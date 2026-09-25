const authSV = (req, res, next) => {

    // No session/user -> login
    if (!req.session.user) {
        return res.redirect('/E-mts/login-board');
    }

    // User exists but not Admin -> alert
    if (req.session.user.rc !== 'Approval') {

        req.session.alert = {
            type: 'danger',
            message: 'You do not have permission to access this page.'
        };

        return res.redirect('/E-mts/login-board');
    }

    next();
};

module.exports = authSV;