define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc/at", "dojox/mvc/Repeat", 
        "dojox/mvc/getStateful","dojox/mvc/Output","dojox/mobile/ToolBarButton"], 
	function(dom, connect, registry, at, Repeat, getStateful, Output){

	return {
		init: function(){
			var selectedIndex = 0;

			// could have used app.children.modelApp_repeat.loadedModels.repeatmodels 
			// instead of app.currentLoadedModels.repeatmodels 
			//var currentModel = app.children.modelApp_repeat.loadedModels.repeatmodels;			
			var currentModel = app.currentLoadedModels.repeatmodels;
			
			function setDetailsContext(index){
				currentModel.set("cursorIndex", index);
			}
			

			// used in the Repeat Data binding demo
			function insertResult(index){
				var data = {id:Math.random(), "First": "", "Last": "", "Location": "CA", "Office": "", "Email": "",
							"Tel": "", "Fax": ""};
				currentModel.model.push(new getStateful(data));
				setDetailsContext(currentModel.model.length-1);
			};


			function deleteResult(index){
				var nextIndex = currentModel.get("cursorIndex");
				if(nextIndex >= index){
					nextIndex = nextIndex-1;
				}
				currentModel.model.splice(index, 1);
				currentModel.set("cursorIndex", nextIndex);
			};

			window.setDetailsContext = setDetailsContext;
			window.insertResult = insertResult;
			window.deleteResult = deleteResult;

			console.log("repeat view init ok");
		}
	}
});
