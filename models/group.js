const mongoose = require('mongoose');
const helper = require('../helper_functions/functions');
// Company Schema
const GroupSchema = mongoose.Schema({
    cf_group_name:{
        type: String,
        required: true
    },
    cf_app_id:{
        type: String,
        required: true
    },
    cf_company_id:{
        type: String,
    },
    cf_group_status:{
        type:String,
        required:true
    },
    cf_createdAt: {
        type: String,
        default: helper.getCurrentDate()
    }
});

const Group = module.exports = mongoose.model('cf_group', GroupSchema);
