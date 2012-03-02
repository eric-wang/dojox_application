define(["dojo/_base/lang", "dojo/_base/declare", "dojo/on", "dojo/_base/Deferred", "../controller", "../view"],
function(lang, declare, on, Deferred, Controller, View){
	// module:
	//		dojox/app/controllers/load
	// summary:
	//		Bind "load" event on dojox.app application's dojo.Evented instance.
	//		Load child view and sub children at one time.

	return declare("dojox.application.controllers.load", Controller, {

		constructor: function(app, events){
			// summary:
			//		bind "load" event on application dojo.Evented instance.
			//
			// app:
			//		dojox.app application instance.
			// events:
			//		{event : handler}
			this.events = {
				"load": this.load
			};
			this.inherited(arguments);
		},

		load: function(event){
			// summary:
			//		Response to dojox.app "load" event.
			//
			// example:
			//		Use dojo.on.emit to trigger "load" event, and this function will response the event. For example:
			//		|	on.emit(this.app.evented, "load", {"parent":parent, "target":target});
			//
			// event: Object
			//		Load event parameter. It should be like this: {"parent":parent, "target":target}
			// returns:
			//		A dojo.Deferred object.
			//		The return value will keep in application dojo/Evented instance, other controllers can get this Deferred object from application.

			var parent = event.parent || this.app;
			var target = event.target || "";
			var parts = target.split(',');
			var childId = parts.shift();
			var subIds = parts.join(",");

			var def = this.loadChild(parent, childId, subIds);
			this.app.evented.loadPromise = def; //store loadChild Deferred in application dojo/Evented instance
			return def;
		},

		createChild: function(parent, childId, subIds){
			// summary:
			//		Create dojox.app.view instance if it is not loaded.
			//
			// parent: Object
			//		parent of the view.
			// childId: String
			//		view id need to be loaded.
			// subIds: String
			//		sub views' id of this view.
			// returns:
			//		If view exist, return the view object.
			//		Otherwise, create the view and return a dojo.Deferred instance.

			var id = parent.id + '_' + childId;
			if(parent.children[id]){
				return parent.children[id];
			}
			//create and start child. return Deferred
			var newView = new View({
				"id": id,
				"name": childId,
				"parent": parent
			});
			parent.children[id] = newView;
			return newView.start();
		},

		loadChild: function(parent, childId, subIds){
			// summary:
			//		Load child and sub children views recursively.
			//
			// parent: Object
			//		parent of this view.
			// childId: String
			//		view id need to be loaded.
			// subIds: String
			//		sub views' id of this view.
			// returns:
			//		A dojo.Deferred instance which will be resovled when all views loaded.

			if(!parent){
				throw Error("No parent for Child '" + childId + "'.");
			}

			if(!childId){
				var parts = parent.defaultView ? parent.defaultView.split(",") : "default";
				childId = parts.shift();
				subIds = parts.join(',');
			}

			var loadChildDeferred = new Deferred();
			Deferred.when(this.createChild(parent, childId, subIds), lang.hitch(this, function(child){
				if(!subIds && child.defaultView){
					subIds = child.defaultView;
				}
				var parts = subIds.split(',');
				childId = parts.shift();
				subIds = parts.join(',');
				if(childId){
					var subLoadDeferred = this.loadChild(child, childId, subIds);
					Deferred.when(subLoadDeferred, function(){
						loadChildDeferred.resolve();
					});
				}else{
					loadChildDeferred.resolve();
				}
			}));
			return loadChildDeferred; //dojo.Deferred
		}
	});
});
