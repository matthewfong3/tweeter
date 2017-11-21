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
module.exports.getToken = getToken;