define(["dojo/_base/lang",
"dojo/_base/declare",
"dojo/on",
"dojo/_base/Deferred",
"../controller",
"../view"],
function(lang, declare, on, Deferred, Controller, View){
	return declare("dojox.application.controllers.history", Controller, {
		constructor: function(application){
			this.events = {};
			this.inherited(arguments);

			this.bind(this.app.domNode, "startTransition", lang.hitch(this, this.onStartTransition));
			this.bind(window, "popstate", lang.hitch(this, this.onPopState));
		},

		proceeding: false,

		waitingQueue: [],

		onStartTransition: function(evt){
			// prevent event from bubbling to window and being
			// processed by dojox/mobile/ViewController
			if(evt.preventDefault){
				evt.preventDefault();
			}
			evt.cancelBubble = true;
			if(evt.stopPropagation){
				evt.stopPropagation();
			}

			var target = evt.detail.target;
			var regex = /#(.+)/;
			if(!target && regex.test(evt.detail.href)){
				target = evt.detail.href.match(regex)[1];
			}

			// Ensure views are ready before transition.
			on.emit(this.app.evented, "load", {"target": target});
			Deferred.when(this.app.evented.loadPromise, lang.hitch(this, function(){
				history.pushState(evt.detail,evt.detail.href, evt.detail.url);
				this.proceedTransition({target:target, opts: lang.mixin({reverse: false},evt.detail)});
			}));
		},

		proceedTransition: function(transitionEvt){
			if(this.proceeding){
				console.log("push event", transitionEvt);
				this.waitingQueue.push(transitionEvt);
				return;
			}
			this.proceeding = true;

			on.emit(this.app.evented, "transition", transitionEvt);
			var transitionDef = this.app.evented.transitionDef;
			Deferred.when(transitionDef, lang.hitch(this, function(){
				this.proceeding = false;
				var nextEvt = this.waitingQueue.shift();
				if (nextEvt){
					this.proceedTransition(nextEvt);
				}
			}));
		},

		onPopState: function(evt){
			// Check application status, if application status not STARTED, do nothing.
			// when clean browser's cache then refresh the current page, it will trigger popState event. 
			// but the application not start, it will throw an error.
			if(this.app.getStatus() !== this.app.lifecycle.STARTED){
				return;
			}
			var state = evt.state;
			if(!state){
				if(!this.app._startView && window.location.hash){
					state = {
						target: (location.hash && location.hash.charAt(0) == "#") ? location.hash.substr(1) : location.hash,
						url: location.hash
					}
				}else{
					state = {};
				}
			}

			var target = state.target || this.app._startView || this.app.defaultView;

			if(this.app._startView){
				this.app._startView = null;
			}
			var title = state.title || null;
			var href = state.url || null;

			if(evt._sim){
				history.replaceState(state, title, href);
			}

			var currentState = history.state;
			this.proceedTransition({target: target,	opts: dojo.mixin({reverse: true}, state)});
		}
	});
});
