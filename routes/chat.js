const express = require('express');
const router = express.Router();
const passport = require('passport');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const helper = require('../helper_functions/functions');
const mongoose = require('mongoose');
// Bring in User Model
let Company = require('../models/company');
let ChatMessages = require('../models/chat_message');
let Registered_users_from_company = require('../models/registered_users_from_company');
let To_Company_message = require('../models/to_company_message');
let User = require('../models/users');

const chatClass = require('../classes/chatClass');
const chatObj = new chatClass();

const crypto = require("crypto");

router.post('/send_message', function (req, res) {

    console.log("SERVER-TERMINAL: routes/chat.js - linija 21");

        let app_id = req.body.app_id;
        let email = req.body.email;
        let username = req.body.username;
        let message = req.body.message;

        //Ako je user registrovan kod njih na aplikaciji oni nam salju email, mi cuvamo taj email u bazi i kreiranje ID za tog usera koji treba
        //da prosledimo dole

        Company.findOne({cf_app_id: app_id}, (err, company) => {
            if (err)
            {
                console.log(err);
                res.send(err);

            }else{

              Registered_users_from_company.findOne({cf_email: email}, (err, reg_user) => {

                if (!reg_user) {

                  let RegUser = new Registered_users_from_company({
                      cf_username: username,
                      cf_email: email,
                      cf_user_company_id: company._id,
                      cf_user_uuid : crypto.randomBytes(16).toString("hex")
                  });

                  RegUser.save();
                  RegUser.on('save', function(new_user) {
                    if (err) {
                        console.log(err);
                    }

                    // Ako je user registrovan i nije jos chatovao onda ga prvo ubacimo u ovu tabelu Registered_users_from_company dobijamo
                    // njegov last insert id. Sledecu poruku kada bude poslao nacicemo ga u ovoj tabeli i idemo u else blok.
                    let ChatMsg = new ChatMessages({
                        cf_app_id: company.cf_app_id,
                        cf_to_company_id: company._id,
                        cf_from_user_id: new_user._id,
                        cf_user_name: username,
                        cf_user_email: email,
                        cf_chat_message: message,
                    });

                    ChatMsg.save(function(err){
                        if(err){
                            console.log(err);
                           return;
                        }

                      });

                  });

                }else{

                  // Ako je user registrovan i vec je chatovao imamo ga u Registered_users_from_company tabeli i dobijamo njegov ID
                  // jer imam email koji su nam poslali preko window.ChattySettings-a.
                  /*let ChatMsg = new ChatMessages({
                      cf_app_id: company.cf_app_id,
                      cf_to_company_id:  company._id,
                      cf_from_user_id: reg_user._id,
                      cf_user_name: username,
                      cf_user_email: email,
                      cf_chat_message: message,
                  });
*/

                    ChatMessages.find({cf_user_email: email}, (err, user) => {

                       // console.log("ivde", user);return;

                    if (!user.length > 0) {

                        console.log('routes/chat.js - line 95');

                        let toCompanyMessage = new To_Company_message({
                            cf_app_id: company.cf_app_id,
                            cf_to_company_id: company._id,
                            cf_from_user_id: reg_user._id,
                            cf_user_name: username,
                            cf_user_email: email,
                            cf_chat_message: message,
                            cf_message_status: 'unread',

                    });

                      toCompanyMessage.save(function(err){
                          if(err){
                             console.log(err);
                               return;
                          }
                     });

                    }else {
                        //da radimo selekt pa da uzmemo poslednju poruku sa kim je cetovao, njegov userId, i ostale podakte, pa onda radimo insert
                        // u ovu istu tabelu sa novom porukom

                    }
             });

                 /* ChatMsg.save(function(err){
                      if(err){
                          console.log(err);
                         return;
                      }

                    });*/


                }

              });
        }

    });


        //Proveravamo da li user postoji sa ovom email adresom i da li je ima uopste. Ako user postoji kod nas u bazi sa tim email-om
        // to znaci da je registrovan korisnik i da je vec chatovao. uzimamo njegov ID i radimo insert u bazu sa tim ID-jem.
        // Ako ga nema u bazi to znaci da nije chatovao do sada, onda mu generisemo ID i upisujemo sve to u bazu i prikazujemo mo mu chat history
        // Ako nema email uposte na serveru, onda to znaci da je neregistrovan user, localstorage...


 });

