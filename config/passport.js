const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load user model
const User = require('../models/users');

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({usernameField: 'email', passwordField: 'password'}, (email, password, done) =>{
            //Match user
            User.findOne({cf_email: email})
                .then(user => {
                    if(!user){
                        return done(null, false,{message: 'That email does not exists'});
                    }
                    // Match password
                    bcrypt.compare(password, user.cf_password, (err, isMatch) => {
                        if(err) throw err;
                        if(isMatch){
                            return done(null, user);
                        }else{
                            return done(null, false, {message:'Incorect password.'})
                        }
                    });
                })
                .catch(err => console.log(err))
        })
    )

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err,user) =>  {
            done(err,user);
        });
    });


}