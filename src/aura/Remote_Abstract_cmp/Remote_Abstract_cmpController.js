({
	handleRemoteSuccess : function(oCmp, oEvent, oHelper) {
		var params = oEvent.getParam('arguments');
		if (params) {
			console.log('handleRemoteSuccess >>> ',params.response);
		}
	},
	
	handleRemoteError : function(oCmp, oEvent, oHelper) {
		var params = oEvent.getParam('arguments');
		if (params) {
			console.log('handleRemoteError >>> ',params.message);
		}
	},
	
})