define(["dojo/_base/lang", "dojo/_base/Deferred", "dojo/_base/config", "dojo/store/DataStore", "dojox/mvc/_base", "./mvcModel"], 
function(lang, Deferred, config, dataStore, mvc, mvcModel){
	return function(/*Object*/ config, /*Object*/ parent){
		// summary:
		//		model is called to create all of the models for the app, or for one view at a time
		// summary:
		//		Create and call the appropriate model utility based upon the modelType set in the model in the config
		// description:
		//		Called for each view or for the app.  For each model in the config, it will  
		//		create the model utility based upon the modelType and call it to create and load the model. 
		// config: Object
		//		The models section of the config for this view or for the app.
		// parent: Object
		//		The parent of this view or the app itself, so that models from the parent will be 
		//		available to the view.
		// returns: loadedModels 
		//		 loadedModels is an object holding all of the available loaded models for this view.
		var loadedModels = {};
		if(parent.loadedModels){
			lang.mixin(loadedModels, parent.loadedModels);
		}
		if(config){
			for(var item in config){
				if(item.charAt(0) !== "_"){
					// Here we need to create the modelType and call it passing in the item and the config[item].params
					params = config[item].params ? config[item].params : {};
					var def = new Deferred();
					
					var modelType = config[item].modelsType ? config[item].modelsType : "dojox/application/utils/mvcModel";
					require([modelType], // require the model type
							function( requirement ){
								def.resolve( requirement );
							}
					);
					Deferred.when( def,
							lang.hitch(this, function(modelCtor){
								loadedModels[item] = modelCtor(config, params, item);
								return loadedModels;
							}),
							function( err ) { // failure
								console.error('Error: Attempted to add an unknown model type.', err);
							}
					); 					
				}
			}
		}else{
			return loadedModels;
		}
		return loadedModels;
	}
});
