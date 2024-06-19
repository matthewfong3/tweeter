// import controllers
const controllers = require('./controllers');
const mid = require('./middleware');
const multer = require('multer');

const imageStorage = multer.diskStorage({
    destination: 'hosted/uploads',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now())
    }
});

// references: https://www.bacancytechnology.com/blog/node-js-multer
const videoStorage = multer.diskStorage({
    destination: 'hosted/uploads',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now())
    }
});

const imagesUpload = multer({
    storage: imageStorage,
    fileFilter(req, file, cb){
        if(file.originalname.match(/\.(png|jpg|gif)$/)) cb(null, true);
    }
});

const videoUpload = multer({
    storage: videoStorage,
    fileFilter(req, file, cb){
        if(file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) cb(null, true);
    }
});

// function to attach routes
const router = (app) => {
    // app.VERB maps get requests to a middleware action
    // app.get handles GET requests
    // app.post handles POST requests
    app.get('/getToken', mid.requiresSecure, controllers.AccountHandler.getToken);
    
    app.get('/logout', mid.requiresLogin, controllers.AccountHandler.logout);
    app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.htmlHandler.getLogin);

    app.get('/getProfile', mid.requiresLogin, controllers.AccountHandler.getProfile);
    app.get('/getTweets', mid.requiresLogin, controllers.TweetHandler.getTweets);

    app.get('/', mid.requiresLogin, controllers.htmlHandler.getIndex);

    // catch-all for any other GET request. The * means anything
    app.get('/*', controllers.htmlHandler.getNotFound);

    app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.AccountHandler.signup);
    app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.AccountHandler.login);
    app.post('/changePassword', mid.requiresSecure, mid.requiresLogin, controllers.AccountHandler.changePassword);
    app.post('/searchAccount', mid.requiresLogin, controllers.AccountHandler.searchAccount, controllers.TweetHandler.getSearchAccountTweets);
    app.post('/follow', mid.requiresLogin, controllers.AccountHandler.followAccount);

    app.post('/tweet', mid.requiresLogin, controllers.TweetHandler.createTweet);
    app.post('/imagesTweet', mid.requiresLogin, imagesUpload.array('images', 4), controllers.TweetHandler.createTweet);
    app.post('/videoTweet', mid.requiresLogin, videoUpload.single('video'), controllers.TweetHandler.createTweet);

    app.post('/reply', mid.requiresLogin, controllers.TweetHandler.replyTweet);
    app.post('/imagesReply', mid.requiresLogin, imagesUpload.array('images', 4), controllers.TweetHandler.replyTweet);
    app.post('/videoReply', mid.requiresLogin, videoUpload.single('video'), controllers.TweetHandler.replyTweet);

    app.post('/favTweet', mid.requiresLogin, controllers.TweetHandler.favTweet);
    app.post('/editTweet', mid.requiresLogin, controllers.TweetHandler.editTweet);
    app.post('/deleteTweet', mid.requiresLogin, controllers.TweetHandler.deleteTweet);
    app.post('/deleteReply', mid.requiresLogin, controllers.TweetHandler.deleteReply);
};

// export the router function
module.exports = router;