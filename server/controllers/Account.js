const models = require('../models');

let AccountModel = models.Account.AccountModel;

// references: https://stackoverflow.com/questions/31549857/mongoose-what-does-the-exec-function-do
// Above link explains difference between 
// const fully_Fledged_Promise = await Model.find({}).exec(); - you get a better 'stack trace' if you catch any errors in executing the queries
// const query = await Model.find({}); - returns a thenable

// handles sign up requests - creating a new document entry and saving it in our db
const signup = (req, res) => {
    // cast to strings to cover up some security flaws
    req.body.email = `${req.body.email}`;
    req.body.username = `${req.body.username}`;
    req.body.pass1 = `${req.body.pass1}`;
    req.body.pass2 = `${req.body.pass2}`;

    if(!req.body.email 
    || !req.body.username 
    || !req.body.pass1
    || !req.body.pass2){
        return res.status(400).json({error: 'All fields are required'});
    }

    // references: https://stackoverflow.com/questions/13840143/jquery-check-if-special-characters-exists-in-string
    if(!(/^[a-zA-Z0-9- ]*$/.test(req.body.username))) return res.status(400).json({error: 'Username cannot contain special characters'});

    if(req.body.pass1 !== req.body.pass2) return res.status(400).json({error: 'Passwords do not match'});

    AccountModel.generateHash(req.body.pass1, async (err, hash) => {
        if(err){
            console.log(err);
            return res.status(500).json({error: 'An error occurred on the server'});
        }

        // references: https://stackoverflow.com/questions/52832010/javascript-await-promise-order-of-execution-is-not-as-expected
        try{
            const accountData = {
                email: req.body.email,
                username: req.body.username,
                password: hash,
                following: [],
                followers: []
            };
    
            const newAccount = new AccountModel(accountData);
    
            // if save() fail, will go to catch{} condition
            // if save() success, will continue with code in try{}
            const saveAccount = await newAccount.save(); // returns a promise
            if(!saveAccount) return res.status(400).json({error: 'Document save promise failed'});

            req.session.account = AccountModel.toAPI(newAccount);
    
            return res.json({redirect: '/'});
        }
        catch(err){
            console.log(err);

            // ERROR CODE: E11000 - duplicate key error (user tries to sign up with already registered email)
            if (err.code === 11000) return res.status(400).json({error: 'Email already in use'});

            return res.status(400).json({error: 'An error occurred'});
        }
    }); 
};

// handles login requests - verifying authenticity of email & password, upon success, redirects client to main app page
const login = (req, res) => {
    const email = `${req.body.email}`;
    const password = `${req.body.pass1}`;

    if(!email || !password) return res.status(400).json({error: 'All fields are required'});

    AccountModel.authenticate(email, password, (err, account) => {
        if(err) return res.status(400).json({error: 'An error occurred'});
        if(!account) return res.status(400).json({error: 'Wrong email or password'});

        req.session.account = AccountModel.toAPI(account);
        
        return res.json({redirect: '/'});
    });
};

// handles logout requests - destroys user session & redirects client to login page
const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
};

// handles change password requests - first validating old password, upon success, generates new hash for new password
const changePassword = (req, res) => {
    req.body.oldPass = `${req.body.oldPass}`;
    req.body.newPass1 = `${req.body.newPass1}`;
    req.body.newPass2 = `${req.body.newPass2}`;

    if(!req.body.oldPass || !req.body.newPass1 || !req.body.newPass2) return res.status(400).json({error: 'All fields are required'});

    if(req.body.newPass1 !== req.body.newPass2) return res.status(400).json({error: 'New password does not match'});

    const oldPassword = req.body.oldPass;
    const newPassword = req.body.newPass1;

    // call AccountModel.validatePassword() - which will validate(old)Password
    AccountModel.validatePassword(req.session.account._id, oldPassword, (err, account) => {
        if(err) return res.status(400).json({error: 'An error occurred'});
        if(!account) return res.status(400).json({error: 'Old password does not match'});

        // upon validation, call AccountModel.generateHash(newPassword)
        return AccountModel.generateHash(newPassword, async (err, hash) => {
            if(err){
                console.log(err);
                return res.status(500).json({error: 'An error occurred on the server'});
            }

            account.password = hash;

            try{
                const saveAccount = await account.save();
                if(!saveAccount) return res.status(400).json({error: 'Document save promise failed'});

                return res.json({redirect: '/'});
            }
            catch(err){
                console.log(err);
                return res.status(400).json({error: 'An error occurred'});
            }
        });
    });
};

