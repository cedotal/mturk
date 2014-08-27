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
  var statisticnames = ['NumberAssignmentsAvailable',
                        'NumberAssignmentsAccepted',
                        'NumberAssignmentsPending',
                        'NumberAssignmentsApproved',
                        'NumberAssignmentsRejected',
                        'NumberAssignmentsReturned',
                        'NumberAssignmentsAbandoned',
                        'PercentAssignmentsApproved',
                        'PercentAssignmentsRejected',
                        'TotalRewardPayout',
                        'AverageRewardAmount',
                        'TotalRewardFeePayout',
                        'TotalFeePayout',
                        'TotalRewardAndFeePayout',
                        'TotalBonusPayout',
                        'TotalBonusFeePayout',
                        'NumberHITsCreated',
                        'NumberHITsCompleted',
                        'NumberHITsAssignable',
                        'NumberHITsReviewable',
                        'EstimatedRewardLiability',
                        'EstimatedFeeLiability',
                        'EstimatedTotalLiability' ];
  /*
  * Get Requester Statistics
  */
  ret.getRequesterStatistics = function(statisticname , callback) {
    var options = {
      Statistic : statisticname,
      TimePeriod : 'LifeToDate'
    };
    request('AWSMechanicalTurkRequester', 'GetRequesterStatistic', 'POST', options, function(err, response) {
      if (err) { return callback(err); } 
      if (! QualWorker.prototype.nodeExists([ 'GetStatisticResult','Request', 'IsValid'], response)) { callback([new Error('No "GetStatisticResult > Request > IsValid" node on the response')]); return; }
      if (response.GetStatisticResult.Request.IsValid.toLowerCase() != 'true') {
        return callback([new Error('Response says CreateQualificationTypeResponse request is invalid: ' + JSON.stringify(response.GetStatisticResult.Request.Errors))]);
      }
      callback(response);
    });
  };
  /*
  * Recursive Function
  */
  var counter = 0;
  function getReqStatistics(statisticname, reqstatresponse, callback){
    var options = {
        Statistic : statisticname,
        TimePeriod : 'LifeToDate'
      };
      request('AWSMechanicalTurkRequester', 'GetRequesterStatistic', 'POST', options, function(err, response) {
        if (err) { return callback(err); } 
        if (! QualWorker.prototype.nodeExists([ 'GetStatisticResult','Request', 'IsValid'], response)) { callback([new Error('No "GetStatisticResult > Request > IsValid" node on the response')]); return; }
        if (response.GetStatisticResult.Request.IsValid.toLowerCase() != 'true') {
          return callback([new Error('Response says CreateQualificationTypeResponse request is invalid: ' + JSON.stringify(response.GetStatisticResult.Request.Errors))]);
        }
        counter++;
        if(counter < statisticnames.length){
          reqstatresponse.push(response);
          getReqStatistics(statisticnames[counter], reqstatresponse, callback);
        }
        else
        {
          callback(reqstatresponse);
        }
      });
  }
  /*
  * Get All Requester Statistics
  */
  ret.getAllRequesterStatistics = function( callback) {
      var reqstatisticsresult = [];
      counter = 0;
      getReqStatistics(statisticnames[0], reqstatisticsresult, function(data){
        callback(data);
      });
  };
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
   * Get Balance
   */
   ret.getBalance = function(callback){
    var options = {};
    request('AWSMechanicalTurkRequester', 'GetAccountBalance', 'POST', options, function(err, response) {
      if (err) { return callback(err); } 
      console.log("The response for account balance is : ");
      console.log(response);
      if (! QualWorker.prototype.nodeExists(['GetAccountBalanceResult', 'Request', 'IsValid'], response)) { callback([new Error('No "GetAccountBalanceResult > Request > IsValid" node on the response')]); return; }
      if (response.GetAccountBalanceResult.Request.IsValid.toLowerCase() != 'true') {
        return callback([new Error('Response says GetAccountBalanceResult request is invalid: ' + JSON.stringify(response.GetAccountBalanceResult.Request.Errors))]);
      }
      callback(response);
    });
   }

   /*
   * Grant bonus to worker
   */
   ret.grantBonusToWorker = function(workerid, assignmentid, price, reason, callback){
    //console.log("the amount is : "+amount);
    //console.log("the curency code is : "+currencycode);
    //var priceds = new Price(parseInt(amount), currencycode);

    var options = {
      WorkerId : workerid,
      AssignmentId : assignmentid,
      BonusAmount : price,
      Reason : reason
    }
    request('AWSMechanicalTurkRequester', 'GrantBonus', 'POST', options, function(err, response) {
      if (err) { return callback(err); } 
      console.log("The response for grant bonus is : ");
      console.log(response);
      if (! QualWorker.prototype.nodeExists(['GrantBonusResult', 'Request', 'IsValid'], response)) { callback([new Error('No "GrantBonusResult > Request > IsValid" node on the response')]); return; }
      if (response.GrantBonusResult.Request.IsValid.toLowerCase() != 'true') {
        return callback([new Error('Response says GrantBonusResult request is invalid: ' + JSON.stringify(response.GrantBonusResult.Request.Errors))]);
      }
      callback(response);
    });

   }

   return ret;
};