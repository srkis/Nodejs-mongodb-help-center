const mongoose = require('mongoose');
const helper = require('../helper_functions/functions');
const  URLSlugs = require('mongoose-url-slugs');

mongoose.set('useCreateIndex', true)

// User Schema
const PageCategorySchema = mongoose.Schema({
    cf_page_category_name:{
        type: String,
        required: true
    },
    cf_company_id:{
        type: String,
        required: true
    },
    cf_created_by_user_id:{
        type: String,
        required: true
    },
    cf_page_category_description:{
        type: String,
        required: true
    },
    //Pravi se od category name-a koji user unosi na dashboardu
    cf_page_category_slug:{
        type: String,
},
    cf_createdAt: {
        type: String,
        default: helper.getCurrentDate()
    }
});

PageCategorySchema.plugin(URLSlugs('cf_page_category_name', {field: 'cf_page_category_slug'}));

const PageCategory = module.exports = mongoose.model('cf_pages_categories', PageCategorySchema);