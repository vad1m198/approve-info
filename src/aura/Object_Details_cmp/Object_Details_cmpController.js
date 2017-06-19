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
			
			oCmp.set("v._records", aRecords);
			oCmp.set("v._headers", aHeaders);
		}
	},
	
	handleSelectAll : function(oCmp, oEvent, oHelper) {		
		var aRecords = oCmp.get("v._records");
		if(aRecords) {
			aRecords.forEach(r => r._isSelected = oEvent.target.checked);
			oCmp.set("v._records", aRecords);
			oCmp.set("v._isAllSelected", oEvent.target.checked);
			
		}
	},
	handleTCselect : function(oCmp, oEvent, oHelper) {
		var aRecords = oCmp.get("v._records");
		var sTargetId = oEvent.target.dataset.recordid;		
		oRecord = aRecords.find(r => r.Id == sTargetId);
		if(oRecord) {
			oRecord._isSelected = oEvent.target.checked;
			var oNonSelected = aRecords.find(r => !r._isSelected);
			if(oNonSelected) {
				oCmp.set("v._isAllSelected", false);
			} else {
				oCmp.set("v._isAllSelected", true);
			}
			
			oCmp.set("v._records", aRecords);
		}

	},
	
	
})