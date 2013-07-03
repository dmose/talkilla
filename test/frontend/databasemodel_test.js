/* global afterEach, beforeEach, chai, describe, it, sinon, DatabaseModel,
 DOMError */

var expect = chai.expect;
var contactDBName = "TalkillaContactsUnitTest";

describe("DatabaseModel", function() {
  "use strict";

  var sandbox;
  var model;
  function successCallback() {}
  function errorCallback() {}

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    model = new DatabaseModel(contactDBName, successCallback, errorCallback);

    var stubOpen = sandbox.stub(window.indexedDB, "open");
    stubOpen.returns({}); // dummy request object
  });

  afterEach(function() {
    sandbox.restore();
    model = undefined;
  });

  it("should throw an Error if dbName arg is not passed",
    function() {
      expect(function() {
        new DatabaseModel();
      }).to.Throw(Error);
    });

  it("should initialize the _dbName property to the name", function() {
    expect(model._dbName).to.equal(contactDBName);
  });

  it("should throw an Error if successCallback function not passed",
    function() {
      expect(function() {
        new DatabaseModel(contactDBName);
      }).to.Throw(Error);
    });

  it("should attach the successCallback to the onUpgradeSuggess proprerty",
    function() {
      expect(model.onUpgradeSuccess).to.equal(successCallback);
    });

  it("should throw an Error if errorCallback function not passed",
    function() {
      expect(function() {
        new DatabaseModel(contactDBName, successCallback);
      }).to.Throw(Error);
    });

  it("should attach the errorCallback to the onUpgradeError proprerty",
    function() {
      expect(model.onUpgradeError).to.equal(errorCallback);
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
    it("should fire the onUpgradeSuccess callback",
      function() {
        sandbox.stub(model, "onUpgradeSuccess");

        model._onOpenSuccess();

        sinon.assert.calledOnce(model.onUpgradeSuccess);
        sinon.assert.calledWithExactly(model.onUpgradeSuccess);
      });

    it("should log but not propagate exceptions thrown by onUpgradeSuccess",
      function() {
        sandbox.stub(window.console, "log");
        var callbackStub = sandbox.stub(model, "onUpgradeSuccess");
        callbackStub.throws();

        expect(model._onOpenSuccess).to.not.Throw();
        sinon.assert.calledOnce(console.log);
      });
  });

  describe("#_onOpenError", function() {
    it("should fire the onUpgradeError callback with the event error",
      function() {
        sandbox.stub(model, "onUpgradeError");
        var errType = DOMError.AbortError;
        var fakeEvent = { target: { error: errType} };

        model._onOpenError(fakeEvent);

        sinon.assert.calledOnce(model.onUpgradeError);
        sinon.assert.calledWithExactly(model.onUpgradeError, errType);
      });

    it("should log but not propagate exceptions thrown by onUpgradeError",
      function() {
        sandbox.stub(window.console, "log");
        var callbackStub = sandbox.stub(model, "onUpgradeError");
        callbackStub.throws();

        expect(model._onOpenError).to.not.Throw();
        sinon.assert.calledOnce(console.log);
      });
  });

  describe("#_onOpenBlocked", function() {
    // XXX need to decide on behavior before landing
    it("should execute some yet-to-be-defined behavior!");
  });

});
