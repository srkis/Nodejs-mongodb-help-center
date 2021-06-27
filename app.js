const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const expressValidator = require('express-validator');
const Mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');
const auth = require('./config/database');
const helper = require('./helper_functions/functions');

require('./config/passport')(passport);
Mongoose.connect(config.database, { useNewUrlParser: true });
let db = Mongoose.connection;

// Check connection
db.once('open', function(){
    console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function(err){
    console.log(err);
});

 app.set('port', process.env.PORT || 4000);

//View engine
app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'));

//Body parser middleware
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

// Set static Path
app.use(express.static(path.join(__dirname,'public')));

// Express Session Middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Express Messages Middleware
app.use(flash());

// Global vars - messages
app.use(function (req, res, next) {
    res.locals.sessionUser = req.session.user;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error_add_page_msg = req.flash('error_add_page_msg');
    res.locals.success_add_page_msg = req.flash('success_add_page_msg');
    res.locals.error = req.flash('error'); // na loginu kada su pogresni podaci
    next();
});

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
            , root    = namespace.shift()
            , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));


//Rute za sajt.

app.use('/', require('./routes/index.js'));

//Rute za admin (users)
let users = require('./routes/users');
app.use('/users', users);


let pages = require('./routes/pages');
app.use('/pages', pages);

let chat = require('./routes/chat');
app.use('/chat', chat);


let page_categories = require('./routes/page_categories');
app.use('/page_categories', page_categories);


let server = require('http').createServer(app);
const io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {

    socket.on('send message', function(data){


         chat.send_message(data,(callback) => {

            console.log("opa callback",callback);

             if(callback && callback.notification == true){
                 io.sockets.emit('notification', callback);
             }

            // Saljemo na dashboard
           // io.sockets.emit('to company', data);

        });




        //vracamo na klijent
        io.sockets.emit('new message', data);
    });
});



app.use(function(req, res, next){
    res.status(404).render('404/404', {title: "Sorry, page not found"});
});

server.listen(app.get('port'));
console.log("APP running on port: ", app.get('port'));
