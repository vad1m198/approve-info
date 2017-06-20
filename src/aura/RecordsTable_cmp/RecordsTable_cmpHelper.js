({
	isAllSelected : function(oCmp) {
		var oNonSelected = oCmp.get("v.records").find(r => !r._isSelected);
		if(oNonSelected) {
			oCmp.set("v._isAllSelected", false);
		} else {
			oCmp.set("v._isAllSelected", true);
		}
	}
})