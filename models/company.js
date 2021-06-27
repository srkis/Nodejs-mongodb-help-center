const mongoose = require('mongoose');
const helper = require('../helper_functions/functions');
// Company Schema
const CompanySchema = mongoose.Schema({
    cf_app_id:{
        type: String,
        required: true
    },
    cf_company_name:{
        type: String,
        required: true
    },
    cf_user_id:{
        type: String,
        required: true
    },
    //new company_id je ID kompanije koja ga je ubacila kod sebe - setujemo company_status na inactive or ivited or disabled..
    cf_new_company_id:{
        type: String,
    },
    cf_invited_by:{
        type: String,
    },
    cf_user_role:{
        type: String,
        required: true
    },
    cf_company_status:{
        type: String,
    },
    cf_createdAt: {
        type: String,
        default: helper.getCurrentDate()
    }
});

const Company = module.exports = mongoose.model('cf_users_company', CompanySchema);