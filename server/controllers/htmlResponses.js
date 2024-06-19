// tells client to render index.html page (main app page)
const getIndex = (req, res) => {
  return res.render('index', {csrfToken: req.csrfToken()});
};

// tells client to render login page
const getLogin = (req, res) => {
  return res.render('login', {csrfToken: req.csrfToken()});
};

// tells client to render not found page
const getNotFound = (req, res) => {
  console.log(req.url);
  return res.status(404).render('notFound');
};

module.exports = {
  getIndex,
  getLogin,
  getNotFound
};
