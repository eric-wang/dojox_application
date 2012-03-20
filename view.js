define(["dojo/_base/declare",
"dojo/_base/lang",
"dojo/_base/Deferred",
"dojo/parser",
"dojo/_base/connect",
"dojo/dom-construct",
"dojo/dom-attr",
"dijit/_TemplatedMixin",
"dijit/_WidgetsInTemplateMixin",
"./assistant",
"./utils/model",
"./utils/bind"],
function(declare, lang, Deferred, parser, connect, domConstruct, dattr, TemplatedMixin, WidgetsInTemplateMixin, Assistant, Model, Bind){
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
					require(deps, function(){
						def.resolve.call(def, arguments);
					});
				}else{
					def.resolve(true);
				}

				var loadViewDeferred = new Deferred();
				Deferred.when(def, lang.hitch(this, function(){
					this.templateString = this.template ? arguments[0][arguments[0].length - 1] : "<div></div>";
					if(this.assistant) {
						this.assistantInstance = arguments[0][0]; // view assistant is the first object of arguements
					}
					this.startup();
					this._start = true;
					loadViewDeferred.resolve(this);
				}));
				return loadViewDeferred;
			}
			return this;
		},

		startup: function(){
			this.widget = this.render(this.templateString);
			//Todo: create view data model

			//Todo: bind data to widget
			this.bindModel(this.widget);
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
			lang.mixin(widgetTemplate, widgetInTemplate);
			widgetTemplate.templateString = templateString;
			widgetTemplate.buildRendering();
			return widgetTemplate;
		},

		bindModel: function(widget){
			//load child's model if it is not loaded before
			if (!this.loadedModels) {
				this.loadedModels = Model(this.models, this.parent);
				//ELC I don't think we need to call bind, things are already bound
				//Bind([widget], this.loadedModels); 
			}
		}
	});
});
