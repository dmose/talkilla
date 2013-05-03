/* global app, chai, describe, it, beforeEach, afterEach, sinon */
var expect = chai.expect;

describe("AppView", function() {
  var sandbox;

  describe("#initialize", function() {
    beforeEach(function() {
      sandbox = sinon.sandbox.create();

      sandbox.stub(app.views, "NotificationsView");
      sandbox.stub(app.views, "LoginView");
      sandbox.stub(app.views, "UsersView");
      sandbox.stub(app.views, "CallView");
      sandbox.stub(app.models, "Call");
    });

    afterEach(function() {
      sandbox.restore();
    });

  });

  describe("#createCall", function () {

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      sandbox.stub(app.views, "NotificationsView");
      sandbox.stub(app.views, "UsersView");
    });

    afterEach(function() {
      sandbox.restore();
    });

    it("should create a call property initialized to a new call model",
      function() {
        var appView = new app.views.AppView();

        // XXX we should really test this in other places, both in the
        // initialization method, and in whatever call cleanup method
        // we write
        expect(appView.call).to.equal(undefined);

        sandbox.stub(app.models, "Call");
        sandbox.stub(app.views, "CallView");
        appView.createCall();

        expect(appView.call).to.be.instanceOf(app.views.CallView);

        sinon.assert.calledOnce(app.models.Call);
        // XXX assert the model constructor should be created with caller
        // and callee args
        sinon.assert.calledOnce(app.views.CallView);
        sinon.assert.calledWith(app.views.CallView, sinon.match.has("model"));
      });
  });

});
