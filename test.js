var opensrt = require("./opensrt.js");
var token = "";
var zlib = require("zlib");

opensrt.searchEpisode({imdbid: "tt0903747", season: "5", episode: "16"}, function(err, res){
	if(err) return console.error("Error: "+ err);
	console.log(res);
})