// handles users searching for an account requests - first searching for requested account, upon success, calls next() function 
// which is hooked up to TweetModels.getTweets() function that will retrieve all of the requested account's tweets 
const searchAccount = async (req, res, next) => {
    req.body.username = `${req.body.username}`;

    //if(req.body.username == req.session.account.username) return res.status(400).json({error: 'Cannot search for own account'});

    try{
        const doc = await AccountModel.findOne({username: req.body.username});
        if(!doc) return res.status(400).json({error: 'Account cannot be found'});
        
        return next();
    }
    catch(err){
        console.log(err);
        return res.status(400).json({error: 'An error occurred'});
    }
};

// handles follow account requests - updating the recipient's followers list (array), upon success, 
// calls the helper function 'updateSelfFollowers()', which updates the user's (requester) own followings list (array)
// reference: https://mongoosejs.com/docs/promises.html
const followAccount = async (req, res) => {
    req.body.username = `${req.body.username}`;
    req.session.account.username = `${req.session.account.username}`;

    if(req.body.username === req.session.account.username) return res.status(400).json({error: 'Cannot follow own account'});

    try{
        const followDoc = await AccountModel.findOne({username: req.body.username});
        if(!followDoc) return res.status(400).json({error: 'Could not retrieve requested document'});

        if(followDoc.followers.length === 0) followDoc.followers.push(req.session.account.username);
        else{
            if(followDoc.followers.includes(req.session.account.username)){
                console.log(req.session.account.username);
                return res.status(400).json({error: 'Already following this account'});
            }

            followDoc.followers.push(req.session.account.username);
        }

        const savedDoc = await followDoc.save(); // returns a promise
        if(!savedDoc) return res.status(400).json({error: 'Document save promise failed'});

        updateSelfFollowers(req, res);
    }
    catch(err){
        console.log(err);
        return res.status(400).json({error: 'An error occurred'});
    }
};

// helper function that updates user's own following list (array) when they request to follow another account
const updateSelfFollowers = async (req, res) => {
    try{
        const requesterDoc = await AccountModel.findOne({_id: req.session.account._id});
        if(!requesterDoc) return res.status(400).json({error: "Could not retrieve requester's document"});

        requesterDoc.following.push(req.body.username);

        const savedDoc = await requesterDoc.save(); // returns a promise
        if(!savedDoc) return res.status(400).json({error: 'Document save promise failed'});
       
        req.session.account = AccountModel.toAPI(requesterDoc);
            
        return res.json({redirect: '/'});
    }
    catch(err){
        console.log(err);
        return res.status(400).json({error: 'An error occurred'});
    }
};

// handles retrieve user's own profile requests - returns user's own document back to client
const getProfile = async (req, res) => {
    try{
        const doc = await AccountModel.findOne({_id: req.session.account._id});
        if(!doc) return res.status(400).json({error: 'Could not retrieve user profile'});

        return res.json(doc);
    }
    catch(err){
        console.log(err);
        return res.status(400).json({error: 'An error occurred'});
    }
};

// handles get csrfToken requests 
const getToken = (req, res) => {
    return res.json({csrfToken: req.csrfToken()});
};

module.exports = {
    signup,
    login,
    logout,
    changePassword,
    searchAccount,
    followAccount,
    getProfile,
    getToken
};