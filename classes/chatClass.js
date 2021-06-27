const express = require('express');
const passport = require('passport');
const crypto = require("crypto");
const helper = require('../helper_functions/functions');
let toCompanyMsgModel = require('../models/to_company_message');
let chatMessagesModel = require('../models/chat_message');
const config = require('../config/constants');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

class ChatClass {

    constructor() {
        this.helper = helper;

    }

    // poruke od usera koje su otisle na kompaniju - nije ih jos niko rasporedio.
    getUnassignedMsg(req, res, username){
        //username - email for registered, some uuid for unregistered

        toCompanyMsgModel.find({
            $and: [
                {cf_message_status: "unread"},
                { $or: [{cf_user_email: username}, {cf_from_user_id: username}] },  

            ]
        }, function (err, userMsgs) {

            if (userMsgs.length > 0) {

                res.status(200).json({status:"ok", userMsgs:userMsgs});

            }

        });
    }

    updateUnassignedMsg(req, res, username, userId){
        console.log("update:", username, userId);

        toCompanyMsgModel.find({
            $and: [
                {cf_message_status: "unread"},
                { $or: [{cf_user_email: username}, {cf_from_user_id: username}] }, 

            ]
        }, function (err, userMsgs) {

            if (userMsgs.length > 0) {

                //Update all users msgs, set status to read
                toCompanyMsgModel.updateMany(
                    {   $and: [
                            {cf_message_status: "unread"},
                            { $or: [{cf_user_email: username}, {cf_from_user_id: username}] },  

                        ] },

                    {
                        cf_message_status: "read",

                    }, function (err, res) {
                        if (err) {
                            console.log("updateMany", err);
                        }
                    });



                for (let i = 0; i < userMsgs.length; i++) {

                    let chat_messages = new chatMessagesModel({
                        cf_app_id: userMsgs[i].cf_app_id,
                        cf_to_company_id: userMsgs[i].cf_to_company_id,
                        cf_from_user_id: userMsgs[i].cf_from_user_id,
                        cf_to_user_id: userId,
                        cf_user_name: userMsgs[i].cf_user_name,
                        cf_user_email: userMsgs[i].cf_user_email,
                        cf_chat_message: userMsgs[i].cf_chat_message,
                    });

                    chat_messages.save(function (err) {
                        if (err) {
                            console.log(err);
                            return;
                        }

                    });

            }

             setTimeout(function() {

                    chatMessagesModel.find()
                        .then(userChats => {
                            if (userChats) {
                                res.status(200).json({status:"ok", userChats:userChats});
                            }
                        });
                }, 1000);//force delay of 1 second.
        }

     });
   }

  async getAllDiscussions(req, res, companyId)
    {
       let self = this;
       await self.companyDiscussions(companyId, (returnValue) => {

           res.status(200).json({status:"ok", userChats:returnValue});
        });

    }

     companyDiscussions (companyId, callback) {
        chatMessagesModel.find({cf_to_company_id:companyId})
            .then(userMsgs => {
                if (userMsgs.length > 0) {

                    callback(userMsgs);
                }
            });
    }



    getSingleUserChat(req, res, data) {


    };
    








};




module.exports = ChatClass;