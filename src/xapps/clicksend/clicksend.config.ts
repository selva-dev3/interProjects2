// clicksend.config.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONFIGURATION FILE.
// DO NOT modify the sections labeled "AUTO-GENERATED".
//
// Copyright (c) 2025 Smackcoders. All rights reserved.
// This file is subject to the Smackcoders Proprietary License.
// Unauthorized copying or distribution is strictly prohibited.
// -----------------------------------------------------------------------------
import { clickSendController } from './clicksend.controller';
export const redirect = 'https://workflow.xapplets.com/exit';

export const XappName = 'ClickSend';
export const modules = [
  {
    module: 'accounts',
    actions: ['get'],
    triggers: [],
  },
  {
    module: 'lists',
    actions: ['create', 'update', 'get', 'getMany', 'delete'],
    triggers: [],
  },
  {
    module: 'contacts',
    actions: ['create', 'update', 'get', 'delete'],
    triggers: [],
  },
  //SMS MODULE IN CREATE ,GETMANT HISTORY ,AND CANCELALL ARE AVAILABLE ONLY
  {
    module: 'sms',
    actions: ['create', 'update', 'get', 'getMany', 'delete'],
    triggers: [],
  },
  // SMS-CAMPAIGN MODULE IN CREATE ,GET,GETMANY HISTORY ARE AVAILABLE
  {
    module: 'sms-campaign',
    actions: ['create', 'update', 'get', 'getMany', 'delete'],
    triggers: [],
  },
  // MMS MODULE ARE NOT SUPPORT IN INDIA
  {
    module: 'mms',
    actions: ['create', 'getMany'],
    triggers: [],
  },
  // MMS-CAMPAIGN MODULE IN CREATE ,GET,GETMANY HISTORY ARE AVAILABLE
  {
    module: 'mms-campaign',
    actions: ['create', 'update', 'get', 'getMany', 'delete'],
    triggers: [],
  },
  // FAX MODULE ARE PAYMENT REQUIRED
  {
    module: 'fax',
    actions: ['create', 'get', 'getMany'],
    triggers: [],
  },
  // VOICE MODULE ARE CREATE ,GETMANY HISTORY AND CANCELALL AVAILABLE
  {
    module: 'voice',
    actions: ['create', 'get', 'getMany', 'delete'],
    triggers: [],
  },
  //POSTCARD MODULE ARE PAYMENT REQUIRED
  {
    module: 'postcard',
    actions: ['create', 'getMany', 'delete'],
    triggers: [],
  },
  // LETTERS MODULE ARE PAYMENT REQUIRED
  {
    module: 'letters',
    actions: ['create', 'getMany', 'delete'],
    triggers: [],
  },
];

export default {
  XappName,
  modules,
};

