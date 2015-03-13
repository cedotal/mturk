module.exports = function(config) {
  var express         = require('express')
    , requestVerifier = require('./request_verifier')(config)
    , requestHandler  = require('./request_handler')
    , ret;
  
  // mturk library should use the client application's server instead
  // of creating its own
  /*
  var receptor = express();

  receptor.use(receptor.router);
  receptor.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  */
  
  var router = config.router;
  
  router.get('/', requestVerifier, requestHandler);

  ret = requestHandler.emitter;

  ret.start = function(callback) {
    // client application's server should already be listening
    // receptor.listen(config.receptor.port, config.receptor.host, callback);
  };

  ret.stop = function() {
    // library shouldn't be able to stop the client app's server
    // receptor.close();
  };

  ret.server = router;
  
  return ret;
}
