/* jshint unused:false */
var CollectedContacts = (function() {
  function CollectedContacts(options) {
    this.options = options || {
      dbname: "TalkillaContactsTest",
      storename: "contacts",
      version: 1
    };
    this.db = undefined;
  }

  CollectedContacts.prototype.load = function(cb) {
    if (this.db)
      throw new Error("Database already loaded");
    var request = indexedDB.open(this.options.dbname, this.options.dbversion);
    request.onblocked = function(event) {
      cb.call(this, event.target.error);
    }.bind(this);
    request.onerror = function(event) {
      cb.call(this, event.target.errorCode);
    }.bind(this);
    request.onupgradeneeded = function(event) {
      this._createStore(event.target.result);
    }.bind(this);
    request.onsuccess = function(event) {
      this.db = event.target.result;
      cb.call(this, null, this.db);
    }.bind(this);
  };

  CollectedContacts.prototype.add = function(username, cb) {
    if (!this.db)
      throw new Error("Database is not loaded");
    var request = this._getStore("readwrite").add({username: username});
    request.onsuccess = function() {
      cb.call(this, null, username);
    }.bind(this);
    request.onerror = function(event) {
      var err = event.target.error;
      if (err.name !== "ConstraintError")
        return cb.call(this, err);
      event.preventDefault();
      cb.call(this, null, username);
    }.bind(this);
  };

  CollectedContacts.prototype.all = function(cb) {
    var cursor = this._getStore("readonly").openCursor(),
        records = [];
    cursor.onerror = function(event) {
      cb.call(this, event.target.errorCode);
    }.bind(this);
    cursor.onsuccess = function(event) {
      var cursor = event.target.result;
      if (!cursor)
        return cb.call(this, null, records);
      records.push(cursor.value.username);
      /* jshint -W024 */
      return cursor.continue();
    }.bind(this);
  };

  CollectedContacts.prototype.close = function() {
    if (!this.db)
      return;
    this.db.close();
    delete this.db;
  };

  CollectedContacts.prototype.drop = function(cb) {
    this.close();
    var request = indexedDB.deleteDatabase(this.options.dbname);
    request.onsuccess = function() {
      cb.call(this, null);
    }.bind(this);
    request.onerror = function(event) {
      cb.call(this, event.target.error);
    }.bind(this);
  };

  CollectedContacts.prototype._createStore = function(db) {
    var store = db.createObjectStore(this.options.storename, {
      keyPath: "username"
    });
    store.createIndex("username", "username", {unique: true});
    return store;
  };

  CollectedContacts.prototype._getStore = function(mode) {
    return this.db.transaction(this.options.storename, mode)
                  .objectStore(this.options.storename);
  };

  return CollectedContacts;
})();
