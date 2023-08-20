//import passport from "passport";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import * as CFG from "./config.js";

import {PUB_KEY, PRIV_KEY} from "./cryptoKeys.js";

// JWT_COOKIE_NAME is the name we give as 'key' to cookie to store JWT token when we created it
import {JWT_COOKIE_NAME} from "./config.js";

const HASH_ITERATIONS = 10000; // how many iterations to do to hash password


/**
 * If client is passing JWT token in an authorization header like this:
 *      Authorization: Bearer <JWT Token>
 * then this function can be used to extract the token from the header
 * 
 * Returns null if token is not present or if it does not have a valid format
 */

function extractJWTFromAuthHeader(req){
    var token = null;
    const tokenParts = req.headers.authorization.split(' ');

    // token will have this struction: <chars>.<chars>.<chars>
    // regex to check for this structure: 
    const token0 = tokenParts[0].trim();
    const token1 = tokenParts[1].trim();

    if(token0 === "Bearer" && token1.match(/\S*\.\S*\.\S*/) !== null ){
        token = token1;
    }

    return token;
}
/**
 * If client is passing JWT token in a cookie, this funciton can be used to extract
 * the token from the cookie 
 * 
 * Returns null if cookie has no field with JWT_COOKIE_NAME
 *
 */
function cookieExtractor(req) {
    var token = null;
    if (req && req.cookies) {
        token = req.cookies[JWT_COOKIE_NAME];
    }
    return token;
};

/**
 * This is our custome middleware that will use JWT authentication 
 * We will use this instead of passport.authenticate('jwt', {session: false})
 * 
 * Adds jwt to req (req.jwt) to store decoded payload from JWT token
 *
 */
export function customAuthMiddleware(req, res, next){
    var token = cookieExtractor(req); // replace this with whatever extractor we need

    if(token == null){ // double equality allows for null or undefined to match null
        res.status(CFG.HTTP_UNAUTHORIZED).json({success: false, msg: "JWT token not found or invalid."});

    }

    jsonwebtoken.verify(token, PUB_KEY, {algorithms: ['RS256']}, (err, decoded)=>{
        if(err){
            res.status(CFG.HTTP_UNAUTHORIZED).json({success: false, msg: err.message});
        }else{
            req.jwt = decoded; // store decoded payloud in request for later use
            next(); // successful verification so continue to next middleware (most likely route)
        }
    });

}



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