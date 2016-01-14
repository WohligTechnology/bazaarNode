/**
 * Wishlist.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    save: function(data, callback) {
        var user = sails.ObjectID(data.id);
        delete data.id;
        if (data.product && data.product != "") {
            data.product = sails.ObjectID(data.product);
        }
        sails.query(function(err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                if (!data._id) {
                    db.collection("user").find({
                        _id: user,
                        "cart.product": sails.ObjectID(data.product)
                    }).toArray(function(err, data2) {
                        if (err) {
                            console.log(err);
                            callback({
                                value: false,
                                comment: "Error"
                            });
                            db.close();
                        } else if (data2 && data2[0]) {
                            callback({
                                value: false
                            });
                            db.close();
                        } else {
                            db.collection("user").update({
                                _id: user
                            }, {
                                $push: {
                                    cart: data
                                }
                            }, function(err, updated) {
                                if (err) {
                                    console.log(err);
                                    callback({
                                        value: false
                                    });
                                    db.close();
                                } else if (updated.result.nModified != 0 && updated.result.n != 0) {
                                    callback({
                                        value: true
                                    });
                                    db.close();
                                } else if (updated.result.nModified == 0 && updated.result.n != 0) {
                                    callback({
                                        value: true,
                                        comment: "Data already updated"
                                    });
                                    db.close();
                                } else {
                                    callback({
                                        value: false,
                                        comment: "No data found"
                                    });
                                    db.close();
                                }
                            });
                        }
                    });
                }
            }
        });
    },
    delete: function(data, callback) {
        sails.query(function(err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection("user").update({
                    _id: sails.ObjectID(data.id)
                }, {
                    $pull: {
                        "cart": {
                            "product": sails.ObjectID(data.product)
                        }
                    }
                }, function(err, updated) {
                    if (err) {
                        console.log(err);
                        callback({
                            value: false
                        });
                        db.close();
                    } else if (updated) {
                        callback({
                            value: true
                        });
                        db.close();
                    } else {
                        callback({
                            value: false,
                            comment: "No data found"
                        });
                        db.close();
                    }
                });
            }
        });
    },
    findone: function(data, callback) {
        var user = sails.ObjectID(data.user);
        sails.query(function(err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection("user").find({
                    "_id": user,
                    "cart._id": sails.ObjectID(data._id)
                }, {
                    "cart.$": 1
                }).toArray(function(err, data2) {
                    if (data2 && data2[0] && data2[0].cart && data2[0].cart[0]) {
                        callback(data2[0].cart[0]);
                        db.close();
                    } else if (err) {
                        console.log(err);
                        callback({
                            value: false
                        });
                        db.close();
                    } else {
                        callback({
                            value: false,
                            comment: "No data found"
                        });
                        db.close();
                    }
                });
            }
        });
    },
    find: function(data, callback) {
        var lastresult = [];
        var i = 0;
        var j = 0;
        var returnData = [];
        var user = sails.ObjectID(data.id);
        sails.query(function(err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection("user").aggregate([{
                    $match: {
                        _id: user
                    }
                }, {
                    $unwind: "$cart"
                }, {
                    $group: {
                        _id: "$_id",
                        cart: {
                            $addToSet: "$cart"
                        }
                    }
                }, {
                    $project: {
                        _id: 0,
                        cart: 1
                    }
                }, {
                    $unwind: "$cart"
                }]).toArray(function(err, data2) {
                    if (data2 && data2.length > 0) {
                        _.each(data2, function(z) {
                            lastresult.push(z.cart);
                            i++;
                            if (i == data2.length) {
                                _.each(lastresult, function(art) {
                                    Product.findone({
                                        _id: art.product
                                    }, function(respo) {
                                        if (respo.value != false) {
                                            j++;
                                            returnData.push(respo);
                                            if (j == lastresult.length) {
                                                callback(returnData);
                                                db.close();
                                            }
                                        } else {
                                            j++;
                                            if (j == lastresult.length) {
                                                callback(returnData);
                                                db.close();
                                            }
                                        }
                                    });
                                });
                            }
                        });
                    } else if (err) {
                        console.log(err);
                        callback({
                            value: false
                        });
                        db.close();
                    } else {
                        callback([]);
                        db.close();
                    }
                });
            }
        });
    },
    // findlimited: function(data, callback) {
    //     var newcallback = 0;
    //     var newreturns = {};
    //     var check = new RegExp(data.search, "i");
    //     var pagesize = data.pagesize;
    //     var pagenumber = data.pagenumber;
    //     var user = sails.ObjectID(data.user);
    //     sails.query(function(err, db) {
    //         if (err) {
    //             console.log(err);
    //             callback({
    //                 value: false
    //             });
    //         }
    //         if (db) {
    //             db.collection("user").aggregate([{
    //                 $match: {
    //                     _id: user
    //                 }
    //             }, {
    //                 $unwind: "$cart"
    //             }, {
    //                 $group: {
    //                     _id: user,
    //                     count: {
    //                         $sum: 1
    //                     }
    //                 }
    //             }, {
    //                 $project: {
    //                     count: 1
    //                 }
    //             }]).toArray(function(err, result) {
    //                 if (result && result[0]) {
    //                     newreturns.total = result[0].count;
    //                     newreturns.totalpages = Math.ceil(result[0].count / data.pagesize);
    //                     callbackfunc();
    //                 } else if (err) {
    //                     console.log(err);
    //                     callback({
    //                         value: false
    //                     });
    //                     db.close();
    //                 } else {
    //                     callback({
    //                         value: false,
    //                         comment: "count of null"
    //                     });
    //                     db.close();
    //                 }
    //             });

    //             function callbackfunc() {
    //                 db.collection("user").aggregate([{
    //                     $match: {
    //                         _id: user
    //                     }
    //                 }, {
    //                     $unwind: "$cart"
    //                 }, {
    //                     $project: {
    //                         cart: 1
    //                     }
    //                 }]).skip(pagesize * (pagenumber - 1)).limit(pagesize).toArray(function(err, found) {
    //                     if (found != null) {
    //                         newreturns.data = found;
    //                         callback(newreturns);
    //                         db.close();
    //                     } else if (err) {
    //                         console.log(err);
    //                         callback({
    //                             value: false
    //                         });
    //                         db.close();
    //                     } else {
    //                         callback({
    //                             value: false,
    //                             comment: "No data found"
    //                         });
    //                         db.close();
    //                     }
    //                 });
    //             }
    //         }
    //     });
    // }
};
