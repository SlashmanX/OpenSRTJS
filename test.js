var opensrt = require("./opensrt.js");
var token = "";
var btoa = require("btoa");
var zlib = require("zlib");

opensrt.getToken(function(err, token) {
	if(err) console.error(err);
	this.token = token;

	opensrt.getSRTs({token: token, subs: [1951854837]}, function(err, res){
		if(err) return console.error(err);
		var buffer = new Buffer(res.data[0].data, "base64");
		zlib.unzip(buffer, function(err, data){
			console.log(err);
			console.log(data.toString());
		});
	})
})