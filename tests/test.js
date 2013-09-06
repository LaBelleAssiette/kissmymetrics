var Kissmetrics = require('../'),
should = require('should');

var TEST_PORT = 50458;

describe('kissmymetrics', function () {

  var kmClient;
  var kmClientDefault;

  before(function (done) {
    kmClientDefault = new Kissmetrics();
    kmClient = new Kissmetrics({
      key: 'blah',
      endpoint: 'http://localhost:' + TEST_PORT
    });

    var server = require('http').createServer(function(req, resp) {
      resp.writeHead(200, { 'Content-Type': 'application/json' });
      resp.write(JSON.stringify({
        method: req.method,
        url: req.url
      }));
      resp.end();
    });

    server.listen(TEST_PORT, done);
  });

  describe('Kissmetrics Constructor', function() {
    it('should be defined', function () {
      should.exist(kmClient);
    });

    it('endpoint should be default', function () {
      kmClientDefault.endpoint.should.equal('https://trk.kissmetrics.com');
    });

    it('key should be correctly set', function () {
      kmClient.key.should.equal('blah');
    });

    it('Manual Timestamp should not be allowed', function () {
      kmClient.allowManualTimestamp.should.false;
    });
  });

  describe('Request', function() {
    it('should correctly send', function (done) {
      kmClient.request('/myPath', {_t: 123456789, param1: 'value1', param2: 42}, function (err, ret) {
        if (err) {
          done(new Error(err));
        } else {
          ret.body.url.should.equal('/myPath?param1=value1&param2=42&_k=blah');
          done();
        }
      });
    });
  });

  describe('Request with timestamp', function() {

    var kmClient2 =  new Kissmetrics({
      key: 'blah',
      endpoint: 'http://localhost:' + TEST_PORT,
      allowManualTimestamp: true
    });

    it('should correctly send', function (done) {
      kmClient2.request('/myPath', {_t: 123456789, param1: 'value1', param2: 42}, function (err, ret) {
        if (err) {
          done(new Error(err));
        } else {
          ret.body.url.should.equal('/myPath?_t=123456789&param1=value1&param2=42&_k=blah&_d=1');
          done();
        }
      });
    });
  });

  describe('Set', function() {
    it('should correctly send', function (done) {
      kmClient.set('Bob', {_t: 123456789, email: 'bob@mail.com'}, function (err, ret) {
        if (err) {
          done(new Error(err));
        } else {
          ret.body.url.should.equal('/s?email=bob%40mail.com&_p=Bob&_k=blah');
          done();
        }
      });
    });
  });

  describe('Alias', function() {
    it('simple alias should correctly send', function (done) {
      kmClient.alias('Bob', 'bob@mail.com', function (err, ret) {
        if (err) {
          done(new Error(err));
        } else {
          ret[0].body.url.should.include('/a?_p=Bob&_n=bob%40mail.com&_k=blah');
          done();
        }
      });
    });

    it('Array of alias should correctly send', function (done) {
      kmClient.alias('Bob', ['bob@mail.com', '+33175755775'], function (err, ret) {
        if (err) {
          done(new Error(err));
        } else {
          ret[0].body.url.should.include('/a?_p=Bob&_n=bob%40mail.com&_k=blah');
          ret[1].body.url.should.include('/a?_p=Bob&_n=%2B33175755775&_k=blah');
          done();
        }
      });
    });
  });

  describe('Event', function () {
    it('Minimum event should be correctly send', function (done) {
      kmClient.event('Bob', 'signin', function (err, ret) {
        if (err) {
          done(new Error(err));
        } else {
          ret.body.url.should.include('/e?_p=Bob&_n=signin&_k=blah');
          done();
        }
      });
    });

    it('Event with properties should be correctly send', function (done) {
      kmClient.event('Bob', 'signin', {method: 'form'}, function (err, ret) {
        if (err) {
          done(new Error(err));
        } else {
          ret.body.url.should.include('/e?method=form&_p=Bob&_n=signin&_k=blah');
          done();
        }
      });
    });
  });

});
