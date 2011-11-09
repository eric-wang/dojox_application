define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Container", "dijit/_Contained", "./widget/_ScrollableMixin"], function(declare, WidgetBase, Container, Contained, ScrollableMixin){
    return declare("dojox.app.container", [WidgetBase, Container, Contained, ScrollableMixin], {
        buildRendering: function(){ 
			this.inherited(arguments);
			this.domNode.style.position = "absolute";
			this.domNode.style.width = "100%";
			this.domNode.style.height = "100%";
        }
    });
});
