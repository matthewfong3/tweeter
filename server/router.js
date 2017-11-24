const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/getTweets', mid.requiresLogin, controllers.Tweet.getTweets);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  // app.get('/passChange', mid.requiresLogin, controllers.Account.change);
  app.post('/passChange', mid.requiresLogin, controllers.Account.change);
  app.get('/maker', mid.requiresLogin, controllers.Tweet.makerPage);
  app.post('/maker', mid.requiresLogin, controllers.Tweet.make);
  app.post('/change', mid.requiresLogin, controllers.Tweet.change);
  app.post('/delete', mid.requiresLogin, controllers.Tweet.delete);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
