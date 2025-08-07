// zohosheet.config.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONFIGURATION FILE.
// DO NOT modify the sections labeled "AUTO-GENERATED".
//
// Copyright (c) 2025 Smackcoders. All rights reserved.
// This file is subject to the Smackcoders Proprietary License.
// Unauthorized copying or distribution is strictly prohibited.

import { zohosheets } from "./zohosheets.controller";

// -----------------------------------------------------------------------------
export const redirect =  "https://workflow.xapplets.com/exit";

export const XappName = "zohosheet";
export const modules = [
  {
    "module": "worksheet",
    "actions": [
      "create",
      "getmany",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "row",
    "actions": [
      "create",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "records",
    "actions": [
      "create",
      "get",
      "update",
      "delete"
    ],
    "triggers": []
  }
];
export const fields = [
  
  {
    displayName: 'Workbook Name',
    name: 'workbook_name',
    type: 'string',
    default: '',
    items:[],
    required: true,
    description: 'The name of the Zoho workbook.',
    displayOptions: {
      show: {
        category: ['spreadsheet'],
        name: ['create'],
      },
    },
  },

  {
    displayName: 'Resource ID',
    name: 'resourceId',
    type: 'dropdown',
    default: '',
    items:[],
    options:[],
    async init(id) {
      try {
      const options = await zohosheets.getAllSpreadSheet(id)
      this.options = options;
      } catch (error) {
        console.log("Error:", error);
      }
    },
    required: true,
    description: 'The Zoho Sheet resource ID.',
    displayOptions: {
      show: {
        category: ['worksheet', 'row', 'records'],
        name: ['create', 'getmany', 'delete', 'recordsCreate', 'recordsDelete', 'recordsUpdate'],
      },
    },
  },

  {
    displayName: 'Worksheet Name',
    name: 'worksheetName',
    type: 'dropdown',
    default: '',
    items:[],
    options:[],
    async init(id) {
      try {
      const options = await zohosheets.getAllworksheet(id)
      this.options = options;
      } catch (error) {
        console.log("Error:", error);
      }
    },
    required: true,
    description: 'The worksheet name within the workbook.',
    displayOptions: {
      show: {
        category: ['row', 'records'],
        name: ['create', 'delete', 'recordsCreate', 'recordsDelete', 'recordsgetmany', 'recordsUpdate'],
      },
    },
  },


  {
    displayName: 'Row Number',
    name: 'row',
    type: 'number',
    default: 1,
    items:[],
    required: true,
    description: 'Row number to insert or delete.',
    displayOptions: {
      show: {
        category: ['row'],
        name: ['create', 'delete'],
      },
    },
  },



  {
    displayName: 'Records',
    name: 'records',
    type: 'string',
    default: '',
    required: true,
    items:[],
    description: 'An array of records (objects with key-value pairs matching column names).',
    displayOptions: {
      show: {
        category: ['records'],
        name: ['create', 'update'],
      },
    },
  },

  {
    displayName: 'Header Row',
    name: 'headerRow',
    type: 'number',
    default: 1,
    items:[],
    description: 'Row number that defines the headers.',
    displayOptions: {
      show: {
        category: ['records'],
        name: ['create', 'update'],
      },
    },
  },

  {
    displayName: 'Criteria',
    name: 'criteria',
    type: 'string',
    default: '',
    required: true,
    items:[],
    description: 'Filter condition to match specific rows for deletion or update.',
    displayOptions: {
      show: {
        category: ['records'],
        name: ['create', 'update'],
      },
    },
  },

 
];



export default {
  XappName,
  modules,
};