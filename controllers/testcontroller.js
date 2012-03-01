define(["dojo/_base/lang",
"dojo/_base/declare",
"../controller"],
function(lang, declare, Controller){
	/**
	 * This is a test controller. Will be removed after test completely.
	 */
	return declare("dojox.application.controller.testcontroller", [Controller], {

		constructor: function(){
			this.events = {
				"load": this.load,
				"resize": this.resizeHandler,
				"help": this.helpHandler,
				"#button1:click": this.button1Handler,
				"#div1 > input:click": this.buttonHandler
			};
			this.inherited(arguments);
		},

		load: function(viewId){
			if (!viewId) {
				console.log(arguments);
			}
			console.log("call loadview handler.", viewId);
		},

		resizeHandler: function(){
			console.log("call resize Handler");
		},

		helpHandler: function(){
			console.log("call help Handler");
		},

		button1Handler: function(){
			console.log("call button1 Handler");
		},

		buttonHandler: function(){
			console.log("call button Handler");
		}
	});
});