//CONTACT MODULE
export const createAndUpdateContactFields = [
  {
    displayName: 'First Name',
    name: 'first_name',
    type: 'string',
    required: false,
    description: 'First name of the recipient.',
    options: [],
    item: [],
  },
  {
    displayName: 'Last Name',
    name: 'last_name',
    type: 'string',
    required: false,
    description: 'Last name of the recipient.',
    options: [],
    item: [],
  },
  {
    displayName: 'Custom 1',
    name: 'custom_1',
    type: 'string',
    required: false,
    description: 'Custom field 1.',
    options: [],
    item: [],
  },
  {
    displayName: 'Custom 2',
    name: 'custom_2',
    type: 'string',
    required: false,
    description: 'Custom field 2.',
    options: [],
    item: [],
  },
  {
    displayName: 'Custom 3',
    name: 'custom_3',
    type: 'string',
    required: false,
    description: 'Custom field 3.',
    options: [],
    item: [],
  },
  {
    displayName: 'Custom 4',
    name: 'custom_4',
    type: 'string',
    required: false,
    description: 'Custom field 4.',
    options: [],
    item: [],
  },
  {
    displayName: 'Fax Number',
    name: 'fax_number',
    type: 'string',
    required: false,
    description: "Recipient's fax number.",
    options: [],
    item: [],
  },
  {
    displayName: 'Organization Name',
    name: 'organization_name',
    type: 'string',
    required: false,
    description: "Name of the recipient's organization.",
    options: [],
    item: [],
  },
  {
    displayName: 'Email',
    name: 'email',
    type: 'string',
    required: false,
    description: 'Email of the recipient.',
    options: [],
    item: [],
  },
  {
    displayName: 'Address Line 1',
    name: 'address_line_1',
    type: 'string',
    required: false,
    description: 'Street address line 1.',
    options: [],
    item: [],
  },
  {
    displayName: 'Address Line 2',
    name: 'address_line_2',
    type: 'string',
    required: false,
    description: 'Street address line 2.',
    options: [],
    item: [],
  },
  {
    displayName: 'City',
    name: 'address_city',
    type: 'string',
    required: false,
    description: 'City name.',
    options: [],
    item: [],
  },
  {
    displayName: 'State',
    name: 'address_state',
    type: 'string',
    required: false,
    description: 'State or province.',
    options: [],
    item: [],
  },
  {
    displayName: 'Postal Code',
    name: 'address_postal_code',
    type: 'string',
    required: false,
    description: 'ZIP or postal code.',
    options: [],
    item: [],
  },
  {
    displayName: 'Country',
    name: 'address_country',
    type: 'string',
    required: false,
    description: 'Country code (e.g., US).',
    options: [],
    item: [],
  },
];

//SMS-CAMPAIGN MODULE
export const getmanySmsCampaignfields = [
  {
    displayName: 'Page',
    name: 'page',
    type: 'number',
    required: false,
    description: 'The page number to retrieve. Default is 1.',
    options: [],
    item: [],
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    required: false,
    description: 'Number of items per page. Range: 15–100. Default is 15.',
    options: [],
    item: [],
  },
  {
    displayName: 'Query',
    name: 'q',
    type: 'string',
    required: false,
    description:
      'Filter results using field_name:value. Example: status:Scheduled.',
    options: [],
    item: [],
  },
  {
    displayName: 'Order By',
    name: 'order_by',
    type: 'string',
    required: false,
    description:
      'Sort the results. Format: field:direction. Example: schedule:desc.',
    options: [],
    item: [],
  },
  {
    displayName: 'Date From',
    name: 'date_from',
    type: 'number',
    required: false,
    description: 'Start date in Unix timestamp format.',
    options: [],
    item: [],
  },
  {
    displayName: 'Date To',
    name: 'date_to',
    type: 'number',
    required: false,
    description: 'End date in Unix timestamp format.',
    options: [],
    item: [],
  },
];

//VOICE MODULE
export const createVoiceFields = [
  {
    displayName: 'Source',
    name: 'source',
    type: 'string',
    required: false,
    description: 'Source of the message (e.g., php, api, etc).',
    options: [],
    item: [],
  },
  {
    displayName: 'Body',
    name: 'body',
    type: 'string',
    required: false,
    description: 'Content of the voice message.',
    options: [],
    item: [],
  },
  {
    displayName: 'To',
    name: 'to',
    type: 'string',
    required: false,
    description: "Recipient's phone number.",
    options: [],
    item: [],
  },
  {
    displayName: 'Language',
    name: 'lang',
    type: 'string',
    required: false,
    description: 'Language of the voice (e.g., en-au, en-us).',
    options: [],
    item: [],
  },
  {
    displayName: 'Schedule',
    name: 'schedule',
    type: 'number',
    required: false,
    description: 'Scheduled time to send the voice message (Unix timestamp).',
    options: [],
    item: [],
  },
  {
    displayName: 'Custom String',
    name: 'custom_string',
    type: 'string',
    required: false,
    description: 'A custom reference string for this voice message.',
    options: [],
    item: [],
  },
  {
    displayName: 'Require Input',
    name: 'require_input',
    type: 'number',
    required: false,
    description: 'Set to 1 to require input from the recipient.',
    options: [],
    item: [],
  },
  {
    displayName: 'Machine Detection',
    name: 'machine_detection',
    type: 'number',
    required: false,
    description: 'Set to 1 to enable answering machine detection.',
    options: [],
    item: [],
  },
];

