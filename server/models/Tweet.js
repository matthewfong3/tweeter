const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let TweetModel = {};

const Schema = mongoose.Schema;

const TweetSchema = new Schema({
    owner: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Account'
    },
    username: {
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    filesData: {
        type: Array
    },
    favorites: {
        type: Array
    },
    comments: {
        type: Array
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});

TweetSchema.statics.toAPI = doc => ({
    _id: doc._id,
    owner: doc.owner,
    message: doc.message
});

TweetModel = mongoose.model('Tweet', TweetSchema);

module.exports = {
    TweetModel,
    TweetSchema
};