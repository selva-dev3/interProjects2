// piwikpro.config.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONFIGURATION FILE.
// DO NOT modify the sections labeled "AUTO-GENERATED".
//
// Copyright (c) 2025 Smackcoders. All rights reserved.
// This file is subject to the Smackcoders Proprietary License.
// Unauthorized copying or distribution is strictly prohibited.
// -----------------------------------------------------------------------------
import { piwikProController, PiwikproController } from "./piwikpro.controller";
export const XappName = "piwikpro";
export const modules = [
  {
    "module": "usergroup",
    "actions": [
      "create",
      "get",
      "update",
      "getMany",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "user",
    "actions": [
      "create",
      "get",
      "getMany",
      "update",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "app",
    "actions": [
      "create",
      "get",
      "getMany",
      "update",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "metasite",
    "actions": [
      "create",
      "get",
      "getMany",
      "update",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "metasiteapp",
    "actions": [
      "create",
      "get",
      "getMany",
      "update",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "usergrouppermissionforapp",
    "actions": [
      "create",
      "get"
    ],
    "triggers": []
  },
  {
    "module": "usergrouppermissionformetasite",
    "actions": [
      "create",
      "get"
    ],
    "triggers": []
  },
  {
    "module": "globalaction",
    "actions": [
      "get"
    ],
    "triggers": []
  },
  {
    "module": "userwithaction",
    "actions": [
      "get"
    ],
    "triggers": []
  }
];

export default {
  XappName,
  modules,
};



// USERGROUP MODULE
export const getManyUserGroupsFields = [
  {
    displayName: "Search",
    name: "search",
    type: "string",
    description: "Search phrase - search for user group name, ID or external ID.",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Sort",
    name: "sort",
    type: "string",
    description: "Sort field - can be reversed by adding dash before field name e.g (-name). Defaults to name.",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Limit",
    name: "limit",
    type: "integer",
    description: "Limits the number of returned user groups in response. Max 1000. Defaults to 10.",
    default: 10,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Offset",
    name: "offset",
    type: "integer",
    description: "Sets offset for list of items. Must be 0 or greater. Defaults to 0.",
    default: 0,
    required: false,
    items: [],
    options: []
  }
];

/** USER MODULE */
export const createAndUpdateUsersFields = [
  {
    displayName: "Role",
    name: "data__attributes__role",
    type: "string",
    description: "User role. Defaults to USER.",
    default: "USER",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Language",
    name: "data__attributes__language",
    type: "string",
    description: "User Interface language in IETF language tag format. Defaults to en-US.",
    default: "en-US",
    required: false,
    items: [],
    options: []
  }
]

export const getManyUsersFields = [
  {
    displayName: "Offset",
    name: "offset",
    type: "integer",
    description: "Sets offset for list of items. Must be 0 or greater. Defaults to 0.",
    default: 0,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Limit",
    name: "limit",
    type: "integer",
    description: "Limits the number of returned items. Must be between 0 and 1000. Defaults to 10.",
    default: 10,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Search Query (Deprecated)",
    name: "search_query",
    type: "string",
    description: "(Deprecated) Use search param instead.",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Sort",
    name: "sort",
    type: "string",
    description: "Sort field - can be reversed by adding dash before field name e.g (-email). Defaults to -addedAt.",
    default: "-addedAt",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Search",
    name: "search",
    type: "string",
    description: "User search query. You can search by email or id.",
    required: false,
    items: [],
    options: []
  }
];

/** APP MODULE */

export const createAndUpdateAppFields = [
  {
    displayName: "Type",
    name: "data__type",
    type: "string",
    default: "",
    description: "Resource type identifier.",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "ID",
    name: "data__attributes__id",
    type: "string",
    description: "App ID (UUID).",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "App Type",
    name: "data__attributes__appType",
    type: "string",
    description: "App type. Defaults to web.",
    default: "web",
    required: false,
    items: [],
    options: []
  },


  {
    displayName: "Timezone",
    name: "data__attributes__timezone",
    type: "string",
    description: "Timezone (IANA format). Affects date/time display in reports.",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Currency",
    name: "data__attributes__currency",
    type: "string",
    description: "Default currency for goal revenues in Analytics.",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Exclude Unknown URLs",
    name: "data__attributes__excludeUnknownUrls",
    type: "boolean",
    description: "Track only visits/actions when URL starts with one of the specified URLs. Defaults to false.",
    default: false,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Keep URL Fragment",
    name: "data__attributes__keepUrlFragment",
    type: "boolean",
    description: "Include page URL fragments in tracking. Defaults to true.",
    default: true,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "E-commerce Tracking",
    name: "data__attributes__eCommerceTracking",
    type: "boolean",
    description: "Enable e-commerce tracking. Defaults to true.",
    default: true,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Site Search Tracking",
    name: "data__attributes__siteSearchTracking",
    type: "boolean",
    description: "Track internal search engine usage (deprecated). Defaults to true.",
    default: true,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Site Search Query Params",
    name: "data__attributes__siteSearchQueryParams",
    type: "string[]",
    description: "Query param keys used for internal search. Defaults to q,query,s,search,searchword,keyword.",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Site Search Category Params",
    name: "data__attributes__siteSearchCategoryParams",
    type: "string[]",
    description: "Category param keys used for internal search.",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Delay",
    name: "data__attributes__delay",
    type: "integer",
    description: "Delay in ms (e.g., for redirects). Defaults to 500.",
    default: 500,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Excluded IPs",
    name: "data__attributes__excludedIps",
    type: "string[]",
    description: "List of IPs (IPv4 or IPv6) to blacklist from tracking. Wildcards supported.",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Excluded URL Params",
    name: "data__attributes__excludedUrlParams",
    type: "string[]",
    description: "Query parameters to exclude from tracking. Regex supported.",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Excluded User Agents",
    name: "data__attributes__excludedUserAgents",
    type: "string[]",
    description: "Exclude tracking if user agent matches any listed strings.",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "GDPR",
    name: "data__attributes__gdpr",
    type: "boolean",
    description: "Enable privacy consent collection for GDPR compliance. Defaults to true.",
    default: true,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "GDPR User Mode Enabled",
    name: "data__attributes__gdprUserModeEnabled",
    type: "boolean",
    description: "Enable GDPR user mode. Defaults to false.",
    default: false,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Privacy Cookie Domains Enabled",
    name: "data__attributes__privacyCookieDomainsEnabled",
    type: "boolean",
    description: "Enable domain-specific cookie settings. Defaults to false.",
    default: false,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Privacy Cookie Expiration Period",
    name: "data__attributes__privacyCookieExpirationPeriod",
    type: "integer",
    description: "Cookie expiration period in seconds. Defaults to 31536000 (1 year).",
    default: 31536000,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Privacy Cookie Domains",
    name: "data__attributes__privacyCookieDomains",
    type: "string[]",
    description: "Domains for privacy cookies. Wildcards supported.",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "GDPR Location Recognition",
    name: "data__attributes__gdprLocationRecognition",
    type: "boolean",
    description: "Use geolocation for UE-based consent (deprecated). Defaults to false.",
    default: false,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "GDPR Data Anonymization",
    name: "data__attributes__gdprDataAnonymization",
    type: "boolean",
    description: "Track only minimal data to avoid consent. Defaults to true.",
    default: true,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "SharePoint Integration",
    name: "data__attributes__sharepointIntegration",
    type: "boolean",
    description: "Enable SharePoint integration. Defaults to false.",
    default: false,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "GDPR Data Anonymization Mode",
    name: "data__attributes__gdprDataAnonymizationMode",
    type: "string",
    description: "Anonymization mode. Defaults to session_cookie_id.",
    default: "session_cookie_id",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Privacy Use Cookies",
    name: "data__attributes__privacyUseCookies",
    type: "boolean",
    description: "Use cookies for tracking. Defaults to true.",
    default: true,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Privacy Use Fingerprinting",
    name: "data__attributes__privacyUseFingerprinting",
    type: "boolean",
    description: "Use fingerprinting for tracking. Defaults to true.",
    default: true,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "CNIL",
    name: "data__attributes__cnil",
    type: "boolean",
    description: "Enable CNIL integration. Defaults to false.",
    default: false,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Session ID Strict Privacy Mode",
    name: "data__attributes__sessionIdStrictPrivacyMode",
    type: "boolean",
    description: "Comply with German privacy law by not collecting device data. Defaults to false.",
    default: false,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Real Time Dashboards",
    name: "data__attributes__realTimeDashboards",
    type: "boolean",
    description: "Enable real-time dashboards. Defaults to false.",
    default: false,
    required: false,
    items: [],
    options: []
  }
];
export const getManyAppsFields = [
  {
    displayName: "Offset",
    name: "offset",
    type: "integer",
    description: "Sets offset for list of items. Must be 0 or greater. Defaults to 0.",
    default: 0,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Limit",
    name: "limit",
    type: "integer",
    description: "Limits the number of returned items. Must be between 0 and 1000. Defaults to 10.",
    default: 10,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Search Query (Deprecated)",
    name: "search_query",
    type: "string",
    description: "(Deprecated) Use search param instead.",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Sort",
    name: "sort",
    type: "string",
    description: "Sort field - can be reversed by adding dash before field name e.g (-name). Defaults to -addedAt.",
    default: "-addedAt",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Search",
    name: "search",
    type: "string",
    description: "App search query.",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Permission",
    name: "permission",
    type: "string",
    description: "Filter apps by permission (actually by an action).",
    required: false,
    items: [],
    options: []
  }
];

/** META SITE MODULE */
export const getManyMetaSiteFields = [
  {
    displayName: "Limit",
    name: "limit",
    type: "integer",
    description: "Limits the number of returned items. Must be between 0 and 1000. Defaults to 10.",
    default: 10,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Offset",
    name: "offset",
    type: "integer",
    description: "Sets offset for list of items. Must be 0 or greater. Defaults to 0.",
    default: 0,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Search",
    name: "search",
    type: "string",
    description: "Search phrase - search for name or id.",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Sort",
    name: "sort",
    type: "string",
    description: "Sort field - can be reversed by adding dash before field name e.g (-name). Defaults to name.",
    default: "name",
    required: false,
    items: [],
    options: []
  }
];

export const createAndUpdateMetaSiteFields = [
  {
    displayName: "ID",
    name: "data__id",
    type: "string",
    description: "UUIDv4 identifier of an object.",
    required: false,
    items: [],
    options: []
  },

  {
    displayName: "Currency (Deprecated)",
    name: "data__attributes__currency",
    type: "string",
    description: "DEPRECATED - This field has no effect and will be removed in the next API version. Defaults to USD.",
    default: "USD",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Timezone",
    name: "data__attributes__timezone",
    type: "string",
    description: "Timezone in IANA format (e.g. Europe/Warsaw) or UTC offset (e.g. UTC+1). Defaults to UTC.",
    default: "UTC",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "E-commerce Tracking",
    name: "data__attributes__e_commerce_tracking",
    type: "boolean",
    description: "Enables e-commerce reports. Defaults to false.",
    default: false,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "SharePoint Integration",
    name: "data__attributes__sharepoint_integration",
    type: "boolean",
    description: "Enable SharePoint integration. Defaults to false.",
    default: false,
    required: false,
    items: [],
    options: []
  }
];

/** usergrouppermissionforapp module */
export const getManyUsergroupPermissionForAppFields = [
  {
    displayName: "Limit",
    name: "limit",
    type: "integer",
    description: "Limits the number of returned items. Must be between 0 and 1000. Defaults to 10.",
    default: 10,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Offset",
    name: "offset",
    type: "integer",
    description: "Sets offset for list of items. Must be 0 or greater. Defaults to 0.",
    default: 0,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Search",
    name: "search",
    type: "string",
    description: "Search phrase - search for user group name and user group ID.",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Sort",
    name: "sort",
    type: "string",
    description: "Sort field - can be reversed by adding dash before field name e.g (-name). Defaults to name.",
    default: "name",
    required: false,
    items: [],
    options: []
  }
];

export const getManyUserGroupPermissionForMetasiteFields = [
  {
    displayName: "Limit",
    name: "limit",
    type: "integer",
    description: "Limits the number of returned items. Must be between 0 and 1000. Defaults to 10.",
    default: 10,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Offset",
    name: "offset",
    type: "integer",
    description: "Sets offset for list of items. Must be 0 or greater. Defaults to 0.",
    default: 0,
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Search",
    name: "search",
    type: "string",
    description: "Search phrase - search for name or ID.",
    required: false,
    items: [],
    options: []
  },
  {
    displayName: "Sort",
    name: "sort",
    type: "string",
    description: "Sort field - can be reversed by adding dash before field name e.g (-name). Defaults to name.",
    default: "name",
    required: false,
    items: [],
    options: []
  }
];



export const fields = [
  /** USER GROUP MODULE */
  {
    displayName: "Type",
    name: "data__type",
    type: "string",
    default: "",
    description: "Resource type identifier.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["usergroup"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "Name",
    name: "data__attributes__name",
    type: "string",
    default: "",
    description: "User group name.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["usergroup"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "UserGroup Id",
    name: "id",
    type: "string",
    default: "",
    description: "Provide UserGroup's ID for actions.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["usergroup"],
        name: ["update", "get", "delete"]
      }
    }
  },
  {
    displayName: "Return All",
    name: "returnALl",
    type: "boolean",
    palceholder: "Return All",
    default: {},
    items: [],
    required: false,
    options: [],
    async init(data) {
      try {

        const list = await piwikProController.getAllUsergroup(data);
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["usergroup"],
        name: ["getMany"]
      }
    },

    fields: getManyUserGroupsFields
  },

  /** USER MODULE */
  {
    displayName: "Type",
    name: "data__type",
    type: "string",
    default: "",
    description: "Resource type identifier.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["user"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "Password",
    name: "data__attributes__password",
    type: "string",
    default: "",
    description: "Valid password (length between 12 and 128 chars, must contain at least one digit, one uppercase, and one lowercase letter).",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["user"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "Email",
    name: "data__attributes__email",
    type: "string",
    default: "",
    description: "Valid user email.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["user"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "User Id",
    name: "id",
    type: "string",
    default: "",
    description: "Provide User's ID for actions.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["user"],
        name: ["update", "get", "delete"]
      }
    }
  },
  {
    displayName: "Additional Fields",
    name: "additionalFields",
    type: "collection",
    palceholder: "Add Fields",
    default: {},
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ["user"],
        name: ["create", "update"]
      }
    },
    fields: createAndUpdateUsersFields
  },
  {
    displayName: "Return All",
    name: "returnALl",
    type: "boolean",
    palceholder: "Return All",
    default: {},
    items: [],
    required: false,
    options: [],
    async init(data) {
      try {

        const list = await piwikProController.getAllUser(data);
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["user"],
        name: ["getMany"]
      }
    },

    fields: getManyUserGroupsFields
  },

  /** APP MODULE */



  {
    displayName: "Name",
    name: "data__attributes__name",
    type: "string",
    description: "App name. Max length 90 characters.",
    required: true,
    items: [],
    options: [],
    displayOptions: {
      show: {
        category: ["app"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "URLs",
    name: "data__attributes__urls",
    type: "string[]",
    description: "List of URL's under which the app is available (deep linking is supported).",
    required: true,
    items: [],
    options: [],
    displayOptions: {
      show: {
        category: ["app"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "App Id",
    name: "id",
    type: "string",
    default: "",
    description: "Provide App's ID for actions.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["app"],
        name: ["update", "get", "delete"]
      }
    }
  },
  {
    displayName: "Additional Fields",
    name: "additionalFields",
    type: "collection",
    palceholder: "Add Fields",
    default: {},
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ["app"],
        name: ["create", "update"]
      }
    },
    fields: createAndUpdateAppFields
  },
  {
    displayName: "Return All",
    name: "returnALl",
    type: "boolean",
    palceholder: "Return All",
    default: {},
    items: [],
    required: false,
    options: [],
    async init(data) {
      try {

        const list = await piwikProController.getAllApp(data);
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["app"],
        name: ["getMany"]
      }
    },

    fields: getManyAppsFields
  },

  /** META SITE MODULE */
  {
    displayName: "Type",
    name: "data__type",
    type: "string",
    default: "",
    description: "Resource type identifier.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["metasite"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "Name",
    name: "data__attributes__name",
    type: "string",
    description: "Meta Sit name. Max length 90 characters.",
    required: true,
    items: [],
    options: [],
    displayOptions: {
      show: {
        category: ["metasite"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "Metasite Id",
    name: "id",
    type: "string",
    default: "",
    description: "Provide Metasite's ID for actions.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["metasite"],
        name: ["update", "get", "delete"]
      }
    }
  },
  {
    displayName: "Additional Fields",
    name: "additionalFields",
    type: "collection",
    palceholder: "Add Fields",
    default: {},
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ["metasite"],
        name: ["create", "update"]
      }
    },
    fields: createAndUpdateMetaSiteFields
  },
  {
    displayName: "Return All",
    name: "returnALl",
    type: "boolean",
    palceholder: "Return All",
    default: {},
    items: [],
    required: false,
    options: [],
    async init(data) {
      try {
        const list = await piwikProController.getAllMetasite(data);
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["metasite"],
        name: ["getMany"]
      }
    },

    fields: getManyMetaSiteFields
  },

  /** META SITE APP MODULE */
  {
    displayName: "Type",
    name: "data||__type",
    type: "string",
    default: "",
    description: "Resource type identifier.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["metasiteapp"],
        name: ["create", "delete"]
      }
    }
  },
  {
    displayName: "App Id",
    name: "data||__id",
    type: "string",
    default: "",
    description: "Provide App's ID for actions.",
    items: [],
    required: true,
    options: [],
    async init(data) {
      try {

        const list = await piwikProController.getAllApp(data);
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["metasiteapp"],
        name: ["create", "delete"]
      }
    }
  },

  {
    displayName: "Meta Site Id",
    name: "meta_site_id",
    type: "string",
    default: "",
    description: "Provide App's ID for actions.",
    items: [],
    required: true,
    options: [],
    async init(data) {
      try {

        const list = await piwikProController.getAllMetasite(data);
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["metasiteapp"],
        name: ["create", "delete"]
      }
    }
  },

  //Usergrouppermissionformetasiteapp
  {
    displayName: "Type",
    name: "type",
    type: "string",
    default: "",
    description: "Resource type identifier.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["usergrouppermissionforapp"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Meta Site Id",
    name: "meta_site_id",
    type: "string",
    default: "",
    description: "Provide Meta site's ID for actions.",
    items: [],
    required: true,
    options: [],
    async init(data) {
      try {

        const list = await piwikProController.getAllApp(data);
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["usergrouppermissionforapp"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "User Group  Id",
    name: "user_group_id",
    type: "string",
    default: "",
    description: "Provide User Group's ID for actions.",
    items: [],
    required: true,
    options: [],
    async init(data) {
      try {

        const list = await piwikProController.getAllUsergroup(data);
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["usergrouppermissionforapp"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Permission",
    name: "attributes__permission",
    type: "string",
    description: "Permission for ppms/app (e.g. edit-publish includes actions: view, edit, publish).",
    required: true,
    items: [],
    options: [],
    displayOptions: {
      show: {
        category: ["usergrouppermissionforapp"],
        name: ["create"]
      }
    }
  },
   {
    displayName: "Meta Site Id",
    name: "meta_site_id",
    type: "string",
    default: "",
    description: "Provide Meta site's ID for actions.",
    items: [],
    required: true,
    options: [],
    async init(data) {
      try {

        const list = await piwikProController.getAllMetasite(data);
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["usergrouppermissionformetasite"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "User Group  Id",
    name: "user_group_id",
    type: "string",
    default: "",
    description: "Provide User Group's ID for actions.",
    items: [],
    required: true,
    options: [],
    async init(data) {
      try {

        const list = await piwikProController.getAllUsergroup(data);
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["usergrouppermissionformetasite"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Return All",
    name: "returnALl",
    type: "boolean",
    palceholder: "Return All",
    default: {},
    items: [],
    required: false,
    displayOptions: {
      show: {
        category: ["usergrouppermissionforapp"],
        name: ["getMany"]
      }
    },

    fields: getManyUsergroupPermissionForAppFields
  },

  /** usergrouppermissionformetasite module */

  {
    displayName: "Type",
    name: "data__type",
    type: "string",
    default: "",
    description: "Resource type identifier.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["usergrouppermissionformetasite"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Permission",
    name: "permission",
    type: "string",
    description: "Permission for ppms/app (e.g. edit-publish includes actions: view, edit, publish).",
    required: true,
    items: [],
    options: [],
    displayOptions: {
      show: {
        category: ["usergrouppermissionformetasite"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Return All",
    name: "returnALl",
    type: "boolean",
    palceholder: "Return All",
    default: {},
    items: [],
    required: false,
    options: [],
    async init(data) {
      try {
        const list = await piwikProController.getAllUsergrouppermissionformetasite(data);
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["usergrouppermissionformetasite"],
        name: ["getMany"]
      }
    },

    fields: getManyUsergroupPermissionForAppFields
  },
  {
    displayName: "Return All",
    name: "returnALl",
    type: "boolean",
    palceholder: "Return All",
    default: {},
    items: [],
    required: false,
    options: [],
    async init(data) {
      try {
        const list = await piwikProController.getAllGlobalaction(data);
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["globalaction"],
        name: ["getMany"]
      }
    },


  },
  {
    displayName: "Return All",
    name: "returnALl",
    type: "boolean",
    palceholder: "Return All",
    default: {},
    items: [],
    required: false,
    options: [],
    async init(data) {
      try {
        const list = await piwikProController.getAllUserwithaction(data);
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["useraction"],
        name: ["getMany"]
      }
    },


  },
]