const crypto = require('crypto');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let AccountModel = {};
const iterations = 10000;
const saltLength = 64;
const keyLength = 64;
const convertId = mongoose.Types.ObjectId;

const AccountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: /^[A-Za-z0-9_\-.]{1,16}$/,
  },
  displayname: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  followers: {
    type: Number,
  },
  following: {
    type: Number,
  },
  salt: {
    type: Buffer,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

AccountSchema.statics.toAPI = doc => ({
  username: doc.username,
  displayname: doc.displayname,
  _id: doc._id,
});

// function that validates incoming password
const validatePassword = (doc, password, callback) => {
  const pass = doc.password;

  return crypto.pbkdf2(password, doc.salt, iterations, keyLength, 'RSA-SHA512', (err, hash) => {
    if (hash.toString('hex') !== pass) {
      return callback(false);
    }
    return callback(true);
  });
};

AccountSchema.statics.findByUsername = (name, callback) => {
  const search = {
    username: name,
  };

  return AccountModel.findOne(search, callback);
};

// function that generates hash for password
AccountSchema.statics.generateHash = (password, callback) => {
  const salt = crypto.randomBytes(saltLength);

  crypto.pbkdf2(password, salt, iterations, keyLength, 'RSA-SHA512', (err, hash) =>
    callback(salt, hash.toString('hex')));
};

// function that checks for user authentication on login
AccountSchema.statics.authenticate = (username, password, callback) =>
  AccountModel.findByUsername(username, (err, doc) => {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback();
    }

    return validatePassword(doc, password, (result) => {
      if (result === true) {
        return callback(null, doc);
      }

      return callback();
    });
  });

// function that finds the owner by id and validates incoming password
AccountSchema.statics.findById = (ownerId, oldPass, callback) => {
  const search = {
    _id: convertId(ownerId),
  };

  return AccountModel.findOne(search, (err, doc) => {
    if (err) {
      callback(err);
    }

    return validatePassword(doc, oldPass, (result) => {
      if (result === true) {
        return callback(null, doc);
      }

      return callback(null, null);
    });
  });
};

AccountSchema.statics.searchDisplayName = (displayname, callback) => {
  const search = {
    displayname,
  };
  return AccountModel.findOne(search, callback);
};

AccountSchema.statics.searchIdForFollow = (ownerId, callback) => {
  const search = {
    _id: convertId(ownerId),
  };
  return AccountModel.findOne(search, callback);
};

AccountModel = mongoose.model('Account', AccountSchema);

module.exports.AccountModel = AccountModel;
module.exports.AccountSchema = AccountSchema;
