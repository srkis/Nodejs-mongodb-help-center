
$(document).ready(function() {

    $("#search-msg").on("keydown",function (e) {


        if(e.keyCode == 13) {
            console.log("enter");
            var query = $(this).val();

            if(query.trim() == ''){
                console.log('prazan msg');
                return false;
            }

            $('#search-msg').val(' ');


            $.ajax({
                type: "POST",
                //url: '/users/add',
                url: 'http://localhost:4000/pages/search',
                data: {
                    query:query,

                },
                success: function(results) {
                    var html_to_append = '';

                    $.each(results.data, function(i, item) {
                        html_to_append +=



                            ' <div style="cursor:pointer" data-page-id="'+item.page_id +'" class="first-page-msg search_item">' +
                            '<div style="display: table-row">' +
                            '<div class="first-page-img">' +
                            ' <i style="color:#888; " class="fa fa-file-text-o fa-3x "></i>' +
                            '</div>' +
                            '<div style="display: table-cell; vertical-align: middle;">' +
                            // '<p style="float: left;margin-left: 10px;">  Can I run background SSH processes via SSH?  </p>' +
                            '<p style="float: left;margin-left: 10px;"> '+ item.page_title+' </p>' +
                            //  '<p style="float: left; line-height: 7px; margin-left: 10px;" > '+ item.page_description +'</p>' +  Can I run background SSH processes via SSH?
                            '</div>' +
                            '</div>' +
                            '</div>';

                    });


                    $("#search_results").html(html_to_append);
                    $("#search_div").css('display', 'block');

                },
                error: function(results) {
                    console.log('error');
                }
            });


        }
    });

// Kada se klikne na dobijeni search page
    $(document).on("click", ".search_item", function (e) {
        var pageId = $(this).attr("data-page-id");
        e.stopPropagation();

        $.ajax({
            type: "GET",
            url: 'http://localhost:4000/pages/get_search_page',
            data: {
                pageId:pageId,

            },

            success: function(page) {

                var html_to_append = '';

                $.each(page.data, function(i, item) {
                    html_to_append +=
                        '<div class="container">'+
                        '<div class="row">'+
                        item.page_content
                    '</div>'+
                    '</div>';

                    //  var pageContent = item.page_content;

                    $("#showPage").html(html_to_append);


                });




                hideChat(5);

            },
            error: function(page) {
                console.log('error');
            }
        });




    });


    setTimeout(function(){
        $('#prime').click(function() {

            toggleFab();

        });
        hideChat(0);
    }, 100);



    setTimeout(function(){

        $('#back0').click(function() {
            hideChat(0);
        });
    }, 200);

    setTimeout(function(){

        $('#back1').click(function() {
            hideChat(1);
        });

    }, 200);

    setTimeout(function(){

        $('#back2').click(function() {
            hideChat(2);
        });

    }, 200);

    setTimeout(function(){

        $('#back3').click(function() {
            hideChat(3);
        });

    }, 200);

//Toggle chat and links
    function toggleFab() {

        $('.prime').toggleClass('zmdi-comment-outline');
        $('.prime').toggleClass('zmdi-close');
        $('.prime').toggleClass('is-active');
        $('.prime').toggleClass('is-visible');
        $('#prime').toggleClass('is-float');
        $('.chat').toggleClass('is-visible');
        $('.fab').toggleClass('is-visible');
    }
    setTimeout(function(){

        $('#chat_first_screen').click(function(e) {
            hideChat(1);
        });
    }, 210);

    setTimeout(function(){
        $('#chat_second_screen').click(function(e) {
            hideChat(2);
        });

    }, 220);

    setTimeout(function(){

        $('#chat_third_screen').click(function(e) {
            hideChat(3);
        });

    }, 230);

    setTimeout(function(){

        $('#chat_fourth_screen').click(function(e) {
            hideChat(4);
        });

    }, 240);

    setTimeout(function(){

        $('#close_search_page').click(function(e) {
            hideChat(0);
        });

    }, 250);

    $('#chat_fullscreen_loader').click(function(e) {
        $('.fullscreen').toggleClass('zmdi-window-maximize');
        $('.fullscreen').toggleClass('zmdi-window-restore');
        $('.chat').toggleClass('chat_fullscreen');
        $('.fab').toggleClass('is-hide');
        $('.header_img').toggleClass('change_img');
        $('.img_container').toggleClass('change_img');
        $('.chat_header').toggleClass('chat_header1');
        $('.fab_field').toggleClass('fab_field2');
        $('.chat_converse').toggleClass('chat_converse2');
        //$('#chat_converse').css('display', 'none');
        // $('#chat_body').css('display', 'none');
        // $('#chat_form').css('display', 'none');
        // $('.chat_login').css('display', 'none');
        // $('#chat_fullscreen').css('display', 'block');
    });

    function hideChat(hide) {
        switch (hide) {
            case 0:
                $('.chat_header').css('display', 'block');
                $("#showPage").css('display', 'none');
                $('.search_page_header').css('display', 'none');
                $('#chat_converse').css('display', 'none');
                $('#chat_body').css('display', 'none');
                $('#chat_form').css('display', 'none');
                $('.chat_header1').css('display', 'none');
                $('.chat_header2').css('display', 'none');
                $('.chat_header3').css('display', 'none');
                $('.chat_header4').css('display', 'none');
                $('.chat_login').css('display', 'block');
                $('.chat_fullscreen_loader').css('display', 'none');
                $('#chat_fullscreen').css('display', 'none');
                $('.fab_field').css('display', 'none');
                break;
            case 1:
                $('.chat_header').css('display', 'none');
                $('.chat_header2').css('display', 'none');
                $('.chat_header3').css('display', 'none');
                $('.chat_header1').css('display', 'block');
                $('.chat_option').toggleClass('is-visible');
                $('#chat_head').toggleClass('is-visible');
                $('#chat_head-text').toggleClass('is-visible');
                $('.fab_field').css('display', 'block');
                $('#chat_converse').css('display', 'block');
                $('#chat_body').css('display', 'none');
                $('#chat_form').css('display', 'none');
                $('.chat_login').css('display', 'none');
                $('.chat_fullscreen_loader').css('display', 'block');
                break;
            case 2:
                $('.chat_header1').css('display', 'none');
                $('.chat_header3').css('display', 'none');
                $('.chat_header').css('display', 'none');
                $('.chat_header2').css('display', 'block');
                $('#chat_converse').css('display', 'none');
                $('#chat_body').css('display', 'block');
                $('#chat_form').css('display', 'none');
                $('.chat_login').css('display', 'none');
                $('.chat_fullscreen_loader').css('display', 'block');
                $('.fab_field').css('display', 'none');
                break;
            case 3:
                $('.chat_header4').css('display', 'none');
                $('.chat_header2').css('display', 'none');
                $('.chat_header3').css('display', 'block');
                $('.chat_converse').css('display', 'none');
                $('#chat_body').css('display', 'none');
                $('#chat_form').css('display', 'block');
                $('.chat_login').css('display', 'none');
                $('.chat_fullscreen_loader').css('display', 'block');
                break;
            case 4:
                $('.chat_header4').css('display', 'block');
                $('.chat_header3').css('display', 'none');
                $('#chat_converse').css('display', 'none');
                $('#chat_body').css('display', 'none');
                $('#chat_form').css('display', 'none');
                $('.chat_login').css('display', 'none');
                $('.chat_fullscreen_loader').css('display', 'block');
                $('#chat_fullscreen').css('display', 'block');
                break;
            case 5:
                $("#showPage").css('display', 'block');
                $('.search_page_header').css('display', 'block');
                $('.chat_header').css('display', 'none');
                $('.chat_header3').css('display', 'none');
                $('#chat_converse').css('display', 'none');
                $('#chat_body').css('display', 'none');
                $('#chat_form').css('display', 'none');
                $('.chat_login').css('display', 'none');
                break;
            case 6:
                $("#showPage").css('display', 'none');
                $('.search_page_header').css('display', 'none');
                $('.chat_header1').css('display', 'block');
                $('.chat_option').toggleClass('is-visible');
                $('#chat_head').toggleClass('is-visible');
                $('#chat_head-text').toggleClass('is-visible');
                $('.fab_field').css('display', 'block');
                $('#chat_converse').css('display', 'block');
                $('#chat_body').css('display', 'none');
                $('#chat_form').css('display', 'none');
                $('.chat_login').css('display', 'none');
                break;
        }
    }



// Show Emoji on chat
    $("#showEmoji").click(function() {
        $('.emoji-picker').toggleClass("hide show");
    });

    let emojiPicker = {
        emojiData : {},
        initialize: function(emojiData) {
            this.emojiData = emojiData;
            return this;
        },
        parseUnicode: function(emojiUnocode) {
            return emojiUnocode
                    .replace(/u[+]/gi, '&#x')
                    .replace(/ /gi, ';')
                + ';';
        },
        renderEmojiGroup: function(emojiGroupName) {
            let $emojis = $('<div />', { class: 'emoji-group'});
            $emojiCategory = $('<div />', {class: 'emoji-category'});
            $emojiCategory.text(emojiGroupName);
            $emojis.append($emojiCategory);
            return $emojis;
        },
        renderEmoji: function(emoji) {
            var $emoji = $('<div />', {class: 'emoji'});
            var emojiCode = this.parseUnicode(emoji.code);
            $emoji.html(emojiCode);
            $emoji.attr('title', emoji.no + ' : ' + emoji.code);

            if ( emoji.hasOwnProperty('types') ) {
                var $emojiTypes = $('<div />', {class: 'emoji-types'});
                $emojiTypes.append($emoji.clone());

                for (var type in emoji.types) {
                    var $emojiType = $('<div />', { class: 'emoji'});
                    var emojiCode = this.parseUnicode(emoji.types[type]);
                    $emojiType.html(emojiCode);
                    $emojiTypes.append($emojiType);
                }

                $emoji.append($emojiTypes);
                $emoji.addClass('emoji-with-types');
            }

            return $emoji;
        },
        render: function() {
            var $emojiPicker = $('<div />', {class: 'emoji-picker'});
            for(var emojiGroup in this.emojiData) {
                var $emojiGroup = this.renderEmojiGroup(emojiGroup);

                for(var emoji in this.emojiData[emojiGroup]) {
                    if (this.emojiData[emojiGroup][emoji].flagged || this.emojiData[emojiGroup][emoji].no === 18) continue;

                    var $emoji = this.renderEmoji(this.emojiData[emojiGroup][emoji])
                    $emojiGroup.append($emoji);
                }

                $emojiPicker.append($emojiGroup);
            }

            return $emojiPicker;
        }
    };


    /*
    setTimeout(function(){

        $('#chatSend').emojioneArea({
            pickerPosition:"top",
            toneStyle: "bullet",
            hidePickerOnBlur: false
        });
    }, 240);

*/

    $(function() {

        let url = "http://localhost:4000/emoji/emoji.js?callback=jsonCallback";
        $.ajax({
            type: 'GET',
            url: url,
            async: false,
            dataType: 'jsonp',
            jsonpCallback: 'jsonCallback',
            contentType: "application/json",

            success: function(emojiData) {
                let $emojiPicker = emojiPicker.initialize(emojiData).render();
                $('#chat_converse').append($emojiPicker);
            },
            error: function(e) {
                console.log(e.message);
            }
        });

     /*
     //   $.getJSON('http://localhost:3000/emoji/emoji.json', function(emojiData) {
          $.getJSON('https://api.myjson.com/bins/4sz7d', function(emojiData) {
            console.log(emojiData);
            let $emojiPicker = emojiPicker.initialize(emojiData).render();
            $('#chat_converse').append($emojiPicker);
            //  $('body').append($emojiPicker);
        });
*/

        let $input = $('#chatSend');

        $('body').on('click', '.emoji-picker>.emoji-group>.emoji:not(.emoji-with-types), .emoji-picker>.emoji-group>.emoji.emoji-with-types>.emoji-types>.emoji', function() {
            $input.val($input.val() + $(this).text());
            $input.focus();
        }).on('click', '.emoji-picker>.emoji-group>.emoji.emoji-with-types', function() {
            $('.emoji-types.visible').not( $(this).find('.emoji-types') ).toggleClass('visible');
            $(this).find('.emoji-types').toggleClass('visible');
        });

    });

    let chat_converse = $('#chat_converse');

    setTimeout(function(){

        // Da proverimo ovde da li su iz kompanije poslali email, ako nisu onda iz localstorage da uzmemo?
        // Saljemo na server "new user" na socketu

        let chatOpen = document.getElementById('prime');
        let send = document.getElementById('fab_send');
        let chattySettings = window.ChattySettings;

        chatOpen.addEventListener("click", function (e) {
            e.preventDefault();

            let userChat = new Chat(chattySettings);

            console.log("userchat:",userChat);

            //Kada klikne na open chat saljemo podatke na server
            //updejtujemo username  u socket
            userChat.getChatHistory();

            send.addEventListener("click", function (e) {
                e.preventDefault();

                let message = $('#chatSend').val();
                $('#chatSend').val("");

                if(!message ){
                    return;
                }
                userChat.sendMessage(message)
                chattySettings.message = message;

            });

        });

    }, 300);






});
