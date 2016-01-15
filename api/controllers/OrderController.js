/**
 * OrderController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    save: function(req, res) {
        if (req.body) {
            if (req.session.passport) {
                req.body._id = req.session.passport.user.id;
                var print = function(data) {
                    res.json(data);
                }
                User.findone(req.body, function(respo) {
                    respo.user = respo._id;
                    respo.cart = req.body.cart;
                    respo.price = req.body.totalCartPrice;
                    respo.type = req.body.paymentType;
                    respo.billing = req.body.billing;
                    respo.shipping = req.body.shipping;
                    respo.mobile = req.body.mobile;
                    respo.name = req.body.name;
                    delete respo._id;
                    Order.save(respo, print);
                });
            } else {
                res.json({
                    value: false,
                    comment: "No user logged in"
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
                Order.delete(req.body, print);
            } else {
                res.json({
                    value: false,
                    comment: "Order-id is incorrect"
                });
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
        Order.find(req.body, print);
    },
    findone: function(req, res) {
        if (req.body) {
            if (req.body._id && req.body._id != "" && sails.ObjectID.isValid(req.body._id)) {
                var print = function(data) {
                    res.json(data);
                }
                Order.findone(req.body, print);
            } else {
                res.json({
                    value: false,
                    comment: "Orderid incorrect"
                });
            }
        } else {
            res.json({
                value: false,
                comment: "Please provide parameters"
            });
        }
    },
    findOrders: function(req, res) {
        if (req.session.passport) {
            req.body.user = req.session.passport.user.id;
            var print = function(data) {
                res.json(data);
            }
            Order.findOrders(req.body, print);
        } else {
            res.json([]);
        }
    },
    findlimited: function(req, res) {
        if (req.body) {
            if (req.body.pagesize && req.body.pagesize != "" && req.body.pagenumber && req.body.pagenumber != "") {
                function callback(data) {
                    res.json(data);
                };
                Order.findlimited(req.body, callback);
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
    }
};
