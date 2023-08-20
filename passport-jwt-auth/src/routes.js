import express from "express";
import passport from "passport";
import * as db from "./database.js";
import * as passwd from "./passport.js";

import * as CFG from "./config.js";


// Create a router object and populate it with code to handle routes
// Then we can use this router object in the main file 
// without cluttering up the main file with code for the routes
export const router = express.Router();

/**
 *----------- POST ROUTES ------------------
 */

 /**
  * login route uses a route-specific middleware: passport.authenticate('local')
  * 
  * passport.authenticate('local') calls verifyCallback() function that we registered with passport.use()
  * in the passport.js file. 
  */
router.post("/login",async  (req, res, next)=>{
    try{
        let user_found = await db.User.findOne({username: req.body.username});
        if(!user_found){
            res.status(CFG.HTTP_UNAUTHORIZED).json({success: false, msg: `Could not find user ${req.body.username}`});
        }
        const valid_pwd = passwd.validatePassword(req.body.password, user_found.hash, user_found.salt);
        if(valid_pwd){
            const jwt_token = passwd.issueJWT(user_found);
            res.cookie(CFG.JWT_COOKIE_NAME, jwt_token, {
                httpOnly: true,
                secure: true,
                maxAge: CFG.AUTH_COOKIE_AGE,
            } );
            res.redirect("/secret-page"); 
        }else{
            res.redirect("/login");
        }
    }catch(err){
        next(err);
    }

});


router.post("/register", async (req, res, next)=>{
    const saltHash = passwd.genPasswordHash(req.body.password);
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    try{
        let user_found = await db.User.findOne({username: req.body.username});

        if(user_found){
            //let err = new Error();
            const err_message=`User ${req.body.username} already exists. Can't register again.`;
            return res.status(CFG.HTTP_CLIENT_BAD_REQUEST).json({message: err_message});
        }

        const newUser = new db.User({
            username: req.body.username,
            hash: hash,
            salt: salt,
        });

    
        await newUser.save();
        console.log("New user created in database: "+ req.body.username);

        const jwtToken = passwd.issueJWT(newUser);
        // We will use the cookie approach to store JWT token
        // as this means brower will send cookie with JWT token on each future request
        //  This means we don't have to write front-end code to manage JWT token,
        // and to attach it to header in each http request
        res.cookie(CFG.JWT_COOKIE_NAME, jwtToken, {
            httpOnly: true,
            //secure: true,
            maxAge: CFG.AUTH_COOKIE_AGE,
        } );
        res.redirect("/login"); // make user login after register

    }catch(err){
        const err_message = `Error creating new user ${req.body.username}. Message: ${err.message}`;
        console.log(err_message);
        return res.status(CFG.HTTP_INTERNAL_SERVER_ERROR).json({message: err_message});
    }
});


/**
 * ---------- GET ROUTES ----------------------
 */

router.get("/", (req, res, next)=> {
    console.log("Get called on /");
    res.render("home");
});


router.get("/login", (req, res, next)=> {
    res.render("login");
});

router.get("/register", (req, res, next)=> {
    res.render("register");
});


/**
 * This is a protected resource. Only render secret-page for authenticated users!
 */
router.get("/secret-page", passport.authenticate('jwt', {session: false}), (req, res, next)=> {
    // Don't need authentication check here due to authenticate middleware

    res.render("secret-page");

});

router.get("/login-failure", (req, res, next)=> {
    res.render("login-failure");
});

/**
 * logout() is now async and takes a callback function that is called whether there is err or not
 * So res.redirect() has to be inside the callback function.
 */
router.get("/logout", (req, res, next)=> {
    return res.clearCookie(CFG.JWT_COOKIE_NAME).status(200).json({message: 'Successfully logged out'}); // clear cookie that stored JWT token

});

console.log("Routes registered!");