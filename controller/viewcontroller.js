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
		},

		_beforeLoad: function(){
			this.beforeLoad();
		},

		beforeLoad: function(){

		},

		_loading: function(){
			this.loading();
		},

		loading: function(){

		},

		_afterLoad: function(){
			this.afterLoad();
		},

		afterLoad: function(){

		},

		_beforeTransition: function(){
			beforeTransition();
		},

		beforeTransition: function(){

		},

		_inTransition: function(){
			inTransition();
		},

		inTransition: function(){

		},

		_afterTransition: function(){
			afterTransition();
		},

		afterTransition: function(){

		},

		_beforeDestroy: function(){
			beforeDestroy();
		},

		beforeDestroy: function(){

		},

		_destroying: function(){
			destroying();
		},

		destroying: function(){

		},

		_afterDestroy: function(){
			afterDestroy();
		},

		afterDestroy: function(){

		}
    });
});
