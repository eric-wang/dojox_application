define(["dojo/_base/declare",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_WidgetBase",
	"./layout/_layoutMixin"],
	function(declare, WidgetBase, Container, Contained, layoutMixin){
	return declare("dojox.app.pane", [WidgetBase, Container, Contained, layoutMixin], {
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
