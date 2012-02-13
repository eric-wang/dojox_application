define(["dojo/_base/declare",
"dojo/_base/lang",
"dojo/_base/Deferred",
"dojo/parser",
"dojo/_base/connect",
"dojo/dom-construct",
"dijit/_TemplatedMixin",
"dijit/_WidgetsInTemplateMixin",
"./viewcontroller",
"./utils/model",
"./utils/bind"],
function(declare, lang, deferred, parser, connect, domConstruct, TemplatedMixin, WidgetsInTemplateMixin, ViewController, Model, Bind){
	return declare("dojox.application.view", [ViewController], {
		constructor: function(params){
			this.id = "";
			this.name = "";
			this.templateString = "";
			this.parent = null;
			this._start = false;

			lang.mixin(this, params);
			if (this.parent) {
				lang.mixin(this, this.parent.params.views[this.name]);
			}
		},

		// start view
		start: function(){
			if (this._start) {
				return;
			}

			// create DOM node from templateString
			if (this.templateString) {
				// TODO: create widget 
				this.widget = this.render(this.templateString);
				this.domNode = this.widget.domNode;
				this.parent.domNode.appendChild(this.domNode);
			}
			// load from templateString
			else {
				console.log("load templateString from template file. ", this.params);
				if (!this.dependencies) {
					this.dependencies = [];
				}
				// load viewcontroller
				var viewController = this.controller;
				if (viewController) {
					var index = viewController.indexOf('.js');
					if (index != -1) {
						viewController = viewController.substring(0, index);
					}
					this.dependencies = ["app/" + viewController].concat(this.dependencies);
				}

				var deps = this.template ? this.dependencies.concat(["dojo/text!app/" + this.template]) : this.dependencies.concat([]);
				var def = new deferred();
				if (deps.length > 0) {
					require(deps, function(){
						def.resolve.call(def, arguments);
					});
				}
				else {
					def.resolve(true);
				}

				var loadViewDeferred = new deferred();
				deferred.when(def, lang.hitch(this, function(){
					this.templateString = this.template ? arguments[0][arguments[0].length - 1] : "<div></div>";
					this.widget = this.render(this.templateString);
					this.widget.id = this.id;
					//Todo: create view data model

					//Todo: bind data to widget
					this.bindModel(this.widget);
					this.domNode = this.widget.domNode;
					this.parent.domNode.appendChild(this.domNode);

					//start widget
					this.widget.startup();

					//mixin view controller, controller is the first object of arguements
					lang.mixin(this, arguments[0][0]);
					// call view controller's init() method to initialize view
					this.init();
					this._start = true;
					loadViewDeferred.resolve(this);
				}));
				return loadViewDeferred;
			}
		},

		render: function(templateString){
			var widgetTemplate = new TemplatedMixin();
			var widgetInTemplate = new WidgetsInTemplateMixin();
			lang.mixin(widgetTemplate, widgetInTemplate);
			widgetTemplate.templateString = templateString;
			widgetTemplate.buildRendering();
			return widgetTemplate;
		},

		// select current view
		select: function(){
			console.log("select view: " + this.id);
		},

		unselect: function(){
			console.log("unselect view: " + this.id);
		},

		bindModel: function(widget){
			//load child's model if it is not loaded before
			if (!this.loadedModels) {
				this.loadedModels = Model(this.models, this.parent);
				//TODO need to find out a better way to get all bindable controls in a view
				Bind([widget], this.loadedModels);
			}
		}
	});
});
