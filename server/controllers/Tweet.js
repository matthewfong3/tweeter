const models = require('../models');
const Tweet = models.Tweet;

// function that renders tweet content into app page
const makerPage = (req, res) => {
  Tweet.TweetModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.render('app', { csrfToken: req.csrfToken(), tweets: docs });
  });
};

// function that handles make tweet request or a new tweet on the server
const makeTweet = (req, res) => {
  if (!req.body.message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  console.log(req.files);

  const tweetData = {
    message: req.body.message,
    displayname: req.session.account.displayname,
    owner: req.session.account._id,
    favorites: [],
    comments: [],
  };

  // don't use this anymore
  if (req.body.imgData) {
    tweetData.imgData = req.body.imgData;
  }
  
  // this is meta
  if(req.files){
    tweetData.imgData = req.files;
  }

  const newTweet = new Tweet.TweetModel(tweetData);

  const tweetPromise = newTweet.save();

  tweetPromise.then(() => res.json({ redirect: '/maker' }));

  tweetPromise.catch((err) => {
    console.log(err);

    return res.status(400).json({ error: 'An error occurred' });
  });

  return tweetPromise;
};

// function that handles get tweets on the server
const getTweets = (request, response) => {
  const req = request;
  const res = response;
  // console.log(`following: ${req.session.account.following}`);
  return Tweet.TweetModel.findAll((err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    const tweets = [];

    for (let i = 0; i < docs.length; i++) {
      if (req.session.account.displayname === docs[i].displayname) {
        // add to return obj as well to view own tweets
        tweets.push(docs[i]);
      }
      for (let j = 0; j < req.session.account.following.length; j++) {
        if (req.session.account.following[j] === docs[i].displayname) {
          // add to return obj
          tweets.push(docs[i]);
        }
      }
    }

    return res.json({ displayname: req.session.account.displayname, tweets });
  });
};

// function that handles a change tweet request on the server
const changeTweet = (req, res) => {
  if (!req.body.message) {
    return res.status(400).json({ error: 'Message is required to alter a tweet' });
  }

  return Tweet.TweetModel.findById(req.session.account._id, req.body._id, (err, doc) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    if (!doc) return res.status(400).json({ error: 'No tweet found' });

    const changedTweet = doc;
    changedTweet.message = req.body.message;

    const tweetPromise = doc.save();
    tweetPromise.then(() => res.json({ redirect: '/maker' }));

    tweetPromise.catch((error) => {
      console.log(error);
      return res.status(400).json({ error });
    });

    return tweetPromise;
  });
};

// function that handles favoriting a tweet request on the server
const favTweet = (req, res) => {
  if (!req.body.id) {
    return res.status(400).json({ error: 'Tweet cannot be found' });
  }

  return Tweet.TweetModel.findByIdForAll(req.body.id, (err, doc) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    if (!doc) return res.status(400).json({ error: 'No tweet found' });

    if (doc.favorites.length === 0) {
      const changedTweet = doc;
      changedTweet.favorites.push(req.session.account.displayname);
    } else {
      for (let i = 0; i < doc.favorites.length; i++) {
        if (doc.favorites[i] === req.session.account.displayname) {
          return res.status(400).json({ error: "Can't favorite same tweet again" });
        }
      }
      const changedTweet = doc;
      changedTweet.favorites.push(req.session.account.displayname);
    }

    const tweetPromise = doc.save();
    tweetPromise.then(() => res.json({ redirect: '/maker' }));

    tweetPromise.catch((error) => {
      console.log(error);
      return res.status(400).json({ error });
    });

    return tweetPromise;
  });
};

// function that handles delete a tweet request on the server
const deleteTweet = (req, res) => {
  if (!req.body._id) {
    return res.status(400).json({ error: 'error occured. missing tweet id' });
  }

  return Tweet.TweetModel.findById(req.session.account._id, req.body._id, (err, doc) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    if (!doc) return res.status(400).json({ error: 'No tweet found' });

    doc.remove();

    return res.json({ redirect: '/maker' });
  });
};

// function that handles replying to a tweet request on the server
const replyTweet = (req, res) => {
  if (!req.body.message) {
    return res.status(400).json({ error: 'Message is required in reply' });
  }

  return Tweet.TweetModel.findByIdForAll(req.body._id, (err, doc) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    if (!doc) return res.status(400).json({ error: 'No tweet found' });

    const changedTweet = doc;
    changedTweet.comments.push(`${req.session.account.displayname}:;${req.body.message}`);

    const tweetPromise = doc.save();
    tweetPromise.then(() => res.json({ redirect: '/maker' }));

    tweetPromise.catch((error) => {
      console.log(error);
      return res.status(400).json({ error });
    });

    return tweetPromise;
  });
};

const uploadFiles = (req, res) => {
  console.log(req.files);
  return;
};

module.exports.makerPage = makerPage;
module.exports.getTweets = getTweets;
module.exports.make = makeTweet;
module.exports.change = changeTweet;
module.exports.delete = deleteTweet;
module.exports.fav = favTweet;
module.exports.reply = replyTweet;
module.exports.upload = uploadFiles;
