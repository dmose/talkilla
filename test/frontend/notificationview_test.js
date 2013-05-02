/* global $, app, chai, describe, it, beforeEach, afterEach, sinon */
var expect = chai.expect;

var sandbox;

describe("IncomingCallNotificationVierw", function() {
    var call;
    var event;
    var notification;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    call = {start: sandbox.spy()};
    event = {preventDefault: sandbox.spy()};
    notification = new app.views.IncomingCallNotificationView({model: call});
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe("#accept", function() {

    it("should call event.preventDefault", function(){
      notification.accept(event);
      sinon.assert.calledOnce(event.preventDefault);
      sinon.assert.calledWithExactly(event.preventDefault);
    });

    it("should start a call", function() {
      var notification = new app.views.IncomingCallNotificationView({model: call});

      notification.accept(event);
      sinon.assert.calledOnce(call.start);
      sinon.assert.calledWithExactly(call.start);
    });
  });
});