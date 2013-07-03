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

  it("should call #_initializeUpgraders",
    function() {
      var stub = sandbox.stub(DatabaseModel.prototype,
        "_initializeUpgraders");

      new DatabaseModel(contactDBName, successCallback, errorCallback);

      sinon.assert.calledOnce(stub);
      sinon.assert.calledWithExactly(stub);
    });

  describe("#_initializeUpgraders", function() {
    it("should set #_upgraders to an array of _latestVersion functions",
      function() {
        var stubDbu = sinon.createStubInstance(DatabaseModel);
        stubDbu._initializeUpgraders = model._initializeUpgraders;

        stubDbu._initializeUpgraders();

        expect(stubDbu._upgraders).to.be.an.instanceOf(Array);
        expect(stubDbu._upgraders).to.have.length(stubDbu._latestVersion);
        stubDbu._upgraders.forEach(function(f) {
          expect(f).to.be.an.instanceOf(Function);
        });
      });
  });

  describe("#startUpgrade", function() {
    beforeEach(function() {
      model.startUpgrade();
    });

    afterEach(function() {
    });

    it("should attempt to open the database with the latest version",
      function() {
        sinon.assert.calledOnce(window.indexedDB.open);
        sinon.assert.calledWithExactly(window.indexedDB.open,
          contactDBName, model._latestVersion);
      });

    it("should attach _onOpenSuccess to the open request", function() {
      expect(model._openRequest.onsuccess).to.equal(model._onOpenSuccess);
    });

    it("should attach _onOpenError to the open request", function() {
      expect(model._openRequest.onerror).to.equal(model._onOpenError);
    });

    it("should attach _onOpenBlocked to the open request", function() {
      expect(model._openRequest.onblocked).to.equal(model._onOpenBlocked);
    });

    it("should attach _upgrade to the open request", function() {
      expect(model._openRequest.onupgradeneeded).to.equal(model._applyUpgrades);
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

  // XXX this upgrade API (and all impls) are going to need to become
  // async as soon as we have a need to migrate data in some interesting way
  describe("#_applyUpgrades", function() {
    it("should apply an upgrade for each version change between old and new",
      function() {
        model.startUpgrade();

        // XXX
      });

    it("should apply all upgrades as part of a single transaction");

    // XXX test/refactor fireCallback

    it("should fire this.onUpgradeError callback if any upgrader fails");

    it("should fire this.onSuccessCallback if all upgraders succeed");

    // XXX does this makes sense
    it('should handle a future version gracefully');

    // XXX other failures to test for?
  });

  describe("#_initialize1", function() {
    it("should create an ObjectStore with a keyPath of 'username'");
    it("should create an unique index named username on the username key");
    it("should handle a ConstraintError cleanly");
  });

  describe("#_upgrades[1]", function() {
    // XXX
  });
});
