const mongoose = require('mongoose');
const helper = require('../helper_functions/functions');
// User Schema
const UserSchema = mongoose.Schema({
    cf_app_id:{
        type: String,
        required: true
    },
    cf_company_id:{
      type:String,
    },
    cf_first_name:{
        type: String,
        required: true
    },
    cf_last_name:{
        type: String,
        required: true
    },
    cf_email:{
        type: String,
        required: true
    },
     cf_password:{
        type: String,
      //  required: true
    },
    cf_user_status:{
        type: String,
        required: true
    },
    cf_activation_token: {
        type: String,
        required: true
    },
    cf_createdAt: {
        type: String,
        default: helper.getCurrentDate()
    }
   // cf_registeredAt: {type: Date, default: helper.formatDate(new Date())}
});

const User = module.exports = mongoose.model('cf_users', UserSchema);