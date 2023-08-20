import passport from "passport";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import {Strategy as JwtStrategy} from "passport-jwt";
import * as db from "./database.js";
import {PUB_KEY, PRIV_KEY} from "./cryptoKeys.js";

import {JWT_COOKIE_NAME} from "./config.js";

const HASH_ITERATIONS = 10000; // how many iterations to do to hash password

var cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies) {
        token = req.cookies[JWT_COOKIE_NAME];
    }
    return token;
};

/**
 * Options object to pass to JwtStrategy
 *      At a minimum, we must pass the `jwtFromRequest` and `secretOrKey` properties
 * 
 * fromAuthHeaderAsBearerToken expects the following  in the header:
 *      Authorization: Bearer <jwt token>
 */
const jwtOpts = {
    // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    jwtFromRequest: cookieExtractor,
    secretOrKey: PUB_KEY, // check signature of token using Public Key -- generate/issue it using private key
    algorithms: ['RS256'],
    // ignoreExpiration: false,
    // issuer: 'enter issuer here',
    // audience: 'enter audience here',
    // passReqToCallback: false
    // jsonWebTokenOptions: {
    //      complete: false,
    //      clearTolerance: '',
    //      maxAge: '2d', // how long token should last for
    //      checkTimestamp: '100',
    //      nonce: 'sting ehre for OpenID',    
    //}
}

/**
 * Set up password to use local strategy with custom fields and our verify callback function
 */
passport.use(new JwtStrategy(jwtOpts, verifyCallback));


/**
 * Verify call back function
 *  This is called after JWT has been verified
 *  So in this function, we can assume that JWT is valid and we just find user
 *  so that the user can be added to the request object.
 * 
 * @param {*} payload 
 * @param {*} done 
 * @returns calls done() call back function 
 */
async function verifyCallback(payload, done) {
    let user_found = undefined;

    try {
        // payload has field 'sub' which  has id of subject (i.e. user)
        user_found = await db.User.findOne({_id: payload.sub});
        if(user_found){
            return done(null, user_found); // User found (JWT token is validated before calling this func)
        }else{
            return done(null, false); // user not found
        }

    }catch(err){
        done(err, false); // send error to call-back
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

/**
 * Creates a JWT token when users logins.
 * @param {} user 
 */
export function issueJWT(user){
    const _id = user._id; // note: even though schema does not have _id, MongoDb adds is automatically
    //const expiresIn = '3d';

    const payload = {
        sub: _id,
        iat: Date.now(),

    };

    const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, 
                                         { algorithm: 'RS256' });
    
    return signedToken; // return JWT token
}