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
    	
    	List<ApproveInfo__mdt> infoLst = [SELECT MasterLabel,FieldsToShow__c FROM ApproveInfo__mdt WHERE MasterLabel = :apiName];
    	if(infoLst.isEmpty()) {
    		throw new AuraHandledException('no ApproveInfo__mdt records were found for ' + apiName);
    	}
    	
    	ApproveInfo__mdt info = infoLst.get(0);
    	String queryStr = 'SELECT ' + info.FieldsToShow__c + ' FROM ' + apiName + ' WHERE ID IN:recordIds';
    	
    	SObjectType objType = Schema.getGlobalDescribe().get(apiName);
    	
    	if(objType == null) throw new AuraHandledException('Invalid api name ' + apiName);
    	
		Map<String,Schema.SObjectField> mfields = objType.getDescribe().fields.getMap();
		
		Map<String,String> mapFieldApiToLabel = new Map<String,String>();
		
		for(String s: info.FieldsToShow__c.split(',')) {
			Schema.DescribeFieldResult dfr = mfields.get(s).getDescribe();
			mapFieldApiToLabel.put(dfr.getName(), dfr.getLabel());
		}
		
    	oResult.put('status', 'success');
    	oResult.put('aRecords', JSON.serialize(Database.query(queryStr)));
    	oResult.put('aFields', info.FieldsToShow__c);
    	oResult.put('aFieldsDescribe', JSON.serialize(mapFieldApiToLabel));
    	return oResult;
    }
    
    private static Map<String,String> getApproveInfo(){
    	Map<String,String> oResult = new Map<String,String>();
    	
    	List<ApproveInfo> aRecords = new List<ApproveInfo>();
    	
    	Set<String> objectsApiNames = new Set<String>();    	
    	for(ApproveInfo__mdt mdtObj: [SELECT MasterLabel FROM ApproveInfo__mdt]) {
    		objectsApiNames.add(mdtObj.MasterLabel);
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