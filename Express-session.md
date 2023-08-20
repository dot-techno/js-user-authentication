## Express Sessions
Express session is a middelware for express that is part of the express-session module.

### Cookies
When a browser makes a request to a website for the first time the website can send set-cookie in the response headers to save cookies on the client's side. For all future requests if the browser has saved cookies it sends them as part of its get requests in the request headers. Cookies can have an expire date/time at whih time they are deleted, or else the user can delete them by cleaning out the history.

If we goto amazon.com and add something to our cart informaiton about that session is saved in a cookied on our end. If we clean out our cookies for amazon.com, and go back to amazon we will not see our cart with items inside it (this is to be done without logging in, as amazon might save data in other places for logged in users).


### Session
Sessions are stored on the server side, in this case in the express.js application. Session can store a large amount of data whereas cookies are generally limited as browsers must attach them to each request. 

With cookies we cannot store secret or private information or credentials, becuase otherwise a hacker could get of this information easily.

Session:
- info stored on sever side
- authenticate into the session using some secret key

### Express Session
```express-session``` is an npm module, that sets up middleware on express, that is used to work with sessions.


To install:
```
npm install express-session
```

To attack this middleware, we use ```app.use()```.

### Express session store
The ```express-session``` middleware needs a store to store information. Be default it comes with a store that stores information in memory and hence is not very scalable. We can set up an express-session store to enable it to use a databse to store information.
We can use the ```connect-mongo``` store that connects ```express-session``` to a mongodb databse.

```
const dbString = "mongodb://localhost:27017/authdb";
const dbOptions={
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
const dbConnection = mongoose.connect(dbString, dbOptions);
```

We need to set up a db connect as shown above before we can setup ```connect-mongo``` for ```express-session``` store. 

To set up the session store:
```
import MongoStore from "connect-mongo";

const sessionStore = MongoStore.create({
    client: dbConnection.prototype.getClient(),
    collectionName: 'sessions',
});
```