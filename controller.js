define(["dojo/_base/lang",
"dojo/_base/declare",
"dojo/_base/Deferred",
"dojox/css3/transit",
"dojo/_base/connect",
"./view"], 
function(lang, declare, deferred, transit, connect, View){
	return declare("dojox.application.controller", [], {
		constructor: function(parent){
			this.parent = parent;
			this.loadedViews = {};
			this.selectedView = null;
		},

		loadView: function(view){
			var id = this.parent.id + '_' + view;
			if (this.loadedViews[id]) {
				console.log("view is exist. ", id);
				return this.loadedViews[id];
			}
			else {
				var newView = new View({
					"id": id,
					"name": view,
					// "templateString": '<div><div data-dojo-type="dojox.mobile.Switch" data-dojo-props="value:off"></div></div>',
					"parent": this.parent
					// "viewcontroller": new viewcontroller()
				});
				this.loadedViews[id] = newView;
				console.log("create new view: ", id);
				return newView.start();
			}
		},

		transition: function(transitionTo, opts){
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
			var toId, subIds, next, current = this.selectedView;
			console.log("scene", this.id, transitionTo);
			if (transitionTo) {
				var parts = transitionTo.split(",");
				toId = parts.shift();
				subIds = parts.join(',');
			}
			else {
				toId = this.defaultView;
				if (this.views[this.defaultView] && this.views[this.defaultView]["defaultView"]) {
					subIds = this.views[this.defaultView]["defaultView"];
				}
			}

			// TODO: need to return a deferred object when start()
			next = this.loadView(toId, subIds);

			if (!current) {
				//assume this.set(...) will return a promise object if child is first loaded
				//return nothing if child is already in array of this.children
				return this.set("selectedChild", next);
			}

			var transitionDeferred = new deferred();
			deferred.when(next, lang.hitch(this, function(next){
				var promise;

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
					next.select();

					transit(current.domNode, next.domNode, lang.mixin({}, opts, {
						transition: this.defaultTransition || "none"
					})).then(lang.hitch(this, function(){
						//dojo.style(current.domNode, "display", "none");
						if (subIds && next.transition) {
							promise = next.transition(subIds, opts);
						}
						deferred.when(promise, function(){
							transitionDeferred.resolve();
						});
					}));
					return;
				}

				//we didn't need to transition, but continue to propogate.
				if (subIds && next.transition) {
					promise = next.transition(subIds, opts);
				}
				deferred.when(promise, function(){
					transitionDeferred.resolve();
				});
			}));
			return transitionDeferred;
		}
	});
});
