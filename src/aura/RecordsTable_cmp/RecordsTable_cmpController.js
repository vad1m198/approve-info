({
	handleSelectAll : function(oCmp, oEvent, oHelper) {		
		var aRecords = oCmp.get("v.records");
		if(aRecords) {
			aRecords.forEach(r => r._isSelected = oEvent.target.checked);
			oCmp.set("v.records", aRecords);
			oCmp.set("v._selectedRecordsNumber", oEvent.target.checked ? aRecords.length : 0);
			
		}
	},
	handleTCselect : function(oCmp, oEvent, oHelper) {
		var aRecords = oCmp.get("v.records");
		var sTargetId = oEvent.target.dataset.recordid;		
		oRecord = aRecords.find(r => r.Id == sTargetId);
		if(oRecord) {
			oRecord._isSelected = oEvent.target.checked;
			oCmp.set("v._selectedRecordsNumber", oEvent.target.checked ? oCmp.get("v._selectedRecordsNumber") + 1 : oCmp.get("v._selectedRecordsNumber") - 1);
			oCmp.set("v.records", aRecords);
		}
	},
	
	processRecords : function(oCmp, oEvent, oHelper) {
		var aRecords = oCmp.get("v.records");
		var aRecordIds = aRecords.filter(r => r._isSelected).map(r => r.Id);
		var oTextAreaCmp = oCmp.find("comments-area");
				
		var oParams = {
			event: 'processRecords',
			sRecordIds: JSON.stringify(aRecordIds),
			sProcessName: oEvent.getSource().get("v.label"),
			sComment: oTextAreaCmp ? oTextAreaCmp.get("v.value") : '',
			apiName: oCmp.get("v.apiName")
		}
		var loadEvent = oCmp.getEvent("loadDataRemote");
	    loadEvent.setParams({ "jsonData" : JSON.stringify(oParams), "component" : oCmp, "showErrorInComponent":false });
        loadEvent.fire();
        oTextAreaCmp.set("v.value","");
	},
	handleRemoteSuccess : function(oCmp, oEvent, oHelper) {
		var params = oEvent.getParam('arguments');
		if (params) {
			var oResponse = params.response;
			var aSuccessRecords = JSON.parse(oResponse.successRecordIds);
			var aRecords = oCmp.get("v.records");
			aRecords = aRecords.filter(r => aSuccessRecords.indexOf(r.Id) == -1);			
			oCmp.set("v.records", aRecords);
			oCmp.set("v._selectedRecordsNumber", oCmp.get("v._selectedRecordsNumber") - aSuccessRecords.length);
		}
	},
})