define(["dojo/_base/lang", "dojo/_base/declare", "dojo/on", "dojox/css3/transit", "../controller"],
function(lang, declare, on, transit, Controller){
	// module:
	//		dojox/app/controllers/transition
	// summary:
	//		Bind "transition" event on dojox.app application dojo.Evented instance.
	//		Do transition from parent view to child view.
	return declare("dojox.application.controllers.transition", Controller, {

		constructor: function(app, events){
			// summary:
			//		bind "transition" event on application dojo.Evented instance.
			//
			// app:
			//		dojox.app application instance.
			// events:
			//		{event : handler}
			this.events = {
				"transition": this.transition
			};
			this.inherited(arguments);
		},

		transition: function(event){
			// summary:
			//		Response to dojox.app "transition" event.
			//
			// example:
			//		Use dojo.on.emit to trigger "transition" event, and this function will response the event. For example:
			//		|	on.emit(this.app.evented, "transition", {"target":target, "opts":opts});
			//
			// event: Object
			//		"transition" event parameter. It should be like this: {"target":target, "opts":opts}
			// returns:
			//		A dojo.Deferred object.
			//		The return value will keep in application dojo/Evented instance, other controllers can get this deferred object from application.

			var target = event.target;
			var opts = event.opts;
			var transitionDef = this._doTransition(target, opts, this.app);
			this.app.evented.transitionDef = transitionDef;
			return transitionDef;
		},

		_doTransition: function(transitionTo, opts, parent){
			// summary:
			//		Transitions from the currently visible scene to the defined scene.
			//		It should determine what would be the best transition unless
			//		an override in opts tells it to use a specific transitioning methodology
			//		the transitionTo is a string in the form of [view]@[scene].  If
			//		view is left of, the current scene will be transitioned to the default
			//		view of the specified scene (eg @scene2), if the scene is left off
			//		the app controller will instruct the active scene to the view (eg view1).  If both
			//		are supplied (view1@scene2), then the application should transition to the scene,
			//		and instruct the scene to navigate to the view.
			//
			// transitionTo: Object
			//		transition to view id. It looks like #tabScene,tab1
			// opts: Object
			//		transition options
			// parent: Object
			//		view's parent
			//
			// returns:
			//		transit dojo.DeferredList object.
			//		The return value will keep in application dojo/Evented instance, other controllers can get this deffered object from application.

			if(!parent){
				throw Error("view parent not found in transition.");
			}
			var toId, subIds, next, current = parent.selectedChild;
			if(transitionTo){
				var parts = transitionTo.split(",");
				toId = parts.shift();
				subIds = parts.join(',');
			}else{
				toId = parent.defaultView;
				if(parent.views[parent.defaultView] && parent.views[parent.defaultView]["defaultView"]){
					subIds = parent.views[parent.defaultView]["defaultView"];
				}
			}

			// next = this.loadChild(toId,subIds);
			// next is loaded and ready for transition
			next = parent.children[parent.id + '_' + toId];
			if(!next){
				throw Error("child view must be loaded before transition.");
			}
			// if no subIds and next has default view, 
			// set the subIds to the default view and transition to default view.
			if(!subIds){
				subIds = next.defaultView;
			}

			if(!current){
				//assume this.set(...) will return a promise object if child is first loaded
				//return nothing if child is already in array of this.children
//				return parent.set("selectedChild", next);
				on.emit(this.app.evented, "select", {"parent":parent, "view":next});
				return;
			}
			// next is not a Deferred object, so Deferred.when is no needed.
			if(next !== current){
				//When clicking fast, history module will cache the transition request que
				//and prevent the transition conflicts.
				//Originally when we conduct transition, selectedChild will not be the
				//view we want to start transition. For example, during transition 1 -> 2
				//if user click button to transition to 3 and then transition to 1. After
				//1->2 completes, it will perform transition 2 -> 3 and 2 -> 1 because
				//selectedChild is always point to 2 during 1 -> 2 transition and transition
				//will record 2->3 and 2->1 right after the button is clicked.

				//assume next is already loaded so that this.set(...) will not return
				//a promise object. this.set(...) will handles the this.selectedChild,
				//activate or deactivate views and refresh layout.
				current.beforeDeactivate();
				next.beforeActivate();

				on.emit(this.app.evented, "select", {"parent":parent, "view":next});

				var result = transit(current.domNode, next.domNode, lang.mixin({}, opts, {
					transition: parent.defaultTransition || "none"
				}));
				result.then(lang.hitch(this, function(){
					current.afterDeactivate();
					next.afterActivate();
					if(subIds){
						this._doTransition(subIds, opts, next);
					}
				}));
				return result; //dojo.DeferredList
			}else{
				next.beforeActivate();
				next.afterActivate();
			}

			// do sub transition like transition from "tabScene,tab1" to "tabScene,tab2"
			if(subIds){
				return this._doTransition(subIds, opts, next); //dojo.DeferredList
			}
		}
	});
});
