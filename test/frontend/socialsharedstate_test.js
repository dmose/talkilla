/*global socialSharedState, chai, sinon */

var expect = chai.expect;

describe('SocialSharedState', function () {
  "use strict";

  var sandbox, sharedState;
  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sharedState = new socialSharedState.SocialSharedState();
  });

  afterEach(function () {
    sandbox.restore;
  });
  describe("#getAsync", function (done) {

    it("should callback a value of undefined if a given name doesn't exist",
      function() {
        sharedState.get("fakeName",

          function (value) {
            expect(value).to.be(undefined);
            done();
          });
      });

    it("should return a given value that has been set in the database");
  });
});
