/* global afterEach, beforeEach, chai, describe,
   it, sinon, _config:true, loadconfig, _signinCallback,
   _currentUserData:true, UserData, DatabaseUpgrader, getContactsDatabase,
   storeContact, contacts:true, contactsDb:true, indexedDB,
   updateCurrentUsers, currentUsers, _ */
var expect = chai.expect;
var contactDBName = "TalkillaContactsUnitTest";

describe('Miscellaneous', function() {
  "use strict";
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("#loadconfig", function() {
    var oldConfig, xhr, requests;

    beforeEach(function() {
      oldConfig = _.clone(_config);
      // XXX For some reason, sandbox.useFakeXMLHttpRequest doesn't want to work
      // nicely so we have to manually xhr.restore for now.
      xhr = sinon.useFakeXMLHttpRequest();
      _config = {};
      requests = [];
      xhr.onCreate = function (req) { requests.push(req); };
    });

    afterEach(function() {
      _config = oldConfig;
      xhr.restore();
    });

    it("should populate the _config object from using AJAX load",
      function(done) {
        expect(_config).to.deep.equal({});
        loadconfig(function(err, config) {
          expect(requests).to.have.length.of(1);
          expect(requests[0].url).to.equal('/config.json');
          expect(config).to.deep.equal({WSURL: 'ws://fake', DEBUG: true});
          done();
        });
        requests[0].respond(200, {
          'Content-Type': 'application/json'
        }, '{"WSURL": "ws://fake", "DEBUG": true}');
      });
  });

  describe("#_signinCallback", function() {
    var socketStub, wsurl = 'ws://fake', testableCallback;

    beforeEach(function() {
      sandbox.stub(window, "WebSocket");
      socketStub = sinon.stub(window, "createPresenceSocket");
      _config.WSURL = wsurl;
      _currentUserData = new UserData({});
      sandbox.stub(_currentUserData, "send");
      testableCallback = _signinCallback.bind({postEvent: function(){}});
    });

    afterEach(function() {
      _currentUserData = undefined;
      socketStub.restore();
    });

    it("should initiate the presence connection if signin succeded",
      function() {
        var nickname = "bill";
        testableCallback(null, JSON.stringify({nick: nickname}));
        sinon.assert.calledOnce(socketStub);
        sinon.assert.calledWithExactly(socketStub, nickname);
      });

    it("should not initiate the presence connection if signin failed",
      function() {
        var nickname;
        testableCallback(null, JSON.stringify({nick: nickname}));
        sinon.assert.notCalled(socketStub);
      });
  });

  describe("storeContact", function() {
    afterEach(function() {
      if (contactsDb)
        contactsDb.close();
      contactsDb = undefined;
      contacts = undefined;
      indexedDB.deleteDatabase(contactDBName);
    });

    it("should store contacts", function(done) {
        getContactsDatabase(function() {
          // Check that we start with an empty contact list.
          expect(contacts).to.eql([]);
          storeContact("foo", function() {
            // Check that the contact has been added to the cached list.
            expect(contacts).to.eql(["foo"]);
            // Drop all references to the contact list
            contacts = undefined;
            contactsDb = undefined;
            getContactsDatabase(function() {
              expect(contacts).to.eql(["foo"]);
              done();
            }, contactDBName);
          });
        }, contactDBName);
      });
  });

  describe("show offline contacts", function() {
    it("should merge local contacts with online contacts from the server",
       function() {
          contacts = ["foo"];
          updateCurrentUsers([{nick: "jb"}]);
          expect(currentUsers).to.eql([
            {nick: "foo", presence: "disconnected"},
            {nick: "jb", presence: "connected"}
          ]);
        });
  });

  describe("DatabaseUpgrader", function() {
    var dbu;
    function successCallback() {}
    function errorCallback() {}

    beforeEach(function() {
      dbu = new DatabaseUpgrader(contactDBName, successCallback, errorCallback);
      var stubOpen = sandbox.stub(window.indexedDB, "open");
      stubOpen.returns({}); // dummy request object
    });

    afterEach(function() {
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
        expect(dbu._openRequest.onupgradeneeded).to.equal(dbu._upgrade);
      });
    });

    describe("#_onOpenSuccess", function() {
      it("should fire the onupgradesuccess callback",
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

          expect(function() { dbu._onOpenSuccess(); } ).to.not.Throw();
          sinon.assert.calledOnce(console.log);
        });
    });

    describe("#_onOpenError", function() {
      // XXX
    });

    // XXX describe("#_onOpenBlocked");
    describe("#_upgrade", function() {
      it("should incrementally apply transforms for each intervening version");
      it("should leave the database in a coherent state if an error occurs");
      it("should post a message to the app threads upon finishing");
      it('should handle a future version gracefully');
    });

    describe("upgraders[0]", function() {
      it("should create a database from scratch with version 1");
      it("should create an object store for contacts");
      it("should create a unique username index called 'username'");
    });

    describe("upgraders[1]", function() {
      // XXX
    });
  });

});
