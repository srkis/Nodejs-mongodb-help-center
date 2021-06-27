const mongoose = require('mongoose');
const helper = require('../helper_functions/functions');
// App Schema
const CompanyAppSchema = mongoose.Schema({
    cf_app_id:{
        type: String,
        required: true
    },
    cf_company_id:{
        type: String,
        required: true
    },
    /*User koji se prvi registrovao i napravio app */
    cf_created_by_user_id:{
        type: String,
        required: true
    },
    cf_app_subscription:{
        type: String,
        required: true
    },
    cf_createdAt: {
        type: String,
        default: helper.getCurrentDate()
    }
});

const Company_app = module.exports = mongoose.model('cf_company_app', CompanyAppSchema);