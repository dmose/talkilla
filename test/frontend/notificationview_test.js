/* global $, app, chai, describe, it, beforeEach, afterEach, sinon */
var expect = chai.expect;

var sandbox;

describe("IncomingCallNotificationVierw", function() {

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe("#accept", function() {

    it("should call event.preventDefault", function(){
      var notification = new app.views.IncomingCallNotificationView();
      var event = {preventDefault: new sandbox.spy()};

      notification.accept(event);
      sinon.assert.calledOnce(event.preventDefault);
      sinon.assert.calledWithExactly();
    });
  });
});