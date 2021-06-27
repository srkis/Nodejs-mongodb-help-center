
class Chat {
  constructor(chattySettings) {

      let obj = this;

        // Load in chat init
     this.socket = io.connect();

     console.log(this.socket);

       if(chattySettings.hasOwnProperty("email") && chattySettings.hasOwnProperty("app_id")){
            this.userEmail = chattySettings.email;
            this.appId = chattySettings.app_id;

      }else if(!chattySettings.hasOwnProperty("email") && chattySettings.hasOwnProperty("app_id")){
        this.userEmail = null;
        this.appId = chattySettings.app_id;

      }else if(chattySettings.hasOwnProperty("email") && !chattySettings.hasOwnProperty("app_id")){
          this.appId = null;
      }else if(chattySettings.email === ""){
           this.userEmail = null;
       }

      this.socket.on('new message', function (data) {
          obj.returningMsgFromSocket(data);

      });

  }



  sendMessage(message) {

      let chat_converse = $('#chat_converse');

        /*
          chat_converse.append(
              ' <span class="chat_msg_item chat_msg_item_admin">'+
              '<div class="chat_avatar">'+
              '<img src="http://res.cloudinary.com/dqvwa7vpe/image/upload/v1496415051/avatar_ma6vug.jpg">'+
              '</div>' + data + '</span>');
  */


      let data = {

            app_id : window.ChattySettings.app_id,
            email  : window.ChattySettings.email,
            username :  window.ChattySettings.name,
            message: message
      };

     // console.log("ovde2", this.socket);

       this.socket.emit('send message', data );


      
            $.ajax({
              url: '../chat/send_message',
              type: 'post',
              data: data,
              success: function( res, textStatus, jQxhr ){
                  console.log(res);
              },
              error: function( jqXhr, textStatus, errorThrown ){
                  console.log( errorThrown );
              }
        });

       
  }

  returningMsgFromSocket(data){
      let chat_converse = $('#chat_converse');
      chat_converse.append(' <span class="chat_msg_item chat_msg_item_user">' + data.message + '</span>');
  }


  //Kada klikne na chat
  getChatHistory() {

    

    if(this.appId == null ) {
          console.log("Error! Missing APP ID");
          return;
    }

   if(this.userEmail == ""){
       console.log("prazan");

    
   }else{
       console.log("nije prazan");
   }
         
        // Ako je registrovan dobavljamo mu chat history   
     if(this.userEmail !== null && this.userEmail !== 'undefined' && this.userEmail !== "") {
          //Registrovan user
        let data = {
              appId: this.appId,
              userEmail: this.userEmail
           };
                $.ajax({
                  url: '../chat/getUserChat',
                  type: 'post',
                  data: data,
                  success: function( res, textStatus, jQxhr ){

                      if(res.chatHistory && res.chatHistory.length > 0) {

                        $('#chat_conversation').append(

                        '<div class="container drop-shadow" style="width:335px !important">'+
                        '<p style="margin-top: 5px;">Your conversation</p>'+
                        '<i class="icon-chevron-left"></i>'+
                        '<div class="container" style="width:260px !important">'+
                            '<div class="row">'+
        
                                '<div id="first_page_msg" class="first-page-msg">'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                        '<p>&nbsp;</p>'+
                    '</div>'

                    );

                          $.each(res.chatHistory, function (i, item) {
                           // console.log(item);
                            $('#first_page_msg').append(

                            '<div style="display: table-row">'+
                                '<div class="first-page-img">'+
                                  '<img class="head" src="http://res.cloudinary.com/dqvwa7vpe/image/upload/v1496415051/avatar_ma6vug.jpg" style="width: 45px;">'+
                                  '</div>'+
                                  '<div style="display: table-cell; vertical-align: middle">'+
                                      '<p style="float: left; line-height: 10px;margin-left: 5px;"> '+item.cf_user_name+' </p><br>'+
                                      '<p style="float: left; line-height: 7px; margin-left: 5px;" > '+item.cf_chat_message+'</p>'+
                                  '</div>'+
                              '</div>'
                            );
                        });

                      }

                  },
                  error: function( jqXhr, textStatus, errorThrown ){
                      console.log( errorThrown );
                  }
            });

    }else{

         let userData =  JSON.parse(localStorage.getItem("userData"));

         console.log(userData);

                //Ako nema nista u localstorage
             if(userData == null ) {
                 let userLocalStorageArr = [];
                 let uniqueId = this.generateUniqueId();
                 let appId = this.appId;
                 let user = {uniqueId, appId};
                 userLocalStorageArr.push(user);
                 localStorage.setItem("userData", JSON.stringify(userLocalStorageArr));
                 let data = {
                     appId: this.appId,
                     uuid: uniqueId
                 };

                 $.ajax({
                     url: '../chat/getUserChat',
                     type: 'post',
                     data: data,
                     success: function( res, textStatus, jQxhr ){
                        // console.log(res);
                     },
                     error: function( jqXhr, textStatus, errorThrown ){
                         console.log( errorThrown );
                     }
                 });

             }else{
               //Ako ima podatke u localStorage

                 let data = {
                     appId: userData[0].appId,
                     uuid: userData[0].uniqueId
                 };
                 // Ako neregistrovan user (visitor) ima localstorage
                 $.ajax({
                     url: '../chat/getUserChat',
                     type: 'post',
                     data: data,
                     success: function( res, textStatus, jQxhr ){
                       //  console.log(res);
                     },
                     error: function( jqXhr, textStatus, errorThrown ){
                         console.log( errorThrown );
                     }
                 });

             }


     }

  }

  generateUniqueId () {
     return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
 }

}
