/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function (cb) {
    sails.Db = require('mongodb').Db,
        sails.MongoClient = require('mongodb').MongoClient,
        sails.ISODate = require('mongodb').ISODate,
        sails.Server = require('mongodb').Server,
        sails.ReplSetServers = require('mongodb').ReplSetServers,
        sails.ObjectID = require('mongodb').ObjectID,
        sails.Binary = require('mongodb').Binary,
        sails.GridStore = require('mongodb').GridStore,
        sails.Grid = require('mongodb').Grid,
        sails.Code = require('mongodb').Code,
        sails.assert = require('assert'),
        sails.mime = require('mime'),
        sails.md5 = require('MD5'),
        sails.moment = require('moment'),
        sails.fs = require('fs'),
        sails.myurl = "http://vignesh.com:82/",
        sails.mandrill = require('mandrill-api/mandrill'),
        sails.mandrill_client = new sails.mandrill.Mandrill('dzbY2mySNE_Zsqr3hsK70A'),
        sails.fromName = "Tag Boss",
        sails.fromEmail = "vigneshkasthuri2009@gmail.com",
        // Connection URL
        sails.url = 'mongodb://localhost:27017/tagboss';
    sails.query = function (myfunc) {
            sails.MongoClient.connect(sails.url, myfunc);
        }
        // It's very important to trigger this callback method when you are finished
        // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    cb();
};