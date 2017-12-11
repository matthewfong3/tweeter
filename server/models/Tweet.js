const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let TweetModel = {};

const convertId = mongoose.Types.ObjectId;

const TweetSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },

  displayname: {
    type: String,
    required: true,
  },

  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },

  imgData: {
    type: Array,
  },

  favorites: {
    type: Array,
  },

  comments: {
    type: Array,
  },

  createdDate: {
    type: Date,
    default: Date.now,
  },
});

TweetSchema.statics.toAPI = (doc) => ({
  message: doc.message,
});

// function that finds all tweets in db
TweetSchema.statics.findAll = (callback) => TweetModel.find({})
  .select('displayname message createdDate imgData favorites comments').exec(callback);

// function that finds tweets only specific to owner
TweetSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return TweetModel.find(search).select('displayname message').exec(callback);
};

// function that finds a tweet by tweetId only specific to owner
TweetSchema.statics.findById = (ownerId, id, callback) => {
  const search = {
    owner: convertId(ownerId),
    _id: id,
  };

  return TweetModel.findOne(search, callback);
};

// function that finds a tweet by tweetId for all users
TweetSchema.statics.findByIdForAll = (id, callback) => {
  const search = {
    _id: id,
  };

  return TweetModel.findOne(search, callback);
};

TweetModel = mongoose.model('Tweet', TweetSchema);

module.exports.TweetModel = TweetModel;
module.exports.TweetSchema = TweetSchema;
