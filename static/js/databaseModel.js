
function DatabaseModel(dbName, successCallback, errorCallback) {
  "use strict";

  if (!dbName || typeof dbName !== "string")
    throw new Error("first arg must be a string");
  this._dbName = dbName;

  if (!successCallback || typeof successCallback !== "function")
    throw new Error("second arg must be a success callback function");
  this.onUpgradeSuccess = successCallback;

  if (!errorCallback || typeof errorCallback !== "function")
    throw new Error("second arg must be an error callback function");
  this.onUpgradeError = errorCallback;
}
DatabaseModel.prototype = {
  _latestVersion: 2,

  openDatabase: function() {
    "use strict";
    this._openRequest = window.indexedDB.open(this._dbName,
      this._latestVersion);

    this._openRequest.onsuccess = this._onOpenSuccess;
    this._openRequest.onerror = this._onOpenError;
    this._openRequest.onblocked = this._onOpenBlocked;
    this._openRequest.onupgradeneeded = this._onUpgradeNeeded;
  },

  _onOpenSuccess: function() {
    "use strict";
    try {
      this.onUpgradeSuccess();
    } catch (ex) {
      console.log("DatabaseUpgrade success callback threw: " + ex);
    }
  },

  _onOpenError: function(event) {
    "use strict";
    try {
      this.onUpgradeError(event.target.error);
    } catch (ex) {
      console.log("DatabaseUpgrade error callback threw: " + ex);
    }
  },

  _onOpenBlocked: function() {
    "use strict";
  },

  _onUpgradeNeeded: function() {
    "use strict";

  }
};