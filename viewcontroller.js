define(["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/connect"],
function(lang, declare, connect){
	return declare("dojox.application.viewcontroller", [], {
		// Load user define javascipt code
		// Use configuration file to configure js module.
		// Example:
		// "simple":{
		//	"template": "./views/simple.html",
		//	"dependencies":["dojox/mobile/TextBox"],
		//	"controller": "./script/simple.js"
		// }

		// init callback. Override in user default js module
		init: function(){
		},

		// view activate callback. Override in user default js module
		activate: function(){
		},

		// view deactivate callback. Override in user default js module
		deactivate: function(){
		},
	});
});
