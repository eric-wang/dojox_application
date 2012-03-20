define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc/at", "dojox/mvc/Group"], 
	function(dom, connect, registry, at, Group){
	return {
		init: function(){
			function setRef(id, model, attr) {
				require([
				         "dijit/registry",
				         "dojox/mvc/at"
				         ], function(registry, at){
								var widget = registry.byId(id);
								widget.set("target", model[attr]);
								console.log("setRef done. "+attr);
							});

			};

			connect.connect(dom.byId('shipto'), "click", function(){
				setRef('addrGroup', app.loadedModels.names.model[0], 'ShipTo');
			});
			connect.connect(dom.byId('billto'), "click", function(){
				setRef('addrGroup', app.loadedModels.names.model[0], 'BillTo');
			});
			//connect.connect(dom.byId('reset1'), "click", function(){
			//	console.log("reset called. ");
			//	app.loadedModels.names.reset();
			//	console.log("reset done. ");
			//});

			console.log("simple view init ok");
		}
	}
});
