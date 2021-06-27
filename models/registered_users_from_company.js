const mongoose = require('mongoose');
const helper = require('../helper_functions/functions');

// Useri koji su regitrovani kod njihovih kompanija. Oni nama salju email i username, mi cuvamo kod nas i generisemo unique id za tog usera
// je nam treba zbog chat-a.

const Registered_users_from_company = mongoose.Schema({
    cf_username:{
        type: String,
        required: true
    },
    cf_email:{
        type: String,
        required: true
    },
     cf_user_company_id:{
        type: String,
        required: true
    },
     cf_user_uuid:{
        type: String,
        required: true
    },
    cf_createdAt: {
        type: String,
        default: helper.getCurrentDate()
    }
});

const User = module.exports = mongoose.model('cf_registered_users_from_company', Registered_users_from_company);
