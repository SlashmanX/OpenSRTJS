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
	var opts = {};
	opts.sublanaguageid = "all";
	if(!data.filename) {
		opts.imdbid = data.imdbid.replace("tt", "");
		opts.season = data.season;
		opts.episode = data.episode;
	}
	else {
		opts.tag = data.filename;
	}
	client.methodCall('SearchSubtitles', [
			data.token, 
			[
				opts
			]
		], 
		function(err, res){
			if(err) return cb(err, null);
			var subs = {};
			async.eachSeries(res.data, function(sub, callback) {
				if(sub.SubFormat != "srt")  return callback();
				if(data.season && data.episode) {// definitely an episode check 
					if(parseInt(sub.SeriesIMDBParent, 10) != parseInt(data.imdbid.replace("tt", ""), 10)) return callback();
					if(sub.SeriesSeason != data.season) return callback();
					if(sub.SeriesEpisode != data.episode) return callback();
				}
				var tmp = {};
				tmp.url = sub.SubDownloadLink.replace(".gz", ".srt");
				tmp.lang = sub.ISO639;
				tmp.downloads = sub.SubDownloadsCnt;
				tmp.score = 0;
				
				if(sub.MatchedBy == "tag") tmp.score += 50;
				if(sub.UserRank == "trusted") tmp.score += 100;
				if(!subs[tmp.lang]) {
					subs[tmp.lang] = tmp;
				}
				else {
					// If score is 0 or equal, sort by downloads
					if(tmp.score > subs[tmp.lang].score || (tmp.score == subs[tmp.lang].score && tmp.downloads > subs[tmp.lang].score.downloads)) { 
						subs[tmp.lang] = tmp;
					}
				}
				return callback();
			},
			function(err) {
				// Do 1 extra query by imdb / season / episode in case no tag match for a lang
				if(!data.recheck && data.imdbid && data.season && data.episode) {
					return searchEpisode({
						imdbid: data.imdbid.replace("tt", ""), 
						season: data.season, 
						episode: data.episode,
						recheck: true,
						token: data.token
					}, cb);
				}
				else {
					return cb(err, subs);
				}
			})
		})
	}
