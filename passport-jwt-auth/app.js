import mongoose from "mongoose";
import express from "express";
import passport from "passport";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";


import {router} from "./src/routes.js"



dotenv.config(); // load env vars into process.env

const app = express();
const APP_PORT= 3000;



app.set('view engine', 'ejs'); // look in views folder for render() and redirect() calls
app.use(express.static("public")); // look in public folder for static files (css, images)
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser()); // cookie parser middleware

const dbString = process.env.DB_STRING;
const dbOptions={
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

/*
    By default mongoose.connect() returns a promise but it does NOT resolve to a MongoClient object
    so we need to use then() to extract the MongClient instance from the promise when it resovles
*/
const mongo_driver = mongoose.connect(dbString, dbOptions).then((m) => {
    console.log("Connected to MongoDB")
    return m.connection.getClient();
});



/**
 * Passport middleware must be set up after settting up express-session above ^
 */
app.use(passport.initialize());


/**
 * Add our router at the very end.
 */
app.use(router);

app.listen(APP_PORT, () =>{
    console.log(`App listening on port ${APP_PORT}.`);
});