export const getManyVoiceFields = [
  {
    displayName: 'Date To',
    name: 'date_to',
    type: 'string',
    required: false,
    description: 'End date to filter results (string format).',
    options: [],
    item: [],
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    required: false,
    description: 'Maximum number of items to return. Example: 20.',
    options: [],
    item: [],
  },
  {
    displayName: 'Operator',
    name: 'operator',
    type: 'string',
    required: false,
    description: 'Logical operator used in query (e.g., AND, OR).',
    options: [],
    item: [],
  },
  {
    displayName: 'Order By',
    name: 'order_by',
    type: 'string',
    required: false,
    description: 'Field and direction to sort by. Example: date_added:desc.',
    options: [],
    item: [],
  },
  {
    displayName: 'Page',
    name: 'page',
    type: 'number',
    required: false,
    description: 'Page number to retrieve. Example: 1.',
    options: [],
    item: [],
  },
];
export const fields = [
  //LISTS MODULE
  {
    displayName: 'Lists Name',
    name: 'list_name',
    type: 'string',
    required: true,
    description: 'Name of the Lists',
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ['list'],
        name: ['create', 'update'],
      },
    },
  },
  {
    displayName: 'Lists ID',
    name: 'Id',
    type: 'string',
    required: true,
    description: "Provide List's ID for actions.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ['list'],
        name: ['get', 'update', 'delete'],
      },
    },
  },
  {
    displayName: 'Return All',
    name: 'returnALl',
    type: 'boolean',
    palceholder: 'Return All',
    default: {},
    items: [],
    required: false,
    options: [],
    async init(data) {
      try {
        const list = await clickSendController.getAllLists(data);
        this.options = list;
      } catch (error) {
        return { 'Error occurred': error };
      }
    },
    displayOptions: {
      show: {
        category: ['list', 'contacts'],
        name: ['getMany', 'create'],
      },
    },
  },

  // CONTACT MODULE
  {
    displayName: 'Phone Number',
    name: 'phone_number',
    type: 'string',
    required: true,
    description: 'Phone Number of Contact',
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ['contact'],
        name: ['create', 'update'],
      },
    },
  },
  {
    displayName: 'Contacts ID',
    name: 'Id',
    type: 'string',
    required: true,
    description: "Provide Contacts's ID for actions.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ['contacr'],
        name: ['get', 'update', 'delete'],
      },
    },
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    palceholder: 'Add Fields',
    default: {},
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ['contact'],
        name: ['create', 'update'],
      },
    },
    fields: createAndUpdateContactFields,
  },

  //SMS MODULE
  {
    displayName: 'Source',
    name: 'messages||source',
    type: 'string',
    required: true,
    description: 'Source of the message (e.g., php, api, etc).',
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ['sms'],
        name: ['create'],
      },
    },
  },
  {
    displayName: 'To',
    name: 'messages||to',
    type: 'string',
    required: true,
    description: 'Recipient phone number.',
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ['sms'],
        name: ['create'],
      },
    },
  },
  {
    displayName: 'Body',
    name: 'messages||body',
    type: 'string',
    required: true,
    description: 'Content of the message.',
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ['sms'],
        name: ['create'],
      },
    },
  },

  // SMS-CAMPAIGN MODULE
  {
    displayName: 'Lists ID',
    name: 'list_id',
    type: 'dropdown',
    required: true,
    description: "Provide List's ID for actions.",
    options: [],
    item: [],
    async init(data) {
      try {
        const list = await clickSendController.getAllLists(data);
        this.options = list;
      } catch (error) {
        return { 'Error occurred': error };
      }
    },
    displayOptions: {
      show: {
        category: ['sms-campaign'],
        name: ['create'],
      },
    },
  },
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    description: 'Name of the campaign.',
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ['sms-campaign'],
        name: ['create'],
      },
    },
  },
  {
    displayName: 'Body',
    name: 'body',
    type: 'string',
    required: true,
    description: 'Content of the campaign message.',
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ['sms-campaign'],
        name: ['create'],
      },
    },
  },
  {
    displayName: 'Sms-Campaign ID',
    name: 'Id',
    type: 'string',
    required: true,
    description: "Provide Sms Campaign's ID for actions.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ['sms-campaign'],
        name: ['get'],
      },
    },
  },
  {
    displayName: 'Return All',
    name: 'returnALl',
    type: 'boolean',
    palceholder: 'Return All',
    default: {},
    items: [],
    required: false,
    options: [],

    displayOptions: {
      show: {
        category: ['sms-campaign'],
        name: ['getMany'],
      },
    },

    fields: getmanySmsCampaignfields,
  },

  //MMS CAMPAIGN MODULE
  {
    displayName: 'Media File',
    name: 'media_file',
    type: 'string',
    required: true,
    description: 'URL to the media file (e.g., image or GIF).',
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ['mms-campaign'],
        name: ['create'],
      },
    },
  },

  {
    displayName: 'List ID',
    name: 'list_id',
    type: 'dropdown',
    required: true,
    description: 'ID of the contact list used in the campaign.',
    options: [],
    async init(data) {
      try {
        const list = await clickSendController.getAllLists(data);
        this.options = list;
      } catch (error) {
        return { 'Error occurred': error };
      }
    },
    item: [],
    displayOptions: {
      show: {
        category: ['mms-campaign'],
        name: ['create'],
      },
    },
  },

  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    description: 'Name of the campaign.',
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ['mms-campaign'],
        name: ['create'],
      },
    },
  },

  {
    displayName: 'From',
    name: 'from',
    type: 'string',
    required: true,
    description: 'Sender phone number.',
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ['mms-campaign'],
        name: ['create'],
      },
    },
  },
  {
    displayName: 'Body',
    name: 'body',
    type: 'string',
    required: true,
    description: 'Content of the campaign message.',
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ['mms-campaign'],
        name: ['create'],
      },
    },
  },
  {
    displayName: 'Schedule',
    name: 'schedule',
    type: 'number',
    required: true,
    description: 'Scheduled time to send the message (Unix timestamp).',
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ['mms-campaign'],
        name: ['create'],
      },
    },
  },
  {
    displayName: 'Subject',
    name: 'subject',
    type: 'string',
    required: true,
    description: 'Subject line of the campaign (optional, if supported).',
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ['mms-campaign'],
        name: ['create'],
      },
    },
  },

  {
    displayName: 'Mms-Campaign ID',
    name: 'Id',
    type: 'string',
    required: true,
    description: "Provide mms Campaign's ID for actions.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ['mms-campaign'],
        name: ['get'],
      },
    },
  },
  {
    displayName: 'Return All',
    name: 'returnALl',
    type: 'boolean',
    palceholder: 'Return All',
    default: {},
    items: [],
    required: false,
    options: [],

    displayOptions: {
      show: {
        category: ['mms-campaign'],
        name: ['getMany'],
      },
    },
  },
  //VOICE MODULE
  {
    displayName: 'Voice',
    name: 'voice',
    type: 'string',
    required: true,
    description: 'Voice type used (male or female).',
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ['voice'],
        name: ['create'],
      },
    },
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    palceholder: 'Add Fields',
    default: {},
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ['voice'],
        name: ['create'],
      },
    },
    fields: createVoiceFields,
  },

  {
    displayName: 'Return All',
    name: 'returnALl',
    type: 'boolean',
    palceholder: 'Return All',
    default: {},
    items: [],
    required: false,
    options: [],

    displayOptions: {
      show: {
        category: ['voice'],
        name: ['getMany'],
      },
    },
    fields: getManyVoiceFields,
  },
];
