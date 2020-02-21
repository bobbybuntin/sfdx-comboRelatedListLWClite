global class relatedListLWCAppBuilderAttributes extends VisualEditor.DynamicPickList{
    VisualEditor.DesignTimePageContext context;

    global relatedListLWCAppBuilderAttributes(VisualEditor.DesignTimePageContext context) {
       this.context = context;
    }


    global override VisualEditor.DataRow getDefaultValue(){
        VisualEditor.DataRow defaultValue = null;
        return defaultValue;
    }
    global override VisualEditor.DynamicPickListRows getValues() {

        VisualEditor.DynamicPickListRows  myValues = new VisualEditor.DynamicPickListRows();
        Map<String, String> uniqueObjectNames = new Map<String, String>();

        String relatedObjectName = context.entityName;

        Schema.DescribeSObjectResult R = Schema.getGlobalDescribe().get(relatedObjectName).getDescribe();
        //Schema.DescribeSObjectResult R = Account.SObjectType.getDescribe();
        for (Schema.ChildRelationship cr: R.getChildRelationships()) 
        {
        system.debug('====child object==='+cr.getChildSObject());


        if(uniqueObjectNames.containsKey(cr.getChildSObject().getDescribe().getName()) == false)
        {
        uniqueObjectNames.put(cr.getChildSObject().getDescribe().getName(), cr.getChildSObject().getDescribe().getName());
        VisualEditor.DataRow value1 = new VisualEditor.DataRow(cr.getChildSObject().getDescribe().getName(), cr.getChildSObject().getDescribe().getName());
        myValues.addRow(value1);
        }
        }
        
  
        system.debug('myValues =====' + myValues);
        //myValues.sort();  sorting doesn't work.  Errors with not comparable.

        return myValues;
    }
}
