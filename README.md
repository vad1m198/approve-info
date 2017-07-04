# approve-info

This is simple lightning component to show all records pending for approval on one page.

This component needs setinngs. Code contain 'ApproveInfoConfig__c' custom object to config component.
Create one ApproveInfoConfig__c record for each object for each user to show on the page. Populate Object_apiName__c with Object apiName,
Fields_To_show_json__c with object in JSON format which represents map of field apiName to Label to show on the page. 
```
{"Name":"Name","Fax":"Fax","Owner.Name":"Owner"}
```
Also record could be marked as isDefault to use for all users

## Deployment
To deploy to salesforce org clone repository and deploy it to destination org using Force.com IDE or Migration tool or use deploy to salesforce button
<a href="https://githubsfdeploy.herokuapp.com/app/githubdeploy/vad1m198/approve-info?ref=master">
  <img alt="Deploy to Salesforce"
       src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png">
</a>



