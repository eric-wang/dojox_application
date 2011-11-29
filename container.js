define(["dojo/_base/declare", "dojo/_base/lang", "dijit/_WidgetBase", "dijit/_Container", "dijit/_Contained", "./widget/_ScrollableMixin","./layout/_layoutMixin"], 
function(declare, lang, WidgetBase, Container, Contained, ScrollableMixin, layoutMixin){
    return declare("dojox.app.container", [WidgetBase, Container, Contained, layoutMixin], {
        buildRendering: function(){ 
			this.inherited(arguments);
			// Mixin _scrollableMixin if the container scrollable="true"
			if(this.scrollable){
				var scrollableMixin = new ScrollableMixin();
				lang.mixin(this, scrollableMixin);

				// Fix scrollDir for the mixin will set scrollDir to v
				if(this.scrolldir){
					this.scrollDir = this.scrolldir;
				}

				// build scrollable container
				this.inherited(arguments);
				this.domNode.style.position = "absolute";
				this.domNode.style.width = "100%";
				this.domNode.style.height = "100%";
			}
        },

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
