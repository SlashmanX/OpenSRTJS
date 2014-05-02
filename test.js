var opensrt = require("./opensrt.js");
var token = "";
var zlib = require("zlib");

opensrt.searchEpisode({imdbid: "0121955", season: "1", episode: "1"}, function(err, res){
	if(err) return console.error("Error: "+ err);
	console.log(res);
})