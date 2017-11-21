const models = require('../models');

const Tweet = models.Tweet;

const makerPage = (req, res) => {
  Tweet.TweetModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.render('app', { csrfToken: req.csrfToken(), tweets: docs });
  });
};

const makeTweet = (req, res) => {
  if (!req.body.message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const tweetData = {
    message: req.body.message,
    displayname: req.session.account.displayname,
    owner: req.session.account._id,
  };

  if (req.body.imgData) {
    // let buffer = new Buffer(req.body.imgData, 'base64');
    // console.log(buffer);
    tweetData.imgData = req.body.imgData;
  }

  // console.log(tweetData);

  const newTweet = new Tweet.TweetModel(tweetData);

  const tweetPromise = newTweet.save();

  tweetPromise.then(() => res.json({ redirect: '/maker' })); // maker?

  tweetPromise.catch((err) => {
    console.log(err);

    return res.status(400).json({ error: 'An error occurred' });
  });

  return tweetPromise;
};

const getTweets = (request, response) => {
  const req = request;
  const res = response;
  return Tweet.TweetModel.findAll((err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ displayname: req.session.account.displayname, tweets: docs });
  });
};

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
    tweetPromise.then(() => res.json({ redirect: '/maker' })); // maker?

    tweetPromise.catch((error) => {
      console.log(error);
      return res.status(400).json({ error });
    });

    return tweetPromise;
  });
};

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

module.exports.makerPage = makerPage;
module.exports.getTweets = getTweets;
module.exports.make = makeTweet;
module.exports.change = changeTweet;
module.exports.delete = deleteTweet;
