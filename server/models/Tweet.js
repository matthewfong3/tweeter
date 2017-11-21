const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const _ = require('underscore');

let TweetModel = {};

const convertId = mongoose.Types.ObjectId;
//const setName = (name) => _.escape(name).trim();

//console.log(setName);

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
    type: String,
    contentType: 'image/png',
  },

  createdDate: {
    type: Date,
    default: Date.now,
  },
});

TweetSchema.statics.toAPI = (doc) => ({
  message: doc.message,
});

TweetSchema.statics.findAll = (callback) => {
  TweetModel.find({}).select('displayname message createdDate imgData').exec(callback);
};

// ownerId only displays the tweets from that owner
// we want to display all the tweets from db
TweetSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return TweetModel.find(search).select('displayname message').exec(callback);
};

// pass in the tweet's unique id
TweetSchema.statics.findById = (ownerId, id, callback) => {
  const search = {
    owner: convertId(ownerId),
    _id: id,
  };

  return TweetModel.findOne(search, callback);
};

TweetModel = mongoose.model('Tweet', TweetSchema);

module.exports.TweetModel = TweetModel;
module.exports.TweetSchema = TweetSchema;
