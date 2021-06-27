const mongoose = require('mongoose');
const helper = require('../helper_functions/functions');
// User Schema
const PagesSchema = mongoose.Schema({
    cf_page_title:{
        type: String,
        required: true
    },
    cf_page_description:{
        type: String,
        required: true
    },
    cf_page_content:{
        type: String,
        required: true
    },
    cf_search_content:{
        type: String,
        required: true
    },
    cf_page_status:{
        type: String,
        required: true
    },
    cf_company_id:{
      type: String,
      required: true
    },
    cf_cat_id:{
        type: String,
        required: true
    },
    cf_created_by_user_id:{
        type: String,
        required: true
    },
    cf_createdAt: {
        type: String,
        default: helper.getCurrentDate()
    }
});

const Pages = module.exports = mongoose.model('cf_pages', PagesSchema);