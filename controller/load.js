define(["dojo/_base/lang", "dojo/_base/declare", "dojo/on", "dojo/_base/Deferred", "../controller", "../view"], function(lang, declare, on, deferred, Controller, View){
	return declare("dojox.application.controller.load", [Controller], {

		constructor: function(application, events){
			this.events = {
				"loadView": this.loadView,
				"ensureViews": this.ensureViews
			};
			this.inherited(arguments);
		},

		// Load view by view id
		loadView: function(view){
			if (view) {
				var viewId = view.viewId, viewName = view.viewId;
				var parent = view.parent;

				//Create view object instance
				var viewId = parent.id + '_' + viewId;
				if (!parent.children[viewId]) {
					var newView = new View({
						"id": viewId,
						"name": viewName,
						"parent": parent
					});
					parent.children[viewId] = newView;
				}
				return parent.children[viewId];
			}
		},

		// Create views
		loadViews: function(views, parent){
			var viewId = views.shift();
			if (!parent) {
				parent = this.application;
			}

			var child = this.loadView({
				"viewId": viewId,
				"parent": parent
			});

			var promise = new deferred();
			deferred.when(child.start(), lang.hitch(this, function(){
				if (views.length > 0) {
					var subPromise = this.loadViews(views, child);
					deferred.when(subPromise, function(){
						promise.resolve();
					});
				}
				else{
					promise.resolve();
				}
			}));
			return promise;
		},

		// Ensure views all exist and started.
		// If view not exist, load and start it.
		// return deferred promise.
		ensureViews: function(views, parent){
			// store promise in application Evented. So other event handler can get the promise.
			this.application.evented.loadPromise = this.loadViews(views, parent);
		}
	});
});
