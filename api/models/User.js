/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    adminlogin: function(data, callback) {
        if (data.password) {
            data.password = sails.md5(data.password);
            sails.query(function(err, db) {
                if (db) {
                    db.collection('user').find({
                        email: data.email,
                        password: data.password,
                        accesslevel: "admin"
                    }, {
                        password: 0,
                        forgotpassword: 0
                    }).toArray(function(err, found) {
                        if (err) {
                            callback({
                                value: false
                            });
                            console.log(err);
                            db.close();
                        } else if (found && found[0]) {
                            callback(found[0]);
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
                if (err) {
                    console.log(err);
                    callback({
                        value: false
                    });
                }
            });
        } else {
            callback({
                value: false
            });
        }
    },
    findorcreate: function(data, callback) {
        var orfunc = {};
        var insertdata = {};
        if (data.provider == "Twitter") {
            insertdata.tweetid = data.id;
            insertdata.provider = data.provider;
            insertdata.username = data.username;
            insertdata.name = data.displayName;
            if (data.photos[0]) {
                insertdata.profilepic = data.photos[0].value;
            }
            insertdata.accesslevel = "customer";
            insertdata.token = data.token;
            insertdata.tokenSecret = data.tokenSecret;
            orfunc.tweetid = data.id;
            dbcall(insertdata);
        } else if (data.provider == "Facebook") {
            insertdata.fbid = data.id;
            insertdata.provider = data.provider;
            insertdata.username = data.username;
            insertdata.name = data.displayName;
            insertdata.accesslevel = "customer";
            if (data.photos && data.photos[0]) {
                insertdata.profilepic = data.photos[0].value;
            }
            if (data.emails && data.emails[0]) {
                insertdata.email = data.emails[0].value;
            }
            insertdata.accessToken = data.accessToken;
            insertdata.refreshToken = data.refreshToken;
            orfunc.fbid = data.id;
            dbcall(insertdata);
        } else {
            insertdata.googleid = data.id;
            insertdata.provider = data.provider;
            insertdata.accesslevel = "customer";
            insertdata.name = data.displayName;
            if (data.photos && data.photos[0]) {
                insertdata.profilepic = data.photos[0].value;
            }
            if (data.emails && data.emails[0]) {
                insertdata.email = data.emails[0].value;
            }
            insertdata.token = data.token;
            orfunc.googleid = data.id;
            dbcall(insertdata);
        }

        function dbcall(data) {
            sails.query(function(err, db) {
                if (err) {
                    callback({
                        value: false
                    });
                }
                data._id = sails.ObjectID();
                db.collection('user').find(orfunc).toArray(function(err, found) {
                    if (err) {
                        console.log(err);
                        callback({
                            value: false
                        });
                        db.close();
                    } else if (found.length != 0 && found[0]) {
                        var data2 = found[0];
                        data2.id = found[0]._id;
                        delete data2.accessToken;
                        delete data2.token;
                        delete data2.tokenSecret;
                        callback(null, data2);
                        db.close();
                    } else {
                        db.collection('user').insert(data, function(err, created) {
                            if (err) {
                                console.log(err);
                                callback({
                                    value: false
                                });
                                db.close();
                            } else if (created) {
                                data.id = created.ops[0]._id;
                                delete data.accessToken;
                                delete data.token;
                                delete data.tokenSecret;
                                callback(null, data);
                                db.close();
                            } else {
                                callback({
                                    value: false,
                                    comment: "Not created"
                                });
                                db.close();
                            }
                        });
                    }
                });
            });
        }
    },
    save: function(data, callback) {
        sails.query(function(err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                if (data.password && data.password != "") {
                    data.password = sails.md5(data.password);
                }

                function saveuser(data) {
                    db.collection('user').insert(data, function(err, created) {
                        if (err) {
                            console.log(err);
                            callback({
                                value: false,
                                comment: "Error"
                            });
                            db.close();
                        } else if (created) {
                            delete data.password;
                            data.id = data._id;
                            delete data._id;
                            callback(data);
                            db.close();
                        } else {
                            callback({
                                value: false,
                                comment: "Not created"
                            });
                            db.close();
                        }
                    });
                }
                if (!data._id) {
                    data._id = sails.ObjectID();
                    if (data.email && data.email != "") {
                        db.collection("user").find({
                            email: data.email
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
                                    value: false,
                                    comment: "User already exists"
                                });
                                db.close();
                            } else {
                                saveuser(data);
                            }
                        });
                    } else {
                        callback({
                            value: false,
                            comment: "Please provide parmeters"
                        });
                        db.close();
                    }
                } else {
                    var user = sails.ObjectID(data._id);
                    delete data._id;
                    db.collection('user').update({
                        _id: user
                    }, {
                        $set: data
                    }, function(err, updated) {
                        if (err) {
                            console.log(err);
                            callback({
                                value: false,
                                comment: "Error"
                            });
                            db.close();
                        } else if (updated.result.nModified != 0 && updated.result.n != 0) {
                            data.id = user;
                            callback({
                                value: true,
                                data: "User updated"
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
            }
        });
    },
    findlimited: function(data, callback) {
        var newreturns = {};
        newreturns.data = [];
        var check = new RegExp(data.search, "i");
        var accesslevel = data.accesslevel;
        var pagesize = parseInt(data.pagesize);
        var pagenumber = parseInt(data.pagenumber);
        var sortnum = parseInt(data.sort);
        var sort = {};
        sails.query(function(err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection("user").count({
                    name: {
                        '$regex': check
                    }
                }, function(err, number) {
                    if (number && number != "") {
                        newreturns.total = number;
                        newreturns.totalpages = Math.ceil(number / data.pagesize);
                        callbackfunc();
                    } else if (err) {
                        console.log(err);
                        callback({
                            value: false
                        });
                        db.close();
                    } else {
                        callback({
                            value: false,
                            comment: "Count of null"
                        });
                        db.close();
                    }
                });

                function callbackfunc() {
                    db.collection("user").find({
                        name: {
                            '$regex': check
                        }
                    }, {
                        password: 0,
                        forgotpassword: 0
                    }, {
                        name: 1
                    }).skip(pagesize * (pagenumber - 1)).limit(pagesize).toArray(function(err, found) {
                        if (err) {
                            callback({
                                value: false
                            });
                            console.log(err);
                            db.close();
                        } else if (found && found[0]) {
                            newreturns.data = found;
                            callback(newreturns);
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
            }
        });
    },
    find: function(data, callback) {
        sails.query(function(err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection("user").find({}, {
                    password: 0,
                    forgotpassword: 0
                }).toArray(function(err, found) {
                    if (err) {
                        callback({
                            value: false
                        });
                        db.close();
                    } else if (found && found[0]) {
                        callback(found);
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
        sails.query(function(err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection("user").find({
                    _id: sails.ObjectID(data._id)
                }, {
                    password: 0,
                    forgotpassword: 0
                }).toArray(function(err, data2) {
                    if (err) {
                        console.log(err);
                        callback({
                            value: false
                        });
                        db.close();
                    } else if (data2 && data2[0]) {
                        delete data2[0].password;
                        callback(data2[0]);
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
    searchmail: function(data, callback) {
        sails.query(function(err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection("user").find({
                    email: data.email
                }).toArray(function(err, data2) {
                    if (err) {
                        console.log(err);
                        callback({
                            value: false
                        });
                        db.close();
                    } else if (data2 && data2[0]) {
                        callback({
                            value: true,
                            comment: "User found"
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
    delete: function(data, callback) {
        sails.query(function(err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            var cuser = db.collection('user').remove({
                _id: sails.ObjectID(data._id)
            }, function(err, deleted) {
                if (deleted) {
                    callback({
                        value: true
                    });
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
        });
    },
    login: function(data, callback) {
        data.password = sails.md5(data.password);
        sails.query(function(err, db) {
            db.collection('user').find({
                email: data.email,
                password: data.password
            }, {
                password: 0,
                forgotpassword: 0,
                wishlist: 0
            }).toArray(function(err, found) {
                if (err) {
                    callback({
                        value: false
                    });
                    console.log(err);
                    db.close();
                }
                if (found && found[0]) {
                    if (found[0].forgotpassword) {
                        db.collection('user').update({
                            email: data.email,
                            password: data.password
                        }, {
                            $set: {
                                forgotpassword: ""
                            }
                        }, function(err, updated) {
                            if (err) {
                                console.log(err);
                                db.close();
                            } else if (updated) {
                                db.close();
                            }
                        });
                    }
                    delete found[0].forgotpassword;
                    found[0].id = found[0]._id;
                    delete found[0]._id;
                    callback(found[0]);
                } else {
                    db.collection('user').find({
                        email: data.email,
                        forgotpassword: data.password
                    }, {
                        password: 0,
                        forgotpassword: 0,
                        wishlist: 0
                    }).toArray(function(err, found) {
                        if (err) {
                            callback({
                                value: false
                            });
                            console.log(err);
                            db.close();
                        }
                        if (found && found[0]) {
                            sails.ObjectID(data._id);
                            db.collection('user').update({
                                email: data.email
                            }, {
                                $set: {
                                    forgotpassword: "",
                                    password: data.password
                                }
                            }, function(err, updated) {
                                if (err) {
                                    console.log(err);
                                    db.close();
                                } else if (updated) {
                                    db.close();
                                }
                            });
                            found[0].id = found[0]._id;
                            delete found[0]._id;
                            callback(found[0]);
                        } else {
                            callback({
                                value: false
                            });
                            db.close();
                        }
                    });
                }
            });
        });
    },
    changepassword: function(data, callback) {
        if (data.password && data.password != "" && data.editpassword && data.editpassword != "" && data.email && data.email != "") {
            data.password = sails.md5(data.password);
            var user = sails.ObjectID(data._id);
            var newpass = sails.md5(data.editpassword);
            sails.query(function(err, db) {
                if (err) {
                    console.log(err);
                    callback({
                        value: false,
                        comment: "Error"
                    });
                } else if (db) {
                    db.collection('user').update({
                        "_id": user,
                        "email": data.email,
                        "password": data.password
                    }, {
                        $set: {
                            "password": newpass
                        }
                    }, function(err, updated) {
                        if (err) {
                            console.log(err);
                            callback({
                                value: false,
                                comment: "Error"
                            });
                            db.close();
                        } else if (updated.result.nModified == 1 && updated.result.n == 1) {
                            callback({
                                value: true
                            });
                            db.close();
                        } else if (updated.result.nModified != 1 && updated.result.n == 1) {
                            callback({
                                value: false,
                                comment: "Same password"
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
        } else {
            callback({
                value: false,
                comment: "Please provide all parameters"
            });
        }
    },
    forgotpassword: function(data, callback) {
        sails.query(function(err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection('user').find({
                    email: data.email
                }).toArray(function(err, data2) {
                    if (err) {
                        console.log(err);
                        callback({
                            value: false
                        });
                        db.close();
                    } else if (data2 && data2[0]) {
                        var text = "";
                        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                        for (var i = 0; i < 8; i++) {
                            text += possible.charAt(Math.floor(Math.random() * possible.length));
                        }
                        var encrypttext = sails.md5(text);
                        var user = sails.ObjectID(data2[0]._id);
                        db.collection('user').update({
                            email: data.email
                        }, {
                            $set: {
                                forgotpassword: encrypttext
                            }
                        }, function(err, updated) {
                            if (err) {
                                console.log(err);
                                callback({
                                    value: false
                                });
                                db.close();
                            } else if (updated) {
                                var template_name = "aura-art";
                                var template_content = [{
                                    "name": "aura-art",
                                    "content": "aura-art"
                                }]
                                var message = {
                                    "from_email": sails.fromEmail,
                                    "from_name": sails.fromName,
                                    "to": [{
                                        "email": data.email,
                                        "type": "to"
                                    }],
                                    "global_merge_vars": [{
                                        "name": "password",
                                        "content": text
                                    }]
                                };
                                sails.mandrill_client.messages.sendTemplate({
                                    "template_name": template_name,
                                    "template_content": template_content,
                                    "message": message
                                }, function(result) {
                                    callback({
                                        value: true,
                                        comment: "Mail Sent"
                                    });
                                    db.close();
                                }, function(e) {
                                    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                                });
                            } else {
                                callback({
                                    value: false
                                });
                                db.close();
                            }
                        });
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
};
