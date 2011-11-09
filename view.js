define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Container", "dijit/_Contained","dijit/_TemplatedMixin","dijit/_WidgetsInTemplateMixin","./layout/_layoutMixin"],
	function(declare,Widget,Container,Contained,TemplatedMixin,WidgetsInTemplateMixin, layoutMixin){
	return declare("dojox.app.view", [Widget,TemplatedMixin,Container,Contained, WidgetsInTemplateMixin, layoutMixin], {
		selected: false,
		keepScrollPosition: true,
		baseClass: "applicationView mblView",
		config:null,
		widgetsInTemplate: true,
		templateString: '<div></div>',
		toString: function(){return this.id},
		activate:function(){},
		deactivate: function(){},
		//Temporary work around for getting a null when calling getParent
		getParent: function(){return null;},

		startup: function(){
			if (this._started) {
				return;
			}
			this._started = true;

			// call _layoutMixin startup to layout children
			this.inherited(arguments);
		}
	});
});
