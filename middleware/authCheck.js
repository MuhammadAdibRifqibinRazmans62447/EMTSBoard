const authCheck = (req, res, next) => {

    if (!req.session.user) {
        return res.redirect('/E-mts/login-board');
    }

    next();

};

module.exports = authCheck;