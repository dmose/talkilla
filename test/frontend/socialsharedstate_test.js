/*global socialSharedState, chai, sinon */

var expect = chai.expect;

describe('SocialSharedState', function () {
  "use strict";

  var sandbox, sharedState, idbStub;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    idbStub = {};
    var testDBName = "testDB";
    sharedState = new socialSharedState.SocialSharedState(idbStub, testDBName);
  });

  afterEach(function () {
    sandbox.restore();
  });
  describe("#getAsync", function (done) {

    it("should callback a value of undefined  if a given name doesn't exist",
      function(done) {
        sharedState.getAsync("fakeName",

          function (error, value) {

            expect(error).to.equal(null);
            expect(value).to.equal(undefined);

            done();
          });
      });

    it("should callback a given boolean value that has been previously set",
      function(done) {
        sharedState.setAsync("fakeName", true, function() {
          sharedState.getAsync("fakeName", function(error, value) {

            expect(error).to.equal(null);
            expect(value).to.equal(true);

            done();
          });
        });
      });

  });
});

