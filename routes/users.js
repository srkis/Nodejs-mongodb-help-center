const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const crypto = require("crypto");
// Bring in Models
let User = require('../models/users');
let Company = require('../models/company');
let PageCategory = require('../models/page_categories');
let Pages = require('../models/pages');
let Group = require('../models/group');
let GroupMembers = require('../models/group_members');
let CompanyApp = require('../models/company_app');

const userClass = require('../classes/users');
const userObj = new userClass();


// Na login ruti ga redirektuje na dashboard, a ovde ga prihvatamo i logujemo
router.get('/dashboard', ensureAuthenticated, function(req, res){

      res.render('./users/index', {
          title: 'ChattyFly | Dashobard',
           name : req.user.cf_first_name, // mislim da se ovaj user objekat formira u passport autentikaciji
      });
});

router.get('/add_page', ensureAuthenticated, function(req, res){

    res.render('./users/add_page', {
        title: 'ChattyFly | Add Page',
        name : req.user.cf_first_name, // mislim da se ovaj user objekat formira u passport autentikaciji
        email: req.user.cf_email
    });
});

router.get('/messenger', ensureAuthenticated, function(req, res){

  let userId = req.user._id;
    User.findOne({_id: userId}, (err, user) => {

    res.render('./users/messenger', {
        title: 'ChattyFly | Chat Page',
        name : req.user.cf_first_name, // mislim da se ovaj user objekat formira u passport autentikaciji
        email: req.user.cf_email,
        company_id: user.cf_company_id,
        userId: userId
       });
    });
});

router.get('/groups', ensureAuthenticated, (req, res) => {

   // console.log(req.session.user);

    let userId = req.user._id;

    userObj.getUserFromDb(req.user._id,(userData) => {
        userObj.getGroupMembers(userData.group_id, (groupData) => {
            res.render('./users/groups', {
                title: 'ChattyFly | Groups',
                name : req.user.cf_first_name,
                groupMembers: groupData,
                userId:userId,
                sessionUser: res.locals.sessionUser
            });
        });

    });

});


// Register Form
router.get('/register', (req, res) => {
    res.render('./users/register');
});

router.get('/login', (req, res) => {
   res.render('./users/login');
});

router.post('/finishUserReg', (req, res) => {

    userObj.finishUserReg(req, res);

});

