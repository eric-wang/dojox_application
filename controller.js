define(["dojo/_base/lang",
"dojo/_base/declare",
"dojo/on"],
function(lang, declare, on){
	return declare("dojox.application.controller", [], {
		/**
		 * bind event when create a controller instance
		 * @param {Object} events			events
		 * @param {Object} application		app instance, every controller should contain the app instance
		 */
		constructor: function(application, events){
			this.events = this.events || events;
			this.application = application;
			if (this.events) {
				console.log("bind event in controller constructor, ", this.events);
				for(var item in this.events){
					if (item.charAt(0) !== "_") {//skip the private properties
						if (item.indexOf(':') > 0) {
							this.bind(document, item, lang.hitch(this, this.events[item]));
						}
						else{
							this.bind(this.application.evented, item, lang.hitch(this, this.events[item]));
						}
					}
				}
			}
		},

		bind: function(evented, event, callback){
			if(!callback){
				callback = this._getHandler(event);
			}
			on(evented, event, callback);
			this.events[event] = callback;
		},

		unbind: function(){

		},

		_getHandler: function(event){
			return function(args){
				_fire(event, args);
			}
		},

		_fire: function(event, args){
			if (this.events[event]) {
				try {
					this.events[event].apply(args);
				}
				catch (e) {
					console.error("exception in controller handler for:", evt);
					console.error(e);
				}
			}
		}
	});
});
