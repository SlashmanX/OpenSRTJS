var xmlrpc = require("xmlrpc");
var async = require("async");

var USER_AGENT = "OpenSubtitlesPlayer v4.7";

var client = xmlrpc.createClient({ host: 'api.opensubtitles.org', port: 80, path: '/xml-rpc'})

var token = "";

exports.getToken = function getToken(cb) {
	client.methodCall('LogIn', ['', '', 'en', USER_AGENT], function (err, res) {
		if(err) return cb(err, null);
		token = res.token;
		cb(null, res.token);
  })
},

exports.searchEpisode = function(data, cb) {
	if(!token && !data.token) {
		exports.getToken(function(err, token) {
			if(err) {
				return cb(err, null);
			}
			data.token = token;
			searchEpisode(data, cb);
		});
	}

	else {
		searchEpisode(data, cb);
	}
}

function searchEpisode(data, cb) {
	var subs = [];
	client.methodCall('SearchSubtitles', [
			data.token, 
			[
				{
					sublanaguageid: "all", 
					imdbid: data.imdbid.replace("tt", ""), 
					season: data.season, 
					episode: data.episode
				}
			]
		], 
		function(err, res){
			if(err) return cb(err, null);

			async.eachSeries(res.data, function(sub, callback) {
				var tmp = {};
				tmp.srtLink = sub.SubDownloadLink.replace(".gz", ".srt");
				tmp.lang = sub.ISO639;
				tmp.downloads = sub.SubDownloadsCnt;
				if(!subs[tmp.lang]) {
					subs[tmp.lang] = tmp;
				}
				else {
					if(tmp.downloads > subs[tmp.lang].downloads) { // Most downloaded seems a good metric for best subtitle
						subs[tmp.lang] = tmp;
					}
				}
				return callback();
			},
			function(err, res) {
				cb(err, subs);
			})
		})
	}