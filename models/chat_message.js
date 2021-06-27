const mongoose = require('mongoose');
const helper = require('../helper_functions/functions');
// Company Schema
const ChatMessageSchema = mongoose.Schema({
    cf_app_id:{
        type: String,
        required: true
    },
    cf_to_company_id:{
        type: String,
        required: true
    },
   
    cf_from_user_id:{
        type: String,
    },
    cf_to_user_id:{  // ovo treba da bude user sa dashboard-a, koji je preuzeo poruku na sebe
        type: String,
    },
    cf_user_name:{
        type: String,
    },
    cf_user_email:{
        type: String,
    },
    cf_chat_message:{
        type: String,
        required: true
    },
    cf_createdAt: {
        type: String,
        default: helper.getCurrentDate()
    }
});

const Chat_message = module.exports = mongoose.model('cf_chat_message', ChatMessageSchema);

//Koristimo user email za registrovane usere i app id i tako mu   vracamo chat history ako ga ima.