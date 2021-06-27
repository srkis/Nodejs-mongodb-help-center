const express = require('express');
const router = express.Router();
const passport = require('passport');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const helper = require('../helper_functions/functions');
const mongoose = require('mongoose');
// Bring in User Model
let PageCategory = require('../models/page_categories');
let Pages = require('../models/pages');
let Company = require('../models/company');


router.post('/add_page_category', function (req, res) {

   // let nekiText = 'Kriptovanje sa crypto bibliotekom';
  //  let cryptedText = helper.encrypt(nekiText);

  //  console.log(cryptedText.encryptedData);
  //  console.log(helper.decrypt(cryptedText));

    if(req.body.catName){

        let errorsArray = [];
        let catName = req.body.catName;
        let catDescription = req.body.catDescription;
        let user_id = req.user._id;


  if (catName == '' || catDescription == ''){

      req.flash('error_add_page_msg','Please fill textarea field!');
      res.redirect('/users/add_page');

  }

      Company.findOne({cf_user_id: user_id}, (err, company) => {
          if (err)
          {
              res.send(err);
          }

        let PageCat = new PageCategory({
            cf_page_category_name: catName,
            cf_page_category_description: catDescription,
            cf_company_id: company._id,
            cf_created_by_user_id: user_id,
        });

        PageCat.save(function(err){
            if(err){
                console.log(err);
               return;
            } else {
                // Odmah dobavljam sve kategorije za tog user i tu firmi i presledjujem na view zbog selekta.Posto je ajax treba da prikazem odmah i novu kategoriju
                PageCategory.find({}).sort({_id:-1}).limit(1).exec(function(err,cats) {
                    if (err)
                    {
                        console.log(err);
                        res.send(err);
                    }

                    let catArray = [];
                    let category = {
                        category_id : cats[0]._id,
                        category_name: cats[0].cf_page_category_name,
                        category_description: cats[0].cf_page_category_description,
                        created_at: cats[0].cf_createdAt,

                    };
                    catArray.push(category);
                    res.status(200).json({status:"added", categories: catArray});
                    req.flash('success_add_page_msg','Your page is successfully published');
                });
              }
          });
       });
      }
  });


router.post('/get_page_categories', function (req, res) {

    let user_id = req.user._id;

    Company.findOne({cf_user_id: user_id}, (err, company) => {
        if (err)
        {
            res.send(err);
        }

    PageCategory.find({cf_company_id: company._id}, function(err, cats)
    {
        if (err)
        {
            res.send(err);
        }

        let arr = [];
        for (let j = 0; j < cats.length; j++){

            arr.push({
                category_id: cats[j]._id,
                category_name: cats[j].cf_page_category_name,
                category_description: cats[j].cf_page_category_description,

            });
        }

        res.status(200).json({status:"ok", categories: arr});

        });

    });

});


router.post('/edit_delete_category', function (req, res) {

    // Ako je delete category onda proveramo da li ima page sa tim category id-jem. Ako ima vracamo gresku jer mora da prebaci sve page u drugu kategoriju ili da ih obrise
    if(req.body.action && req.body.action == 'delete'){

        let catId = req.body.catId;

        Pages.find({cf_cat_id: catId}, function(err, pages)
        {
            if (err)
            {
                res.send(err);
            }

            if(pages.length == 0  || pages.length < 1){
                    // Nema page vezanih za kategoriju koja se brise
                PageCategory.deleteOne({'_id': mongoose.Types.ObjectId(catId)} , (err, result) => {

                    if (err)
                    {
                        res.send(err);
                    }
                    res.status(200).json({status:"deleted"});
                });

            }else{
                res.status(403).json({msg:"canNotDelete"});
            }
        });

    }else{

        let catId = req.body.catId;
        let catName = req.body.catName;
        let catDescription = req.body.category_description;
        let column = req.body.column;
        let ObjectId = require('mongodb').ObjectID;

        if(catName != null || typeof catName != "undefined" || catName != undefined  )
            {
                PageCategory.updateOne({'_id': mongoose.Types.ObjectId(catId)}, {$set: {cf_page_category_name: helper.htmlentities(catName)}}, (err, result) => {
                    res.status(200).json({status: "ok"});
                });
            }

        if(catDescription != null || typeof catDescription != "undefined" || catDescription != undefined)
        {
            PageCategory.updateOne({'_id': mongoose.Types.ObjectId(catId)}, {$set: {cf_page_category_description: helper.htmlentities(catDescription)}}, (err, result) => {
                res.status(200).json({status: "ok"});
            });

        }

    }
});

module.exports = router;
