var xmlrpc = require("xmlrpc");
var async = require("async");

var USER_AGENT = "OpenSRTJS";

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
	if(!data.token) {
		exports.getToken(function(err, token) {
			if(err) {
				return cb(err, null);
			}
			data.token = token;
			return searchEpisode(data, cb);
		});
	}

	else {
		return searchEpisode(data, cb);
	}
}

function searchEpisode(data, cb) {
	client.methodCall('SearchSubtitles', [
			data.token, 
			[
				{
					sublanaguageid: "all", 
					imdbid: data.imdbid.replace("tt", ""), 
					season: data.season, 
					episode: data.episode,
					tag: data.filename
				}
			]
		], 
		function(err, res){
			if(err) return cb(err, null);
			var subs = {};
			async.eachSeries(res.data, function(sub, callback) {
				var tmp = {};
				tmp.url = sub.SubDownloadLink.replace(".gz", ".srt");
				tmp.lang = sub.ISO639;
				tmp.downloads = sub.SubDownloadsCnt;
				tmp.byTag = (sub.MatchedBy == "tag");
				if(!subs[tmp.lang]) {
					subs[tmp.lang] = tmp;
				}
				else {
					if((tmp.byTag && !subs[tmp.lang].byTag) || 
					(tmp.downloads > subs[tmp.lang].downloads && tmp.byTag)) { 
					// Get most download with tag match taking precedence
						subs[tmp.lang] = tmp;
					}
				}
				return callback();
			},
			function(err) {
				return cb(err, subs);
			})
		})
	}
