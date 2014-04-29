var xmlrpc = require("xmlrpc");
var zlib = require("zlib");
var request = require("request");
var cheerio = require("cheerio");

var USER_AGENT = "OS Test User Agent";

var client = xmlrpc.createClient({ host: 'api.opensubtitles.org', port: 80, path: '/xml-rpc'})

var token = "";

exports.getToken = function getToken(cb) {
	client.methodCall('LogIn', ['', '', 'en', USER_AGENT], function (err, res) {
		if(err) return cb(err, null);
		cb(null, res.token);
  })
},

exports.getSRTs = function(data, cb) {
	if(!data.token) {
		exports.getToken(function(err, token) {
			data.token = token;
			getSRT(data, cb);
		});
	}

	else {
		getSRT(data, cb);
	}
}

exports.getSRTFromURL = function(data, cb) {
	request({uri: "http://www.opensubtitles.org/en/subtitles/"+ data.subs, followAllRedirects: true}, function(err, res, body) {
		if(err || !body) return cb(err, null);
		var $ = cheerio.load(body);
		var id = $("a.none").filter(function() {
			var link = $(this);
			return link.attr("href").match(/\/en\/subtitleserve\/file\/(.*)/);
		});
		id = id.attr("href").replace("/en/subtitleserve/file/", "");
		exports.getSRTs({subs: [id]}, function(err, srt) {
			if(err) return cb(err, null);
			return cb(null, srt);
		})
	})
}

function getSRT(data, cb) {
	client.methodCall('DownloadSubtitles', [data.token, data.subs], function (err, res) {
		if(err) return cb(err, null);
		var buffer = new Buffer(res.data[0].data, "base64");
		zlib.unzip(buffer, function(err, data){
			if(err) cb(err, null);
			cb(null, data.toString());
		});
  })
}