define(["dojo/_base/lang", "dojo/_base/declare", "dojo/on", "dojo/_base/array", "dojo/query", "dojo/dom-style", "dojo/dom-attr", "dojo/dom-geometry", "dijit/registry", "../controller", "../layout/utils"],
function(lang, declare, on, array, query, dstyle, dattr, dgeometry, registry, Controller, layoutUtils){
	// module:
	//		dojox/app/controllers/layout
	// summary:
	//		Bind "layout" and "resize" events on dojox.app application's dojo.Evented instance.

	return declare("dojox.application.controllers.layout", Controller, {

		constructor: function(app, events){
			// summary:
			//		bind "layout" and "resize" events on application dojo.Evented instance.
			//
			// app:
			//		dojox.app application instance.
			// events:
			//		{event : handler}
			this.events = {
				"resize": this.resize,
				"select": this.select
			};
			this.inherited(arguments);
		},

		layout: function(view){
			// summary:
			//		Response to dojox.app "layout" event.
			//
			// example:
			//		Use dojo.on.emit to trigger "layout" event, and this function will response the event. For example:
			//		|	on.emit(this.app.evented, "layout", view);
			//
			// view: Object
			//		view instance needs to do layout.

			if(!view){
				console.warn("layout empaty view.");
				return;
			}

			var fullScreenScene, children, hasCenter;

			if(view.selectedChild && view.selectedChild.isFullScreen){
				console.warn("fullscreen sceen layout");
				/*
				 fullScreenScene=true;
				 children=[{domNode: this.selectedChild.domNode,region: "center"}];
				 dojo.query("> [region]",this.domNode).forEach(function(c){
				 if(this.selectedChild.domNode!==c.domNode){
				 dojo.style(c.domNode,"display","none");
				 }
				 })
				 */
			}else{
				children = query("> [region]", view.domNode).map(function(node){
					var w = registry.getEnclosingWidget(node);
					if(w){
						return w;
					}

					return {
						domNode: node,
						region: dattr.get(node, "region")
					};
				});
				if(view.selectedChild){
					children = array.filter(children, function(c){
						if((c.region == "center") && view.selectedChild && (view.selectedChild.domNode !== c.domNode)){
							dstyle.set(c.domNode, "zIndex", 25);
							dstyle.set(c.domNode, 'display', 'none');
							return false;
						}
						else if(c.region != "center"){
							dstyle.set(c.domNode, "display", "");
							dstyle.set(c.domNode, "zIndex", 100);
						}
						return c.domNode && c.region;
					}, view);
				}else{
					array.forEach(children, function(c){
						if (c && c.domNode && c.region == "center") {
							dstyle.set(c.domNode, "zIndex", 25);
							dstyle.set(c.domNode, 'display', 'none');
						}
					});
				}
			}
			// We don't need to layout children if this._contentBox is null for the operation will do nothing.
			if(view._contentBox){
				layoutUtils.layoutChildren(view.domNode, view._contentBox, children);
			}
		},

		resize: function(event){
			// summary:
			//		Response to dojox.app "resize" event.
			//
			// example:
			//		Use dojo.on.emit to trigger "resize" event, and this function will response the event. For example:
			//		|	on.emit(this.app.evented, "resize", view);
			//
			// event: Object
			//		{"view":view, "changeSize":changeSize, "resultSize":resultSize}

			var view = event.view;
			var changeSize = event.changeSize || null;
			var resultSize = event.resultSize || null;
			this._doResize(view, changeSize, resultSize);
		},

		_doResize: function(view, changeSize, resultSize){
			var node = view.domNode;
			// set margin box size, unless it wasn't specified, in which case use current size
			if(changeSize){
				dgeometry.setMarginBox(node, changeSize);
				// set offset of the node
				if(changeSize.t){ node.style.top = changeSize.t + "px"; }
				if(changeSize.l){ node.style.left = changeSize.l + "px"; }
			}

			// If either height or width wasn't specified by the user, then query node for it.
			// But note that setting the margin box and then immediately querying dimensions may return
			// inaccurate results, so try not to depend on it.
			var mb = resultSize || {};
			lang.mixin(mb, changeSize || {});	// changeSize overrides resultSize
			if( !("h" in mb) || !("w" in mb) ){
				mb = lang.mixin(dgeometry.getMarginBox(node), mb);	// just use dojo.marginBox() to fill in missing values
			}

			// Compute and save the size of my border box and content box
			// (w/out calling dojo.contentBox() since that may fail if size was recently set)
			var cs = dstyle.getComputedStyle(node);
			var me = dgeometry.getMarginExtents(node, cs);
			var be = dgeometry.getBorderExtents(node, cs);
			var bb = (view._borderBox = {
				w: mb.w - (me.w + be.w),
				h: mb.h - (me.h + be.h)
			});
			var pe = dgeometry.getPadExtents(node, cs);
			view._contentBox = {
				l: dstyle.toPixelValue(node, cs.paddingLeft),
				t: dstyle.toPixelValue(node, cs.paddingTop),
				w: bb.w - pe.w,
				h: bb.h - pe.h
			};

			this.layout(view);
		},

		select: function(event){
			// summary:
			//		Response to dojox.app "select" event.
			//
			// example:
			//		Use dojo.on.emit to trigger "select" event, and this function will response the event. For example:
			//		|	on.emit(this.app.evented, "select", view);
			//
			// event: Object
			//		{"parent":parent, "view":view}

			var parent = event.parent || this.app;
			var view = event.view;

			if(!view){
				return;
			}

			if(view !== parent.selectedChild){
				if(parent.selectedChild){
					if(parent.selectedChild.beforeDeactivate){
						parent.selectedChild.beforeDeactivate();
					}
					dstyle.set(parent.selectedChild.domNode, "zIndex", 25);
				}

				dstyle.set(view.domNode, "display", "");
				dstyle.set(view.domNode, "zIndex", 50);
				parent.selectedChild = view;
				if(parent._started){
					if(view.startup && !view._started){
						view.startup();
					}
					else if(view.afterActivate){
						view.afterActivate();
					}
				}
				this._doResize(parent);
			}
		}
	});
});
