define(["dojo/_base/lang",
"dojo/_base/declare",
"dojo/on",
"dojo/_base/Deferred",
"dojox/css3/transit",
"../controller",
"../view"],
function(lang, declare, on, deferred, transit, Controller, View){
	return declare("dojox.application.controller.transition", [Controller], {
		constructor: function(application){
			this.events = {
				"transition": this.transition
			};
			this.inherited(arguments);
		},

		transition: function(event){
			var target = event.target;
			var opts = event.opts;
			this._doTransition(target, opts, this.application);
		},

		_getView: function(view, parent){
			var viewId = parent.id + '_' + view;
			if (parent.children && parent.children[viewId]) {
				var child = parent.children[viewId];
				if (child._start) {
					return child;
				}
				throw Error("view not start before transition. ", viewId);
			}
			throw Error("view not exist before transition. ", viewId);
		},

		_doTransition: function(transitionTo, opts, parent){
			//summary: 
			//  transitions from the currently visible scene to the defined scene.
			//  it should determine what would be the best transition unless
			//  an override in opts tells it to use a specific transitioning methodology
			//  the transitionTo is a string in the form of [view]@[scene].  If
			//  view is left of, the current scene will be transitioned to the default
			//  view of the specified scene (eg @scene2), if the scene is left off
			//  the app controller will instruct the active scene to the view (eg view1).  If both
			//  are supplied (view1@scene2), then the application should transition to the scene,
			//  and instruct the scene to navigate to the view.
			var toId, subIds, next, current = this.application.selectedView;
			if (transitionTo) {
				var parts = transitionTo.split(",");
				toId = parts.shift();
				subIds = parts.join(',');
			}
			else {
				toId = this.application.defaultView;
				if (this.application.views[this.application.defaultView] && this.application.views[this.application.defaultView]["defaultView"]) {
					subIds = this.application.views[this.application.defaultView]["defaultView"];
				}
			}

			next = this._getView(toId, parent);

			if (!current) {
				//assume this.set(...) will return a promise object if child is first loaded
				//return nothing if child is already in array of this.children

				//TODO: select child
				return this.set("selectedChild", next);
			}

			if (next !== current) {
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

				//TODO select view
				next.select();

				current.beforeDeactivate();
				next.beforeActivate();
				var result = transit(current.domNode, next.domNode, lang.mixin({}, opts, {
					transition: next.defaultTransition || this.application.defaultTransition || "none"
				}));

				result.then(lang.hitch(this, function(){
					current.afterDeactivate();
					next.afterActivate();
					// set new selectView of application
					this.application.selectedView = next;
					if (subIds) {
						this._doTransition(subIds, opts, next);
					}
				}));
			}
		}
	});
});
