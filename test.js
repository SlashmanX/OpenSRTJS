var opensrt = require("./opensrt.js");
var token = "";
var zlib = require("zlib");

opensrt.searchEpisode({imdbid: "tt0944947", season: "4", episode: "6", filename: "Game.of.Thrones.S04E06.HDTV.x264-KILLERS.avi"}, function(err, res){
	if(err) return console.error("Error: "+ err);
	console.log(res);
})