define(["dojo/aspect", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/window",
		"dojo/dom","dojo/dom-geometry",
		"dojo/io/script", "dijit/registry", "dojox/mobile/ProgressIndicator"
],function(aspect, declare, lang, win, dom, domGeom, script, registry, ProgressIndicator){
	// Map class
	var Map = declare(null, {
		constructor: function(args){
			this.id = args.id;
			var opt = (args.options ? args.options : {});
			this.options = lang.mixin({
				zoom : 8,
				mapTypeId : google.maps.MapTypeId.ROADMAP
			}, opt);
		},
		load: function(){
			this.map = new google.maps.Map(document.getElementById(this.id),
					this.options);
		},
		resize: function(){
			google.maps.event.trigger(this.map, "resize");
		}
	});

	var isLoaded = false; // flag to indicate whether the map is loaded

	function showMap(latLng) {
		var googleMap = new Map({
			id : "googleMap",
			options: {
				center: (latLng ? latLng : new google.maps.LatLng(-34.397, 150.644))
			}
		});
		googleMap.load();
		// fix resize problem after rotation
		aspect.after(registry.byId("map"), "resize", function(){
			var mapBox = domGeom.getMarginBox("map");
			var headerBox = domGeom.getMarginBox("header");
			mapBox.w = headerBox.w;
			mapBox.h = win.global.innerHeight - domGeom.getMarginBox("header").h;
			domGeom.setMarginBox("map", mapBox);
			googleMap.resize();
		});
		isLoaded = true;
	}

	var mapDemo = lang.getObject("dojox.app.tests.showcase.src.map", true);
	mapDemo.initMap = function(){
		if (navigator.geolocation)
			navigator.geolocation.getCurrentPosition(function(position) {
				var myLatLng = new google.maps.LatLng(
						position.coords.latitude, position.coords.longitude);
				showMap(myLatLng);
			}, function(){showMap();});
		else
			showMap();
	};

	function loadMap(){
		script.get({
			url : "http://maps.google.com/maps/api/js",
			content : {
				sensor : false,
				callback : "dojox.app.tests.showcase.src.map.initMap"
			},
			timeout: 30000,
			error: function(err){
				dom.byId("googleMap").innerHTML = err;
			}
		});
	};

	return {
		init: function(){
			if (isLoaded){
				return;
			}
			isLoaded = true;
			var mapMargin = domGeom.getMarginBox("map");
			mapMargin.h = window.innerHeight - 44;
			domGeom.setMarginBox("map", mapMargin);
			loadMap();
		}
	};
});
