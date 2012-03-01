define([
	"dojo/_base/lang",
	"dojo/_base/declare",
	"dojo/_base/connect"],
	function(lang, declare, connect){
	return declare("dojox.application.assistant", [], {
		// Load view assistance code
		// Use configuration file to configure view assistant
		// Example:
		// "simple":{
		//	"template": "./views/simple.html",
		//	"dependencies":["dojox/mobile/TextBox"],
		//	"assistant": "./script/simple.js"
		// }

		// view lifecycle init. Override in view's assistant
		init: function(){
		},

		// view lifecycle beforeActivate. Override in view's assistant
		beforeActivate:function(){
		},

		// view lifecycle afterActivate. Override in view's assistant
		afterActivate:function(){
		},

		// view lifecycle beforeDeactivate. Override in view's assistant
		beforeDeactivate: function(){
		},

		// view lifecycle afterDeactivate. Override in view's assistant
		afterDeactivate: function(){
		},

		// view lifecycle destory. Override in view's assistant
		destory: function(){
		}
    });
});
