const mongoose = require('mongoose');
const helper = require('../helper_functions/functions');
// Company Schema
const Group_members_Schema = mongoose.Schema({
    cf_group_id:{
        type: String,
        required: true
    },
    cf_user_id:{
        type: String,
        required: true
    },
    //new company_id je ID kompanije koja ga je ubacila kod sebe - setujemo company_status na inactive or ivited or disabled..
    cf_company_id:{
        type: String,
    },
    cf_invited_by:{
        type: String,
    },
    cf_owner_id:{
        type: String,
    },
    cf_user_role:{
        type: String,
        required: true
    },
    cf_invited_status:{
      type:String,
    },
    cf_activation_token:{
        type:String,
    },
    cf_createdAt: {
        type: String,
        default: helper.getCurrentDate()
    },
    cf_invite_url_expire:{
        type: String,
    }
});

const GroupMembers = module.exports = mongoose.model('cf_group_members', Group_members_Schema);
