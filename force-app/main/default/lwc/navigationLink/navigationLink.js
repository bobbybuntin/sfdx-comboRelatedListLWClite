// *********************************************************************
// ** NavigationLink
// *********************************************************************
// ** Written by: Paul J. Narsavage <NarsavageP@dnb.com>
// ** Date: Mar 28, 2019
// ** Purpose: Generates a navigation link using parameters passed to the component
// ** Reference: https://developer.salesforce.com/docs/component-library/documentation/lwc/use_navigate
// **********************************************************************

/*
    <c-navigation-link 
        label="The Label" 
        title="The Title" 
        type="PageReferenceType" 
        record-id="RecordId"
        api-name="ApiName"
        object-api-name="ObjectApiName"
        relationship-api-name="RelationshipApiName"
        page-name="PageName" 
        action-name="ActionName"></c-record-link>
*/

import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class NavigationLink extends NavigationMixin(LightningElement) {
    @api label; // Text to be displayed as the link
    @api title; // Text to be displayed when hovering on the link (optional, will default to label)

    @api type;               // PageReference Type (default of "standard__recordPage" if recordId provided) 
    @api recordId;           // Id of the record
    @api pageName;           // The name of the Page
    @api apiName;            // API Name of Page
    @api objectApiName;      // Object type
    @api relationshipApiName // The API Name of Relationship to open
    @api actionName;         // Action to perform when clicked (default of "view" if recordId provided)

    @track url;

    connectedCallback() {

        // Set defaults...
        if (!this.title) this.title = this.label;
        if (this.recordId) {
            if (!this.type) this.type = "standard__recordPage";
            if (!this.actionName) this.actionName = 'view';
        }

        // Generate the page reference for NavigationMixin...
        this.navigationLinkRef = {
            type: this.type,
            attributes: {
                recordId: this.recordId,
                pageName: this.pageName,
                apiName: this.opiName,
                objectApiName: this.objectApiName,
                relationshipApiName: this.relationshipApiName,
                actionName: this.actionName
            }
        };

        // Set the link's HREF value so the user can click "open in new tab" or copy the link...
        this[NavigationMixin.GenerateUrl](this.navigationLinkRef)
            .then((url) => { this.url = url });

    }

    handleClick(event) {

        // Stop the event's default behavior (don't follow the HREF link) and prevent click bubbling up in the DOM...
        event.preventDefault();
        event.stopPropagation();

        // Navigate as requested...        
        this[NavigationMixin.Navigate](this.navigationLinkRef);

    }

}