var xml          = require('../lib/xml-native')
    EventEmitter = require('events').EventEmitter;

module.exports = function(config) {
  var request    = require('../lib/request')(config)
    , inherits   = require('util').inherits
    , Base       = require('./base')
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
      if (! QualWorker.prototype.nodeExists(['CreateQualificationTypeResponse', 'QualificationType','Request', 'IsValid'], response)) { callback([new Error('No "CreateQualificationTypeResponse > QualificationType > Request > IsValid" node on the response')]); return; }
      if (response.CreateQualificationTypeResponse.QualificationType.Request.IsValid.toLowerCase() != 'true') {
        return callback([new Error('Response says ApproveAssignmentResult request is invalid: ' + JSON.stringify(response.ApproveAssignmentResult.Request.Errors))]);
      }
      callback(null);
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
      if (! Assignment.prototype.nodeExists(['AssignQualificationResult', 'Request', 'IsValid'], response)) { callback([new Error('No "AssignQualificationResult > Request > IsValid" node on the response')]); return; }
      if (response.AssignQualificationResult.Request.IsValid.toLowerCase() != 'true') {
        return callback([new Error('Response says AssignQualificationResult request is invalid: ' + JSON.stringify(response.ApproveAssignmentResult.Request.Errors))]);
      }
      callback(null);
    });
   };

   return ret;
};