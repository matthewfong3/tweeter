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
  // fix below so getTweets isn't just restricted to ownerId's tweets
  return Tweet.TweetModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ tweets: docs });
  });
};

const changeTweet = (req, res) => {
  if (!req.body.message) {
    return res.status(400).json({ error: 'Message is required to alter a tweet' });
  }
  // req.body.tweetId instead of req.session.account._id
  return Tweet.TweetModel.findById(req.body._id, (err, doc) => {
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
  return Tweet.TweetModel.findById(req.body._id, (err, doc) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }
    
    if (!doc) return res.status(400).json({ error: 'No tweet found' });
    
    doc.remove();
    
    const removePromise = doc.save();
    console.log(removePromise);
    removePromise.then(() => res.json({ redirect:'/maker' }));
    
    removePromise.catch((error) => {
      console.log(error);
      return res.status(400).json({error});
    });
    
    return removePromise;
  });
};

module.exports.makerPage = makerPage;
module.exports.getTweets = getTweets;
module.exports.make = makeTweet;
module.exports.change = changeTweet;
module.exports.delete = deleteTweet;