define([
	"dojo/_base/lang",
	"dojo/_base/declare",
	"dojo/_base/connect",
	"./viewlifecycle"], 
	function(lang, declare, connect, viewlifecycle){
	return declare("dojox.app.controller.viewcontroller", [], {
		// Load user define javascipt code
		// Use configuration file to configure js module.
		// Example:
		// "simple":{
		//	"type": "dojox.app.view",
		//	"template": "views/simple.html",			
		//	"dependencies":["dojox/mobile/TextBox"],
		//	"jsmodule": "script/simple.js"
		// }
		_init: function(){
			var params = this.params;
			var jsmodule = params.jsmodule;
			if(!jsmodule){
				return;
			}

			var _this = this;
			require(["./"+jsmodule], function(module){
				lang.mixin(_this, module);
				_this.init();
			});
		},

		// Init callback. Override in user default js module
		init: function(){
		}
    });
});
