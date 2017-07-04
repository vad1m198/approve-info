public with sharing class Approve_Info_Controller {

	private static Map<String, String> aParams = new Map<String, String>();
	
	@AuraEnabled
	public static String remoteHandler(String sIncomeParams) {		
		system.debug('sParams >>> ' + sIncomeParams);
        Approve_Info_Controller.aParams = (Map<String, String>) JSON.deserialize(sIncomeParams, Map<String, String>.class);
        Map<String, String> aResult = new Map<String, String>();
        String sAction = Approve_Info_Controller.getRequest('event', '');
        try {
            if (sAction == 'loadApproveInfo') {
                aResult = Approve_Info_Controller.getApproveInfo();
            } else if(sAction == 'loadObjectRecords') {
            	aResult = Approve_Info_Controller.getObjectRecords();
            } else if(sAction == 'processRecords') {
            	aResult = Approve_Info_Controller.processRecords();
            }
            
        } catch (QueryException e) {
            aResult.put('status', 'error');
            aResult.put('message', e.getMessage());
            system.debug('DB exception >>> ' + aResult);
        } catch (DMLException e) {
            aResult.put('status', 'error');
            aResult.put('message', 'Database Error: ' + e.getDmlMessage(0));
            List<String> aErrFields = e.getDmlFieldNames(0);
            aResult.put('fields', String.join(aErrFields, ','));
            system.debug('DB exception >>> ' + e.getDmlFields(0));
        } catch (System.Exception e) {
            aResult.put('status', 'error');
            aResult.put('message', e.getMessage() + ' (' + e.getTypeName() + ' # ' + e.getStackTraceString() + ')');
            system.debug('exception >>> ' + aResult);
        }

        return JSON.serialize(aResult);
	}
	
	private static String getRequest(String sName) {
        return Approve_Info_Controller.getRequest(sName, null);
    }
    private static String getRequest(String sName, String sDefault) {
        return Approve_Info_Controller.aParams.containsKey(sName) ? Approve_Info_Controller.aParams.get(sName) : sDefault;
    }
    
    private static Map<String,String> getObjectRecords(){
    	Map<String,String> oResult = new Map<String,String>();
    	String apiName = Approve_Info_Controller.getRequest('apiName');
    	if(apiName == null) throw new AuraHandledException('apiName parameter is empty');
    	Set<String> recordIds = (Set<String>)JSON.deserialize(Approve_Info_Controller.getRequest('recordIds'),Set<String>.class);
    	
    	List<ApproveInfoConfig__c> infoLst = [SELECT Fields_To_show_json__c FROM ApproveInfoConfig__c 
    	  									   WHERE Object_apiName__c = :apiName 
    	  									   	 AND (Assigned_To__c =:UserInfo.getUserId() OR isDefault__c = true)
    	  									   	 ORDER BY Assigned_To__c NULLS LAST];
    	
    	if(infoLst.isEmpty()) {
    		throw new AuraHandledException('no ApproveInfoConfig__c records were found for ' + apiName);
    	}
    	
    	ApproveInfoConfig__c info = infoLst.get(0);
    	Map<String,String> mapApiNameToLable = (Map<String,String>)JSON.deserialize(info.Fields_To_show_json__c,Map<String,String>.class);
    	String queryStr = 'SELECT ' + String.join(new List<String>(mapApiNameToLable.keySet()),',') + ' FROM ' + apiName + ' WHERE ID IN:recordIds';
    	
    	SObjectType objType = Schema.getGlobalDescribe().get(apiName);
    	
    	if(objType == null) throw new AuraHandledException('Invalid api name ' + apiName);
    			
    	oResult.put('status', 'success');
    	oResult.put('aRecords', JSON.serialize(Database.query(queryStr)));
    	oResult.put('oApiNameToLable', JSON.serialize(mapApiNameToLable));
    	return oResult;
    }
    
    private static Map<String,String> getApproveInfo(){
    	Map<String,String> oResult = new Map<String,String>();
    	List<ApproveInfo> aRecords = new List<ApproveInfo>();
    	
    	Set<String> objectsApiNames = new Set<String>();
    	for(ApproveInfoConfig__c configObj: [SELECT Object_apiName__c FROM ApproveInfoConfig__c 
    										  WHERE Assigned_To__c =:UserInfo.getUserId() OR isDefault__c = true]) {
    		objectsApiNames.add(configObj.Object_apiName__c);
    	}
    	
    	for(ProcessInstanceWorkitem item: [SELECT Id,ProcessInstance.TargetObjectId,ActorId 
    		FROM ProcessInstanceWorkitem WHERE ActorId=:UserInfo.getUserId()]) {
    			
			    Id sId = item.ProcessInstance.TargetObjectId;
			    Schema.DescribeSObjectResult dsr = sId.getSObjectType().getDescribe();
			    String sobjectLabel = dsr.getLabel();
			    String sobjectName = dsr.getName();
			    
			    if(!objectsApiNames.contains(sobjectName)) continue;
			    
			    ApproveInfo obj = null;
			    for(ApproveInfo o: aRecords) {
			    	if(o.apiName == sobjectName) {
			    		obj = o;
			    		break;
			    	}
			    }
			    
			    if(obj != null) {
			    	obj.addRecordId(sId);
			    } else {
			    	obj = new ApproveInfo(sobjectName,sobjectLabel);			    	
			    	obj.addRecordId(sId);
			    	aRecords.add(obj);
			    }
		}
		oResult.put('status', 'success');
    	oResult.put('aRecords', JSON.serialize(aRecords));
    	return oResult;
    }
    
    private static Map<String,String> processRecords() {
    	Map<String,String> oResult = new Map<String,String>();
    	String sRecordIds = Approve_Info_Controller.getRequest('sRecordIds','');
    	String sProcessName = Approve_Info_Controller.getRequest('sProcessName','');
    	String sComment = Approve_Info_Controller.getRequest('sComment','');
    	List<Id> aRecordIds = (List<Id>) JSON.deserialize(sRecordIds, List<Id>.class);
    	
    	Approval.ProcessWorkitemRequest[] allReq = New Approval.ProcessWorkitemRequest[]{};
    	for(ProcessInstanceWorkitem wi: [SELECT Id FROM ProcessInstanceWorkitem WHERE ProcessInstance.TargetObjectId IN:aRecordIds]) {
    		Approval.ProcessWorkitemRequest req = new Approval.ProcessWorkitemRequest();
    		req.setComments(sComment);
    		if(sProcessName.equalsIgnoreCase('Approve')) {
    			req.setAction('Approve');
    		} else if(sProcessName.equalsIgnoreCase('Reject')){
    			req.setAction('Reject');
    		} else {
    			throw new AuraHandledException('Invalid acction name for approval process: ' + sProcessName);
    		}
    		req.setWorkitemId(wi.Id);
    		allReq.add(req);
    	}
    	Set<Id> successRecordIds = new Set<Id>();
    	Set<Id> failedRecordIds = new Set<Id>();
    	Approval.ProcessResult[] approvalResult =  Approval.process(allReq);
    	for(Approval.ProcessResult apRes: approvalResult) {
    		if(!apRes.isSuccess()) {
    			failedRecordIds.add(apRes.getEntityId());
    			System.debug('errors >>> ' + apRes.getEntityId() + ' ### ' + apRes.getErrors());
    		} else {
    			successRecordIds.add(apRes.getEntityId());
    		}
    	}
    	
    	oResult.put('status', 'success');
    	oResult.put('successRecordIds', JSON.serialize(successRecordIds));
    	oResult.put('failedRecordIds', JSON.serialize(failedRecordIds));
	   	return oResult;
    }
    
    
    class ApproveInfo {
    	String apiName;
    	String label;
    	Set<Id> recordIds;
    	
    	ApproveInfo(String apiName, String label) {
    		this.apiName = apiName;
    		this.label = label;
    		this.recordIds = new Set<Id>();
    	}
    	
    	void addRecordId(Id id) {
    		this.recordIds.add(id);
    	}
    	
    }
    
}