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
			if(params.event == 'processRecords'){
				var oResponse = params.response;
				var aSuccessRecords = JSON.parse(oResponse.successRecordIds);
				var aRecords = oCmp.get("v.records");
				aRecords = aRecords.filter(r => aSuccessRecords.indexOf(r.Id) == -1);			
				oCmp.set("v.records", aRecords);
				oCmp.set("v._selectedRecordsNumber", oCmp.get("v._selectedRecordsNumber") - aSuccessRecords.length);
				oCmp.set("v._pageNumber", 1);
				oHelper.calculateVisibleRecords(oCmp);
			} else {
				var oResponse = params.response;
				var aRecords = JSON.parse(params.response.aRecords);			
				var oFieldsDescribe = JSON.parse(oResponse.oFieldsDescribe);
				var aHeaders = oResponse.aFields.split(",").map(field => {return {apiName:field,label:oFieldsDescribe[field]}})
				
				console.log('aRecords >>> ',aRecords);
				console.log('aHeaders >>> ',aHeaders);
				
				oCmp.set("v.records", aRecords);
				oCmp.set("v.headers", aHeaders);
				oHelper.calculateVisibleRecords(oCmp);
			}
			
		}
	},
	
	handleTableClick : function(oCmp, oEvent, oHelper) {
		if(oEvent.target.tagName == 'INPUT' && oEvent.target.type == 'checkbox') {
			window.setTimeout(
			    $A.getCallback(()=> {
				    var selectedRecordsNum = oCmp.get("v.records").reduce((acc, val) => val._isSelected ? ++acc: acc, 0);
				    oCmp.set("v._selectedRecordsNumber",selectedRecordsNum);
			    }), 500
			);
			
		}
	},
	previousPage : function(oCmp, oEvent, oHelper) {
		oCmp.set("v._pageNumber",oCmp.get("v._pageNumber") - 1);
		oHelper.calculateVisibleRecords(oCmp);
	},
	nextPage : function(oCmp, oEvent, oHelper) {
		oCmp.set("v._pageNumber",oCmp.get("v._pageNumber") + 1);
		oHelper.calculateVisibleRecords(oCmp);
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
	
})