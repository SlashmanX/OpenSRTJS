var opensrt = require("./opensrt.js");
var token = "";

opensrt.getToken(function(err, token) {
	if(err) console.error(err);
	this.token = token;
})