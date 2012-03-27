define(["dojo/_base/lang", "dojo/_base/Deferred", "dojo/_base/config", "dojo/store/DataStore", "dojox/mvc/_base"], 
function(dlang, Deferred, config, dataStore, mvc){
	return function(/*Object*/ config, /*Object*/ params, /*String*/item){
		// summary:
		//		mvcModel is called for each mvc model, to create the model based upon the type and params
		//		it will also load models and return the . 
		// summary:
		//		Create and load the mvcModel based upon the type and params
		// description:
		//		Called for each model with a modelType of "dojox/application/utils/mvcModel", it will
		//		create the model based upon the type and the params set for the model in the config.
		// config: Object
		//		The models section of the config for this view or for the app.
		// params: Object
		//		The params set into the config for this model.
		// item: String
		//		The String with the name of this model
		// returns: model 
		//		 The model, of the type specified in the config for this model.
		var loadedModels = {};
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
						require([type], // require the model type
								function(requirement){
									def.resolve(requirement);
								}
						);

						Deferred.when(def,
								function( modelCtor ) {
									loadedModels[item] = new modelCtor( options );
									Deferred.when(loadedModels[item].queryStore(), 
										function(model){
											// now the loadedModels[item].models is set.
											return loadedModels;
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
				return loadedModels[item];
				}
});
