const mongoose = require('mongoose');
const helper = require('../helper_functions/functions');
// Kada user posalje poruku prvo ubacujemo u ovu tabelu zbog notifikacije na dashboardu. Kada neko na dashboardu klikne i preuzme poruku na sebe
// Mi uzimamo njegov ID i upisujemo ili radimo update u chat_message schemu gde ce se zapisivati konverzacija izmedju usera i dashboarda

const ToCompanyMessageSchema = mongoose.Schema({
    cf_app_id:{
        type: String,
        required: true
    },
    cf_to_company_id:{
        type: String,
        required: true
    },
    /*Ovo treba da nam bude privremeni user_id - local storage, sesion ili cookie*/
    cf_from_user_id:{
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
    cf_message_status:{
      type: String,
      required:true
    },
    cf_createdAt: {
        type: String,
        default: helper.getDateAndTime()
    }
});

const Chat_message = module.exports = mongoose.model('cf_to_company_message', ToCompanyMessageSchema);

//Koristimo user email za registrovane usere i app id i tako mu   vracamo chat history ako ga ima.