//https://medium.com/@vschroeder/javascript-how-to-execute-code-from-an-asynchronously-loaded-script-although-when-it-is-not-bebcbd6da5ea

//https://www.youtube.com/playlist?list=PLxl69kCRkiI2-dfy1dLwbXyn8MaZ8oRac - chat send messages weblessons

// U google-u: asynchronous loading javascript and use function from that javascript
window.Chatty = {};

   // var prot = ("https:"===document.location.protocol?"https://":"http://");

//emojionearea-picker emojionearea-picker-position-top emojionearea-filters-position-top emojionearea-search-position-top hidden

    if(window.ChattySettings.hasOwnProperty("app_id")){
            console.log("Check if not send app_id!");

    }





    function completed() { console.log('completed'); }  // FIXME: remove logs

    function checkStateAndCall(path, callback) {
        var _success = false;
        return function() {
            if (!_success && (!this.readyState || (this.readyState == 'complete'))) {
                _success = true;
                console.log(path, 'is ready'); // FIXME: remove logs
                callback();
            }
        };
    }

window.Chatty.asyncLoadScripts = function () {

         let files = [
              "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.js",
             //"https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.dev.js",
              "http://localhost:4000/chat/chat.js",
           //"https://cdn.rawgit.com/mervick/emojionearea/master/dist/emojionearea.min.js",
         ];

        function loadNext() { // chain element
            if (!files.length) completed();
            let path = files.shift();
            let scriptElm = document.createElement('script');
            scriptElm.type = 'text/javascript';
            scriptElm.async = true;
          //  scriptElm.src = prot+path;
            scriptElm.src = path;
           // console.log(scriptElm.src);
            scriptElm.onload = scriptElm.onreadystatechange = checkStateAndCall(path, loadNext); // load next file in chain when
            // this one will be ready
            let headElm = document.head || document.getElementsByTagName('head')[0];
            headElm.appendChild(scriptElm);
        }

        for(let i = 0; i < files.length; i++){
            loadNext(); // start a chain
        }
    }

function getHTML( url, callback) {

    // Feature detection
    if ( !window.XMLHttpRequest ) return;

    // Create new request
    let xhr = new XMLHttpRequest();
    // Setup callback
    xhr.onload = function() {
        if ( callback && typeof( callback ) === 'function' ) {
            callback( this.responseXML );
        }
    }

    xhr.withCredentials = false;
    xhr.open( 'GET', url );
    xhr.responseType = 'document';
    xhr.send();

};

window.Chatty.messenger = function(chat){

    if(chat === 'start') {

        getHTML('http://localhost:4000/chat/chat.html', function (response) {
            console.log("chat hmtl");
            let someElem = document.querySelector('#chat');
            let someOtherElem = response.querySelector('#body');
            someElem.innerHTML = someOtherElem.innerHTML;

            let link = document.createElement('link');
            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.href = 'http://localhost:4000/chat/style.css';
            let head = (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(link);

            /*
            let emojiCss = document.createElement('link');
            emojiCss.type = 'text/css';
            emojiCss.rel = 'stylesheet';
            emojiCss.href = 'https://cdn.rawgit.com/mervick/emojionearea/master/dist/emojionearea.min.css';
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(emojiCss);
*/
            let bsa = document.createElement('script');
            bsa.type = 'text/javascript';
            bsa.async = true;
            bsa.src = 'http://localhost:4000/chat/main.js';
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(bsa);

        });


        $(function() {



        });


   }else{
        alert("Kurac micaga!");
    }
}


window.addEventListener('load', function() {

    let = headetTitle = '<h3>Hi, we\'re ChattyFly <img class="hand-wave" src="http://knjizara.icodes.rocks/chatbot/waving-hand-icon-26.jpg.png"></h3>';
    let div = document.getElementById('chat_head');

    if(window.ChattySettings.hasOwnProperty("name") && window.ChattySettings.name != '' && window.ChattySettings.name !==null && window.ChattySettings.name != undefined){

    headetTitle = '<h3>Hi, ' + window.ChattySettings.name +' <img class="hand-wave" src="http://knjizara.icodes.rocks/chatbot/waving-hand-icon-26.jpg.png"></h3>';;

    div.innerHTML += headetTitle;
}else{
    div.innerHTML += headetTitle;
}


});


console.log('external script loaded');