// Za dashboard
 router.post('/getCompanyMessages', (req, res) => {

          let company_id = req.body.company_id;

          ChatMessages.find({cf_to_company_id:company_id}, function(err, data){

              res.status(200).json({status:"ok", data: data});

        });

 });

// Useri su registrovani korisnici, visitori su neregistrovani
router.post('/getUserChat', (req, res) => {

  let appId = req.body.appId;
  let email = req.body.userEmail;
  let uuid  = req.body.uuid ? req.body.uuid : null;

  console.log("SERVER-TERMINAL :routes/chat.js - line 169");

  if(!appId) {
      res.status(403).json({status:"error", msg: "Wrong APP_ID"});
  }

  if(email) {
      

    User.find({$and: [{cf_email: email}, {cf_app_id: appId}]})
        .then(user => {
         //   console.log(user);
          Company.find({$and: [{cf_user_id: user[0]._id}, {cf_app_id: appId}]})
              .then(company => {
                  ChatMessages.find({$and: [{cf_app_id: appId}, {cf_to_company_id: company[0]._id}]})
                      .then(chatMessages => {
                        if(chatMessages.length > 0) {
                            res.status(200).json({status:"ok", chatHistory: chatMessages});
                        }else {
                            //Vracamo isto 200 ali prazan niz kao response.
                            res.status(200).json({status:"ok", chatHistory: []});
                        }
                 });
              });

            });

          }else{

      // Ako nemamo email - neregistrovan user
      User.findOne({cf_app_id: appId })
          .then(user => {
                  console.log("User",user);
                  Company.find({$and: [{cf_user_id: user._id}, {cf_app_id: appId}]})
                      .then(company => {
                          ChatMessages.find({$and: [{cf_app_id: appId}, {cf_to_company_id: company._id}]})
                              .then(chatMessages => {
                                  if(chatMessages.length > 0) {
                                      res.status(200).json({status:"ok", chatHistory: chatMessages});
                                  }else {
                                      //Vracamo isto 200 ali prazan niz kao response.
                                      res.status(200).json({status:"ok", chatHistory: []});
                                  }
                              });
                      });

              });
          }
      });


