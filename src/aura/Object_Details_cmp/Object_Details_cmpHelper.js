({
	calculateVisibleRecords : function(oCmp) {
		var pageNumber = oCmp.get("v._pageNumber");
		var recordsNumber = oCmp.get("v._recordsOnPageNumber");
		var records = oCmp.get("v.records");
		oCmp.set("v.recordsToShow", records.slice((recordsNumber * (pageNumber - 1)),(recordsNumber * pageNumber)))
		
	}
})