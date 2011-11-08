/*
 * Use for testcase.
 * In dojox.app, we mixin _ScrollableMixin.js to a container to implement ScrollableView.
 * 
 * This file can be removed in release.
 */
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dijit/registry",
	"./_ScrollableMixin",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_WidgetBase"
], function(array, declare, domClass, domConstruct, registry, ScrollableMixin, WidgetBase, Container, Contained){

	/*=====
		var View = dojox.mobile.View;
		var ScrollableMixin = dojox.mobile._ScrollableMixin;
	=====*/

	// module:
	//		dojox/mobile/ScrollableView
	// summary:
	//		A container that has a touch scrolling capability.

	return declare("dojox.app.widget.ScrollableView", [WidgetBase, Container, Contained, ScrollableMixin], {

	});
});
