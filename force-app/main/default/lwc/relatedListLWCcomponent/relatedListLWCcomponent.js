import { LightningElement, track, wire, api } from 'lwc';
//import fetchDataHelper from './fetchDataHelper';
//import findContacts from '@salesforce/apex/accountRelatedContacts.getContacts';
import getRelatedRecords from '@salesforce/apex/comboRelatedListController.getRelatedRecords';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
//import getColumns from '@salesforce/apex/comboRelatedListController.getColumns';
//import getIconName from '@salesforce/apex/accountRelatedContacts.getContacts';
 
// Datatable Columns
/*const columns = [
    {
        label: 'Name',
        fieldName: 'UrlName',
        type: 'url',

        typeAttributes: {label: {fieldName: 'Name'},
        target: '_self'},
        sortable: true
    }, {
        label: 'LastName',
        fieldName: 'LastName',
        type: 'text'
    }, {
        label: 'FirstName',
        fieldName: 'FirstName',
        type: 'text'
    }
];
*/
var columns = [];


export default class RelatedListLWCcomponent extends LightningElement {
    @track data = [];
    @track columns = columns;
    @track searchKey = '';
    @track relatedObjectName = '';
    @api recordId;
    @api chosenObject;
    @api objectApiName;
    @api columnFields;
    @api urlField;

    @wire(getObjectInfo, { objectApiName: '$chosenObject' })
    objectInfo;

    //@wire(getIconName, { sObjectName : '$relatedObjectName'}) iconName;

    @wire(getRelatedRecords, { searchKey: '$searchKey', objectName: '$objectApiName', relatedObjectName: '$relatedObjectName', columnFields: '$columnFields', urlField: '$urlField'})
    relatedRecords;

    handleColumns() {
        var columnArray = this.columnFields.split(',').map(item => item.trim());
        var urlColumnsArray = this.urlField.split(',').map(item => item.trim());

        var columns2 = [];

        if(urlColumnsArray.length > 0)
        {
            for (var x in urlColumnsArray)
            {
                var theColumnDefinition = {
                    label: urlColumnsArray[x],
                    fieldName: 'UrlName',
                    type: 'url',

                    typeAttributes: {label: {fieldName: urlColumnsArray[x]},
                    target: '_self'},
                    sortable: true
                };
                columns2.push(theColumnDefinition);
            }
        }

        if(columnArray.length > 0)
        {
            for (var x in columnArray)
            {
                var theColumnDefinition = {
                    label : columnArray[x],
                    fieldName : columnArray[x],
                    type : 'text'
                };
                columns2.push(theColumnDefinition);
            }
        }
        console.log(columns2);
        console.log(this.relatedRecords);
        this.columns = columns2;
    }


    connectedCallback() {
        this.searchKey = this.recordId;
        this.relatedObjectName = this.chosenObject;
        this.handleColumns();
    }

    //TODO
    //Add handling of count of records / pagination
    //Fix Icon and header formatting
    //Make the field type match the actual datatype instead of always String
    //Create test classes
    //Add error handling
    //Add attribute checkbox to optionally include relationship name as a column
    //Replace column labels with the field label instead of the api name
    //Add handling to ensure a reasonable number of max columns
    //enbale column sorting options


    
}

