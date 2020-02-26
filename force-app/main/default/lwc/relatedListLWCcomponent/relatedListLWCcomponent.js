import { LightningElement, track, wire, api } from 'lwc';
//import fetchDataHelper from './fetchDataHelper';
//import findContacts from '@salesforce/apex/accountRelatedContacts.getContacts';
import  getRelatedRecords from '@salesforce/apex/comboRelatedListController.getRelatedRecords';
import  { getObjectInfo } from 'lightning/uiObjectInfoApi';
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

//maps the salesforce sobject field datatypes to the available LWC datatable column types
const fieldTypes = {Address : 'text', Boolean : 'boolean', ComboBox : 'text', Currency : 'currency', Date : 'date-local',
                    DateTime : 'date', Double : 'number', Email : 'email', EncryptedString : 'string', Int : 'number', Location : 'location',
                    MultiPicklist : 'text', Percent : 'percent', Phone : 'phone', Picklist : 'text', Reference : 'text', String : 'text',
                    TextArea : 'text', Time : 'text', Url : 'url'};


var columns = [];


export default class RelatedListLWCcomponent extends LightningElement {
    @track data = [];
    @track displayRows = [];
    @track columns = columns;
    @track searchKey = '';
    @track relatedObjectName = '';
    @track pageSize = 5;
    @track pageNumber = 1;
    @track footerText = 'Show 5 more';
    //@track moreRecordsToShow = false;
    @api recordId;
    @api chosenObject;
    @api objectApiName;
    @api columnFields;
    @api urlField;
    @api includeRelationshipName;

    

    @wire(getObjectInfo, { objectApiName: '$chosenObject' })
    objectInfo({ data, error }) {
        if (data) this.handleColumns(data);
        else console.log('Error: Could not retrieve the field labels for the child object');
    }

    //@wire(getIconName, { sObjectName : '$relatedObjectName'}) iconName;

    @wire(getRelatedRecords, { searchKey: '$searchKey', objectName: '$objectApiName', relatedObjectName: '$relatedObjectName', columnFields: '$columnFields', urlField: '$urlField',
                                pageSize : 100, pageNumber : 1})
    relatedRecords ({ data, error}){
        if (data) {
            console.log('Next item will show related records data retrieved:');
            console.log(data);
            this.data = data;
            this.handlePageChange();
        }
        
        else 
        {
        this.data = [];
        console.log ('Error: could not retrieve any row data');
        }
    }
    
    showMore() {
        this.pageSize += 5;
        this.handlePageChange();
    }

    handleColumns(theObjectInfo) {
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
                if(fieldTypes.hasOwnProperty(theObjectInfo.fields[columnArray[x]].dataType))
                {
                    var theColumnDefinition = {
                        label : theObjectInfo.fields[columnArray[x]].label,  //columnArray[x],
                        fieldName : columnArray[x],
                        type : fieldTypes[theObjectInfo.fields[columnArray[x]].dataType]//'text'
                    };
                    columns2.push(theColumnDefinition);
                }
            }
            if (this.includeRelationshipName)
            {
                var theColumnDefinition = {
                    label : 'Relationship',
                    fieldName : 'Relationship',
                    type : 'text' //'text'
                };
                columns2.push(theColumnDefinition);
            }
        }
        //console.log(columns2);
        //console.log(this.relatedRecords);
        this.columns = columns2;
    }//end handleColumns

    handleChange(event) {
        const field = event.target.name;
        if (field === 'pageSize') {
            this.pageSize = event.target.value;
            this.footerText = 'New page size is ' + this.pageSize.toString();
            console.log('pageSize Changed');
            this.handlePageChange();
        }
        else
        console.log('something changed but it was not pageSize.  it was ' + field);
    }

    handlePageChange() {
        //totalPages = data.length() / this.pageSize;
        console.log('Handling page change.');
        console.log(this.displayRows);
        console.log(this.data);
        console.log(this.pageNumber);
        console.log(this.pageSize);
        console.log((this.pageNumber - 1) * this.pageSize);
        console.log('Attempting to update display rows');
        this.displayRows = this.data.slice((this.pageNumber - 1) * this.pageSize, this.pageSize);
        console.log(this.displayRows);
        //this.displayRows = data.slice()
        this.checkMoreRecordsToShow();
    }

    checkMoreRecordsToShow() {
        console.log('Checking for more records to show...');
        console.log(this.data);
        console.log(this.data.length);
        /*
        if(this.data.length > this.pageSize)
        this.moreRecordsToShow = true;
        else
        this.moreRecordsToShow = false;
        */
        console.log('MOre records to show is ....' + this.moreRecordsToShow);
    }

    get  moreRecordsToShow(){
        if(this.data.length > this.pageSize)
        {
            console.log('returend true for more records to show this.pageSize');
        return true;
        }
        else
        return false;

    }

    get componentTitle(){
        var recordCount = 0;
        if(this.data)
        recordCount = this.data.length;
        
        return (this.chosenObject + ' (' + recordCount + ')');
    }
    /*
    get pageSize() {
        return $this.pageSize;
    }
*/
    connectedCallback() {
        this.searchKey = this.recordId;
        this.relatedObjectName = this.chosenObject;
        //this.handleColumns();
    }

    //TODO
    //Add handling of count of records / pagination --partly complete.  Need to clean up/ set max limits
    //Fix Icon and header formatting
    //DONE Make the field type match the actual datatype instead of always String
    //Create test classes
    //Add error handling
    //Add attribute checkbox to optionally include relationship name as a column
    //DONE (though perhaps fragile) Replace column labels with the field label instead of the api name
    //Add handling to ensure a reasonable number of max columns
    //enbale column sorting options



    
}