router.post('/checkNewNotification', (req, res) => {

    let companyId = req.body.companyId;

    To_Company_message.find({$and: [{cf_message_status: 'unread'}, {cf_to_company_id: companyId}]})
                .then(notification => {
                  //  console.log(notification);
                    if(notification.length > 0){
                        res.status(200).json({status:"ok", data: notification});
/*
                        let userIds = [];
                        let notificationData = [];
                        for (let i = 0; i < notification.length; i++){
                            userIds.push(notification[i].cf_from_user_id);
                        }

                        Registered_users_from_company.find(
                            {
                                 $and: [
                                     {'_id': {$in: userIds}},
                                     {cf_user_company_id: companyId},
                                 ]

                        }).then(userData => {

                          // console.log('notification', notification);
                          // console.log('userData', userData);
                            let newObj = {};
                            for (let i = 0; i < notification.length; i++){

                                for(j = 0; j < userData.length; j++){

//                                    console.log("i",i);

                                  //  console.log("j",j);

                                 //   console.log("(notification[i].cf_user_email",notification[i].cf_user_email);
                                   // console.log("(userData[j].cf_user_email",userData[j].cf_email);

                                    if(notification[i].cf_user_email == userData[j].cf_email){

                                        notification[i] = Object.extend(notification[i], notification[i]);
                                  //   console.log(notification[i]);
                                  //      console.log(notification[i].cf_chat_message);

                                        newObj["msg"] = (newObj[notification[i].cf_from_user_id] || []).concat(notification[i].cf_chat_message)
                                       //console.log("Email",notification[i].cf_user_email )

                                    }

                                }


                            }
                            console.log("New obj",notification[i]);

                    return;

                            /!*
                            * Uzimamo sve iz to company message i trazimo po user id-ju u registered users from company.
                            * Kada dobije i jedno u drugi (notification i userData) onda mergujemo da napravimo jedan array of objects
                            * pa onda taj array of objects mergujemo  da ako ima vise poruka od jednog usera ne saljemo sve na notifikacije
                            * nego da posaljemo jedan user sa podacima i vise njegovih poruka.To je bio cilj ove zajebancije.
                            *
                            * *!/

                            let arr3 = [];
                            for(var i in notification){
                                    arr3.push(notification[i]);
                            }
                            arr3 = arr3.concat(userData);
                            let newArr = [];
                            for(var j=0;j<arr3.length;j++){
                                let current = arr3[j];
                                for(let i=j+1;i<arr3.length;i++){
                                    if(current.cf_from_user_id == arr3[i]._id){
                                        current.uuid = arr3[i].cf_user_uuid;
                                        newArr.push(current);
                                    }
                                }
                            }

                          console.log("arr3",arr3);
               return;

                        
                           let obj = {};
                            newArr.forEach(function(v) {

                                

                             //   console.log("V je: ",v);
                            //    obj["company_id"] = v.cf_to_company_id;
                              //  obj['userId'] = v.cf_from_user_id;
                                obj[v.cf_to_company_id] = (obj[v.cf_to_company_id] || [])
                                obj[v.cf_from_user_id] = (obj[v.cf_from_user_id] || []).concat(v.cf_chat_message)
                            //    obj["messages"] = (obj[v.cf_from_user_id] || []).concat(v.cf_chat_message)
                             //      obj['cf_user_name'] = v.cf_user_name;
                            

                            });
  //   console.log("arr",obj);

     
                        //    var arr = Object.keys(obj);
                      

                            var arr = Object.keys(obj).reduce(function(s,a) {
                            //  console.log("Ovo je S:",s);
                             //   console.log("Ovo je A:",obj[a]);
                                s.push({
                                    userId: a,
                                    user_messages: obj[a],
                                    companyId:a
                                });
                                return s;
                            }, []);

                    console.log("ovde arr fucking:",arr);



                        });*/
                    }
                });

});

