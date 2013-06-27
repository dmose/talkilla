/* global afterEach, beforeEach, chai, describe, it, sinon, DatabaseUpgrader,
 DOMError */

var expect = chai.expect;
var contactDBName = "TalkillaContactsUnitTest";

describe("DatabaseUpgrader", function() {
  "use strict";

  var sandbox;
  var dbu;
  function successCallback() {}
  function errorCallback() {}

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    dbu = new DatabaseUpgrader(contactDBName, successCallback, errorCallback);

    var stubOpen = sandbox.stub(window.indexedDB, "open");
    stubOpen.returns({}); // dummy request object
  });

  afterEach(function() {
    sandbox.restore();
    dbu = undefined;
  });

  it("should throw an Error if dbName arg is not passed",
    function() {
      expect(function() {
        new DatabaseUpgrader();
      }).to.Throw(Error);
    });

  it("should initialize the _dbName property to the name", function() {
    expect(dbu._dbName).to.equal(contactDBName);
  });

  it("should throw an Error if successCallback function not passed",
    function() {
      expect(function() {
        new DatabaseUpgrader(contactDBName);
      }).to.Throw(Error);
    });

  it("should attach the successCallback to the onUpgradeSuggess proprerty",
    function() {
      expect(dbu.onUpgradeSuccess).to.equal(successCallback);
    });

  it("should throw an Error if errorCallback function not passed",
    function() {
      expect(function() {
        new DatabaseUpgrader(contactDBName, successCallback);
      }).to.Throw(Error);
    });

  it("should attach the errorCallback to the onUpgradeError proprerty",
    function() {
      expect(dbu.onUpgradeError).to.equal(errorCallback);
    });

  it("should call #_initializeUpgraders",
    function() {
      var stub = sandbox.stub(DatabaseUpgrader.prototype,
        "_initializeUpgraders");

      new DatabaseUpgrader(contactDBName, successCallback, errorCallback);

      sinon.assert.calledOnce(stub);
      sinon.assert.calledWithExactly(stub);
    });

  describe("#_initializeUpgraders", function() {
    it("should set #_upgraders to an array of _latestVersion functions",
      function() {
        var stubDbu = sinon.createStubInstance(DatabaseUpgrader);
        stubDbu._initializeUpgraders = dbu._initializeUpgraders;

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
      dbu.startUpgrade();
    });

    afterEach(function() {
    });

    it("should attempt to open the database with the latest version",
      function() {
        sinon.assert.calledOnce(window.indexedDB.open);
        sinon.assert.calledWithExactly(window.indexedDB.open,
          contactDBName, dbu._latestVersion);
      });

    it("should attach _onOpenSuccess to the open request", function() {
      expect(dbu._openRequest.onsuccess).to.equal(dbu._onOpenSuccess);
    });

    it("should attach _onOpenError to the open request", function() {
      expect(dbu._openRequest.onerror).to.equal(dbu._onOpenError);
    });

    it("should attach _onOpenBlocked to the open request", function() {
      expect(dbu._openRequest.onblocked).to.equal(dbu._onOpenBlocked);
    });

    it("should attach _upgrade to the open request", function() {
      expect(dbu._openRequest.onupgradeneeded).to.equal(dbu._applyUpgrades);
    });
  });

  describe("#_onOpenSuccess", function() {
    it("should fire the onUpgradeSuccess callback",
      function() {
        sandbox.stub(dbu, "onUpgradeSuccess");

        dbu._onOpenSuccess();

        sinon.assert.calledOnce(dbu.onUpgradeSuccess);
        sinon.assert.calledWithExactly(dbu.onUpgradeSuccess);
      });

    it("should log but not propagate exceptions thrown by onUpgradeSuccess",
      function() {
        sandbox.stub(window.console, "log");
        var callbackStub = sandbox.stub(dbu, "onUpgradeSuccess");
        callbackStub.throws();

        expect(dbu._onOpenSuccess).to.not.Throw();
        sinon.assert.calledOnce(console.log);
      });
  });

  describe("#_onOpenError", function() {
    it("should fire the onUpgradeError callback with the event error",
      function() {
        sandbox.stub(dbu, "onUpgradeError");
        var errType = DOMError.AbortError;
        var fakeEvent = { target: { error: errType} };

        dbu._onOpenError(fakeEvent);

        sinon.assert.calledOnce(dbu.onUpgradeError);
        sinon.assert.calledWithExactly(dbu.onUpgradeError, errType);
      });

    it("should log but not propagate exceptions thrown by onUpgradeError",
      function() {
        sandbox.stub(window.console, "log");
        var callbackStub = sandbox.stub(dbu, "onUpgradeError");
        callbackStub.throws();

        expect(dbu._onOpenError).to.not.Throw();
        sinon.assert.calledOnce(console.log);
      });
  });

  describe("#_onOpenBlocked", function() {
    // XXX need to decide on behavior before landing
    it("should execute some yet-to-be-defined behavior!");
  });

  describe("#_applyUpgrades", function() {
    it("should apply an upgrade for each version change between old and new",
      function() {
        dbu.startUpgrade();

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

  describe("#_upgrades[0]", function() {
    it("should create a database from scratch with version 1");
    it("should create an object store for contacts");
    it("should create a unique username index called 'username'");
  });

  describe("#_upgrades[1]", function() {
    // XXX
  });
});
