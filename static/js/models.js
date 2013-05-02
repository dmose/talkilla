/* global Talkilla, Backbone, StateMachine */
/**
 * Talkilla models and collections.
 */
(function(app, Backbone) {
  "use strict";

  app.models.Call = Backbone.Model.extend({
      defaults: {
          status: "ready"
      },

    initialize: function(options) {
      this.caller = options.caller;
      this.callee = options.callee;

      this.state = StateMachine.create({
        initial: 'ready',
        events: [
          {name: 'start',  from: 'ready',   to: 'pending'},
          {name: 'accept', from: 'pending', to: 'ongoing'},
          {name: 'hangup', from: '*',       to: 'terminated'}
        ]
      });

      this.state.onafterevent = function(event) {
        this.set("status", event);
        this.trigger(event);
      }.bind(this);

      this.accept = this.state.accept.bind(this.state);
      this.hangup = this.state.hangup.bind(this.state);
    },

    _pc: null,
    _localStream: null,
    _remoteStream: null,

    start: function() {
      app.media.startPeerConnection(this.callee);
      app.trigger("call", {callee: this.callee});
      this.state.start();
    },

    _onHangup: function(media) {
      media.closePeerConnection(this._pc, this._localStream,
        this._remoteStream);
      this._pc = null;
      this._remoteStream = null;
      this._localStream = null;
      this.callee = null;
      app.trigger('hangup_done');
    }
  });

  app.models.IncomingCall = Backbone.Model.extend({
    defaults: {callee: undefined,
               caller: undefined,
               offer: {}}
  });

  app.models.PendingCall = Backbone.Model.extend({
    defaults: {callee: undefined, caller: undefined}
  });

  app.models.DeniedCall = Backbone.Model.extend({
    defaults: {callee: undefined, caller: undefined}
  });

  app.models.Notification = Backbone.Model.extend({
    defaults: {type:    "default",
               message: "empty message"}
  });

  app.models.User = Backbone.Model.extend({
    defaults: {nick: undefined}
  });

  app.models.UserSet = Backbone.Collection.extend({
    model: app.models.User
  });
})(Talkilla, Backbone, StateMachine);
