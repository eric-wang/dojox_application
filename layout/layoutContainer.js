define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Container", "dijit/_Contained", "./_layoutMixin"], 
function(declare, Widget, Container, Contained, layoutMixin){
	return declare("dojox.app.layout.layoutContainer", [Widget, Container, Contained, layoutMixin], {
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
