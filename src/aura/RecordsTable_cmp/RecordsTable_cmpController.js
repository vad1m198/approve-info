({
	handleSelectAll : function(oCmp, oEvent, oHelper) {		
		var aRecords = oCmp.get("v.records");
		if(aRecords) {
			aRecords.forEach(r => r._isSelected = oEvent.target.checked);
			oCmp.set("v.records", aRecords);
			oCmp.set("v._isAllSelected", oEvent.target.checked);
		}
	},
	handleTCselect : function(oCmp, oEvent, oHelper) {
		var aRecords = oCmp.get("v.records");
		var sTargetId = oEvent.target.dataset.recordid;		
		oRecord = aRecords.find(r => r.Id == sTargetId);
		if(oRecord) {
			oRecord._isSelected = oEvent.target.checked;
			oCmp.set("v.records", aRecords);
			oHelper.isAllSelected(oCmp)
		}
	},
	recordsChange : function(oCmp, oEvent, oHelper) {
		oHelper.isAllSelected(oCmp)
	}
})