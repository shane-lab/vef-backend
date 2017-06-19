var cfg = require('../bin/cfg');

var users = require('../models/user');

var passportJWT = require('passport-jwt');

module.exports = ((passport) => {
    var opts = {};
    opts.secretOrKey = cfg.api.secret;
    opts.jwtFromRequest = passportJWT.ExtractJwt.fromAuthHeader();

    passport.use(new passportJWT.Strategy(opts, (payload, done) => {
        users.Model.findOne({
            _id: payload._id
        }, (err, user) => {
            if (err) {
                return done(err, false);
            }

            done(null, (user || false));
        })
    }));
});