({
	doInit : function(oCmp, oEvent, oHelper) {
		var oParams = {
				event: 'loadApproveInfo',
		}
		var fHandleSuccess = oResult => {
			var aRecords = JSON.parse(oResult.aRecords);
			console.log('aRecords >>> ', aRecords);
			oCmp.set("v.approveInfo",aRecords);
		};
		oHelper._request(oCmp, oParams, fHandleSuccess,oError=>oHelper.showMessage(oCmp, oError.message, 'error') );
	},

	loadData : function(oCmp, oEvent, oHelper) {
		var oParams = JSON.parse(oEvent.getParam("jsonData"));
		var showErrorInCmp = oEvent.getParam("showErrorInComponent");
		var oTargetCmp = oEvent.getParam("component");
		console.log('load data >>> ', oParams);
		var fHandleSuccess = oResult => {
			if (oTargetCmp) oTargetCmp.handleRemoteSuccess(oResult,oParams.event);
			
			if(oParams.event == 'processRecords') {
				var aRecords = oCmp.get("v.approveInfo");
				var oApproveInfo = aRecords.find(info => info.apiName == oParams.apiName);
				if(oApproveInfo) {
					var aSuccessRecords = JSON.parse(oResult.successRecordIds);
					oApproveInfo.recordIds = oApproveInfo.recordIds.filter( id => aSuccessRecords.indexOf(id) == -1);
					oCmp.set("v.approveInfo",aRecords);
				}
			}
		}
		
		var fHandleError = oError => {
			if(!showErrorInCmp) {
				var sMessage = [].concat(oError)[0].message;
				oHelper.showMessage(oCmp, sMessage, 'error')
			}
			if (oTargetCmp) oTargetCmp.handleRemoteError(sMessage);
		};
		oHelper._request(oCmp, oParams, fHandleSuccess, fHandleError);
	}
})