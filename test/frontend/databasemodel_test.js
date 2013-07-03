/* global afterEach, beforeEach, chai, describe, it, sinon,
   app */

var expect = chai.expect;
var contactDBName = "TalkillaContactsUnitTest";

describe("DatabaseModel", function() {
  "use strict";

  var sandbox;
  var model;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    model = new app.models.DatabaseModel( {dbName: contactDBName} );

    var stubOpen = sandbox.stub(window.indexedDB, "open");
    stubOpen.returns({}); // dummy request object
  });

  afterEach(function() {
    sandbox.restore();
    model = undefined;
  });

  it("should initialize the _dbName property to options._dbName", function() {
    expect(model._dbName).to.equal(contactDBName);
  });

  it("should set _dbName to 'contacts' if dbName option not passed",
    function() {
      var model = new app.models.DatabaseModel();
      expect(model._dbName).to.equal('contacts');
    });

  describe("#openDatabase", function() {
    beforeEach(function() {
      model.openDatabase();
    });

    afterEach(function() {
    });

    it("should attempt to open the database with the latest version",
      function() {
        sinon.assert.calledOnce(window.indexedDB.open);
        sinon.assert.calledWithExactly(window.indexedDB.open,
          contactDBName, model._latestVersion);
      });

    it("should attach _onOpenSuccess function to the open request", function() {
      expect(model._openRequest.onsuccess).to.equal(model._onOpenSuccess);
      expect(model._openRequest.onsuccess).to.be.an.instanceOf(Function);

    });

    it("should attach _onOpenError function to the open request", function() {
      expect(model._openRequest.onerror).to.equal(model._onOpenError);
      expect(model._openRequest.onerror).to.be.an.instanceOf(Function);

    });

    it("should attach _onOpenBlocked function to the open request", function() {
      expect(model._openRequest.onblocked).to.equal(model._onOpenBlocked);
      expect(model._openRequest.onblocked).to.be.an.instanceOf(Function);
    });

    it("should attach _onUpgradeNeeded function to the open request",
      function() {
        expect(model._openRequest.onupgradeneeded).
          to.equal(model._onUpgradeNeeded);
        expect(model._openRequest.onupgradeneeded).
          to.be.an.instanceOf(Function);
      });
  });

  describe("#_onOpenSuccess", function() {
    it("should fire the XXX callback");
  });

  describe("#_onOpenError", function() {
    it("should fire the XXX callback");
  });

  describe("#_onOpenBlocked", function() {
    // XXX need to decide on behavior before landing
    it("should execute some yet-to-be-defined behavior!");
  });

  describe("#fetchRecentMessages", function() {
    // XXX
  });
});
