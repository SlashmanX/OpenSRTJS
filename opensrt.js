var xmlrpc = require("xmlrpc");

var USER_AGENT = "OS Test User Agent";

var client = xmlrpc.createClient({ host: 'api.opensubtitles.org', port: 80, path: '/xml-rpc'})

var token = "";

exports.getToken = function(cb) {
	client.methodCall('LogIn', ['', '', 'en', USER_AGENT], function (err, res) {
		if(err) return cb(err, null);
		cb(null, res.token);
  })
},

exports.getSRTs = function(data, cb) {
	if(!data.token) return cb("Token not supplied", null);
	client.methodCall('DownloadSubtitles', [data.token, data.subs], function (err, res) {
		if(err) return cb(err, null);
		cb(null, res);
  })
}