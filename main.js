define(["dojo/_base/lang",
"dojo/_base/declare",
"dojo/_base/Deferred",
"dojo/on",
"dojo/Evented",
"dojo/ready",
"dojo/_base/window",
"dojo/dom-construct",
"./utils/model",
"./view",
"./controllers/Load",
"./controllers/Transition",
"./controllers/Layout",
"./controllers/History",
"dojo/_base/loader",
"dojo/store/Memory",
"dojo/data/ItemFileWriteStore"],
function(lang, declare, Deferred, on, Evented, ready, baseWindow, dom, model, View, LoadController, TransitionController, LayoutController, HistoryController){
	dojo.experimental("dojox.app");

	var Application = declare(null, {
		constructor: function(params, node){
			lang.mixin(this, params);
			this.params = params;
			this.stores = {};
			this.id = params.id || "app";
			window[this.id] = {}; //init global namespace for application
			this.defaultView = params.defaultView;
			this.widgetId = params.id;
			this.controllers = [];
			this.children = {};
			this.loadedModels = {};

			// Create a new domNode and append to body
			// Need to bind startTransition event on application domNode,
			// Because dojox.mobile.ViewController bind startTransition event on document.body
			this.domNode = dom.create("div", {id: this.id, style: "width:100%; height:100%"});
			node.appendChild(this.domNode);
		},

		createDataStore: function(params){
			if (params.stores) {
				//create stores in the configuration.
				for(var item in params.stores){
					if(item.charAt(0) !== "_"){//skip the private properties
						var storeCtor;
						var config = {};
						if(params.stores[item].params){
							lang.mixin(config, params.stores[item].params);
						}
						if(config.data && lang.isString(config.data)){
							//get the object specified by string value of data property
							//cannot assign object literal or reference to data property
							//because json.ref will generate __parent to point to its parent
							//and will cause infinitive loop when creating StatefulModel.
							var type = params.stores[item].type ? params.stores[item].type : "dojo.store.Memory";
							storeCtor = dojo.getObject(type);
							config.data = dojo.getObject(config.data);
						}else if(config.url){ //Add ItemFileWriteStore support
							var type = params.stores[item].type ? params.stores[item].type : "dojo.data.ItemFileWriteStore";
							storeCtor = dojo.getObject(type);
						}
						params.stores[item].store = new storeCtor(config);
						this.stores[item] = params.stores[item].store;
					}
				}
			}
		},

		createControllers: function(controllers){
			if (controllers) {
				var requireItems = [];
				for (var i = 0; i < controllers.length; i++) {
					requireItems.push(controllers[i]);
				}

				var def = new Deferred();
				require(requireItems, function(){
					def.resolve.call(def, arguments);
				})

				var controllerDef = new Deferred();
				Deferred.when(def, lang.hitch(this, function(){
					for (var i = 0; i < arguments[0].length; i++) {
						// Store Application object on each application level controller.
						this.controllers.push(new arguments[0][i](this));
					}
					controllerDef.resolve(this);
				}));
				return controllerDef;
			}
		},

		// load default view and startup the default view
		start: function(){
			// create application controller instances
			new LoadController(this);
			new TransitionController(this);
			new LayoutController(this);
			new HistoryController(this);

			// move _startView from history module to application
			var hash = window.location.hash;
			this._startView = ((hash && hash.charAt(0)=="#")?hash.substr(1):hash)||this.defaultView;

			//create application level data store
			this.createDataStore(this.params);

			// create application level data model
			this.loadedModels = model(this.params.models, this);
			
			// create application template view
			if(this.template){
				this.view = new View({
					id: this.id,
					name: this.name,
					parent: this,
					templateString: this.templateString,
					assistant: this.assistant
				});
				this.view.start();

				this.domNode = this.view.domNode;
			}

			// create application level controller
			var controllers = this.createControllers(this.params.controllers);

			Deferred.when(controllers, lang.hitch(this, function(result){
				// emit load event and let controller to load view.
				on.emit(this.evented, "load", {"target": this.defaultView,"callback":lang.hitch(this, function(){
					var selectId = this.defaultView.split(",");
					selectId = selectId.shift();
					this.selectedChild = this.children[this.id + '_' + selectId];
					if(this._startView !== this.defaultView){
						on.emit(this.evented, "transition", {"target": this._startView});
						this.setStatus(this.lifecycle.STARTED);
						console.log("application started.");
					}else{
						on.emit(this.evented, "layout", {"view":this});
						this.setStatus(this.lifecycle.STARTED);
						console.log("application started.");
					}
				})});
			}));
		}
	});

	function generateApp(config, node, appSchema, validate){
		// Register application module path
		var path = window.location.pathname;
		if (path.charAt(path.length) != "/") {
			path = path.split("/");
			path.pop();
			path = path.join("/");
		}
		dojo.registerModulePath("app", path);

		var modules = config.modules.concat(config.dependencies);

		if (config.template) {
			modules.push("dojo/text!" + "app/" + config.template);
		}
		//TODO: load view assistant if exists in configure
//		if (config.assistant){
//			modules.push("dojo/text!" + "app/" + config.assistant);
//		}

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
