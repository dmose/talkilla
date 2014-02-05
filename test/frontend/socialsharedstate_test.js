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

    it("should callback a value of undefined if a given name doesn't exist",
      function(done) {
        sharedState.get("fakeName",

          function (value) {
            expect(value).to.equal(undefined);
            done();
          });
      });

    it.skip("should callback a given value that has been set in the database",
      function(done) {

      });

  });
});

