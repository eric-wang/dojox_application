define(["dojo/_base/declare", "dojo/_base/connect"], function(declare, connect){
	return declare(null, {
		lifecycle: {
			UNKNOWN:			0,	//unknown
			BEFORELOAD:			1,	//before load view
			LOADING:			2,	//loading
			AFTERLOAD:			3,	//after load view
			BEFORETRANSITION:		4,	//before transition
			INTRANSITION:			5,	//transition
			AFTERTRANSITION:		6,	//after transition
			BEFOREDESTROY:			7,	//before destroy
			DESTROYING:			8,	//destroying
			AFTERDESTROY:			9	//after destroy
		},

		_status: 0, //unknown

		getStatus: function(){
			return this._status;
		},

		setStatus: function(newStatus){
			this._status = newStatus;
			connect.publish("/app/view/status", [newStatus]);
		}
	});
});
