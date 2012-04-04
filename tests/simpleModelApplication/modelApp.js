require(["dojo", "dojox/application/main", "dojox/json/ref", "dojo/text!./config.json", "dojo/_base/connect"], function(dojo, Application, jsonRef, config, connect){
	dojo.global.modelApp = {};
	modelApp.names =  {identifier: "id", items: [{
		"id" : "1",
		"Serial": "360324",
		"First": "John",
		"Last": "Doe",
		"Email": "jdoe@us.ibm.com",
		"ShipTo": {
			"Street": "123 Valley Rd",
			"City": "Katonah",
			"State": "NY",
			"Zip": "10536"
		},
		"BillTo": {
			"Street": "17 Skyline Dr",
			"City": "Hawthorne",
			"State": "NY",
			"Zip": "10532"
		}
	}]};
	app = Application(jsonRef.fromJson(config));
});
