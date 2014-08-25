var xml          = require('../lib/xml-native')
    EventEmitter = require('events').EventEmitter;

module.exports = function(config) {
  var request    = require('../lib/request')(config)
    , inherits   = require('util').inherits
    , Base       = require('./base')
    , Price      = require('./price')
    , ret;

  function QualWorker() {
  }
  

  inherits(QualWorker, Base);

  ret = QualWorker;

  /*
   * Create a Qualification Type
   */
   ret.createQualification = function(qualtypename, qualtypedescription,  callback){
    var options = {
        Name: qualtypename,
        Description: qualtypedescription,
        QualificationTypeStatus: 'Active'
    };
    request('AWSMechanicalTurkRequester', 'CreateQualificationType', 'POST', options, function(err, response) {
      if (err) { return callback(err); } 
      console.log("The response for create qual type is : ");
      console.log(response);
      console.dir(response.QualificationType.Request.Errors);
      if (! QualWorker.prototype.nodeExists([ 'QualificationType','Request', 'IsValid'], response)) { callback([new Error('No "CreateQualificationTypeResponse > QualificationType > Request > IsValid" node on the response')]); return; }
      if (response.QualificationType.Request.IsValid.toLowerCase() != 'true') {
        return callback([new Error('Response says CreateQualificationTypeResponse request is invalid: ' + JSON.stringify(response.QualificationType.Request.Errors))]);
      }
      callback(response);
    });
   };

   /*
   * Assign Qualification to worker
   */
   ret.assignQualToWorker = function(qualtypeid, workerid, integervalue, callback){
    var options = {
        QualificationTypeId: qualtypeid
      , WorkerId: workerid,
        IntegerValue: integervalue
    };
    request('AWSMechanicalTurkRequester', 'AssignQualification', 'POST', options, function(err, response) {
      if (err) { return callback(err); } 
      console.log("The response for assign qual type is : ");
      console.log(response);
      if (! QualWorker.prototype.nodeExists(['AssignQualificationResult', 'Request', 'IsValid'], response)) { callback([new Error('No "AssignQualificationResult > Request > IsValid" node on the response')]); return; }
      if (response.AssignQualificationResult.Request.IsValid.toLowerCase() != 'true') {
        return callback([new Error('Response says AssignQualificationResult request is invalid: ' + JSON.stringify(response.AssignQualificationResult.Request.Errors))]);
      }
      callback(response);
    });
   };

   /*
   * Grant bonus to worker
   */
   ret.grantBonusToWorker = function(workerid, assignmentid, amount, currencycode, reason, callback){
    var priceds = new Price(amount, currencycode);
    var options = {
      WorkerId : workerid,
      AssignmentId : assignmentid,
      BonusAmount : priceds,
      Reason : reason
    }
    request('AWSMechanicalTurkRequester', 'GrantBonus', 'POST', options, function(err, response) {
      if (err) { return callback(err); } 
      console.log("The response for grand bonus is : ");
      console.log(response);
      if (! QualWorker.prototype.nodeExists(['GrantBonusResult', 'Request', 'IsValid'], response)) { callback([new Error('No "GrantBonusResult > Request > IsValid" node on the response')]); return; }
      if (response.GrantBonusResult.Request.IsValid.toLowerCase() != 'true') {
        return callback([new Error('Response says GrantBonusResult request is invalid: ' + JSON.stringify(response.AssignQualificationResult.Request.Errors))]);
      }
      callback(response);
    });

   }

   return ret;
};