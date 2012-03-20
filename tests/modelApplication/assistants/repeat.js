define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc/at", "dojox/mvc/Repeat", 
        "dojox/mvc/getStateful","dojox/mvc/Output","dojox/mobile/ToolBarButton"], 
	function(dom, connect, registry, at, Repeat, getStateful, Output){

	return {
		init: function(){
			var selectedIndex = 0;

			function setDetailsContext(index){
				app.loadedModels.repeatmodels.set("cursorIndex", index);
			}
			

			// used in the Repeat Data binding demo
			function insertResult(index){
				var data = {id:Math.random(), "First": "", "Last": "", "Location": "CA", "Office": "", "Email": "",
							"Tel": "", "Fax": ""};
				app.loadedModels.repeatmodels.model.push(new getStateful(data));
				setDetailsContext(app.loadedModels.repeatmodels.model.length-1);
			};


			function deleteResult(index){
				var nextIndex = app.loadedModels.repeatmodels.get("cursorIndex");
				if(nextIndex >= index){
					nextIndex = nextIndex-1;
				}
				app.loadedModels.repeatmodels.model.splice(index, 1);
				app.loadedModels.repeatmodels.set("cursorIndex", nextIndex);
			};

			window.setDetailsContext = setDetailsContext;
			window.insertResult = insertResult;
			window.deleteResult = deleteResult;

			console.log("repeat view init ok");
		}
	}
});
