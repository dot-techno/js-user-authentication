import passport from "passport";
import crypto from "crypto";
import {Strategy as LocalStrategy} from "passport-local";
import * as db from "./database.js";

const HASH_ITERATIONS = 10000; // how many iterations to do to hash password

// if fields in the html form are not called username and password
// then we need to use this object to tell passport which fields to look for
const customFields = {
    usernameField: 'username',
    passwordField: 'password',
}

/**
 * Set up password to use local strategy with custom fields and our verify callback function
 */
passport.use(new LocalStrategy(customFields, verifyCallback));


/**
 * Verify call back function
 * 
 * @param {*} username 
 * @param {*} password 
 * @param {*} done 
 * @returns calls done() call back function 
 */
async function verifyCallback(username, password, done) {
    let user_found = undefined;

    try {
        user_found = await db.User.findOne({username: username});
        if(!user_found){
            return done(null, false); // operation done but user not found
        }
        const isValid = validatePassword(password, user_found.hash, user_found.salt);
        if(isValid){
            return done(null, user_found); // user authenticated
        }else {
            return done(null, false); // password was wrong
        }
    }catch(err){
        done(err); // send error to call-back
    }
}

passport.serializeUser((user, done)=>{
    done(null, user.id);
});


passport.deserializeUser( async (userID, done)=> {
    try{
        let user_found = await db.User.findById(userID);
        done(null, user_found);
    }catch(err){
        done(err);
    }
});



export function validatePassword(password, hash, salt){
    let hashVerify = crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, 64, 'sha512').toString('hex');

    return hash===hashVerify;
}


export function genPasswordHash(password) {
    let salt = crypto.randomBytes(32).toString('hex');
    let genHash = crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, 64, 'sha512').toString('hex');

    return {
        salt: salt,
        hash: genHash,
    };
}


