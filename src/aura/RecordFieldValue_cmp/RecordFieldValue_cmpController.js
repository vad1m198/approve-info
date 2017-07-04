({
	doInit : function(oCmp, oEvent, oHelper) {
		var sFieldApiName = oCmp.get("v.fieldApiName");
		var _val = oCmp.get("v.record");
		if(_val && sFieldApiName) {
			sFieldApiName.split(".").forEach(f => _val = _val[f]);
			oCmp.set("v._value", _val);
		}
	}
})