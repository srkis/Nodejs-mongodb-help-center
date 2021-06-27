const express = require('express');
const router = express.Router();
const passport = require('passport');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const helper = require('../helper_functions/functions');
// Bring in User Model
let Pages = require('../models/pages');
let Company = require('../models/company');
let PageCategory = require('../models/page_categories');
const mongoose = require('mongoose');

//test ruta textarea add page
router.post('/add_page', function (req, res) {

    let user_id = req.user._id;

    if(req.body.content){
        let errorsArray = [];
        let content = req.body.content;
        let search_content = helper.htmlentities(req.body.content);
        let pageTitle = req.body.pageTitle;
        let pageDescription = req.body.pageDescription;
        let user_id = req.user._id;
        let cat_id = req.body.cat_id;

        if(cat_id === 'Choose a category'){
            req.flash('error_add_page_msg','Please choose a category!');
            res.redirect('/users/add_page');
        }

        if (search_content == ''){
          req.flash('error_add_page_msg','Please fill textarea field!');
          res.redirect('/users/add_page');
        }

        Company.findOne({cf_user_id: user_id}, (err, company) => {
            if (err)
            {
                res.send(err);
            }

        let newPage = new Pages({
            cf_page_content: content,
            cf_search_content: search_content,
            cf_page_title: pageTitle,
            cf_page_description: pageDescription,
            cf_page_status:'active',
            cf_company_id: company._id,
            cf_created_by_user_id: user_id,
            cf_cat_id: cat_id,

        });

        newPage.save(function(err){
            if(err){
                req.flash('error_add_page_msg','Please enter page title and page description');
                res.redirect('/users/add_page');
               return;
            } else {
                req.flash('success_add_page_msg','Your page is successfully published');
                res.redirect('/users/add_page');
            }
        });

        });

       //req.flash('error_msg', 'Field can not be empty!');
      //  errorsArray.push({msg:'Please fill in all fields'});
      }

   });

router.get('/edit_page', ensureAuthenticated,  (req, res) => {

    let pageId = req.query.page;  // page je get parametar stavljen u help-center.ejs kada se klikne na edit page button

    Pages.findOne({_id: pageId}, (err, page) => {
        if (err)
        {
            res.send(err);
        }
        let catId = page.cf_cat_id;

        let pageCats = function(catId, callback) {
        PageCategory.find().where("_id", catId)
            .exec(function(err, cats) {
            // docs contains an array of MongooseJS Documents
            // so you can return that...
            // reverse does an in-place modification, so there's no reason
            // to assign to something else ...
            cats.reverse();
            callback(err, cats);
        });
    };

        pageCats(catId, function(err, cats) {

        if (err) {
            /* panic! there was an error fetching the list of blogs */
            return;
        }
            PageCategory.find({}, function(err, allCategories){

        res.render('./users/edit_page', {
            title: 'ChattyFly | Edit Page',
            name : req.user.cf_first_name, // mislim da se ovaj user objekat formira u passport autentikaciji
            email: req.user.cf_email,
            data:page,
            selectedCategory:cats,
            allCategories:allCategories
        });
      });
    });
    });
});

//test ruta textarea add page
router.post('/update_page', function (req, res) {

    let user_id = req.user._id;
    let pageId = req.body.page_id;

    if(req.body.content){
        let errorsArray = [];
        let content = req.body.content;
        let search_content = helper.htmlentities(req.body.content);
        let page_title = helper.htmlentities(req.body.pageTitle);
        let page_description = helper.htmlentities(req.body.pageDescription);
        let user_id = req.user._id;
        let cat_id = req.body.category_id;

        if(cat_id === 'Choose a category'){
            req.flash('error_add_page_msg','Please choose a category!');
            res.redirect('/users/add_page');
        }

        if (search_content == '' || page_title == '' || page_description == '' ){
            req.flash('error_add_page_msg','Please fill all fields!');
            res.redirect('/users/add_page');
        }

        Company.findOne({cf_user_id: user_id}, (err, company) => {
            if (err)
            {
                res.send(err);
            }

            let updatePage = {
                cf_page_content: content,
                cf_search_content: search_content,
                cf_page_description: page_description,
                cf_page_title: page_title,
                cf_page_status:'active',
                cf_created_by_user_id: user_id,
                cf_cat_id: cat_id,

            };
        Pages.updateOne({_id:pageId}, {$set: updatePage}, (err) => {
                if(err){
                    console.log(err);
                    return;
                } else {
                    req.flash('success_add_page_msg','Your page is successfully updated');
                    res.redirect('/users/help-center');
                }
            });


        });
    }

});


router.post('/delete_page', function (req, res) {

    if(req.body.action && req.body.action == 'delete') {

        let pageId = req.body.pageId;

    if(pageId){

        Pages.deleteOne({'_id': mongoose.Types.ObjectId(pageId)} , (err, result) => {

             if (err)
             {
                 res.send(err);
             }
             res.status(200).json({status:"deleted"});
         });
       }
    }
  });


//full text search
//https://www.youtube.com/watch?v=ZC2aRON3fWw&t=1s
//https://arianacosta.com/database/mongodb/mongodb-full-text-search-tutorial/
//https://github.com/codepope/ftslite/
router.post("/search", function(req, res) {

   let query = helper.htmlentities(req.body.query);
    query = helper.removeAllParentasses(query) ;

    if(query === '' ||  typeof query === "undefined" || query == null ){
        res.status(406).json({status:"Not Acceptable"})
        return;
    }

           Pages.find({"$text": { "$search": helper.htmlentities(query) }},
               {
                 //_id:0,
                 __v:0
               },
               function (err,data) {
               if(data){

                   let arr = [];
                   for (let j = 0; j < data.length; j++){

                       arr.push({
                           page_id: data[j]._id,
                           page_title: data[j].cf_page_title,
                           page_description: data[j].cf_page_description,
                           page_content: data[j].cf_page_content,

                       });
                   }

                   res.status(200).json({status:"ok", data:arr})
               }
           });
     });


router.get('/get_search_page' , (req, res) => {

    let pageId = req.query.pageId;

    Pages.find({_id: pageId}, (err, page) => {
        if (err)
        {
            res.send(err);
        }

        if(page){

            let arr = [];
            for (let j = 0; j < page.length; j++){

                arr.push({
                    page_id: page[j]._id,
                    page_title: page[j].cf_page_title,
                    page_description: page[j].cf_page_description,
                    page_content: page[j].cf_page_content,

                });
            }


            res.status(200).json({status:"ok", data:arr})
        }
    });

});

module.exports = router;