## Express Middelware

We can add functions as middleware to express using ```app.use()```.
These functions are called with request, response and next parameters in the order they are added.

For example: express.urlencoded can add a request body parser that decodes the data and presents it as a nice JS object called body in the request accessible as ```req.body```. The ```express.urlencoded()``` function is a built-in middleware function in Express. It parses incoming requests with URL-encoded payloads and is based on a body parser.
```
app.use( express.urlencoded({extended:true}) );
```


In a middleware we can also set custom properties and pass on data:
```
function middleware1(req, res, next){
    req.customProperty = 100;
    next(); // must call next or respond to request to end the middleware chain
}
app.use(middelware1);
```

Error handlers are special types of middleware. In order to define an error handling middleware the function must accept an err argument in addition to req, res and next. Error handling is important becuase unless gracefully caught and handled an error can crash our server and render our web-app unusable.
Example of error handling function:

```
function errorHandler(err, req, res, next){
    if(err){
        res.send('There was an error');
    }
}
app.use(errorHandler); // must be the last middelware added
```

To add a middleware to a route, as a route specific middleware we can do that in the route:
```
app.get("/", middleware1, middleware2, function(req, res, next){
    res.render(...)
    // on error can call next with err
    next(err); // this will call the error handler
});
```

Consider the following example:
```
import express from "express";
const app = express();

function middelware1(req, res, next){
    console.log("This is middleware #1");
    next();
}

function middleware2(req, res, next){
    console.log("This is middleware #2");
    next(); 
}

app.use(middleware1)
app.use(middleware2)

app.get("/", (req, res, next)=>{
    console.log("I am the get request handler");
    res.send("<h1>This is some text.</h1>");
});

app.listen(3000);

```

When the localhost:3000/ is accessed the get "/" request is invoked and the following is printed on the console:
```
This is middleware #1
This is middleware #2
I am the get request handler
```

