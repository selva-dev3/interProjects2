// zendesk.config.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONFIGURATION FILE.
// DO NOT modify the sections labeled "AUTO-GENERATED".
//
// Copyright (c) 2025 Smackcoders. All rights reserved.
// This file is subject to the Smackcoders Proprietary License.
// Unauthorized copying or distribution is strictly prohibited.
// -----------------------------------------------------------------------------

export const XappName = "Zendesk";
export const modules = [
  {
    "module": "tickets",
    "actions": [
      "create",
      "get",
      "getMany",
      "update",
      "delete"
    ],
    "triggers": [
      "new_ticket",
      "ticket_updated",
      "ticket_deleted"
    ]
  },
  {
    "module": "comments",
    "actions": [
      "create",
      "get",
      "update",
      "delete",
      "getMany"
    ],
    "triggers": [
      "new_comment",
      "comment_updated"
    ]
  },
  {
    "module": "attachments",
    "actions": [
      "add",
      "delete",
      "get",
      "update"
    ],
    "triggers": [
      "new_attachment",
      "attachment_deleted"
    ]
  },
  {
    "module": "ticket_forms",
    "actions": [
      "create",
      "get",
      "getMany",
      "delete",
      "update",
      "clonetiketform",
      "reorderticket",
      "updatestatus"
    ],
    "triggers": [
      "new_ticket_form",
      "ticket_form_updated"
    ]
  },
  {
    "module": "ticket_fields",
    "actions": [
      "create",
      "update",
      "delete",
      "get",
      "getMany",
      "count"
    ],
    "triggers": [
      "new_ticket_field",
      "ticket_field_updated"
    ]
  },
  {
    "module": "requests",
    "actions": [
      "create",
      "update",
      "getMany",
      "get"
    ],
    "triggers": [
      "new_request",
      "request_updated"
    ]
  },
  {
    "module": "imports",
    "actions": [
      "create",
      "bulkcreate"
    ],
    "triggers": []
  },
  {
    "module": "audits",
    "actions": [
      "getMany",
      "listaudits",
      "countaudits",
      "get",
      "changecomments"
    ],
    "triggers": []
  },
  {
    "module": "ticket_metrics",
    "actions": [
      "get",
      "getMany"
    ],
    "triggers": []
  },
  {
    "module": "activities",
    "actions": [
      "get",
      "getMany",
      "count"
    ],
    "triggers": []
  },
  {
    "module": "skips",
    "actions": [
      "getMany",
      "record"
    ],
    "triggers": []
  },
  {
    "module": "email_notifications",
    "actions": [
      "get",
      "getMany",
      "showMany"
    ],
    "triggers": []
  },
  {
    "module": "custom_ticket_statuses",
    "actions": [
      "create",
      "update",
      "get",
      "getMany",
      "bulkupdate"
    ],
    "triggers": []
  },
  {
    "module": "sharing_agreements",
    "actions": [
      "create",
      "update",
      "delete",
      "get",
      "getMany"
    ],
    "triggers": []
  },
  {
    "module": "ticket_form_statuses",
    "actions": [
      "getMany",
      "delete",
      "deletestatus"
    ],
    "triggers": []
  },
  {
    "module": "conversation_log",
    "actions": [
      "getMany"
    ],
    "triggers": []
  },
  {
    "module": "users",
    "actions": [
      "create",
      "getMany",
      "search",
      "autocomplete",
      "count",
      "get",
      "showmany",
      "getinformation",
      "getself",
      "creatmanyeusers",
      "update",
      "updateusers",
      "delete",
      "bulkdelete",
      "updatemanyusers",
      "permanentldelete",
      "count",
      "getdeleteusers"
    ],
    "triggers": []
  },
  {
    "module": "identities",
    "actions": [
      "create",
      "get",
      "update",
      "delete",
      "getMany",
      "verify",
      "make"
    ],
    "triggers": []
  },
  {
    "module": "profiles",
    "actions": [
      "getprofilesbyuserid",
      "get",
      "getidentifier",
      "create",
      "update",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "user_events",
    "actions": [
      "get",
      "geteventsbysunshineprofile",
      "geteventsbysunshineprofileid",
      "trackeventzendesk",
      "trackeventsunshine",
      "trackeventbyid"
    ],
    "triggers": []
  },
  {
    "module": "user_fields",
    "actions": [
      "create",
      "update",
      "delete",
      "get",
      "getMany"
    ],
    "triggers": []
  },
  {
    "module": "password",
    "actions": [
      "getMany",
      "change",
      "set"
    ],
    "triggers": []
  },
  {
    "module": "organizations",
    "actions": [
      "create",
      "update",
      "get",
      "getMany",
      "delete",
      "count",
      "autocomplete",
      "search",
      "bulkdelete",
      "createmany",
      "updatemany",
      "merge"
    ],
    "triggers": []
  },
  {
    "module": "organization_memberships",
    "actions": [
      "create",
      "get",
      "getMany",
      "delete",
      "setmembership",
      "set",
      "unassign",
      "bulkdelete"
    ],
    "triggers": []
  },
  {
    "module": "organization_fields",
    "actions": [
      "create",
      "update",
      "delete",
      "get",
      "getMany",
      "reoder"
    ],
    "triggers": []
  },
  {
    "module": "organization_subscriptions",
    "actions": [
      "create",
      "get",
      "getMany",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "lookup_relationship_fields",
    "actions": [
      "create",
      "get",
      "filetr"
    ],
    "triggers": []
  },
  {
    "module": "groups",
    "actions": [
      "create",
      "get",
      "update",
      "getMany",
      "delete",
      "count"
    ],
    "triggers": []
  },
  {
    "module": "group_memberships",
    "actions": [
      "create",
      "get",
      "getMany",
      "delete",
      "bulkdelete",
      "set"
    ],
    "triggers": []
  },
  {
    "module": "search_results",
    "actions": [
      "get",
      "getMany",
      "export"
    ],
    "triggers": []
  },
  {
    "module": "incremental_exports",
    "actions": [
      "ticketcursor",
      "tickettime",
      "ticketevent",
      "usercursor",
      "usertime",
      "organizationexport",
      "sample"
    ],
    "triggers": []
  },
  {
    "module": "tags",
    "actions": [
      "add",
      "remove",
      "set",
      "getMany",
      "count",
      "search"
    ],
    "triggers": []
  },
  {
    "module": "satisfaction_ratings",
    "actions": [
      "create",
      "get",
      "getMany",
      "count"
    ],
    "triggers": []
  },
  {
    "module": "satisfaction_reason",
    "actions": [
      "get",
      "getMany"
    ],
    "triggers": []
  },
  {
    "module": "job_statuses",
    "actions": [
      "get",
      "getMany",
      "showmany"
    ],
    "triggers": []
  },
  {
    "module": "items",
    "actions": [
      "create",
      "update",
      "get",
      "getMany",
      "delete",
      "showmany"
    ],
    "triggers": []
  },
  {
    "module": "variants",
    "actions": [
      "create",
      "get",
      "getMany",
      "update",
      "delete",
      "updatemany",
      "createmany"
    ],
    "triggers": []
  },
  {
    "module": "schedules",
    "actions": [
      "create",
      "update",
      "delete",
      "get",
      "getMany"
    ],
    "triggers": []
  },
  {
    "module": "schedules_holiday",
    "actions": [
      "create",
      "update",
      "delete",
      "get",
      "getMany"
    ],
    "triggers": []
  },
  {
    "module": "skill-based_routing",
    "actions": [
      "getMany",
      "get",
      "create",
      "update",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "attribute_value",
    "actions": [
      "getMany",
      "get",
      "create",
      "update",
      "delete",
      "bulkset",
      "settickets",
      "getManytickets"
    ],
    "triggers": []
  },
  {
    "module": "resource_collections",
    "actions": [
      "create",
      "update",
      "delete",
      "get",
      "getMany"
    ],
    "triggers": []
  },
  {
    "module": "workspaces",
    "actions": [
      "create",
      "update",
      "delete",
      "get",
      "getMany",
      "bulkdelete",
      "reorder"
    ],
    "triggers": []
  },
  {
    "module": "bookmarks",
    "actions": [
      "create",
      "delete",
      "getMany"
    ],
    "triggers": []
  },
  {
    "module": "views",
    "actions": [
      "create",
      "get",
      "getMany",
      "delete",
      "update"
    ],
    "triggers": []
  },
  {
    "module": "ticket_triggers",
    "actions": [
      "create",
      "get",
      "getMany",
      "update",
      "delete",
      "bulkdelete",
      "reorder",
      "search",
      "updatemany"
    ],
    "triggers": []
  },
  {
    "module": "ticket_trigger_categories",
    "actions": [
      "getmany",
      "create",
      "createbatch",
      "get",
      "update",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "macros",
    "actions": [
      "getmany",
      "getmanyactive",
      "get",
      "create",
      "update",
      "updatemany",
      "delete",
      "bulkdelete",
      "search",
      "getmanymacrocategories",
      "getmanysupportedactions",
      "getmanyactiondefinitions",
      "getreplica",
      "getManyattachments",
      "getattachment",
      "createattchment",
      "createunassociated",
      "getchangesticket",
      "getafterchanges"
    ],
    "triggers": []
  },
  {
    "module": "automations",
    "actions": [
      "getmany",
      "getanyactive",
      "search",
      "get",
      "create",
      "update",
      "updatemany",
      "delete",
      "bulkdelete"
    ],
    "triggers": []
  },
  {
    "module": "sla_policies",
    "actions": [
      "getmany",
      "get",
      "create",
      "update",
      "delete",
      "reorder",
      "getsupportedfilterdefinitionitems"
    ],
    "triggers": []
  },
  {
    "module": "group_sla_policies",
    "actions": [
      "getmany",
      "get",
      "create",
      "update",
      "delete",
      "reorder",
      "getsupportedfilter"
    ],
    "triggers": []
  },
  {
    "module": "deletion_schedules",
    "actions": [
      "getmany",
      "create",
      "get",
      "update",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "custom_roles",
    "actions": [
      "getmany",
      "get",
      "create",
      "update",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "account_settings",
    "actions": [
      "get",
      "update"
    ],
    "triggers": []
  },
  {
    "module": "support_addresses",
    "actions": [
      "getmany",
      "get",
      "create",
      "update",
      "delete",
      "verify"
    ],
    "triggers": []
  },
  {
    "module": "sessions",
    "actions": [
      "getmany",
      "get",
      "getcurrentauthenticated",
      "renewcurrent",
      "delete",
      "deleteauthenticated",
      "bulkdelete"
    ],
    "triggers": []
  },
  {
    "module": "brand_agent",
    "actions": [
      "getmany",
      "get"
    ],
    "triggers": []
  },
  {
    "module": "brands",
    "actions": [
      "getmany",
      "get",
      "create",
      "update",
      "delete",
      "checkhost",
      "checkexisting"
    ],
    "triggers": []
  },
  {
    "module": "locales",
    "actions": [
      "getmany",
      "getmanylocalesagent",
      "getmanypublic",
      "getcurrent",
      "get",
      "detectbestlanguageforuser"
    ],
    "triggers": []
  },
  {
    "module": "audit_logs",
    "actions": [
      "getmany",
      "get",
      "export"
    ],
    "triggers": []
  },
  {
    "module": "access_logs",
    "actions": [
      "getmany"
    ],
    "triggers": []
  },
  {
    "module": "push_notifications",
    "actions": [
      "bulkunregister"
    ],
    "triggers": []
  },
  {
    "module": "ticket_statuses",
    "actions": [
      "getmany"
    ],
    "triggers": []
  },
  {
    "module": "zendesk_ips",
    "actions": [
      "getmany"
    ],
    "triggers": []
  },
  {
    "module": "tokens",
    "actions": [
      "getmany",
      "get",
      "create",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "clients",
    "actions": [
      "getmany",
      "get",
      "create",
      "update",
      "delete",
      "generatesecret"
    ],
    "triggers": []
  },
  {
    "module": "global_oauth_clients",
    "actions": [
      "list_global_oauth_clients"
    ],
    "triggers": []
  },
  {
    "module": "apps",
    "actions": [
      "getmany",
      "getmanyowned",
      "get",
      "getapppublickey",
      "create",
      "update",
      "delete",
      "getjob",
      "upload",
      "sendnotification",
      "install",
      "listappinstallations",
      "getappinstallation",
      "updateappinstallation",
      "remove"
    ],
    "triggers": []
  },
  {
    "module": "app_installations",
    "actions": [
      "getmany",
      "get",
      "getmanylocation",
      "reorder"
    ],
    "triggers": []
  },
  {
    "module": "locations",
    "actions": [
      "getmany",
      "get"
    ],
    "triggers": []
  },
  {
    "module": "targets",
    "actions": [
      "getMany",
      "get",
      "create",
      "update",
      "delete",
      "getManytargetfailures",
      "gettargetfailure"
    ],
    "triggers": []
  },
  {
    "module": "side_conversations",
    "actions": [
      "create",
      "update",
      "get",
      "getMany",
      "import",
      "importevents",
      "reply"
    ],
    "triggers": []
  }
];

export default {
  XappName,
  modules,
};
