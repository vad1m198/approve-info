({
	doInit : function(oCmp, oEvent, oHelper) {
		var oParams = {
				event: 'loadApproveInfo',
		}
		var fHandleSuccess = oResult => {
			var aRecords = JSON.parse(oResult.aRecords);
			console.log('aRecords >>> ', aRecords);
			oCmp.set("v.approveInfo",aRecords);
		};
		oHelper._request(oCmp, oParams, fHandleSuccess,oError=>oHelper.showMessage(oCmp, oError.message, 'error') );
	},
	
	loadObjectRecords: function(oCmp, oEvent, oHelper) {	
		var oParams = {
				event: 'loadObjectRecords',
				apiName : oEvent.getParam("apiName"),
				recordIds : JSON.stringify(oEvent.getParam("recordIds"))
		}
		var fHandleSuccess = oResult => {			
			console.log('aRecords >>> ', JSON.parse(oResult.aRecords));	
			console.log('aFields >>> ', oResult.aFields);
			console.log('aFieldsDescribe >>> ', JSON.parse(oResult.aFieldsDescribe));		
		};
		
		oHelper._request(oCmp, oParams, fHandleSuccess,oError=>oHelper.showMessage(oCmp, oError.message, 'error') );
	}
})