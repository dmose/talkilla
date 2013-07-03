/* global app, Backbone */

(function(app, Backbone) {
  "use strict";

  app.models.DatabaseModel = Backbone.Model.extend({

    initialize: function(options) {
      if (options && options.dbName) {
        this._dbName = options.dbName;
      } else {
        this._dbName = 'contacts';
      }
    },

    openDatabase: function() {
      this._openRequest = window.indexedDB.open(this._dbName,
        this._latestVersion);

      this._openRequest.onsuccess = this._onOpenSuccess;
      this._openRequest.onerror = this._onOpenError;
      this._openRequest.onblocked = this._onOpenBlocked;
      this._openRequest.onupgradeneeded = this._onUpgradeNeeded;
    },

    _onOpenSuccess: function() {
      try {
        this.onUpgradeSuccess();
      } catch (ex) {
        console.log("DatabaseUpgrade success callback threw: " + ex);
      }
    },

    _onOpenError: function(event) {
      try {
        this.onUpgradeError(event.target.error);
      } catch (ex) {
        console.log("DatabaseUpgrade error callback threw: " + ex);
      }
    },

    _onOpenBlocked: function() {
    },

    _onUpgradeNeeded: function() {

    }
  });


})(app, Backbone);
