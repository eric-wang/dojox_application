define(["dojo/_base/lang",
"dojo/_base/declare",
"dojo/_base/Deferred",
"dojo/_base/connect",
"dojo/ready",
"dojo/_base/window",
"dojo/dom-construct",
"./controller",
"./utils/model",
"dojo/store/Memory"], 
function(lang, declare, deferred, connect, ready, baseWindow, dom, Controller, Model){
	dojo.experimental("dojox.app");

	var Application = declare([], {
		constructor: function(params, node){
			lang.mixin(this, params);
			this.params = params;
			this.stores = {};
			this.srcNodeRef = node;
			this.domNode = node;
			this.id = params.id;
			this.defaultView = params.defaultView;
			this.widgetId = params.id;
			// this.controller = new Controller(this);
			// mixin controller to application
			lang.mixin(this, new Controller(this));
		},

		createDataStore: function(params){
			if (params.stores) {
				//create stores in the configuration.
				for (var item in params.stores) {
					if (item.charAt(0) !== "_") {//skip the private properties
						var type = params.stores[item].type ? params.stores[item].type : "dojo.store.Memory";
						var config = {};
						if (params.stores[item].params) {
							lang.mixin(config, params.stores[item].params);
						}
						var storeCtor = lang.getObject(type);
						if (config.data && lang.isString(config.data)) {
							//get the object specified by string value of data property
							//cannot assign object literal or reference to data property
							//because json.ref will generate __parent to point to its parent
							//and will cause infinitive loop when creating StatefulModel.
							config.data = lang.getObject(config.data);
						}
						params.stores[item].store = new storeCtor(config);
						this.stores[item] = params.stores[item].store;
					}
				}
			}
		},

		// load default view and startup the default view
		start: function(applicaton){
			var path = window.location.pathname;
			if (path.charAt(path.length) != "/") {
				path = path.split("/");
				path.pop();
				path = path.join("/");
			}
			dojo.registerModulePath("app", path);

			this.postCreate();
			this.createDataStore(this.params);
			this.loadedModels = Model(this.params.models, this);
			var currentView = this.loadView(this.defaultView);

			deferred.when(currentView, lang.hitch(this, function(result){
				this.selectedView = result;
				this.setStatus(this.lifecycle.STARTED);
			}));
			console.log("application started.");
		}
	});

	function generateApp(config, node, appSchema, validate){
		var modules = config.modules.concat(config.dependencies);

		if (config.template) {
			modules.push("dojo/text!" + "app/" + config.template);
		}

		require(modules, function(){
			var modules = [Application];
			for (var i = 0; i < config.modules.length; i++) {
				modules.push(arguments[i]);
			}

			var ext = {};
			if (config.template) {
				ext = {
					templateString: arguments[arguments.length - 1]
				};
			}
			App = declare(modules, ext);

			ready(function(){
				app = App(config, node || baseWindow.body());
				app.setStatus(app.lifecycle.STARTING);
				app.start();
			});
		});
	};

	return function(config, node){
		if (!config) {
			throw Error("App Config Missing");
		}

		if (config.validate) {
			require(["dojox/json/schema", "dojox/json/ref", "dojo/text!dojox/application/schema/application.json"], function(schema, appSchema){
				schema = dojox.json.ref.resolveJson(schema);
				if (schema.validate(config, appSchema)) {
					generateApp(config, node);
				}
			});
		}
		else {
			generateApp(config, node);
		}
	};
});
