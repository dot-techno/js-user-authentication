# User Authentication with Express

In this project I have updated the code from the youtube tutorial at:
https://www.youtube.com/watch?v=F-sFp_AvHc8&t=17704s

The updated code works with the latest version of packages as of Aug 2023. It uses module type "package" and import, export ES6 statements as well as promises.

This code can be used as a basis for setting up auth in a nodeJS backend.

This code base consists of the following three mini web-applications each demonstrating a particular user authentication strategy:

## Local Strategy (passport-local-auth)
This saves passwords hashed and salted in mongodb.

## JWT Local Strategy (passport-jwt-auth)
This issues JWT token to user once authenticated. The server does not need sessions to maintain state. As long as prior to expiry of JWT token if users attaches the token to HTTP requests, the token is verified and user is given access.

## JWT Strategy with Custom Middleware instead ofPassport.js
This is similar to the JWT startegy but strips out passport module, and instead writes a custome middleware function to do JWT based user authentication. The `jsonwebtoken` library is used to sign and verify JWT tokens.
