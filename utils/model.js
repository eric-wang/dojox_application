define(["dojo/_base/lang", "dojo/_base/Deferred", "dojo/store/DataStore", "dojox/mvc/_base"], function(dlang, Deferred, dataStore, mvc){
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
					loadedModels[item] = Deferred.when(mvc.newStatefulModel(options), function(model){
						return model;
					});
				}
			}
		}
		return loadedModels;
	}
});
