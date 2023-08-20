# User Authentication Using LocalStrategy with Passport.js on Express Backend

This is modified implementation of the JWT authorization covered at the end of the following freeCodeCamp course:
https://www.youtube.com/watch?v=F-sFp_AvHc8&t=17704s


**The differences include:**
- Using asnyc await and promises
- EJS based template SSR pages instead of an SPA front-end
- Use of ES6 import, export (instead of require)

The code works for the latest package versions as of Aug 2023.


----

The `passport-local` strategy is used, and `passport` is set as a middleware on express to handle authentication. Express `sessions` are used to keep the user logged in. The session id is sent in a cookie to the user so that is automatically attached to future HTTP requests. Session details themselves are stored in MongoDB.


-----

To run the code successfully, a secret key must be made available using the `SESSIONS_SECRET` environment variable. This secret key is used to encrpyt session data that is stored on the MongoDB. An environment variable can be set for development using the .env file. 

To successfully run the simple app that showcases the register/login/auth functionality, the app needs to connect to a MongoDB instance to store user credentials. The environment variable `DB_STRING` must be set pointing to the MongoDB instance and the database connection string must include the name of the database as well. For example: `mongodb://localhost:27017/authDB`

A brief description of the JS files:
- `cryptoKeys.js` loads the public and private keys from files and makes them available to other modules
- `passport.js` builds the authentication logic, sets up the `verifyCallback` for passport, and configures passport.
- `database.js` has the schema to store User auth details in a MongoDB database
- `routes.js` has all the GET and POST routes defined for the simple secrets app 
- `part1-sessions-test.js` is a simple express server that sets up sessions and illustrates how to use `express-session` to manage sessions in express. 

The `views` folder has EJS files including pages for login and registering. The `secret-page` is only accessible through a route that requires authentication.

