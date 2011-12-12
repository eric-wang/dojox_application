define([
	"dojo/_base/lang",
	"dojo/_base/declare",
	"dojo/_base/connect"],
	function(lang, declare, connect){
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

			require(["./"+jsmodule], dojo.hitch(this, function(module){
				lang.mixin(this, module);
				this.init();
			}));
		},

		// init callback. Override in user default js module
		init: function(){
		},

		// view activate callback. Override in user default js module
		activate:function(){
		},

		// view deactivate callback. Override in user default js module
		deactivate: function(){
		},
    });
});
