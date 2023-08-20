import mongoose from "mongoose";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";

dotenv.config(); // load env vars into process.env

const app= express();
const APP_PORT= 3000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));

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
    secret: process.env.SESSION_SECRET, // used to hash session data
    resave: false, 
    saveUninitialized: true,
    store: sessionStore, // MongoStore (as default memory store is not sufficient for production)
    cookie: {
        maxAge: 1000*60*60*24, // cookie expiry: this 1 day in milliseconds
    }
}));


app.get("/", function(req, res, next){
    // we can add custom properties to the session object
    // this session object is stored on the server using the store setting when session() was initialized above ^ 
    if(req.session.viewCount){ 
        req.session.viewCount++; 
    }else {
        req.session.viewCount = 1; // set the prop if it didn't exist
    }
    
    res.send(`<h2>Working on express sessions...You have visited this page ${req.session.viewCount} times!</h2>`);
});

app.listen(APP_PORT, () =>{
    console.log(`App listening on port ${APP_PORT}.`);
})