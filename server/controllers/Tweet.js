const models = require('../models');

let TweetModel = models.Tweet.TweetModel;

// handles create new tweet requests - creating a new document and saving it in our db
const createTweet = async (req, res) => {
    if(!req.body.message) return res.status(400).json({error: 'Message is required'});

    try{
        const tweetData = {
            owner: req.session.account._id,
            username: req.session.account.username,
            type: "tweet",
            message: req.body.message,
            favorites: [],
            comments: []
        }

        if(req.file) tweetData.filesData = req.file; // video file
        if(req.files) tweetData.filesData = req.files; // images files
    
        const newTweet = new TweetModel(tweetData);

        const saveTweet = await newTweet.save(); // returns a promise
        if(!saveTweet) return res.status(400).json({error: 'Document save promise failed'});

        return res.json({redirect: '/'});
    }
    catch(err){
        console.log(err);
        return res.status(400).json({error: 'An error occurred'});
    }
};

// handles get tweets requests - retrieving all tweets, filtering them and returning new collection of tweets to client
const getTweets = async (req, res) => {
    try{
        const docs = await TweetModel.find({});
        if(!docs) return res.status(400).json({error: 'Could not retrieve tweets'});

        const tweets = docs.filter((doc) => {
            if(doc.type === "tweet"){
                // retrieve user's own tweets
                if(doc.username === req.session.account.username) return true
            
                // retrieve tweets from accounts the user follows
                for(const f of req.session.account.following) if(f === doc.username) return true

                // else, reject current tweet
                return false;
            }
            return false; // reject current tweet because it is not of type "tweet", therefore, it is a "reply" type
        });

        return res.json({accountUser: req.session.account.username, tweets: tweets});
    }
    catch(err){
        console.log(err);
        return res.status(400).json({error: 'An error occurred'});
    }
};

// handles 'gets tweets of searched account' requests - when user searches for an account, retrieves searched account's tweets only to client
const getSearchAccountTweets = async (req, res) => {
    try{
        const docs = await TweetModel.find({username: req.body.username});
        if(!docs) return res.status(400).json({error: "Could not retrieve tweets"});

        const tweets = docs.filter((doc) => {
            if(doc.type === "tweet") return true;
            else return false;
        });

        return res.json({accountUser: req.session.account.username, username: req.body.username, tweets: tweets});
    }
    catch(err){
        console.log(err);
        return res.status(400).json({error: 'An error occurred'});
    }
};

// handles edit a tweet requests - changing the tweet and saving it in our db
const editTweet = async (req, res) => {
    if(!req.body.message) return res.status(400).json({error: 'Message is required to alter tweet'});
    
    const search = {
        owner: req.session.account._id,
        _id: req.body._id
    };

    try{
        const doc = await TweetModel.findOne(search);
        if(!doc) return res.status(400).json({error: 'Could not retrieve document from server'});

        doc.message = req.body.message;

        const savedDoc = await doc.save();
        if(!savedDoc) return res.status(400).json({error: 'Document save promise failed'});

        return res.json({redirect: '/'});
    }
    catch(err){
        console.log(err);
        return res.status(400).json({error: 'An error occurred'});
    }
};

// handles favoriting/unfavoriting a tweet requests - upon success, updates user's favorites (array)
const favTweet = async (req, res) => {
    if(!req.body._id) return res.status(400).json({error: 'Missing parameter'});
    
    try{
        const doc = await TweetModel.findOne({_id: req.body._id});
        if(!doc) return res.status(400).json({error: 'Could not retrieve document from server'});

        if(doc.favorites.length === 0) doc.favorites.push(req.session.account.username);
        else{
            for(const f of doc.favorites){
                // unfavorite a tweet
                if(f === req.session.account.username) {
                    const index = doc.favorites.indexOf(req.session.account.username);
                    doc.favorites.splice(index, 1);
                }
                // favorite a tweet
                else doc.favorites.push(req.session.account.username);
            }
        }

        const savedDoc = await doc.save();
        if(!savedDoc) return res.status(400).json({error: 'Document save promise failed'});
        
        return res.json({redirect: '/'});
    }
    catch(err){
        console.log(err);
        return res.status(400).json({error: 'An error occurred'});
    }
};

// handles delete a tweet requests - removes the tweet from our db
const deleteTweet = async (req, res) => {
    if(!req.body._id) return res.status(400).json({error: 'Error occurred - Missing tweet id'});

    const search = {
        owner: req.session.account._id,
        _id: req.body._id
    };

    try{
        // references: https://mongoosejs.com/docs/api/model.html
        const doc = await TweetModel.findOneAndDelete(search);
        if(!doc) return res.status(400).json({error: 'Could not retrieve document from server'});

        return res.json({redirect: '/'});
    }
    catch(err){
        console.log(err);
        return res.status(400).json({error: 'An error occurred'});
    }
};

const deleteReply = async (req, res) => {
    if(!req.body._id) return res.status(400).json({error: 'Error occurred - Missing tweet id'});

    const search = { _id: req.body.parentTweet_id };

    try{
        // finds the parent tweet first
        const doc = await TweetModel.findOne(search);
        if(!doc) return res.status(400).json({error: 'Could not retrieve document from server'});

        // references: https://stackoverflow.com/questions/7364150/find-object-by-id-in-an-array-of-javascript-objects
        //             https://stackoverflow.com/questions/13104690/node-js-mongodb-objectid-to-string
        const reply = doc.comments.find((r) => r._id.toString() === req.body._id);

        // removes the replt tweet from the comments section of the parent tweet
        const index = doc.comments.indexOf(reply);

        // references: https://stackoverflow.com/questions/5767325/how-can-i-remove-a-specific-item-from-an-array-in-javascript
        if(index > -1) doc.comments.splice(index, 1);

        const savePromise = doc.save();
        if(!savePromise) return res.status(400).json({error: 'Document save promise failed'});

        // removes the reply tweet from overall db
        deleteTweet(req, res);
    }
    catch(err){
        console.log(err);
        return res.status(400).json({error: 'An error occurred'});
    }
};

// handles reply to a tweet requests - updating the tweet's comments list (array) with incoming reply messages
const replyTweet = async (req, res) => {
    if(!req.body.message) return res.status(400).json({error: 'Message is required in reply'});
    
    try{
        const doc = await TweetModel.findOne({_id: req.body._id});
        if(!doc) return res.status(400).json({error: 'No tweet found'});

        const replyTweetData = {
            owner: req.session.account._id,
            username: req.session.account.username,
            type: "reply",
            message: req.body.message
        };
        
        // save all incoming files into an array 
        if(req.files) replyTweetData.filesData = req.files;
        if(req.file) replyTweetData.filesData = [req.file];

        const newTweet = new TweetModel(replyTweetData);

        const saveTweet = await newTweet.save(); // returns a promise
        if(!saveTweet) return res.status(400).json({error: 'Document save promise failed'});

        doc.comments.push(newTweet);
        
        const savedDoc = await doc.save();
        if(!savedDoc) return res.status(400).json({error: 'Document save promise failed'});

        return res.json({redirect: '/'});
    }
    catch(err){
        console.log(err);
        return res.status(400).json({error: 'An error occurred'});
    }
};

module.exports = {
    createTweet,
    getTweets,
    getSearchAccountTweets,
    editTweet,
    favTweet,
    deleteTweet,
    deleteReply,
    replyTweet
}