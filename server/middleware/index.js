// middleware function checks if user is logged in first
const requiresLogin = (req, res, next) => {
    if(!req.session.account) return res.redirect('/login');

    return next();
};

// middleware function checks if user is logged out first
const requiresLogout = (req, res, next) => {
    if(req.session.account) return res.redirect('/');

    return next();
};

// middleware function checks if incoming requests are secure first
const bypassSecure = (req, res, next) => {
    next();
};

module.exports.requiresLogin = requiresLogin;
module.exports.requiresLogout = requiresLogout;
module.exports.requiresSecure = bypassSecure;