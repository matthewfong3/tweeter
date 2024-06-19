// import libraries
// import our router.js file to handle MVC routes
// in MVC, 'routes' help map URLs to controller methods
const router = require('./router.js');
// library that handles POST requests of any information sent in an HTTP body
const bodyParser = require('body-parser');
// library to gzip responses for smaller/faster transfer
const compression = require('compression');
// library to parse cookies from the requests
//const cookieParser = require('cookie-parser');

const csrf = require('@dr.pogodin/csurf');

// ejs module allows for html-view when using express MVC framework
const ejs = require('ejs');
// Model-View-Controller framework for Node
const express = require('express');

const session = require('express-session');
// library to handle favicon requests
const favicon = require('serve-favicon');
// built-in node library to handle file system paths
const path = require('path');
// Mongoose = MongoDB library for node
const mongoose = require('mongoose');

const redis = require('redis');
// references: https://github.com/tj/connect-redis/releases/tag/v7.0.0
const RedisStore = require('connect-redis').default; // as of connect-redis v7.0.0, we must import the 'default' export

// mongodb address to connect to
const dbURL = process.env.MONGODB_URI || 'mongodb://localhost/tweeterDB'; //|| 'mongodb://127.0.0.1/tweeterDB';

// call mongoose's connect function and pass in the url.
// If there are any errors connecting, we will throw it and kill the server.
// Once connected, the mongoose package will stay connected for every file
// that requires it in this project
mongoose.connect(dbURL)
        .then(() => {console.log('Connected to mongodb!');})
        .catch((err) => {
            console.log(err);
            throw err;
        });

// initialize redis client
let redisClient = redis.createClient();
redisClient.connect()
    .then(() => console.log('Connected to redis cli!'))  
    .catch(console.error);

// initialize redis store
let redisURL = {
    hostname: 'localhost',
    port: 6379
};

let redisStore = new RedisStore({
    client: redisClient,
    prefix: "myTweeterApp:",
    host: redisURL.hostname,
    port: redisURL.port
});

// port for our express node app to listen on
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// call express to get an Express MVC server object
const app = express();

// app.set sets one of the express config options
// set up the view (V of MVC) to use html
// ejs module allows us to set express()'s view engine to html
// references: https://stackoverflow.com/questions/4529586/render-basic-html-view?page=1&tab=scoredesc#tab-top
//             https://stackoverflow.com/questions/23595282/error-no-default-engine-was-specified-and-no-extension-was-provided
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
// set the views path to the template directory
app.set('views', `${__dirname}/../views`);

app.disable('x-powered-by'); // disable this header so people don't know what our server is running

// app.use tells express to use different options
// This option tells express to use /assets in a URL path as a static mirror to our hosted folder
// Any requests to /assets will map to the hosted folder to find a file
// references: https://stackoverflow.com/questions/24582338/how-can-i-include-css-files-using-node-express-and-ejs
app.use('/assets', express.static(path.join(__dirname, '/../hosted')));

// call favicon with the favicon path and tell app to use it
app.use(favicon(path.join(__dirname, '/../hosted/img/favicon.png')));

// parse form POST requests as 'application/x-www-form-urlencoded'
app.use(bodyParser.urlencoded({ extended: false }));
// parse 'application/json' body requests
// These are usually POST requests or requests with a body parameter in AJAX
// Alternatively, this might be a web API request from a mobile app,
// another server or another application
app.use(bodyParser.json());

// call compression() & cookieParser() libraries and tell app to use them
app.use(compression());
//app.use(cookieParser()); // do NOT need cookieParser() middleware when using express-session module to work as of version 1.5.0 - references: https://www.npmjs.com/package/express-session

// call express-session() library, while also setting up redis store and tell app to use express-session
app.use(session({
    store: redisStore,
    key: 'sessionid',
    secret: 'Tweet Tweet',
    resave: true,
    saveUninitialized: true,
    cookie: {httpOnly: true}
}));

// call csrf() library and tell app to use it
// tell app to check error code is anything but 'EBADCSRFTOKEN' - if so, incoming request is missing csrf token
app.use(csrf());
app.use((err, req, res, next) => {
    if(err.code !== 'EBADCSRFTOKEN') return next(err);

    console.log('Missing CSRF token');
    return false;
});

// pass our app to our router object to map the routes
router(app);

// app listening on specified port
app.listen(port, (err) => {
    // if app fails, throw err
    if(err) throw err;
    console.log(`Listening on port ${port}`);
});