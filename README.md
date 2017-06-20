# approve-info

<a href="https://githubsfdeploy.herokuapp.com/app/githubdeploy/vad1m198/approve-info?ref=master">
  <img alt="Deploy to Salesforce"
       src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png">
</a>

This is simple lightning component to show all records pending for approval on one page.
This component uses custom metadata type for customization. Before deploy this code first create
ApproveInfo casutom metadata type and add text field 'FieldsToShow'.
Create one ApproveInfo_mdt record for each object to show on the page. Populate Label with Object apiName
and FieldsToShow with comma separated apiNames of fields to show on the page. Page does not support relationship
fields.
