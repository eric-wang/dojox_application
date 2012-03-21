define(["dojo/_base/lang", "dojo/_base/Deferred", "dojo/_base/config", "dojo/store/DataStore", "dojox/mvc/_base"], 
function(dlang, Deferred, config, dataStore, mvc){
	return function(config, parent){
		//load models here. create dojox.newStatefulModel 
		//using the configuration data for models
		var loadedModels = {};
		if(parent.loadedModels){
			dlang.mixin(loadedModels, parent.loadedModels);
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
					if(type == "dojox/mvc/StatefulModel"){
						loadedModels[item] = Deferred.when(mvc.newStatefulModel(options), function(model){
							return model;
						});						
					}else{
						// need to load the class to use for the model
						var myRequireDeferred = new Deferred();
						var currentItem = item;
						require([type], // require the model type
								function( requirement ){
									myRequireDeferred.resolve( requirement );
								}
						);

						Deferred.when( myRequireDeferred,
								function( modelCtor ) {
									loadedModels[currentItem] = new modelCtor( options );
									Deferred.when(loadedModels[currentItem].queryStore(), function(model){
										return loadedModels[currentItem];
									});
								},
								function( err ) { // failure
									console.error('Error: Attempted to add an unknown model type.', err);
								}
						); 
					}					
				}
			}
		}
		return loadedModels;
	}
});
