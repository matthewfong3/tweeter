const models = require('../models');

const Account = models.Account;

const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (request, response) => {
  const req = request;
  const res = response;

  // force cast to strings to cover some security flaws
  const username = `${req.body.username}`;
  const password = `${req.body.password}`;

  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // more callback hell?
  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) { return res.status(401).json({ error: 'Wrong username or password' }); }

    req.session.account = Account.AccountModel.toAPI(account);

    return res.json({ redirect: '/maker' }); // /maker?
  });
};

const signup = (request, response) => {
  const req = request;
  const res = response;

  // cast to strings to cover up some security flaws
  req.body.username = `${req.body.username}`;
  req.body.displayname = `${req.body.displayname}`;
  req.body.password = `${req.body.password}`;
  req.body.password2 = `${req.body.password2}`;

  if (!req.body.username || !req.body.displayname || !req.body.password || !req.body.password2) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // source: https://stackoverflow.com/questions/13840143/jquery-check-if-special-characters-exists-in-string
  if (/^[a-zA-Z0-9- ]*$/.test(req.body.username) === false ||
      /^[a-zA-Z0-9- ]*$/.test(req.body.displayname) === false) {
    return res.status(400).json({ error: 'Username cannot contain special characters' });
  }

  if (req.body.password !== req.body.password2) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  // callback hell
  return Account.AccountModel.generateHash(req.body.password, (salt, hash) => {
    const accountData = {
      username: req.body.username,
      displayname: req.body.displayname,
      salt,
      password: hash,
    };

    const newAccount = new Account.AccountModel(accountData);

    const savePromise = newAccount.save();

    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(newAccount);
      return res.json({ redirect: '/maker' }); // maker?
    });

    savePromise.catch((err) => {
      console.log(err);

      if (err.code === 11000) { return res.status(400).json({ error: 'Username already in use' }); }

      return res.status(400).json({ error: 'An error occured' });
    });
  });
};

const changePassword = (req, res) => {
  if (!req.body.oldPass || !req.body.newPass1 || !req.body.newPass2) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (req.body.newPass1 !== req.body.newPass2) {
    return res.status(400).json({ error: 'New password does not match' });
  }

  const password = `${req.body.oldPass}`;

  return Account.AccountModel.findById(req.session.account._id, password, (err, doc) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    // console.log(doc.password);

    if (!err && !doc) {
      return res.status(400).json({ error: 'old password does not match' });
    }

    return Account.AccountModel.generateHash(req.body.newPass1, (salt, hash) => {
      const changedDoc = doc;
      changedDoc.password = hash;
      changedDoc.salt = salt;

      const accountPromise = doc.save();

      accountPromise.then(() => res.json({ redirect: '/maker' }));

      accountPromise.catch((error) => {
        console.log(error);
        return res.status(400).json({ error });
      });

      return accountPromise;
    });
  });
};

const notFound = (req, res) => {
  console.log('not found');
  res.status(404).sendFile(`${__dirname}/../views/notFound.handlebars`);
};

const getToken = (request, response) => {
  const req = request;
  const res = response;

  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };

  res.json(csrfJSON);
};

module.exports.loginPage = loginPage;
module.exports.login = login;
module.exports.logout = logout;
module.exports.signup = signup;
module.exports.change = changePassword;
module.exports.getToken = getToken;
module.exports.notFound = notFound;
