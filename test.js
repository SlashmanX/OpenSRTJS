var opensrt = require("./opensrt.js");
var token = "";
var zlib = require("zlib");

opensrt.searchEpisode({imdbid: "tt2243973", season: "1", episode: "6", filename: "Hannibal.S01E06.720p.HDTV.X264-2HD.avi"}, function(err, res){
	if(err) return console.error("Error: "+ err);
	console.log(res);
})