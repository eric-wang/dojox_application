//define(["dojo/_base/lang", "dojo/_base/Deferred", "dojo/_base/config", "dojo/store/DataStore", "dojox/mvc/_base", "./mvcModel"], 
//function(lang, Deferred, config, dataStore, mvc, mvcModel){
define(["dojo/_base/lang", "dojo/_base/Deferred", "dojo/_base/config", "dojo/store/DataStore"], 
function(lang, Deferred, config, dataStore){
	return function(/*Object*/ config, /*Object*/ parent){
		// summary:
		//		model is called to create all of the models for the app, and all models for a view, it will
		//		create and call the appropriate model utility based upon the modelLoader set in the model in the config
		// description:
		//		Called for each view or for the app.  For each model in the config, it will  
		//		create the model utility based upon the modelLoader and call it to create and load the model. 
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
			var loadModelDeferred = loadedModels;
			for(var item in config){
				if(item.charAt(0) !== "_"){
					// Here we need to create the modelLoader and call it passing in the item and the config[item].params
					params = config[item].params ? config[item].params : {};
					var def = new Deferred();
					
					var modelLoader = config[item].modelLoader ? config[item].modelLoader : "dojox/application/utils/mvcModel";
					require([modelLoader], // require the model type
							function( requirement ){
								def.resolve( requirement );
							}
					);
					var loadModelDeferred = new Deferred();
					return Deferred.when(def, lang.hitch(this, function(modelCtor){
						//	loadedModels[item] = modelCtor(config, params, item);
						var createModelPromise;
						try{
							createModelPromise = modelCtor(config, params, item);
						}catch(ex){
							loadModelDeferred.reject("load model error in model.", ex);
							return loadModelDeferred.promise;
						}
						if(createModelPromise.then){
							Deferred.when(createModelPromise, lang.hitch(this, function(newModel){
								loadedModels[item] = newModel;
								//console.log("in model, loadedModels for item="+item);
								//console.log(loadedModels);
								loadModelDeferred.resolve(loadedModels);
								return loadedModels;
							}),
							function(){
								loadModelDeferred.reject("load model error in models.");
							});
							return loadModelDeferred;
						}else{
							loadedModels[item] = createModelPromise;
							//console.log("in module else path, loadedModels for item="+item);
							//console.log(loadedModels);
							loadModelDeferred.resolve(loadedModels);
							return loadedModels;
						}
					}));
					return loadModelDeferred;					
				}
			}
			return loadModelDeferred;
		}else{
			return loadedModels;
		}
		return loadModelDeferred;
	}
});
