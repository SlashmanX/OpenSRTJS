var xmlrpc = require("xmlrpc");

var USER_AGENT = "OS Test User Agent";

var client = xmlrpc.createClient({ host: 'api.opensubtitles.org', port: 80, path: '/xml-rpc'})

var token = "";

exports.getToken = function(cb) {
	  client.methodCall('LogIn', ['', '', 'en', USER_AGENT], function (err, res) {
	  	if(err) return cb(err, null);
	  	cb(null, res.token);
  })
}