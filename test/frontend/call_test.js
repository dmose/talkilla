/* global app, chai, describe, it, beforeEach, afterEach, sinon */
var expect = chai.expect;

describe("Call", function() {
  var call;
  var sandbox;
  var callOptions = {caller: "caller", callee: "callee"};

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    sandbox.stub(app.media, "startPeerConnection");
    call = new app.models.Call(callOptions);
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe("initialize", function() {

    it("should have a state machine", function() {
      expect(call.state).to.be.an.instanceOf(Object);
    });

    it("should have an initial state", function() {
      expect(call.state.current).to.equal('ready');
    });

    it("should have an initial status", function() {
      expect(call.get("status")).to.equal("ready");
    });

    it("should have a caller and a callee attribute", function() {
      expect(call.caller).to.equal("caller");
      expect(call.callee).to.equal("callee");
    });

    it("should trigger two events when the state change", function() {
      sandbox.stub(call, "trigger");
      call.start();
      sinon.assert.calledThrice(call.trigger);
      sinon.assert.calledWith(call.trigger, "sendOutgoingCallRequest");
      sinon.assert.calledWith(call.trigger, "change");
      sinon.assert.calledWith(call.trigger, "change:status");
    });
  });

  // XXX test that getting some event from view sets _localStream

  // XXX test that getting some event from services(?) sets _remoteStream

  // XXX test that something sets _pc for incoming calls

  // XXX test that something sets _pc for outcoming calls

  describe("#start", function() {

    it("should change the state from ready to pending", function() {
      call.start();
      expect(call.state.current).to.equal('pending');
    });

    it("should raise an error if called twice", function() {
      call.start();
      expect(call.start).to.Throw();
    });

    it("should call startPeerConnection", function() {
      call.start();
      sinon.assert.calledOnce(app.media.startPeerConnection);
      sinon.assert.calledWithExactly(app.media.startPeerConnection, "callee");
    });

    it("should trigger a call event on app", function() {
      sandbox.stub(app, "trigger");
      call.start();
      sinon.assert.calledOnce(app.trigger);
      sinon.assert.calledWithExactly(app.trigger, "call", {callee: "callee"});
    });
  });

  describe("#accept", function() {

    it("should change the state from pending to ongoing", function() {
      call.start();
      call.accept();
      expect(call.state.current).to.equal('ongoing');
    });

  });

  describe("#hangup", function() {

    it("should change any state to terminated", function() {
      var pending = new app.models.Call(callOptions);
      var ongoing = new app.models.Call(callOptions);

      pending.start();
      ongoing.start();
      ongoing.accept();

      [pending, ongoing].forEach(function(call) {
        call.hangup();
        expect(call.state.current).to.equal('terminated');
      });
    });

    it("should not throw an error if hangup is called multiple times",
      function() {
        call.hangup();
        expect(call.hangup).to.not.Throw();
      });

  });

  describe('#_onHangup', function (){

    var sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should call app.media.closePeerConnection', function() {
      var media = {closePeerConnection: sinon.spy()};
      call._onHangup(media);
      sinon.assert.calledOnce(media.closePeerConnection);
      sinon.assert.calledWithExactly(media.closePeerConnection, call._pc,
        call._localStream, call._remoteStream);
    });

    it("should set the peer connection to null", function() {
      var media = {closePeerConnection: function() {}};
      call._onHangup(media);
      expect(call._pc).to.equal(null);
    });

    it("should set the callee to null", function() {
      var media = {closePeerConnection: function() {}};
      call._onHangup(media);
      expect(call.callee).to.equal(null);
    });

    it("should set _localStream to null", function() {
      call._localStream = undefined;
      var media = {closePeerConnection: function() {}};

      call._onHangup(media);

      expect(call._localStream).to.equal(null);
    });

    it("should set _remoteStream to null", function() {
      call._remoteStream = undefined;
      var media = {closePeerConnection: function() {}};

      call._onHangup(media);

      expect(call._remoteStream).to.equal(null);
    });

    it("should cause app to trigger a hangup_done event", function() {
      sandbox.stub(app, "trigger");
      var media = {closePeerConnection: function() {}};
      call._onHangup(media);
      sinon.assert.calledOnce(app.trigger);
      sinon.assert.calledWithExactly(app.trigger, "hangup_done");
    });

  });
});
