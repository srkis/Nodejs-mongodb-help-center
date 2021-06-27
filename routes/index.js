const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

let Pages = require('../models/pages');
let PageCategory = require('../models/page_categories');
// Welcome Page

router.get('/', function (req, res) {
    let pageTitle = 'ChattyFly. Fly with us!';
    let firstTitle = 'Chat Bot';
    res.render('index', {
        title:pageTitle,
        firstTitle:firstTitle,
    });
});


router.get('/features', function (req, res) {
    let pageTitle = 'ChattyFly. Fly with us!';
    let firstTitle = 'Features';
    res.render('features', {
        title:pageTitle,
        firstTitle:firstTitle,
    });
});
router.get('/pricing', function (req, res) {
    let pageTitle = 'Chatty Fly. Fly with us!';
    let firstTitle = 'Features';
    res.render('price', {
        title:pageTitle,
        firstTitle:firstTitle,
    });
});
router.get('/contact', function (req, res) {
    let pageTitle = 'ChattyFly. Fly with us!';
    let firstTitle = 'Contact';
    res.render('contact', {
        title:pageTitle,
        firstTitle:firstTitle,
    });
});
router.get('/blog', function (req, res) {
    let pageTitle = 'ChattyFly. Fly with us!';
    let firstTitle = 'Blog';
    res.render('blog', {
        title:pageTitle,
        firstTitle:firstTitle,
    });
});
router.get('/single-blog', function (req, res) {
    let pageTitle = 'ChattyFly. Fly with us!';
    let firstTitle = 'Single Blog';
    res.render('single-blog', {
        title:pageTitle,
        firstTitle:firstTitle,
    });
});




router.get('/help/*', function (req, res) {

    if(req.url === '/help/'){ //Ako nemamo slug samo help page onda prikazujemo sve kategorije koje postoje

        PageCategory.find({}, function(err, data){
            let pageTitle = 'ChattyFly. Fly with us!';
            let firstTitle = 'ChattyFly';
            res.render('./help', {
                title:pageTitle,
                data:data,
                firstTitle:firstTitle,
            });


        });

    }else{

        let slug = req.url.replace(/^.*\/(.*)$/, "$1");

            // ovo je kada se klikne na odredjenu kategoriju koja ima slug
        PageCategory.find({ cf_page_category_slug: slug}, function (err, data) {

          if( data.length == 0 || data == '' || data == null || data == 'undefined' || data == undefined){
                return;
          }
            Pages.find({ cf_cat_id: data[0]._id}, function (err, pages) {
            let pageTitle = 'ChattyFly. Fly with us!';
            let firstTitle = 'ChattyFly';
            let count = pages.length;

                let arr = [];
                for (let j = 0; j < pages.length; j++){

                    arr.push({
                        page_id: pages[j]._id,
                        page_content: pages[j].cf_page_content.trim().slice(0, 250),
                        cat_id: pages[j].cf_cat_id
                    });
                }

            res.render('./help/category-articles', {
                title:pageTitle,
                data:data,
                pages:arr,
                firstTitle:firstTitle,
                count:count,
            });
          });
       });
    }

});


/*

router.get('/help', function (req, res) {
    console.log('ovde 2');
    PageCategory.find({}, function(err, data){

    let pageTitle = 'ChattyFly. Fly with us!';
    let firstTitle = 'ChattyFly';
    res.render('./help', {
        title:pageTitle,
        data:data,
        firstTitle:firstTitle,
    });

    });
});

 */


module.exports = router;