public with sharing class accountRelatedContacts {

    public List<Contact> contactList {get;set;}
    public accountRelatedContacts (){
        this.contactList = new List<Contact>();
    }
    @AuraEnabled(cacheable=true)
    public static list<Map<String, String>> getContacts(string searchKey, string objectName, string relatedObjectName){
        List<sObject> results = new List<sObject>();
        List<Map<String, String>> mapresults = new List<Map<String, String>>();
        
        
        System.debug('RelatedObjectName is ' + relatedObjectName);
        System.debug('ThisObjectName is ' + objectName);

                //find the relationshiop fields in the related object
        map<string, Map<String, Schema.SObjectField>> objectFieldsMap = new map<string, Map<String, Schema.SObjectField>>(); //Object field schema map
        System.debug('Schema describe = ' + Schema.getGlobalDescribe().get(relatedObjectName).getDescribe().fields.getMap());
        
        Map<String, Schema.SObjectField> objectFields
                                = Schema.getGlobalDescribe().get(relatedObjectName).getDescribe().fields.getMap();
        for(Schema.SObjectField fld :objectFields.values()){
        schema.describeFieldResult dfield = fld.getDescribe();
        string fldType = string.valueOf(dfield.getType());   
            if (fldType == 'REFERENCE'){ // Lookup field!
                for (Schema.SobjectType reference : dfield.getReferenceTo())
                {
                if(reference.getDescribe().getName() == objectName) 
                {
                    system.debug(string.valueOf(dfield.Name) + ' = ' + fldType + ' --- relationship name = ' + dfield.getRelationshipName());
                    //its referenced to the right object so add it to a map
                    String fieldName = dfield.getName();
                    String queryStr = 'SELECT Id, Name FROM ' + relatedObjectName + ' WHERE ' + fieldName + '= \'' + String.escapeSingleQuotes(searchKey) + '\'';
                    system.debug('Dynamic Query String = ' + queryStr);
                    List<sObject> lst = Database.query(queryStr);
                    system.debug('Dynamic Query Results = ' + lst);

                    //take the list of sobjects, convert them into a list of generic maps that can be used by the datatable and can 
                    //include the relationship name as an extra column


                    if (lst.size() > 0)
                    {
                        for (sObject item : lst)
                        {
                            System.debug('Object Item Info = ' + item);
                            Map<String,String> tableValues = new Map <String, String>();
                            tableValues.put('Id',item.id);
                            System.debug ('Object Item Name = ' + item.get('Name') + ' - ' + item.get('Name'));
                            
                            String nameString = (String)item.get('Name');
                            tableValues.put('Name', nameString);
                            tableValues.put('Relationship',dfield.getRelationshipName() );
                            tableValues.put('UrlName' , URL.getSalesforceBaseUrl().toExternalForm() + '/' + item.id);
                            System.debug('TableValues = ' + tableValues);
                            
                            mapresults.add(tableValues);
                        }
                        
                        results.addAll(lst);
                    }
                        
                }
                }
            //system.debug(string.valueOf(dfield.Name) + ' = ' + fldType);
            }
}


        //query the related records using each of those relationship fields
        //combine them all into one list


        //String queryStr = 'SELECT Id, Name FROM ' + relatedObjectName + ' WHERE Id = ' + searchKey;


        
        //List<Contact> lst = new List<Contact>([SELECT Id, Name FROM Contact WHERE Accountid = :searchKey ]);
        //return lst;
        //return results;
    return mapresults;
    }

    
}
