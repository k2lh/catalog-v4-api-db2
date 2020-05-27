/* eslint-disable */
require('dotenv').config()
const express = require('express');
const history = require('connect-history-api-fallback');
const apiCache = require('apicache');
const compression = require('compression');
const os = require('os');
const bodyParser = require('body-parser');
const cors = require('cors');
const request = require('request');
const router = express.Router();
const jwt = require('jsonwebtoken');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require("express-session");
const MemoryStore = require('session-memory-store')(session);

const DEBUG=false;
const MAX_URLS = 100;
const CACHE_TIME = 60000;

// Set DB2 license
// DO NOT remove, cloud deployment requires this
if (process.env.LICENSE && process.env.LICENSE_FILE) {
  console.log('connecting to DB2 with LICENSE...')
  var fs = require('fs')
  fs.open(process.env.LICENSE_FILE, 'w+', function (err, fd) {
    if (err) console.log(err);
    var strArray = process.env.LICENSE.split('|')
    for (var i = 0; i < strArray.length; i++) {
      fs.appendFile(process.env.LICENSE_FILE, strArray[i] + '\n', function (err) {
        if (err) console.log(err);
      })
    }
    console.log('DB2 LICENSE set successfully');
  })
} else {
  console.log('connect to DB2 directly, no license file required')
}

var env = process.env.NODE_ENV || 'development';
const productionAppName = 'data-project';
const port = (process.env.VCAP_APP_PORT || process.env.PORT || 3000);
const appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
    console.log('productionAppName:', productionAppName, ' && env:', process.env.NODE_ENV);
const appHost = process.env.VCAP_APPLICATION && JSON.parse(process.env.VCAP_APPLICATION).application_uris[0] || 'localhost';

let hostUri = 'http://localhost:' + port;
let appName = 'local';
if (process.env.VCAP_APPLICATION) {
  let appVar = JSON.parse(process.env.VCAP_APPLICATION);
  hostUri = appVar.application_uris[0]; // Take any URI from the list, any will work
  appName = appVar.application_name;
}
const loopEndPoint = hostUri + '/api';
    console.log('App: ', appName, ' hostUri: ', hostUri);
if (DEBUG) console.log('Env: ', process.env);

/* Initialization */
const app = express();
const cache = apiCache.middleware;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(cookieParser());
app.use(cors({
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204,
  "withCredentials": true
}));

/* See http://expressjs.com/en/api.html#trust.proxy.options.table */
app.enable('trust proxy');
app.use(function (req, res, next) {
  const runOncloud = () => {
    return appName.includes('data-project');
  }
  if (!req.secure && runOncloud()) {
    console.log('---------------- NOT secure, on cloud');
    res.redirect('https://' + req.headers.host + req.url);
  } else {
    next();
  }
});

/* Caching */
if (appName === productionAppName) {
  console.log('Server caching enabled');
  app.use(cache(CACHE_TIME * 5));
} else {
  console.log('Server caching disabled outside of production');
}
class CacheManager {
  constructor() {
    this.CACHING_TIME = CACHE_TIME * 5;     // in ms
    this.REPEAT_DELAY = this.CACHING_TIME + 10000;  // Give 30s response time
    this.lastCalledUrls = [];
  }
  pushUrl(req) {
    if (DEBUG) console.log('pushUrl ', req.url, this.lastCalledUrls.length);
    if (req.method !== 'GET') {
      if (DEBUG) console.log('request is not a get, not caching that call');
      return;
    }
    if (DEBUG) console.log('request is a get, proceeding');
    if (this.lastCalledUrls.length >= MAX_URLS) {
      let bin = this.lastCalledUrls.shift();
      if (DEBUG) console.log((new Date()).toLocaleString(),
                             'removing entry from the list', bin.url);
    }
    if (!this.alreadyPushed(req)) {
      if (DEBUG) console.log((new Date()).toLocaleString(),
                              'pushing new URL into the pool', req.url);
      this.lastCalledUrls.push(req);
      this.scheduleRequest(req);
    } else {
      if (DEBUG) console.log((new Date()).toLocaleString(),
                             'URL is already in the pool, ignoring', req.url);
    }
  }
  alreadyPushed(req) {
    if (!req) {
      throw('provide a URL to CacheManager.alreadyPushed()');
    }
    let res = this.lastCalledUrls.find(request => {
      return request.url === req.url;
    }) ? true : false;
    return res;
  }
  scheduleRequest (req) {
    if (DEBUG) console.log('scheduleRequest', req.url);
    setTimeout(this.repeatRequest.bind(this), this.REPEAT_DELAY, req);
  }
  repeatRequest (req, context) {
    if (DEBUG) console.log('repeatRequest', req.url);
    if (this.alreadyPushed(req)) {
      const localUrl = loopEndPoint + req.url;
      let payload = { qs: req.query, headers: { 'XReplay': true } };
      req.headers['XReplay'] = 'true';
      req.pipe(request.get(localUrl, payload));
      this.scheduleRequest(req);
    } else {
      if (DEBUG) console.log('request seems to have fallen out of the list', req.url);
      // No need for caching in other cases, and even less repeating
    }
  }
}
cacheManager = new CacheManager();

app.use('/api', require('./routes/endpoints')(app));

/* Front End */
app.use(history({index: '/index.html'}));
app.use(compression());
app.use('/', express.static(__dirname + '/dist'));

app.listen(port, function() { console.log('gogogo on port ' + port); });
