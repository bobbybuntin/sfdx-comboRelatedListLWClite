public with sharing class comboRelatedListController {
    public List<Contact> contactList {get;set;}
    public comboRelatedListController (){
        this.contactList = new List<Contact>();//not used just placeholder for the constructor
    }

    @AuraEnabled(cacheable=true)
    //public static list<Map<String, String>> getRelatedRecords(string searchKey, string objectName, string relatedObjectName, 
      //  string columnFields, string urlField)
        public static Map<String, Object> getRelatedRecords(string searchKey, string objectName, string relatedObjectName, 
        string columnFields, string urlField, String pageSize, String pageNumber)
    {
            List<sObject> results = new List<sObject>();
            //List<Map<String, String>> mapresults = new List<Map<String, String>>();
            List<Map<String, Object>> mapresults = new List<Map<String, Object>>();
            String queryFields = '';
            String queryWhereClause = '';
            Integer queryLimit = 1000;
            Integer totalRecordCount = 0;
            String queryLimitClause = String.valueOf(queryLimit);  //this is the default limit on number of records returned per child relationship
            List<String> lookupRelationshipFieldList = new List<String>();
            Boolean relationshipChildRecordsOverLimitWarning = false;


            //find the relationship fields in the related object
            map<string, Map<String, Schema.SObjectField>> objectFieldsMap = new map<string, Map<String, Schema.SObjectField>>(); //Object field schema map
            
            
            Map<String, Schema.SObjectField> objectFields
                                    = Schema.getGlobalDescribe().get(relatedObjectName).getDescribe().fields.getMap();
            
            //columnFields = columnFields.deleteWhitespace();
            
            List<String> columnsList = columnFields.deleteWhitespace().split(',');
            columnsList.addAll(urlField.deleteWhitespace().split(','));

            for(Schema.SobjectField fld :objectFields.values())
            {
                //confirm that fields in the objectFields actually exist in the object, and if so,
                //add to the query fields used to build the SOQL query for the related records.
                if (columnsList.contains(fld.getDescribe().getName()))
                {
                    System.Debug('Field ' + fld.getDescribe().getName() + ' is in columns list');
                    if (!String.isBlank(queryFields))
                    {
                        queryFields += ', ';
                    }
                    queryFields += (String)fld.getDescribe().getName();
                }
            }

                                    
            for(Schema.SObjectField fld :objectFields.values())
            {
            //Find all lookup relationship fields on the child object
                schema.describeFieldResult dfield = fld.getDescribe();
            
                string fldType = string.valueOf(dfield.getType());   
                    if (fldType == 'REFERENCE')
                    { // Lookup field!
                        for (Schema.SobjectType reference : dfield.getReferenceTo())
                        {
                            if(reference.getDescribe().getName() == objectName) 
                            {
                               
                               
                                lookupRelationshipFieldList.add(dfield.getName());
                               
                                /* *********   This  logic needs to move outside of the FOR loop to only run
                                a single query to capture all the related child records
                                */
                                
                                
                               
                                /*      End of the logic that needs to move outside the for loop. */
                            }
                        }
                    }
            }//end for loop of child object fields describe

            for(String lu : lookupRelationshipFieldList)
            {
                //Build the WHERE clause of the child records query
                queryWhereClause = lu + ' = \'' + String.escapeSingleQuotes(searchKey) + '\'';
                //queryLimitClause = Integer.valueOf(pageSize) + ' OFFSET '  + (Integer.valueOf(pageSize)*(Integer.valueOf(pageNumber )-1));//can be used for server side pagination
                String queryStr = 'SELECT id, ' + queryFields + ' FROM ' + relatedObjectName + ' WHERE ' + queryWhereClause + ' LIMIT ' + queryLimitClause;
                System.Debug('Query string = ' + queryStr);
                List<sObject> lst = Database.query(queryStr);

                String countQueryStr = 'SELECT count() FROM ' + relatedObjectName + ' WHERE ' + queryWhereClause;
                Integer theRecordCount = Database.countQuery(countQueryStr);

                totalRecordCount += theRecordCount;

                If (theRecordCount > queryLimit)
                    relationshipChildRecordsOverLimitWarning = true;  //need to include over query limit warning in the results payload


                if (lst.size() > 0)
                {
                    for (sObject item : lst)
                    {

                        //Map<String,String> tableValues = new Map <String, String>();
                        Map<String,Object> tableValues = new Map <String, Object>();
                        tableValues.put('Id',item.id);
                        //take the list of sobjects, convert them into a list of generic maps that can be used by the datatable and can 
                        //include the relationship name as an extra column                       
                        //String nameString = (String)item.get('Name'); //doesn't work on case object because there is no name field
                        for (String itemName : columnsList)
                        {
                            //tableValues.put(itemName, String.valueOf(item.get(itemName)));
                            tableValues.put(itemName, item.get(itemName));
                            System.Debug('String value of item = ' + String.valueOf(item.get(itemName)));
                        }
                        tableValues.put('Relationship',lu);
                        tableValues.put('UrlName' , URL.getSalesforceBaseUrl().toExternalForm() + '/' + item.id);

                        mapresults.add(tableValues);
                    }
                    //results.addAll(lst);
                }
            }
            //*************************************    Component Warning Messages     ******************************* */
            //testing out adding of other messages to the mapresults payload to be extracted in the component
            List<String> componentMessages = new List<String>();

            if(relationshipChildRecordsOverLimitWarning)
                componentMessages.add('There are too many related records to show all of them in this list.');
            //mapresults.add(componentMessages);
            //-------------------------------------------------------------------



            Map<String,Object> resultsPayload = new Map<String, Object>();
            resultsPayload.put('recordsList', mapresults);
            resultsPayload.put('componentWarnings',componentMessages);
            resultsPayload.put('totalRecordCount', totalRecordCount);
            return resultsPayload;
            //System.Debug('Map results = ' + mapresults);
            //return mapresults;
    }//end of getRelatedRecords method

    
}
