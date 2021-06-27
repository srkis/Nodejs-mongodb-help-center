const express = require('express');
const passport = require('passport');
const crypto = require("crypto");
const helper = require('../helper_functions/functions');
let userModel = require('../models/users');
let companyModel = require('../models/company');
let groupModel = require('../models/group');
let groupMembersModel = require('../models/group_members');
let loginDetailsModel = require('../models/login_details');
let toCompanyMsgModel = require('../models/to_company_message');
const config = require('../config/constants');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

class User {

    constructor() {
        this.helper = helper;

    }

    login(req, res, next) {

        passport.authenticate('local', {
            successRedirect: 'dashboard',
            failureRedirect: '/users/login',
            failureFlash: true
        })(req, res, next);

       userModel.findOne({cf_email: req.body.email})
          .then(user => {
            if (user) {

                let login_details = new loginDetailsModel({
                    cf_app_id: user.cf_app_id,
                    cf_company_id: user.cf_company_id,
                    cf_user_id: user._id,

                });

                login_details.save(function (err, user) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                });
            }
      });


    }

    groupInvite(req, res){

        let userId = req.user._id;
        this.getUserFromDb(userId, (ownerData) => {

            if(ownerData){

                req.checkBody('firstName', 'First name is required').notEmpty();
                req.checkBody('lastName', 'Last name is required').notEmpty();
                req.checkBody('email', 'Email is not valid').isEmail();
                req.checkBody('role', 'Role is required').notEmpty();

                const first_name = req.body.firstName;
                const last_name = req.body.lastName;
                const email = req.body.email;
                const role = req.body.role;

                let errorsArray = [];

                if(!first_name || ! last_name || !email || !role ){
                    errorsArray.push({msg:'Please fill in all fields'});
                }

                let activationToken = crypto.randomBytes(10).toString("hex");

                let emailData = {
                    "userWhoInvite": [{
                        owner_first_name: ownerData.cf_first_name,
                        owner_last_name: ownerData.cf_last_name,
                        owner_email: ownerData.owner_email,
                        owner_company_name:ownerData.company_name
                    }],
                    "invitedUser": [{
                        first_name: first_name,
                        last_name: last_name,
                        email:email,
                        role:role,
                        template: 'group_invite',  // Naziv email template - dinamicki
                        url_expire: this.helper.getCurrentDate(15)
                    }]
                };

                //Kada radimo invite onda proveravamo da li user postoji
                this.inviteUser(ownerData, emailData,activationToken, req, res);

            }else{

                res.status(500).json({status:"Error! Something went wrong."});
            }
        });

    }

    inviteUser(ownerData, emailData,activationToken,req, res){
        userModel.findOne({cf_email: emailData.invitedUser[0].email})
            .then(user => {
                if (user) {
                    console.log("Pronasao usera");
                        groupMembersModel.findOne({cf_user_id: user._id})
                        .then(groupMemberUser => {
                            console.log("Pronasao usera u gm tabeli");
                            //Proveravamo da li ima vise od jednog usera sa istim group_id-jem
                            groupMembersModel.find({cf_group_id: groupMemberUser.cf_group_id})
                                .then(findUsers => {
                                    if (findUsers.length > 1) {
                                        res.status(403).json({status: "Error! User with that email address already exist in active group."});
                                        return;
                              }
                              groupMembersModel.find({ $and: [ { cf_user_id: findUsers[0].cf_user_id }, { cf_invited_status: "accepted" }, { cf_group_id: ownerData.group_id } ] })
                                 .then(acceptedUser => {
                                     if (acceptedUser.length > 0) {
                                         res.status(403).json({status: "Error! User with that email address is already in your working group"});
                                         return;
                                    }

                            //Treba da proverimo da li user postoji sa mojim group_id i da li mu je status pending
                            groupMembersModel.find({ $and: [ { cf_user_id: findUsers[0].cf_user_id },{ cf_group_id: ownerData.group_id}, { cf_invited_status: "pending" } ] })
                                    .then(userFound => {
                                        if (userFound === undefined || userFound.length === 0) {
                                            console.log("User nije found:", userFound);
                                            //uradimo insert u GM tabelu, setujemo status pending_invitation
                                            let group_members = new groupMembersModel({
                                                cf_group_id: ownerData.group_id,
                                                cf_company_id: ownerData.company_id,
                                                cf_invited_by: ownerData.userId,
                                                cf_user_id:  user._id,
                                                cf_owner_id: ownerData.userId ,
                                                cf_user_role : 'Admin',
                                                cf_invited_status: 'pending',
                                                cf_activation_token: activationToken,
                                                cf_invite_url_expire: this.helper.getCurrentDate(15) // 15 days from now
                                            });
                                            group_members.save(function(err, groupMembers){
                                                if(err) {
                                                    console.log(err);
                                                    return;
                                                }
                                            });

                                            let activationUrl = "http://localhost:4000/users/acceptInvitation/?activationToken="+activationToken+"&email="+emailData.invitedUser[0].email+"&firstName="+emailData.invitedUser[0].first_name+"&lastName="+emailData.invitedUser[0].last_name;
                                            emailData['invitedUser']['activationUrl'] = activationUrl;
                                            // console.log("Ovo je email data:",emailData.invitedUser.activationUrl);

                                            this.helper.sendEmail(req, res, emailData);
                                            res.status(200).json({status:"User has been successfully invited in your workgroup"});
                                        } else {
                                            console.log("User found:", userFound);
                                            //Ako postoji sa mojim group_id i statusom pending nije jos uradio accept update activationToken i resend mail.
                                            let activationUrl = "http://localhost:4000/users/acceptInvitation/?activationToken="+activationToken+"&email="+emailData.invitedUser[0].email+"&firstName="+emailData.invitedUser[0].first_name+"&lastName="+emailData.invitedUser[0].last_name;

                                            groupMembersModel.updateOne(
                                                { $and: [ { cf_user_id: findUsers[0].cf_user_id }, { cf_group_id: ownerData.cf_group_id}, { cf_invited_status: "pending" } ] },
                                                {
                                                    cf_activation_token: activationToken,
                                                    cf_invite_url_expire: this.helper.getCurrentDate(15) // 15 days from now
                                                }, function (err, res) {
                                                    if (err) {
                                                        console.log("GM2", err);
                                                    }
                                                });


                                            emailData['invitedUser']['activationUrl'] = activationUrl;
                                            // console.log("Ovo je email data:",emailData.invitedUser.activationUrl);

                                            this.helper.sendEmail(req, res, emailData);
                                            res.status(200).json({status:"You successfully resend group invitation email"});
                                      }
                                   });
                             });
                      });
                   });

                } else {
                    console.log("Invite unregistered");
                    // Novi user kada se invajtuje. Nije jos registrovan
                    let activationUrl = "http://localhost:4000/users/finishReg/?activationToken="+activationToken+"&email="+emailData.invitedUser[0].email+"&firstName="+emailData.invitedUser[0].first_name+"&lastName="+emailData.invitedUser[0].last_name;
                    emailData['invitedUser']['activationUrl'] = activationUrl;

                    let newUser = new userModel({
                        cf_app_id: ownerData.app_id,
                        cf_company_id: ownerData.company_id,
                        cf_first_name:emailData.invitedUser[0].first_name,
                        cf_last_name:emailData.invitedUser[0].last_name,
                        cf_email:emailData.invitedUser[0].email,
                        cf_user_status:"not_activated",
                        cf_activation_token: activationToken,
                    });

                    newUser.save(function(err, user){
                        if(err) {
                            console.log(err);
                            return;
                        }

                        let newCompany = new companyModel({
                            cf_app_id: ownerData.app_id,
                            cf_company_name:ownerData.company_name,
                            cf_user_id:user._id,
                            cf_user_role: emailData.invitedUser[0].role,
                            cf_company_status:'Active'

                        });

                        newCompany.save(function(err, company){
                            if(err) {
                                console.log(err);
                                return;
                            }

                            let newGroup = new groupModel({
                                cf_group_name:"Employees of" + " " + emailData.userWhoInvite[0].owner_company_name,
                                cf_company_id:ownerData.company_id,
                                cf_app_id:ownerData.app_id,
                                cf_group_status: "Active"
                            });

                            newGroup.save(function(err, group){
                                if(err) {
                                    console.log(err);
                                    return;
                                }
                            });

                                let group_members = new groupMembersModel({
                                    cf_group_id: ownerData.group_id,
                                    cf_company_id: ownerData.company_id,
                                    cf_invited_by: ownerData.userId,
                                    cf_user_id:  user._id,
                                    cf_owner_id: ownerData.userId ,
                                    cf_user_role : 'Admin',
                                    cf_invited_status: 'pending',
                                    cf_activation_token: activationToken,
                                    cf_invite_url_expire: helper.getCurrentDate(15) // 15 days from now

                                });
                                group_members.save(function(err, groupMembers){
                                    if(err) {
                                        console.log(err);
                                        return;
                                    }
                                });

                        });
                    });

                    this.helper.sendEmail(req, res, emailData);
                    res.status(200).json({status:"You successfully resend group invitation email"});
                }

            });

    }

    acceptInvitation(req, res) {

        let activationToken = req.query.activationToken;
        let email = req.query.email;
        let firstName = req.query.firstName;
        let lastName = req.query.lastName;

        //console.log(activationToken,email,firstName,lastName);return;
        userModel.findOne({cf_email: email})
            .then(user => {
                if(user){
                    //Check activation token and expire url
                    groupMembersModel.find( { $and: [ { cf_user_id: user._id }, { cf_activation_token: activationToken } ] } )
                        .then(checkUser => {

                            if(checkUser.length > 0) {
                                 // Ako je invitation url expire
                                if(this.helper.getCurrentDate()  > checkUser[0].cf_invite_url_expire){

                                    res.render('./help/already-accept-invitation', {
                                        title:'Already accepted invitation',
                                    });

                                    return;

                                }
                            }else{
                                    //Nije pronasao usera sa tim tokenom
                                res.render('./404/404', {
                                    title:'Error Page',
                                });
                                return;
                            }

                    groupMembersModel.find( { $and: [ { cf_user_id: user._id }, { cf_invited_status: "pending" } ] } )
                    //groupMembersModel.findOne({cf_user_id: user._id, cf_invited_status: "pending" })
                        .then(findUsers => {
                            try {
                                    //Nije pronasao usera sa pending statusom, sto znaci da je vec uradio accept.
                                  if (findUsers === undefined || findUsers.length < 1) {

                                      res.render('./help/already-accept-invitation', {
                                          title:'Already accepted invitation',
                                      });

                                      return;
                                  }
                                     // console.log("omg",findUsers);return;
                                      this.getUserFromDb(findUsers[0].cf_owner_id, (ownerData) => {
                                          //'console.log("findUsers",findUsers[0]._id); // group_id usera koji se invajtuje
                                          let group_query = {_id: findUsers[0].cf_group_id};
                                          let group_values = {$set: {cf_group_status: "locked"}};
                                          groupModel.updateOne(group_query, group_values, function (err, res) {
                                              if (err) {
                                                  console.log("Group", err);
                                              }
                                          });

                                           groupMembersModel.updateMany(
                                               { $and: [ { cf_user_id: findUsers[0].cf_user_id }, { cf_invited_status: "pending" } ] },
                                            //  {cf_user_id: findUsers[0].cf_user_id}, { cf_invited_status: "pending" },
                                              {
                                                  cf_group_id: ownerData.group_id,
                                                  cf_company_id: ownerData.company_id,
                                                  cf_invited_by: ownerData.userId,
                                                  cf_invited_status: "accepted"
                                              }, function (err, res) {
                                                  if (err) {
                                                      console.log("GM", err);
                                                  }
                                              });

                                          groupMembersModel.updateMany(
                                              { $and: [ { cf_company_id: user.cf_company_id }, { cf_owner_id: user._id } ] },
                                              {
                                                  cf_invited_status: "locked"
                                              }, function (err, res) {
                                                  if (err) {
                                                      console.log("Group member", err);
                                                  }
                                              });

                                          //Update user table, set company_id i app_id od onog ko ga invajuje
                                          let user_query = {'_id': findUsers[0].cf_user_id.toString()};
                                          let user_values = {
                                              $set: {
                                                  cf_company_id: ownerData.company_id,
                                                  cf_app_id: ownerData.app_id
                                              }
                                          };

                                          userModel.updateOne(user_query, user_values, function (err, res) {
                                              if (err) {
                                                  console.log("User", err);
                                              }
                                          });
                                          //Update company, set company_id i app_id od onog ko ga invajuje
                                          let company_query = {cf_user_id: findUsers[0].cf_user_id};
                                          let company_values = {$set: {cf_app_id: ownerData.app_id}};
                                          companyModel.updateOne(company_query, company_values, function (err, res) {
                                              if (err) {
                                                  console.log("Company", err);
                                              }
                                          });
                                      });

                            }catch (e) {
                                helper.error_log(e, req);
                            }


                            res.render('./help/accept-invitation', {
                                title:'Accept group invitation',
                            });

                        });
                     });
                   }
            });
    }

    finishReg(req, res){

        let activationToken = req.query.activationToken;
        let email = req.query.email;
        let firstName = req.query.firstName;
        let lastName = req.query.lastName;

        userModel.findOne({cf_email: email})
        .then(user => {
            if(user && user !== undefined ){                
                //Check activation token and expire url
                groupMembersModel.find( { $and: [ { cf_user_id: user._id }, { cf_activation_token: activationToken } ] } )
                    .then(checkUser => {
                        if(checkUser.length > 0) {

                        companyModel.findOne({_id: checkUser[0].cf_company_id})
                        .then(company => {

                             // Ako je invitation url expire
                                if(this.helper.getCurrentDate()  > checkUser[0].cf_invite_url_expire){
                                    res.render('./help/already-accept-invitation', {
                                         title:'Already accepted invitation',
                                    });
                                        return;
                                    }else{

                                        let data = {
                                            firstName : firstName,
                                            lastName : lastName,
                                            email: email,
                                            companyName : company.cf_company_name,
                                            activationToken: activationToken
                                        };

                                        res.render('./users/finishReg', {
                                            title: 'ChattyFly | Fisnish registration',
                                            data :data
                                        });

                                    }
                                });
                        }else{
                                //Nije pronasao usera sa tim tokenom
                              this.helper.show404(res);
                        }
                   
                  });
                }else{
                    //Nije pronasao usera sa tim tokenom
                this.helper.show404(res);
            }   
              
            });
    }

    finishUserReg(req, res) {

        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const email = req.body.email;
        let cf_password = req.body.password;
        let cf_password2 = req.body.password2;
        const company_name = req.body.company_name;
        const cf_status = 'not_activated';
        let activationToken = req.body.activationToken;  // Token koji smo mu poslali na mejl kada smo ga invajtovali

        req.checkBody('first_name', 'First name is required').notEmpty();
        req.checkBody('last_name', 'Last name is required').notEmpty();
        req.checkBody('company_name', 'Company name is required').notEmpty();
        req.checkBody('email', 'Email is not valid').isEmail();
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

        let errorsArray = [];

        if (!first_name || !last_name || !email || !cf_password || !cf_password || !company_name) {
            errorsArray.push({msg: 'Please fill in all fields'});
        }

        if (cf_password !== cf_password2) {
            errorsArray.push({msg: 'Passwords do not match'});
        }

        //Check pass length
        if (cf_password.length < 6) {
            errorsArray.push({msg: 'Password must be at least 6 characters'})
        }

        let emailData = {
            "invitedUser": [{
                first_name: first_name,
                last_name: last_name,
                email:email,
                template: 'activateAcc',  // Naziv email template - dinamicki
                url_expire: this.helper.getCurrentDate(15)
            }]
        };

        if (errorsArray.length > 0) {

            let data = {
                firstName: first_name,
                lastName: last_name,
                email: email,
                companyName: company_name,
                activationToken:activationToken,
            };

            res.render('./users/finishReg', {
                errorsArray,
                first_name,
                last_name,
                company_name,
                email,
                cf_password,
                cf_password2,
                data

            });

        } else {

        userModel.findOne({cf_email: email})
            .then(user => {
                if (user && user !== undefined) {
                    //Check activation token and expire url
                    groupMembersModel.find({$and: [{cf_user_id: user._id}, {cf_activation_token: activationToken}]})
                        .then(checkUser => {
                          if (checkUser.length > 0) {
                              //Ako je invitation url expire
                              if (this.helper.getCurrentDate() > checkUser[0].cf_invite_url_expire) {
                                  res.render('./help/already-accept-invitation', {
                                      title: 'Already accepted invitation',
                                  });
                                  return;
                              }

                              bcrypt.genSalt(10, function (err, salt) {
                                  bcrypt.hash(cf_password, salt, function (err, hash) {
                                      if (err) {
                                          console.log(err);
                                      }
                                      cf_password = hash;

                                      userModel.updateMany(
                                          {$and: [{cf_email: email}, {cf_activation_token: activationToken}]},
                                          {
                                              // Proveriti da li ovde treba da se uradio actiavated!? Mislim  da treba ispod u activatAcc funkciji, ovde samo pass
                                              cf_user_status: "activated",
                                              cf_password: cf_password,
                                          }, function (err, res) {
                                              if (err) {
                                                  console.log("GM", err);
                                              }
                                          });
                                  });
                              });

                              groupMembersModel.updateMany(
                                  {$and: [{cf_user_id: user._id}, {cf_invited_status: "pending"}]},
                                  {cf_invited_status: "accepted"}, function (err, res) {
                                      if (err) {
                                          console.log("GM", err);
                                      }
                                  });

                              let activationUrl = "http://localhost:4000/users/activateAcc/?activationToken=" + user.cf_activation_token + "&email=" + emailData.invitedUser[0].email + "&firstName=" + emailData.invitedUser[0].first_name + "&lastName=" + emailData.invitedUser[0].last_name;
                              emailData['invitedUser']['activationUrl'] = activationUrl;

                              if(this.helper.sendEmail(req, res, emailData)){
                                    res.redirect('./users/login');
                              }
                          }


                           else {

                              console.log('ovde 1');

                                    this.helper.show404(res);
                                }
                      });


                  }else{

                    console.log('ovde 2 ');

                    this.helper.show404(res);
                }
            });
        }
    }

    activateAcc(req, res) {

        let activationToken = req.query.activationToken;
        let email = req.query.email;
        let firstName = req.query.firstName;
        let lastName = req.query.lastName;

        console.log(activationToken, email, firstName, lastName);

    }

    updateUserActivity(req, res, userId){

        let last_activity =  new Date();

        let query = {cf_user_id: userId};
        let group_values = {$set: {cf_last_activity: last_activity}};
        loginDetailsModel.updateOne(query, group_values, function (err, result) {
            if (err) {
                console.log("updateUserActivity", err);
            }else{
                res.status(200).json({status:"true"});
            }
        });

    }

    checkOnlineStatus(req, res, userId) {

        this.getUserFromDb(userId,(userData) => {
            this.getGroupMembers(userData.group_id, (groupData) => {

                let groupArr = [];

                for(let j = 0; j < groupData.length; j++){

                    groupArr.push(groupData[j]._id.toString());  //svi user ids iz grupe
                }

                if (groupData.length > 0)  {
                    let arr = [];
                
                    for(let i = 0; i < groupData.length; i++){
                        arr.push(groupData[i]._id);
                    }

         loginDetailsModel.find(
             {$and: [
                     { cf_user_id : { $in : arr } },
                     {cf_last_activity: {$gt : new Date(new Date()-(50000)) }}
                    ]

            }).then(checkUser => {  //online useri

                //treba da se proveri user ids iz groupArr koji nisu u checkuser oni su offline
               //ako user ids ne postoje u checkuser oni su offline
                let checkOnlineUsers = [];

                 for(let k = 0; k < checkUser.length; k++){
                     checkOnlineUsers.push(checkUser[k].cf_user_id);
                 }

                 let offlineUsers = groupArr.filter(x => !checkOnlineUsers.includes(x)); // stavljamo u offlineUsers sve ids iz grupe koji nisu online

                if (checkUser.length > 0) {
                    res.status(200).json({status:"online", onlineUsers:checkOnlineUsers, offlineUsers:offlineUsers});
                }else{
                    console.log("nije online");
                    res.status(200).json({status:"offline"});
                }
            });
          }
      });
   });
 }


    getUserFromDb(userId, callback) {

    userModel.findOne({'_id': mongoose.Types.ObjectId(userId)})
        .then(user => {
              if (user) {
                  companyModel.findOne({'cf_user_id': user._id})
                   .then(company => {
                       groupModel.findOne({'cf_app_id': company.cf_app_id})
                            .then(group => {
                            let userData = {
                                userId: user._id,
                                owner_email: user.cf_email,
                                cf_first_name: user.cf_first_name,
                                cf_last_name: user.cf_last_name,
                                app_id: user.cf_app_id,
                                company_id: company._id,
                                group_id: group._id,
                                company_name: company.cf_company_name,
                                group_name: group.cf_group_name,

                            };

                       callback(userData);
                  });
              });
            }
        });
    }

    getGroupMembers(groupId, callback) {
        const arr = [];

      groupMembersModel.find({cf_group_id: mongoose.Types.ObjectId(groupId)})
          .then(gmUsers => {
              if (gmUsers) {

                  for(let i = 0; i < gmUsers.length; i++){
                      arr.push(gmUsers[i].cf_user_id);
                  }
                  userModel.find( { _id : { $in : arr } } ).then(users => {
                      callback(users);
                  });
              }
          });

    }



};








module.exports = User;