/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var frontend = "http://wohlig.co.in/tagboss/";
// var frontend = "http://192.168.0.106:8080";
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
        clientID: "255093403704-0ss1qsp6r0pegavuhk9hknvggtk47357.apps.googleusercontent.com",
        clientSecret: "QLHIdMHGd-R6tiZV5rYOqkha",
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
                clientID: "255093403704-0ss1qsp6r0pegavuhk9hknvggtk47357.apps.googleusercontent.com",
                clientSecret: "QLHIdMHGd-R6tiZV5rYOqkha",
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
        successRedirect: '/user/success',
        failureRedirect: '/user/fail'
    }),
    callbackg: passport.authenticate('google', {
        successRedirect: '/user/success',
        failureRedirect: '/user/fail'
    }),
    callbackf: passport.authenticate('facebook', {
        successRedirect: '/user/success',
        failureRedirect: '/user/fail'
    }),
    success: function(req, res, data) {
        if (req.session.cart && req.session.cart.items.length > 0) {
            var i = 0;
            _.each(req.session.cart.items, function(art) {
                art.id = req.session.passport.user.id;
                Cart.save(art, function(cartrespo) {
                    i++;
                    if (i == req.session.cart.items.length) {
                        req.session.cart = {};
                        res.redirect(frontend);
                    }
                });
            });
        } else {
            res.redirect(frontend);
        }
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
            if (req.body._id) {
                if (req.body._id != "" && sails.ObjectID.isValid(req.body._id)) {
                    user();
                } else {
                    res.json({
                        value: false,
                        comment: "User-id is incorrect"
                    });
                }
            } else {
                user();
            }

            function user() {
                var print = function(data) {
                    if (data.value != false) {
                        if (data.accesslevel && data.accesslevel == "customer") {
                            req.session.passport = {
                                user: data
                            };
                            if (req.session.cart && req.session.cart.items.length > 0) {
                                var i = 0;
                                _.each(req.session.cart.items, function(art) {
                                    art.id = req.session.passport.user.id;
                                    Cart.save(art, function(cartrespo) {
                                        i++;
                                        if (i == req.session.cart.items.length) {
                                            req.session.cart = {};
                                            res.json({
                                                value: true
                                            });
                                        }
                                    });
                                });
                            } else {
                                res.json({
                                    value: true
                                });
                            }
                        } else {
                            res.json(data);
                        }
                    } else {
                        res.json(data);
                    }
                }
                User.save(req.body, print);
            }
        } else {
            res.json({
                value: false,
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
                value: false,
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
                    value: false,
                    comment: "USer not loggedd in"
                });
            }
        } else {
            res.json({
                value: false,
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
                    value: false,
                    comment: "Please provide parameters"
                });
            }
        } else {
            res.json({
                value: false,
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
                    value: false,
                    comment: "User-id is incorrect"
                });
            }
        } else {
            res.json({
                value: false,
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
                        if (req.session.cart && req.session.cart.items.length > 0) {
                            var i = 0;
                            _.each(req.session.cart.items, function(art) {
                                art.id = req.session.passport.user.id;
                                Cart.save(art, function(cartrespo) {
                                    i++;
                                    if (i == req.session.cart.items.length) {
                                        req.session.cart = {};
                                        res.json({
                                            value: true
                                        });
                                    }
                                });
                            });
                        } else {
                            res.send({
                                value: true
                            });
                        }
                    } else {
                        res.json(data);
                    }
                }
                User.login(req.body, print);
            } else {
                res.json({
                    value: false,
                    comment: "Please provide parameters"
                });
            }
        } else {
            res.json({
                value: false,
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
                    value: false,
                    comment: "User-id is incorrect"
                });
            }
        } else {
            res.json({
                value: false,
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
                    value: false,
                    comment: "Please provide parameters"
                });
            }
        } else {
            res.json({
                value: false,
                comment: "Please provide parameters"
            });
        }
    },
    adminlogin: function(req, res) {
        if (req.body) {
            if (req.body.email && req.body.email != "" && req.body.password && req.body.password != "") {
                var print = function(data) {
                    res.json(data);
                }
                User.adminlogin(req.body, print);
            } else {
                res.json({
                    value: false,
                    comment: "Please provide parameters"
                });
            }
        } else {
            res.json({
                value: false,
                comment: "Please provide parameters"
            });
        }
    },
};
