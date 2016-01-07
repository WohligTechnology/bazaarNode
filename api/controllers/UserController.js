/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var frontend = "http://192.168.0.110:8080/";
var passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new TwitterStrategy({
        consumerKey: "Gw3Y8I7DqKXE0gsXt6u5Ltxmd",
        consumerSecret: "fvRPSYfPJ7mrHZs5kKM7PMQZccAhDD7RsEms8yGWE9b3oUuzXH",
        callbackURL: sails.myurl + "user/callbackt"
    },
    function(token, tokenSecret, profile, done) {
        profile.token = token;
        profile.tokenSecret = tokenSecret;
        profile.provider = "Twitter";
        User.findorcreate(profile, done);
    }
));
passport.use(new FacebookStrategy({
        clientID: "698269600308287",
        clientSecret: "2f9ec34541b81ea98ab6d0f798be9579",
        callbackURL: sails.myurl + "user/callbackf"
    },
    function(accessToken, refreshToken, profile, done) {
        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;
        profile.provider = "Facebook";
        User.findorcreate(profile, done);
    }
));

passport.use(new GoogleStrategy({
        clientID: "134127417071-165vbnskckor8f786cq2f2u0i4pkrnj8.apps.googleusercontent.com",
        clientSecret: "r4P0uGeJIx9R_qSYhFVitkFi",
        callbackURL: "callbackg"
    },
    function(token, tokenSecret, profile, done) {
        profile.token = token;
        profile.tokenSecret = tokenSecret;
        profile.provider = "Google";
        // console.log(profile);
        User.findorcreate(profile, done);
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(id, done) {
    done(null, id);
});
module.exports = {
    //////////////////////////////
    // LOGIN FUNCTIONS
    logint: function(req, res) {
        var user = req.param("user");

        passport.use(new TwitterStrategy({
                consumerKey: "Gw3Y8I7DqKXE0gsXt6u5Ltxmd",
                consumerSecret: "fvRPSYfPJ7mrHZs5kKM7PMQZccAhDD7RsEms8yGWE9b3oUuzXH",
                callbackURL: sails.myurl + "user/callbackt"
            },
            function(token, tokenSecret, profile, done) {
                profile.token = token;
                profile.tokenSecret = tokenSecret;
                profile.provider = "Twitter";
                if (user && sails.ObjectID.isValid(user)) {
                    profile._id = user;
                }
                User.findorcreate(profile, done);
            }
        ));

        var loginid = req.param("loginid");
        req.session.loginid = loginid;
        passport.authenticate('twitter')(req, res);
    },
    loginf: function(req, res) {
        var user = req.param("user");

        passport.use(new FacebookStrategy({
                clientID: "698269600308287",
                clientSecret: "2f9ec34541b81ea98ab6d0f798be9579",
                callbackURL: sails.myurl + "user/callbackf"
            },
            function(accessToken, refreshToken, profile, done) {
                profile.accessToken = accessToken;
                profile.refreshToken = refreshToken;
                profile.provider = "Facebook";
                if (user && sails.ObjectID.isValid(user)) {
                    profile._id = user;
                }
                User.findorcreate(profile, done);
            }
        ));

        var loginid = req.param("loginid");
        req.session.loginid = loginid;
        passport.authenticate('facebook', {
            scope: 'email,public_profile,publish_actions'
        })(req, res);
    },
    loging: function(req, res) {
        var user = req.param("user");

        passport.use(new GoogleStrategy({
                clientID: "134127417071-165vbnskckor8f786cq2f2u0i4pkrnj8.apps.googleusercontent.com",
                clientSecret: "r4P0uGeJIx9R_qSYhFVitkFi",
                callbackURL: "callbackg"
            },
            function(token, tokenSecret, profile, done) {
                profile.token = token;
                profile.provider = "Google";
                User.findorcreate(profile, done);
            }
        ));

        var loginid = req.param("loginid");
        req.session.loginid = loginid;
        passport.authenticate('google', {
            scope: "openid profile email"
        })(req, res);
    },
    callbackt: passport.authenticate('twitter', {
        successRedirect: frontend,
        failureRedirect: '/user/fail'
    }),
    callbackg: passport.authenticate('google', {
        successRedirect: frontend,
        failureRedirect: '/user/fail'
    }),
    callbackf: passport.authenticate('facebook', {
        successRedirect: frontend,
        failureRedirect: '/user/fail'
    }),
    success: function(req, res, data) {
        if (req.session.passport) {
            sails.sockets.blast("login", {
                loginid: req.session.loginid,
                status: "success",
                user: req.session.passport.user
            });
        }
        res.view("success");
    },
    fail: function(req, res) {
        sails.sockets.blast("login", {
            loginid: req.session.loginid,
            status: "fail"
        });
        res.view("fail");
    },
    profile: function(req, res) {
        if (req.session.passport) {
            res.json(req.session.passport.user);
        } else {
            res.json({});
        }
    },
    logout: function(req, res) {
        req.session.destroy(function(err) {
            res.json({
                value: true
            });
        });
    },
    findorcreate: function(req, res) {
        var print = function(data) {
            res.json(data);
        }
        User.findorcreate(req.body, print);
    },
    //////////////////////////////
    save: function(req, res) {
        if (req.body) {
            if (req.session.passport) {
                req.body._id = req.session.passport.user.id;
                user();
            } else {
                user();
            }

            function user() {
                var print = function(data) {
                    if (data.value != false) {
                        req.session.passport = {
                            user: data
                        };
                        res.json({
                            value: true
                        });
                    } else {
                        res.json(data);
                    }
                }
                User.save(req.body, print);
            }
        } else {
            res.json({
                value: "false",
                comment: "Please provide parameters"
            });
        }
    },
    find: function(req, res) {
        var print = function(data) {
            res.json(data);
        }
        User.find(req.body, print);
    },
    findlimited: function(req, res) {
        if (req.body) {
            if (req.body.pagesize && req.body.pagesize != "" && req.body.pagenumber && req.body.pagenumber != "") {
                function callback(data) {
                    res.json(data);
                };
                User.findlimited(req.body, callback);
            } else {
                res.json({
                    value: false,
                    comment: "Please provide parameters"
                });
            }
        } else {
            res.json({
                value: "false",
                comment: "Please provide parameters"
            });
        }
    },
    findone: function(req, res) {
        if (req.body) {
            if (req.session.passport) {
                req.body._id = req.session.passport.user.id;
                var print = function(data) {
                    res.json(data);
                }
                User.findone(req.body, print);
            } else {
                res.json({
                    value: "false",
                    comment: "USer not loggedd in"
                });
            }
        } else {
            res.json({
                value: "false",
                comment: "Please provide parameters"
            });
        }
    },
    searchmail: function(req, res) {
        if (req.body) {
            if (req.body.email && req.body.email != "") {
                var print = function(data) {
                    res.json(data);
                }
                User.searchmail(req.body, print);
            } else {
                res.json({
                    value: "false",
                    comment: "Please provide parameters"
                });
            }
        } else {
            res.json({
                value: "false",
                comment: "Please provide parameters"
            });
        }
    },
    delete: function(req, res) {
        if (req.body) {
            if (req.body._id && req.body._id != "" && sails.ObjectID.isValid(req.body._id)) {
                var print = function(data) {
                    res.json(data);
                }
                User.delete(req.body, print);
            } else {
                res.json({
                    value: "false",
                    comment: "User-id is incorrect"
                });
            }
        } else {
            res.json({
                value: "false",
                comment: "Please provide parameters"
            });
        }
    },
    login: function(req, res) {
        if (req.body) {
            if (req.body.email && req.body.email != "" && req.body.password && req.body.password != "") {
                var print = function(data) {
                    if (data.value != false) {
                        req.session.passport = {
                            user: data
                        };
                        res.json({
                            value: true
                        });
                    } else {
                        res.json(data);
                    }
                }
                User.login(req.body, print);
            } else {
                res.json({
                    value: "false",
                    comment: "Please provide parameters"
                });
            }
        } else {
            res.json({
                value: "false",
                comment: "Please provide parameters"
            });
        }
    },
    changepassword: function(req, res) {
        if (req.body) {
            if (req.body._id && req.body._id != "" && sails.ObjectID.isValid(req.body._id)) {
                var print = function(data) {
                    res.json(data);
                }
                User.changepassword(req.body, print);
            } else {
                res.json({
                    value: "false",
                    comment: "User-id is incorrect"
                });
            }
        } else {
            res.json({
                value: "false",
                comment: "Please provide parameters"
            });
        }
    },
    forgotpassword: function(req, res) {
        if (req.body) {
            if (req.body.email && req.body.email != "") {
                var print = function(data) {
                    res.json(data);
                }
                User.forgotpassword(req.body, print);
            } else {
                res.json({
                    value: "false",
                    comment: "Please provide parameters"
                });
            }
        } else {
            res.json({
                value: "false",
                comment: "Please provide parameters"
            });
        }
    }
};
