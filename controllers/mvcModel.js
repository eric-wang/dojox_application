define(["dojo/_base/lang", "dojo/_base/declare", "dojo/on", "dojo/_base/Deferred", "../controller", "../view"],
function(lang, declare, on, Deferred, Controller, View){
	// module:
	//		dojox/app/controllers/mvcModel
	// summary:
	//		Bind "load" event on dojox.app application's dojo.Evented instance.
	//		Load the mvcModel for the view and if the mvcModel for the app has not been loaded, load it

	return declare("dojox.application.controllers.mvcModel", Controller, {

		constructor: function(app, events){
			// summary:
			//		bind "load" event on application dojo.Evented instance.
			//
			// app:
			//		dojox.app application instance.
			// events:
			//		{event : handler
			this.appModelCreated = false;
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

			var parent = event.parent || this.app;
			var target = event.target || "";

			// if the mvcModel for the app has not been created yet, create it first.
			if(!this.appModelCreated){
				this.createModel(parent, parent);
				this.appModelCreated = true;
			}
			this.createModel(parent.views[target], parent);
		},

		// create the mvc model based upon the setting in the config
		createModel: function(view, parent){
			// if the models for this view have already been created use them
			if (view.modelsLoaded) {
				app.currentLoadedModels = view.loadedModels;
				return;
			}
			console.log("in createModel in mvcModel controller");
			var config = view.models;
			var loadedModels = {};
			if(parent.loadedModels){
				lang.mixin(loadedModels, parent.loadedModels);
			}
			if(config){
				for(var item in config){
					if(item.charAt(0) !== "_"){
						var params = config[item].params ? config[item].params : {};
						var options;
						if(params.store.params.data){
							options = {
								"store": params.store.store,
								"query": params.store.query ? params.store.query : {}
							};
						}else if(params.store.params.url){
							options = {
								"store": new dataStore({
									store: params.store.store
								}),
								"query": params.store.query ? params.store.query : {}
							};
						}
						var modelCtor;
						var ctrl = null;
						var type = config[item].type ? config[item].type : "dojox/mvc/StatefulModel";
						// need to load the class to use for the model
						var def = new Deferred();
						var currentItem = item;
						require([type], // require the model type
							function(requirement){
								def.resolve(requirement);
							}
						);

						Deferred.when(def,
							function( modelCtor ) {
								loadedModels[currentItem] = new modelCtor( options );
								Deferred.when(loadedModels[currentItem].queryStore(), 
									function(model){
										return loadedModels[currentItem];
									},
									function( err ) { // failure
										console.error('Error: queryStore failed for model.', err);
									}
								);
							},
							function( err ) { // failure
								console.error('Error: Attempted to add an unknown model type.', err);
							}
						); 
					}
				}
			}
			view.loadedModels = loadedModels;
			view.modelsLoaded = true;
			app.currentLoadedModels = loadedModels;
		}
	});
});