// Register Proccess
router.post('/register', (req, res) => {
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const cf_password = req.body.password;
    const cf_password2 = req.body.password2;
    const company_name = req.body.company_name;
    const cf_status = 'not_activated';

    req.checkBody('first_name', 'First name is required').notEmpty();
    req.checkBody('last_name', 'Last name is required').notEmpty();
    req.checkBody('company_name', 'Company name is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    let errorsArray = [];

    if(!first_name || ! last_name || !email || !cf_password || !cf_password || !company_name){
        errorsArray.push({msg:'Please fill in all fields'});
    }

    if(cf_password !== cf_password2){
        errorsArray.push({msg: 'Passwords do not match'});
    }

    //Check pass length
    if(cf_password.length < 6 ){
        errorsArray.push({msg: 'Password must be at least 6 characters'})
    }

    if(errorsArray.length > 0){
        res.render('./users/register', {
            errorsArray,
            first_name,
            last_name,
            company_name,
            email,
            cf_password,
            cf_password2

        });

    }else{

        User.findOne({cf_email: email })
            .then(user => {
                if(user){
                //User exists
                errorsArray.push({msg: "User already registered!"});
                res.render('./users/register', {
                    errorsArray,
                    first_name,
                    last_name,
                    company_name,
                    email,
                    cf_password,
                    cf_password2
                });

            }else{

               let app_id = crypto.randomBytes(10).toString("hex");
               let activationToken = crypto.randomBytes(10).toString("hex");

               let newUser = new User({
                    cf_app_id: app_id,
                    cf_company_id: null,
                    cf_first_name:first_name,
                    cf_last_name:last_name,
                    cf_email:email,
                    cf_password:cf_password,
                    cf_user_status:cf_status,
                    cf_activation_token: activationToken,
                });

                bcrypt.genSalt(10, function(err, salt){
                    bcrypt.hash(newUser.cf_password, salt, function(err, hash){
                        if(err){
                            console.log(err);
                        }
                        newUser.cf_password = hash;
                        newUser.save(function(err, user){
                            if(err){
                                console.log(err);
                                return;
                            } else {

                         //new register user data
                            let userId = user._id;
                            //Kreiramo novu kompaniju za svakog usera

                            let newCompany = new Company({
                                cf_app_id: app_id,
                                cf_company_name:company_name,
                                cf_user_id:userId,
                                cf_user_role: 'Admin',
                                cf_company_status:'Active'

                            });

                            newCompany.save(function(err, company){
                               if(err) {
                                   console.log(err);
                                   return;
                               }
                                //Update users collection set company_id
                                let query = { _id: userId };
                                let values = { $set: {cf_company_id: company._id} };
                                User.updateOne(query, values, function(err, res) {
                                    if (err){
                                        console.log(err);
                                    }
                                });

                               // kada se user registruje pavimo mu odmah i app_id i ubacujemo company_id. To ce nam biti veza
                               let companyApp = new CompanyApp({
                                   cf_app_id: app_id,
                                   cf_company_id:company._id,
                                   cf_created_by_user_id : userId,
                                   cf_app_subscription: 'free_trial'
                               });

                                companyApp.save(function(err, company_app){
                                    if(err) {
                                        console.log(err);
                                        return;
                                    }

                                let newGroup = new Group({
                                    cf_group_name:"Employees of" + " " + company_name,
                                    cf_company_id:company._id,
                                    cf_app_id:app_id,
                                    cf_group_status: "Active"
                                });

                                newGroup.save(function(err, group){
                                    if(err) {
                                        console.log(err);
                                        return;
                                    }

                                    let group_id = group._id;
                                    let group_members = new GroupMembers({
                                        cf_group_id: group_id,
                                        cf_user_id:  userId,
                                        cf_company_id: company._id,
                                        cf_invited_by : userId,
                                        cf_owner_id: userId ,
                                        cf_user_role : 'Admin'

                                    });

                                    group_members.save(function(err, groupMembers){
                                        if(err) {
                                            console.log(err);
                                            return;
                                        }
                                    });

                                });
                             });
                          });

                             req.flash('success_msg','You are now registered and can log in');
                             res.redirect('/users/login');
                            }
                        });
                    });
                });
            }
       });

    }
});

//test ruta za submit iz chat-a
router.post('/add', function (req, res) {
    console.log(req.body.msg);
    // console.log(req.body.pass);
});

//Login handler
router.post('/login', (req, res, next) => {

    userObj.login(req, res, next);

});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

router.get('/help-center', ensureAuthenticated, function(req, res){

    Pages.find({}, function(err, data){

        let arr = [];
        for (let j = 0; j < data.length; j++){

            arr.push({
                page_id: data[j]._id,
                page_content: data[j].cf_page_content.slice(0, 450),
                cat_id: data[j].cf_cat_id
            });
        }

    res.render('./users/help-center', {
        title: 'ChattyFly | Help Center',
        name : req.user.cf_first_name, // mislim da se ovaj user objekat formira u passport autentikaciji
        data: arr
       });
    });
});


//ruta da vidim  template - moze da se brise
router.get('/form_advanced', function (req, res) {
    let pageTitle = 'ChattyFly. Fly with us!';
    let firstTitle = 'Single Blog';
    res.render('./users/form_advanced', {
        title:pageTitle,
        firstTitle:firstTitle,
    });
});

//ruta da vidim  template - moze da se brise
router.get('/spinners_usage', function (req, res) {
    let pageTitle = 'ChattyFly. Fly with us!';
    let firstTitle = 'Single Blog';
    res.render('./users/spinners_usage', {
        title:pageTitle,
        firstTitle:firstTitle,
    });
});

router.get('/all-categories', ensureAuthenticated, function (req, res) {

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
                created_at: cats[j].cf_createdAt
            });
        }

        let pageTitle = 'ChattyFly. All categories!';
        let firstTitle = 'All categories';
        res.render('./users/all-categories', {
            title:pageTitle,
            firstTitle:firstTitle,
            //data: arr,
            name : req.user.cf_first_name, // mislim da se ovaj user objekat formira u passport autentikaciji
            email: req.user.cf_email
        });
       });
    });
});




router.post('/inviteIntoGroup', function(req, res){

    userObj.groupInvite(req, res);


});


function getUserFromDbById(userId) {

      /*
    return new Promise(

        function (resolve, reject) {
            let data =  User.aggregate([
                {
                    $lookup: {
                        from: "cf_users_companies",
                        localField: "cf_app_id",
                        foreignField: 'cf_app_id',
                        as: "user_info"
                    }
                },
                {
                    $unwind:"$user_info" //user_info._id je company_id
                },

                {
                    $lookup:{
                        from: "cf_groups",
                        localField: "cf_company_id",
                        foreignField: "cf_company_id", //field iz grupe
                        as: "user_group"
                    }
                },
                {
                    $unwind:"$user_group"
                },

                { $match: { 'user_info.cf_user_id' : userId.toString() } },


                {

                    $project:{
                        _id : 1,
                        app_id: "$user_info.cf_app_id",
                        group_id: "$user_group._id",
                        cf_first_name: 1,
                        cf_last_name: 1,
                        cf_email: 1,
                        cf_company_id: 1,
                        company_name : "$user_info.cf_company_name",
                        role : "$user_info.cf_user_role",
                    }
                }

            ])
                .then(user => {
                    resolve(user); // returns to the function that calls the callback
                });


        }
    );
*/
}

router.get('/activateAcc', (req, res) => {
    userObj.activateAcc(req, res);
});

router.get('/acceptInvitation', (req, res) => {
   userObj.acceptInvitation(req, res);
});

//https://stackabuse.com/get-query-strings-and-parameters-in-express-js/
router.get('/finishReg', async function(req, res){

    userObj.finishReg(req, res);

});


router.post('/updateUserActivity', (req, res) => {

        let userId = req.body.userId;
        userObj.updateUserActivity(req, res, userId);

});


router.post('/checkOnlineStatus', (req, res) => {

    let userId = req.body.userId;
    userObj.checkOnlineStatus(req, res, userId);
});





module.exports = router;
