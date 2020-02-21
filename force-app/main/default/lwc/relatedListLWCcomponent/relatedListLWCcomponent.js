import { LightningElement, track, wire, api } from 'lwc';
//import fetchDataHelper from './fetchDataHelper';
//import findContacts from '@salesforce/apex/accountRelatedContacts.getContacts';
import getRelatedRecords from '@salesforce/apex/comboRelatedListController.getRelatedRecords';
//import getIconName from '@salesforce/apex/accountRelatedContacts.getContacts';
 
// Datatable Columns
const columns = [
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

    //@wire(getIconName, { sObjectName : '$relatedObjectName'}) iconName;

    @wire(getRelatedRecords, { searchKey: '$searchKey', objectName: '$objectApiName', relatedObjectName: '$relatedObjectName', columnFields: '$columnFields', urlField: '$urlField'})
    relatedRecords;
    /*
    contacts(result)
    {
        const { data, error } = result;
        if(data) {
            let nameUrl;
            this.contacts = data.map(row => { 
                nameUrl = `/${row.Id}`;
                return {...row , nameUrl} 
            })
            this.error = null;
        }
        if(error) {
            this.error = error;
            this.contacts = [];
        }
    }
    */

    connectedCallback() {
        this.searchKey = this.recordId;
        this.relatedObjectName = this.chosenObject;
        //this.chosenObject = this.recordId;
    }

    
}

