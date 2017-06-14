({
	doInit : function(oCmp, oEvent, oHelper) {
		console.log(oCmp.get("v.apiName"),oCmp.get("v.recordIds"));
		
		var loadEvent = oCmp.getEvent("loadRecords");        
	    loadEvent.setParams({ "apiName" : oCmp.get("v.apiName"), "recordIds" : oCmp.get("v.recordIds") });
        loadEvent.fire();
		
	}
})





