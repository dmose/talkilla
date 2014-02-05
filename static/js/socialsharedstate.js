/* exported socialSharedState */

var socialSharedState = (function() {
  "use strict";

  function SocialSharedState(idb, dbName) {
    this._idb = idb;
    this._dbName = dbName;
  }

  SocialSharedState.prototype = {

    get: function(name, callback) {
      callback(undefined);
    }
  };

  return {
    SocialSharedState: SocialSharedState
  };

})();
