const atob = require('atob');
const models = require('../models');
const Tweet = models.Tweet;

// HELPER FUNCTION
// reference: https://stackoverflow.com/questions/21797299/convert-base64-string-to-arraybuffer
const base64ToBufferArray = (base64) => {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) { bytes[i] = binaryString.charCodeAt(i); }

  return bytes.buffer;
};

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
    // tweetData.imgData = base64ToBufferArray(req.body.imgData);
    const temp = base64ToBufferArray(req.body.imgData);
    console.dir(temp.toString('utf-8'));
    tweetData.imgData = temp.toString('utf-8');
  }

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
