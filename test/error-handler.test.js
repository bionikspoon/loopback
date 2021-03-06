var loopback = require('../');
var app;
var assert = require('assert');
var request = require('supertest');

describe('loopback.errorHandler(options)', function() {
  it('should return default middleware when options object is not present', function(done) {
    //arrange
    var app = loopback();
    app.use(loopback.urlNotFound());
    app.use(loopback.errorHandler({ log: false }));

    //act/assert
    request(app)
      .get('/url-does-not-exist')
      .end(function(err, res) {
        assert.ok(res.error.text.match(/<ul id="stacktrace"><li> &nbsp; &nbsp;at raiseUrlNotFoundError/));
        done();
      });
  });

  it('should delete stack when options.includeStack is false', function(done) {
    //arrange
    var app = loopback();
    app.use(loopback.urlNotFound());
    app.use(loopback.errorHandler({ includeStack: false, log: false }));

    //act/assert
    request(app)
      .get('/url-does-not-exist')
      .end(function(err, res) {
        assert.ok(res.error.text.match(/<ul id="stacktrace"><\/ul>/));
        done();
      });
  });

  it('should pass options on to error handler module', function(done) {
    //arrange
    var app = loopback();
    app.use(loopback.urlNotFound());

    var errorLogged;
    app.use(loopback.errorHandler({
      includeStack: false,
      log: function customLogger(err, str, req) {
        errorLogged = err;
      },
    }));

    //act
    request(app).get('/url-does-not-exist').end(function(err) {
      if (err) return done(err);
      //assert
      expect(errorLogged)
        .to.have.property('message', 'Cannot GET /url-does-not-exist');
      done();
    });
  });
});
