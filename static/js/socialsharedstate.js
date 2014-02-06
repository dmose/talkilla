/* exported socialSharedState */

var socialSharedState = (function() {
  "use strict";

  function SocialSharedState(idb, dbName) {
    this._idb = idb;
    this._dbName = dbName;
  }

  SocialSharedState.prototype = {
    _storeVersion: 1,

    /**
     *
     * @param name
     * @param callback
     */
    getAsync: function(name, callback) {
      this._openStore(function (error, db) {
        if (error) {
          callback(error);
        }

 // XXX next up is do something with the ddb

      });
      callback(undefined, undefined);
    },

    setAsync: function(name, value, callback) {
      callback(undefined, true);
    }
  };

  return {
    SocialSharedState: SocialSharedState
  };

})();
