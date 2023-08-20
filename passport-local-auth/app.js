import mongoose from "mongoose";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import dotenv from "dotenv";
import {router} from "./src/routes.js"



dotenv.config(); // load env vars into process.env

const app = express();
const APP_PORT= 3000;



app.set('view engine', 'ejs'); // look in views folder for render() and redirect() calls
app.use(express.static("public")); // look in public folder for static files (css, images)
app.use(express.urlencoded({extended:true}));
app.use(express.json());


const dbString = process.env.DB_STRING;
const dbOptions={
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

/*
    By default mongoose.connect() returns a promise but it does NOT resolve to a MongoClient object
    so we need to use then() to make sure the promise returns a MongoClient instance when it resovles
*/
const mongo_driver = mongoose.connect(dbString, dbOptions).then(m => m.connection.getClient());

/*
MongoStore.create() argument clientPromise:
    A Promise that is resolved with MongoClient connection. If the connection was established without 
    database name being present in the connection string, database name should be provided using dbName option.
*/
const sessionStore = MongoStore.create({
    clientPromise: mongo_driver, // we need to pass in a promise that resolves to MongoClient or a MongoClient instnace
    //dbName: "authDB", // only needed if we did not add db name to connection string dbString
    collectionName: "sessions",
});


/*
    Add express-session middleware to express app
    Options are sent to express-session to send a cookie in the response header ot the browser
    each new request from the browser will send back the cookie we generate
*/
app.use(session({
    /* Secret parameter: used to sign session ID cookie 
        (can pass an array, with first secret used to encode new cookies
        and old cookies will be validated against all entries in array which are old secrets) */
    secret: process.env.SESSION_SECRET, 
    resave: false, // if true forces a re-save even if nothing changed (if store implements touch then set it to false, else need to be true to record new use of session to avoid expiry)
    saveUninitialized: true,
    store: sessionStore, // MongoStore (as default memory store is not sufficient for production)
    cookie: {
        maxAge: 1000*60*60*24, // cookie expiry: this 1 day in milliseconds
    }
}));


/**
 * Passport middleware must be set up after settting up express-session above ^
 */
app.use(passport.initialize());
app.use(passport.session());

/**
 * Add our router at the very end.
 */
app.use(router);

app.listen(APP_PORT, () =>{
    console.log(`App listening on port ${APP_PORT}.`);
})