router.send_message = (data, callback) => {

        let app_id = data.app_id;
        let email = data.email;
        let username = data.username;
        let message = data.message;


        //Ako je user registrovan kod njih na aplikaciji oni nam salju email, mi cuvamo taj email u bazi i kreiranje ID za tog usera koji treba
        //da prosledimo dole
        Company.findOne({cf_app_id: app_id}, (err, company) => {
            if (err)
            {
                console.log(err);
                res.send(err);

            }else{
                Registered_users_from_company.findOne({cf_email: email}, (err, reg_user) => {
                    
                    if (!reg_user || reg_user == null) {  //Samo ako user ne postoji. Ako user postoji ne ulazi ovde
                       
                        let RegUser = new Registered_users_from_company({
                            cf_username: username,
                            cf_email: email,
                            cf_user_company_id: company._id,
                            cf_user_uuid : crypto.randomBytes(16).toString("hex")
                        });

                        RegUser.save();
                        RegUser.on('save', function(new_user) {
                            if (err) {
                                console.log(err);
                            }

                            // Pa onda treba da proverimo da li je taj user vec chatovao , ako jeste onda uzimamo od usera sa dashboard-a id i na njega  saljemo poruku na dhashnoard.
                            // Ako nije chatovao, tj. ako ga nema u ChatMessages tabeli,  onda upisujemo u to_company_message tabelu i saljemo notifikaciju na dashboard.

                            // Ovde proveriri u ChatMessages tabeli, ako ga nema upisujemo u toCompanyMessage
                            ChatMessages.find({cf_user_email: email}, (err, user) => {
                                if (!user.length > 0) {  // ako user nije chatovao, a registrovan je

                                    let toCompanyMessage = new To_Company_message({
                                        cf_app_id: company.cf_app_id,
                                        cf_to_company_id: company._id,
                                        cf_from_user_id: new_user._id,
                                        cf_user_name: username,
                                        cf_user_email: email,
                                        cf_chat_message: message,
                                        cf_message_status: 'unread',

                                    });

                                    toCompanyMessage.save(function(err){
                                        if(err){
                                            console.log(err);
                                            return;
                                        }
                                        //Ovo je za notifikaciju na dashboard-u
                                        let userData = {
                                            notification: true,
                                            email: email,
                                            message:message,
                                            app_id:app_id,
                                            company_id: company._id
                                        };

                                         callback(userData);

                                    });

                                }else {
                                    //da radimo selekt pa da uzmemo poslednju poruku sa kim je cetovao, njegov userId, i ostale podakte, pa onda radimo insert
                                    // u ovu istu tabelu sa novom porukom

                                }
                            });

                        });

                    }else{
                        console.log("ulazi u else");

                        // Ako je poslao poruku, nije bio registrovan kod nas sa tim emailom, mi smo ga sacuvali u Registered_users_from_company tabelu
                        // i proverili da li je u chatmessage tabeli, ako nije onda smo upisali u  toCompanyMessage.
                        // Ako jos uvek nisu singovali usera i poruku na sebe, ovi na dashboardu, a on posalje opet puruku, ulazimo ovde u else blok
                        // Onda cemo opet proveriti da li je postoji u ChatMessages tabeli, ako ne onda opet upisujemo njegovu poruku u toCompanyMessage tabelu
                        // Dokle god ovi sa dashboarda ne urade sign na sebe, tada prebacujemo njegove poruke u chatmessage tabelu i stavljamo status na read.

                        ChatMessages.find({cf_user_email: email}, (err, user) => {


                            if (!user.length > 0) {  // ako user nije chatovao, a registrovan je

                                let toCompanyMessage = new To_Company_message({
                                    cf_app_id: company.cf_app_id,
                                    cf_to_company_id: company._id,
                                    cf_from_user_id: reg_user._id,
                                    cf_user_name: username,
                                    cf_user_email: email,
                                    cf_chat_message: message,
                                    cf_message_status: 'unread',

                                });

                                toCompanyMessage.save(function(err){
                                    if(err){
                                        console.log(err);
                                        return;
                                    }
                                });
                                   //Ovo je za notifikaciju na dashboard-u
                                let userData = {
                                    notification: true,
                                    email: email,
                                    message:message,
                                    app_id:app_id,
                                    company_id: company._id
                                };

                                callback(userData);

                            }else {
                                console.log('ulazi u drugi else');
                                //da radimo selekt pa da uzmemo poslednju poruku sa kim je cetovao, njegov userId, i ostale podakte, pa onda radimo insert
                                // u ovu istu tabelu sa novom porukom
                            }
                    });

                        /* ChatMsg.save(function(err){
                             if(err){
                                 console.log(err);
                                return;
                             }

                           });*/


                    }

                });
            }

        });


        //Proveravamo da li user postoji sa ovom email adresom i da li je ima uopste. Ako user postoji kod nas u bazi sa tim email-om
        // to znaci da je registrovan korisnik i da je vec chatovao. uzimamo njegov ID i radimo insert u bazu sa tim ID-jem.
        // Ako ga nema u bazi to znaci da nije chatovao do sada, onda mu generisemo ID i upisujemo sve to u bazu i prikazujemo mo mu chat history
        // Ako nema email uposte na serveru, onda to znaci da je neregistrovan user, localstorage...


};


router.post('/getUnassignedMsg', (req, res) => {
    let username = req.body.username;
    chatObj.getUnassignedMsg(req, res, username);
});


router.post('/updateUnassignedMsg', (req, res) => {
    let username = req.body.username;
    let userId = req.body.userId;
    chatObj.updateUnassignedMsg(req, res, username, userId);
});


router.post('/getAllDiscussions', (req, res) => {
    let companyId = req.body.companyId;
    chatObj.getAllDiscussions(req, res, companyId);
});

router.post('/getSingleUserChat', (req, res) => {

    let data = {
        companyId:req.body.companyId,
        userId:req.body.userId,
        username:req.body.username,
    }

    chatObj.singleUserChat(req, res, data);
});






module.exports = router;
