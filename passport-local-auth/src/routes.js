import express from "express";
import passport from "passport";
import * as db from "./database.js";
import * as passwd from "./passport.js";

const HTTP_REDIRECT_CODE = 302;
const HTTP_UNAUTHORIZED = 401;

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
router.post("/login", 
    passport.authenticate('local', {
        failureRedirect: '/login-failure',
        successRedirect: '/secret-page'
    })
);


router.post("/register", async (req, res, next)=>{
    const saltHash = passwd.genPasswordHash(req.body.password);
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    try{
        let user_found = await db.User.findOne({username: req.body.username});

        if(user_found){
            console.log(`User ${req.body.username} already exists! Can't register again!`);
            let err = new Error();
            err.message=`User ${req.body.username} already exists`;
            return next(err);
        }

        const newUser = new db.User({
            username: req.body.username,
            hash: hash,
            salt: salt,
        });

    
        await newUser.save();
        console.log("New user created in database: "+req.body.username);
        res.redirect("/login"); // make user login after register
    }catch(err){
        console.log("Error creating new user: "+err.message);
        next(err);
    }
});

/**
 * -------- MIDDLEWARE TO MANAGE USER ACCESS ---------------
 */

/**
 * Middleware to check authentication status
 * Default action for un-authenticated users is to send them to login page
 * 
 * Can add to any route that must be protected. Easier than checking for auth in each route
 */
function authRequired(req, res, next){
    if(req.isAuthenticated()){
        next(); // proceed to route
    }else{
        res.redirect(HTTP_REDIRECT_CODE, "/login");
    }
}

/**
 * User schema must have a boolean admin field, that if true identifies the user as an admin
 * This middleware can be used on admin control panel route to ensure only
 * loggin in admins can access it. 
 */
function isAdmin(req, res, next){
    if(req.isAuthenticated && req.user.admin){
        next();
    }else {
        res.status(HTTP_UNAUTHORIZED).json({msg:"You are not an admin. You are not authorized to access this resource."});
    }
}
/**
 * ---------- GET ROUTES ----------------------
 */

router.get("/", (req, res, next)=> {
    res.render("home");
});


router.get("/login", (req, res, next)=> {
    res.render("login");
});

router.get("/register", (req, res, next)=> {
    res.render("register");
});

router.get("/admin", isAdmin, (req, res, next)=> {
    res.render("admin");
});

/**
 * This is a protected resource. Only render secret-page for authenticated users!
 */
router.get("/secret-page", authRequired, (req, res, next)=> {
    // Don't need authentication check here due to authRequired middleware

    //if(req.isAuthenticated()){
    res.render("secret-page");
    // }else{
    //    res.redirect("/login");
    //}
});

router.get("/login-failure", (req, res, next)=> {
    res.render("login-failure");
});

/**
 * logout() is now async and takes a callback function that is called whether there is err or not
 * So res.redirect() has to be inside the callback function.
 */
router.get("/logout", (req, res, next)=> {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
});
