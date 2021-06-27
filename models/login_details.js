const mongoose = require('mongoose');
const helper = require('../helper_functions/functions');
// User Schema
const LoginDetailsSchema = mongoose.Schema({
    cf_app_id:{
        type: String,
        required: true
    },
    cf_company_id:{
      type:String,
    },
    cf_user_id:{
        type: String,
        required: true
    },
    cf_last_activity:{
        default: {type: Date, default: new Date()}
    }

});


const DetailsSchema = module.exports = mongoose.model('cf_login_details', LoginDetailsSchema);