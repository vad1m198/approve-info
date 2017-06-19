({
	doInit : function(oCmp, oEvent, oHelper) {
		
		var oParams = {
			event: 'loadObjectRecords',
			apiName: oCmp.get("v.apiName"),
			recordIds: JSON.stringify(oCmp.get("v.recordIds"))
		}
		var loadEvent = oCmp.getEvent("loadDataRemote");
	    loadEvent.setParams({ "jsonData" : JSON.stringify(oParams), "component" : oCmp, "showErrorInComponent":false });
        loadEvent.fire();
			
	},
	
	handleRemoteSuccess : function(oCmp, oEvent, oHelper) {
		var params = oEvent.getParam('arguments');
		if (params) {			
			var oResponse = params.response;
			var aRecords = JSON.parse(params.response.aRecords);			
			var oFieldsDescribe = JSON.parse(oResponse.oFieldsDescribe);
			var aHeaders = oResponse.aFields.split(",").map(field => {return {apiName:field,label:oFieldsDescribe[field]}})
			
			console.log('aRecords >>> ',aRecords);
			console.log('aHeaders >>> ',aHeaders);
			
			oCmp.set("v.records", aRecords);
			oCmp.set("v.headers", aHeaders);
		}
	},
	
})