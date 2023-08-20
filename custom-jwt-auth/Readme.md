# User Authentication Using JWTs on Express Backend
## Without using Passport.js

This is modified implementation of the JWT authorization covered at the end of the following freeCodeCamp course:
https://www.youtube.com/watch?v=F-sFp_AvHc8&t=17704s

**The differences include:**
- Using cookies to store JWTs to simplify frontend
- Using asnyc await and promises
- EJS based template SSR pages instead of an SPA front-end
- Use of ES6 import, export (instead of require)

The code works for the latest package versions as of Aug 2023.


---

The `jsonwebtoken` npm package and `crypto` built-in node module are used for the cryptography, and signature verification. Express `sessions` are not used so thate backend is stateless. This is a particularly useful example if making a REST API. The JWT tokens are returned in the a cookie, which the browser autoamtically appends to future requests until expiry of the cookie (or deletion by user).

This example can easily be converted to using authorization header instead of cookies. Instead of returning a cookie, a JSON object can be returned which has the JWT token. The front-end logic can then attach an authorization header to subsequent HTTP requests.
E.g.
`Authorization: Bearer <JWT Token>`




-----

To run the code successfully, a private-public key pair must be generated and saved as .pem files in the keys folder. This can be done easily by running generateKeyPair.js using node. 
The relative path and file name of the private and public keys must be put in environment variables `PRIV_KEY_FILE` and `PUB_KEY_FILE`. For example if the public key is stored in the file `id_rsa_pub.pem` in the `keys` folder than we need the following environmental variable:
`PUB_KEY_FILE=./keys/rd_rsa_pub.pem`

Likefiles `PRIV_KEY_FILE` must be set for the private key.

To successfully run the simple app that showcases the register/login/auth functionality, the app needs to connect to a MongoDB instance to store user credentials. The environment variable `DB_STRING` must be set pointing to the MongoDB instance and the database connection string must include the name of the database as well. For example: `mongodb://localhost:27017/authDB`

A brief description of the JS files:
- `config.js` has constants like HTTP codes that are used by the other files
- `cryptoKeys.js` loads the public and private keys from files and makes them available to other modules
- `customAuth.js` builds the authentication logic, including funcationality to generate JWT token, hash passwords, and so on.
- `database.js` has the schema to store User auth details in a MongoDB database
- `routes.js` has all the GET and POST routes defined for the simple secrets app 

The `views` folder has EJS files including pages for login and registering. The `secret-page` is only accessible through a route that requires authentication.
