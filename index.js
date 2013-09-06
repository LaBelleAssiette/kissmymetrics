var superagent = require('superagent'),
Batch = require('batch');

var DEFAULT_TRACKER_ENDPOINT = 'https://trk.kissmetrics.com';

function kissMyMetrics(options) {
  options = options || {};
  this.endpoint = options.endpoint || DEFAULT_TRACKER_ENDPOINT;
  this.key = options.key;
  this.allowManualTimestamp = (options.allowManualTimestamp) ? true : false;
}

kissMyMetrics.prototype.request = function (pathname, params, callback) {
  callback = callback || defaultCallback;
  var request = superagent.get(this.endpoint + pathname);
  params['_k'] = this.key;

  if (this.allowManualTimestamp && params._t) {
    params['_d'] = 1;
  } else if (params._t) {
    delete params._t;
  }
  request.query(params);
  request.end(function (err, resp) {
    if (err) {
      callback(err.code);
    } else if (! resp.ok) {
      callback('kissmetrics http ' + resp.status + ' ' + resp.text);
    } else {
      callback(null, resp);
    }
  });
};

kissMyMetrics.prototype.set = function (person, properties, callback) {
  properties._p = person;
  this.request('/s', properties, callback);
};

kissMyMetrics.prototype.alias = function (person, aliases, callback) {
  var self = this;
  aliases = Array.isArray(aliases) ? aliases : [aliases];
  callback = callback || defaultCallback;

  var batch = new Batch();
  aliases.forEach(function (alias) {
    batch.push(function (callback) {
      var params = {
        '_p': person,
        '_n': alias,
      };
      self.request('/a', params, callback);
    });
  });
  batch.end(callback);
};

kissMyMetrics.prototype.event = function (person, event, properties, callback) {
  if (typeof properties === 'function') {
    callback = properties;
    properties = {};
  }
  properties = properties || {};

  properties._p = person;
  properties._n = event;

  this.request('/e', properties, callback);
};

function defaultCallback(err) {
  if (err) {
    console.error('KISSmetrics error:', err.stack);
  }
}

module.exports = kissMyMetrics;
