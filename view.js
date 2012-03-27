define(["dojo/_base/declare",
"dojo/_base/lang",
"dojo/_base/Deferred",
"dojo/parser",
"dojo/_base/connect",
"dojo/dom-construct",
"dojo/dom-attr",
"dijit/_TemplatedMixin",
"dijit/_WidgetsInTemplateMixin",
"dojox/application/utils/model",
"./assistant"],
function(declare, lang, Deferred, parser, connect, domConstruct, dattr, TemplatedMixin, 
		WidgetsInTemplateMixin, model, Assistant){
	return declare("dojox.application.view", null, {
		constructor: function(params){
			this.id = "";
			this.name = "";
			this.templateString = "";
			this.parent = null;
			this.children = {};
			this._start = false;
			this.assistantInstance = null;
			this.selectedChild = null;

			lang.mixin(this, params);
			// mixin views configuration to current view instance.
			if(this.parent.views){
				lang.mixin(this, this.parent.views[this.name]);
			}
			var assistantInstance = new Assistant();
			lang.mixin(this, assistantInstance);
		},

		// start view
		start: function(){
			if(this._start){
				return this;
			}

			// create DOM node from templateString
			if(this.templateString){
				this.startup();
			}else{ // load from templateString
				if(!this.dependencies){
					this.dependencies = [];
				}
				// load view assistant
				var assistant = this.assistant;
				if(assistant){
					var index = assistant.indexOf('.js');
					if(index != -1){
						assistant = assistant.substring(0, index);
					}
					this.dependencies = ["app/" + assistant].concat(this.dependencies);
				}

				var deps = this.template ? this.dependencies.concat(["dojo/text!app/" + this.template]) : this.dependencies.concat([]);
				var def = new Deferred();
				if(deps.length > 0){
					var requireSignal;
					try{
						requireSignal = require.on("error", function(error){
							if(def.fired != -1){
								return;
							}
							console.error("load dependencies error in createChild.", error);
							def.reject("load dependencies error.");
							requireSignal.remove();
						});
						require(deps, function(){
							def.resolve.call(def, arguments);
							requireSignal.remove();
						});
					}catch(ex){
						console.error("load dependencies error in createChild. ", ex)
						def.reject("load dependencies error.");
						requireSignal.remove();
					}
				}else{
					def.resolve(true);
				}

				var loadViewDeferred = new Deferred();
				Deferred.when(def, lang.hitch(this, function(){
					this.templateString = this.template ? arguments[0][arguments[0].length - 1] : "<div></div>";
					if(this.assistant) {
						this.assistantInstance = arguments[0][0]; // view assistant is the first object of arguements
					}
					this.setupModel();
					//this.startup();
					this._start = true;
					loadViewDeferred.resolve(this);
				}));
				return loadViewDeferred;
			}
			return this;
		},

		startup: function(){
			this.widget = this.render(this.templateString);

			this.domNode = this.widget.domNode;
			this.parent.domNode.appendChild(this.domNode);

			//start widget
			this.widget.startup();
			
			// set widget attribute
			dattr.set(this.domNode, "id", this.id);
			dattr.set(this.domNode, "region", "center");
			dattr.set(this.domNode, "style", "width:100%; height:100%");
			this.widget.region = "center";

			//mixin view assistant
			if(this.assistantInstance){
				lang.mixin(this, this.assistantInstance);
			}

			// call view assistant's init() method to initialize view
			this.init();
		},

		render: function(templateString){
			var widgetTemplate = new TemplatedMixin();
			var widgetInTemplate = new WidgetsInTemplateMixin();
			// set the loadedModels here to be able to access the model on the parse.
			widgetInTemplate.loadedModels = this.loadedModels; 
			lang.mixin(widgetTemplate, widgetInTemplate);
			widgetTemplate.templateString = templateString;
			widgetTemplate.buildRendering();
			return widgetTemplate;
		},

		setupModel: function(){
			//load child's model if it is not already loaded then call startup
			if (!this.loadedModels) {
				this.loadedModels = model(this.models, this.parent);
				console.log("in view bindModel, this.loadedModels for this.name="+this.name);
				console.log(this.loadedModels);
				this.startup();
			}else{
				this.startup();
			}
		}
	});
});
