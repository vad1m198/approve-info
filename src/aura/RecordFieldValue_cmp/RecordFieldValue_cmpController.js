({
	doInit : function(oCmp, oEvent, oHelper) {
		var oRecord = oCmp.get("v.record");
		var sFieldApiName = oCmp.get("v.fieldApiName");
		oCmp.set("v._value", oRecord[sFieldApiName]);
	}
})