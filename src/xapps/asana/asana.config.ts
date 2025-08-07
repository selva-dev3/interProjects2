// asana.config.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONFIGURATION FILE.
// DO NOT modify the sections labeled "AUTO-GENERATED".
//
// Copyright (c) 2025 Smackcoders. All rights reserved.
// This file is subject to the Smackcoders Proprietary License.
// Unauthorized copying or distribution is strictly prohibited.
// -----------------------------------------------------------------------------

import { CustomLogger } from "src/logger/custom.logger";
import { asanaController } from "./asana.controller";

export const redirect =  "https://workflow.xapplets.com/exit";

export const XappName = "asana";
export const modules = [
  
  {
    "module": "users",
    "actions": [
      "get",
      "getmany",
    ],
    "triggers": [
      "user_added",
      "user_removed"
    ]
  },
  {
    "module": "attachment",
    "actions": [
      "create",
      "get",
      "getmany",
      "delete"
    ],
    "triggers": [
      "attachment_added",
      "attachment_removed"
    ]
  },
  {
    "module": "project",
    "actions": [
      "create",
      "get",
      "getmany",
      "update",
      "delete"
    ],
    "triggers": [
      "project_created",
      "project_updated",
      "project_deleted"
    ]
  },
  {
    "module": "task",
    "actions": [
      "create",
      "get",
      "getmany",
      "update",
      "delete"
    ],
    "triggers": [
      "task_created",
      "task_updated",
      "task_completed",
      "task_deleted"
    ]
  },
  {
    "module": "workspace",
    "actions": [
      "create",
      "get",
      "getmany",
      "update",
    ],
    "triggers": [
      "workspace_created",
      "workspace_updated"
    ]
  },
  {
    "module": "story",
    "actions": [
      "create",
      "get",
      "getmany",
      "update",
      "delete"
    ],
    "triggers": [
      "story_created",
      "story_updated"
    ]
  },
  {
    "module": "webhooks",
    "actions": [
      "create",
      "get",
      "getmany",
      "update",
      "delete"
    ],
    "triggers": [
      "webhook_created",
      "webhook_updated",
      "webhook_deleted"
    ]
  },
  {
    "module": "section",
    "actions": [
      "create",
      "get",
      "getmany",
      "update",
      "delete"
    ],
    "triggers": [
      "section_created",
      "section_updated",
      "section_deleted"
    ]
  }
];

export default {
  XappName,
  modules,
};
export const requiredFields = {
  asana: ['gid'],
  };


export const projectAddtionalFields = [
  {
    displayName: "Archived",
    name: "archived",
    type: "dropdown",
    description: "",
    default: "",
    items: [],
    options: [
      { "name": "true", "value": true, "description": "True if the project is archived," },
      { "name": "false", "value": false, "description": "false if the project is  not archived" },


    ],
    required: false,
    
  }, {
    displayName: "Color",
    name: "color",
    type: "dropdown",
    description: "Color of the project.",
    default: "",
    items: [],
    options: [
      { "name": "dark-pink", "value": "dark-pink", "description": "" },
      { "name": "dark-green", "value": "dark-green", "description": "" },
      { "name": "dark-blue", "value": "dark-blue", "description": "" },
      { "name": "dark-red", "value": "dark-red", "description": "" },
      { "name": "dark-teal", "value": "dark-teal", "description": "" },
      { "name": "dark-brown", "value": "dark-brown", "description": "" },
      { "name": "dark-orange", "value": "dark-orange", "description": "" },
      { "name": "dark-purple", "value": "dark-purple", "description": "" },
      { "name": "dark-warn-gray", "value": "dark-warn-gray", "description": "" },
      { "name": "light-pink", "value": "light-pink", "description": "" },
      { "name": "light-green", "value": "light-green", "description": "" },
      { "name": "light-blue", "value": "light-blue", "description": "" },
      { "name": "light-red", "value": "light-red", "description": "" },
      { "name": "light-teal", "value": "light-teal", "description": "" },
      { "name": "light-brown", "value": "light-brown", "description": "" },
      { "name": "light-orange", "value": "light-orange", "description": "" },
      { "name": "light-purple", "value": "light-purple", "description": "" },
      { "name": "light-warn-gray", "value": "light-warn-gray", "description": "" },
      { "name": "none", "value": "none", "description": "" },
      { "name": "null", "value": "null", "description": "" },
    ],
    required: false,
   
  }, {
    displayName: "Default View",
    name: "default_view",
    type: "dropdown",
    description: "he default view  of project",
    default: "",
    items: [],
    options: [
      { "name": "list", "value": "list", "description": "" },
      { "name": "board", "value": "board", "description": "" },
      { "name": "calender", "value": "calender", "description": "" },
      { "name": "timeline", "value": "timeline", "description": "" },


    ],
    required: false,
  }, {
    displayName: "Html Notes",
    name: "html_notes",
    type: "date",
    description: "The notes of the project with formatting as HTML.",
    default: "",
    items: [],
    required: false,
  }, {
    displayName: "Due On",
    name: "due_on",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false,
  }, {
    displayName: "Notes",
    name: "notes",
    type: "string",
    description: "Free-form textual information associated with the project",
    default: "",
    items: [],
    required: false,
  }, {
    displayName: "Privacy Setting",
    name: "privacy_setting",
    type: "dropdown",
    description: "The privacy setting of the project. Note: Administrators in your",
    default: "",
    items: [],
    option: [
      { "name": "public_to_workspace", "value": "public_to_workspace", "description": "" },
      { "name": "private_to_team", "value": "private_to_team", "description": "" },
      { "name": "private", "value": "private", "description": "" },

    ],
    required: false,

  }, {
    displayName: "Start On",
    name: "start_on",
    type: "date",
    description: "",
    default: "",
    items: [],
    required: false,

  }, {
    displayName: "Default Access Level",
    name: "default_access_level",
    type: "dropdown",
    description: "The default access for users or teams who join or are added as members to the project.",
    default: "",
    items: [],
    options: [
      { "name": "admin", "value": "admin", "description": "" },
      { "name": "editor", "value": "editor", "description": "" },
      { "name": "commenter", "value": "commenter", "description": "" },
      { "name": "viewer", "value": "viewer", "description": "" },

    ],
    required: false,
 
  }, {
    displayName: "Minimum Access Level For Customization",
    name: "minimum_access_level_for_customization",
    type: "string",
    description: "The minimum access level needed for project members to modify this project's workflow and appearance.",
    default: "",
    items: [],
    required: false,
    options: [
      { "name": "admin", "value": "admin", "description": "" },
      { "name": "editor", "value": "editor", "description": "" },
    ],

  }, {
    displayName: "Minimum Access Level For Sharing",
    name: "minimum_access_level_for_sharing",
    type: "string",
    description: "The minimum access level needed for project members to share the project and manage project memberships.",
    default: "",
    items: [],
    required: false,
    options: [
      { "name": "admin", "value": "admin", "description": "" },
      { "name": "editor", "value": "editor", "description": "" },
    ],
 
  }, 

]


export const taskAdditionalFields = [
  {
    displayName: "Resource Subtype",
    name: "resource_subtype",
    type: "dropdown",
    description: "The subtype of this resource",
    default: "",
    items: [],
    options: [
      { "name": "default_task", "value": "default_task", "description": "" },
      { "name": "milestone", "value": "milestone", "description": "milestone represent a single moment in time." },
      { "name": "approval", "value": "approval", "description": "" },

    ],
    required: false,
   
  }, {
    displayName: "assignee Status",
    name: "assignee_status",
    type: "dropdown",
    description: "",
    default: "",
    items: [],
    options: [
      { "name": "today", "value": "today", "description": "" },
      { "name": "upcoming", "value": "upcoming", "description": "" },
      { "name": "later", "value": "later", "description": "" },
      { "name": "new", "value": "new", "description": "" },
      { "name": "inbox", "value": "inbox", "description": "" }
    ],

    required: false,
  }, {
    displayName: "Completed",
    name: "completed",
    type: "dropdown",
    description: "True if the task is currently marked complete, false if not.",
    default: "",
    items: [],
    Options: [
      { "name": "true", "value": "true", "description": "True if the task is currently marked complete," },
      { "name": "false", "value": "false", "description": "false if the task is currently not completed" },
    ],
    required: false,
  },
  {
    displayName: "Due On",
    name: "due_on",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false,

  },
  {
    displayName: "Due Date",
    name: "due_date",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false,

  }, {
    displayName: "Html Notes",
    name: "html_notes",
    type: "string",
    description: " The notes of the text with formatting as HTML.",
    default: "",
    items: [],
    required: false,
  }, {
    displayName: "Liked",
    name: "liked",
    type: "dropdown",
    description: "",
    default: "",
    items: [],
    options: [
      { "name": "true", "value": "true", "description": "" },
      { "name": "false", "value": "false", "description": "" },
    ],
    required: false,

  }, {
    displayName: "Notes",
    name: "notes",
    type: "string",
    description: "Free-form textual information associated with the task",
    default: "",
    items: [],
    required: false,

  }, {
    displayName: "Start At",
    name: "date",
    type: "string",
    description: "Date and time on which work begins for the task",
    default: "",
    items: [],
    required: false,
  }, {
    displayName: "Start On",
    name: "start_on",
    type: "date",
    description: "The day on which work begins for the task",
    default: "",
    items: [],
    required: false,

  }, {
    displayName: "Assignee Section",
    name: "assignee_section",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false,

  }, {
    displayName: "Parent",
    name: "parent",
    type: "string",
    description: "Gid of a task.",
    default: "",
    items: [],
    required: false,

  }, 

]

export const storyAddtionalFields=[
  {
    displayName: "Html Text",
    name: "html_text",
    type: "string",
    description: "HTML formatted text for a comment. This will not include the name of the creator.",
    default: "",
    items: [],
    required: true,

  },{
    displayName: "Is Pinned",
    name: "is_pinned",
    type: "string",
    description: " Whether the story should be pinned on the resource.",
    default: "",
    items: [],
    options:[
      { "name": "true", "value": "true", "description": "" },
      { "name": "false", "value": "false", "description": "" },
    ],
    required: true,

  },{
    displayName: "Sticker Name",
    name: "sticker_name",
    type: "string",
    description: "",
    default: "",
    items: [],
    options:[
      { "name": "green_checkmark", "value": "green_checkmark", "description": "" },
      { "name": "people_dancing", "value": "people_dancing", "description": "" },
      { "name": "dancing_unicorn", "value": "dancing_unicorn", "description": "" },
      { "name": "heart", "value": "heart", "description": "" },
      { "name": "party_popper", "value": "party_popper", "description": "" },
      { "name": "people_waving_flags", "value": "people_waving_flags", "description": "" },
      { "name": "splashing_narwhal", "value": "splashing_narwhal", "description": "" },
      { "name": "trophy", "value": "trophy", "description": "" },
      { "name": "yeti_riding_unicorn", "value": "yeti_riding_unicorn", "description": "" },
      { "name": "celebrating_people", "value": "celebrating_people", "description": "" },
      { "name": "determined_climbers", "value": "determined_climbers", "description": "" },
      { "name": "phoenix_spreading_love", "value": "phoenix_spreading_love", "description": "" }
  ]
  ,
    required: true,

  },
]

export const sectionAddtionalFields=[
  {
    displayName: "Insert Before",
    name: "insert_before",
    type: "string",
    description: "An existing section within this project before which the added section should be inserted",
    default: "",
    items: [],
    required: false,
  
  },{
    displayName: "Insert After",
    name: "insert_after",
    type: "string",
    description: "An existing section within this project after which the added section should be inserted",
    default: "",
    items: [],
    required: false,

  }
]

export const attachmentAddtionalFields=[
  {
    displayName: "Resource Subtype",
    name: "resource_subtype",
    type: "dropbox",
    description: "",
    default: "",
    items: [],
    options:[
      { "name": "asana", "value": "asana", "description": "" },
      { "name": "dropbox", "value": "dropbox", "description": "" },
      { "name": "gdrive", "value": "gdrive", "description": "" },
      { "name": "onedrive", "value": "onedrive", "description": "" },
      { "name": "box", "value": "box", "description": "" },
      { "name": "vimeo", "value": "vimeo", "description": "" },
      { "name": "external", "value": "external", "description": "" }
  ],
  
    required: false,

  },{
    displayName: "File",
    name: "file",
    type: "string",
    description: "file to upload",
    default: "",
    items: [],
    required: false,

  },{
    displayName: "Url",
    name: "url",
    type: "string",
    description: "The URL of the external resource being attached. Required for attachments of type external.",
    default: "",
    items: [],
    required: false,

  },{
    displayName: "Name",
    name: "name",
    type: "string",
    description: "The name of the external resource being attached. Required for attachments of type external.",
    default: "",
    items: [],
    required: false,

  },{
    displayName: "Connect To App",
    name: "connect_to_app",
    type: "dropbox",
    description: "",
    default: "",
    items: [],
    options:[
      { "name": "true", "value": "true", "description": "" },
      { "name": "false", "value": "false", "description": "" }

    ],
    required: false,

  },
]
export const fields = [
  {
    displayName: "User Gid",
    name: "Id",
    type: "string",
    description: "Globally unique identifier for the user",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["user"],
        name: ["get"],
      },
    },
  },
  {
    displayName: "Name",
    name: "name",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["project"],
        name: ["create", "update"],
      },
    },
  },
  {
    displayName: "Workspace",
    name: "workspace",
    type: "dropdown",
    description: "The gid of a workspace.",
    default: "",
    items: [],
    async init(id) {
      const logger = new CustomLogger()
      try {
        const options = await asanaController.getAllWorkspace(id)
        this.options = options;
      } catch (error) {
         logger.error('Error occurred:', error + error.stack);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ["project", "task"],
        name: ["create","getmany"],
      },
    },
  },
  {
    displayName: "Project Gid",
    name: "Id",
    type: "string",
    description: "Globally unique identifier for the project",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["project"],
        name: ["get", "update", "delete"],
      },
    },
  }, 
  {
    displayName: "Additional Fields",
    name: "addtinal fields",
    type: "string",
    description: "",
    default: "",
    items: [],
    fields: projectAddtionalFields,
    required: true,
    displayOptions: {
      show: {
        category: ["project"],
        name: ["create", "update"],
      },
    },
  },

  // Tasks

  {
    displayName: "Workspace",
    name: "workspace",
    type: "string",
    description: "Gid of a workspace.",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["task"],
        name: ["create", "update"],
      },
    },
  },
  {
    displayName: "Assignee",
    name: "assignee",
    type: "string",
    description: "Gid of a user.",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["task"],
        name: ["create", "update"],
      },
    },
  },


  {
    displayName: "Task Gid",
    name: "Id",
    type: "string",
    description: " globally-unique identifier of a Task",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["task"],
        name: ["get", "update", "delete"],
      },
    },
  }, {
    displayName: "Additional Fields",
    name: "addtinal fields",
    type: "string",
    description: "",
    default: "",
    items: [],
    fields: taskAdditionalFields,
    required: true,
    displayOptions: {
      show: {
        category: ["task"],
        name: ["create", "update"],
      },
    },
  },


  // Webhooks
  {
    displayName: "Resource",
    name: "resource",
    type: "string",
    description: "A resource ID to subscribe ",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["webhooks"],
        name: ["crete"],
      },
    },
  }, {
    displayName: "Target",
    name: "arget",
    type: "string",
    description: "The URL to receive the HTTP POST",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["webhooks"],
        name: ["crete"],
      },
    },
  }, {
    displayName: "Filters",
    name: "filters",
    type: "string",
    description: "Array of filters for webhooks",
    default: "",
    items: [],
    required: true,
    fields: [
      {
        displayName: "resource_type",
        name: "filters||resource_type",
        type: "string",
        description:"The type of the resource which created the event when modified",
        default: ""
      },
      {
        displayName: "resource_subtype",
        name: "filters||resource_subtype",
        type: "string",
        description:"The resource subtype of the resource that the filter applies to",
        default: ""
      },
      {
        displayName: "action",
        name: "filters||action",
        type: "string",
        description:"",
        default: ""
      },
      {
        displayName: "fields",
        name: "filters||fields",
        type: "string",
        description:"",
        default: ""
      },
    ],
    displayOptions: {
      show: {
        category: ["webhooks"],
        name: ["crete","update"],
      },
    },
  }, 

  {
    displayName: "Workspace",
    name: "resource",
    type: "dropdown",
    description: "The gid of a workspace.",
    default: "",
    items: [],
    options:[],
    async init(id) {
      const logger = new CustomLogger()
      try {
        const options = await asanaController.getAllWorkspace(id)
        this.options = options;
      } catch (error) {
         logger.error('Error occurred:', error + error.stack);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ["webhooks"],
        name: ["create","getmany"],
      },
    },
  },
   {
    displayName: "Webhook Gid",
    name: "Id",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["Webhooks"],
        name: ["get","update","delete"],
      },
    },
  },
  
  // story
 {
    displayName: "Task Gid",
    name: "task_gid",
    type: "dropdown",
    description: "gid of the task",
    default: "",
    items: [],
    options:[],
    async init(id) {
      const logger = new CustomLogger()
      try {
        const options = await asanaController.getAllTask(id)
        this.options = options;
      } catch (error) {
         logger.error('Error occurred:', error + error.stack);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ["story"],
        name: ["create"],
      },
    },
  }, {
    displayName: "Text",
    name: "text",
    type: "string",
    description: "The plain text of the comment to add. Cannot be used with html_text.",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["story"],
        name: ["create","update"],
      },
    },
  },
{
    displayName: "story Gid",
    name: "Id",
    type: "string",
    description: "gid of trhe story",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["story"],
        name: ["get","update","delete"],
      },
    },
  },
  
 {
    displayName: "Addtional Fields",
    name: "addtional fields",
    type: "string",
    description: "",
    default: "",
    items: [],
    fields:storyAddtionalFields,
    required: true,
    displayOptions: {
      show: {
        category: ["story"],
        name: ["create","update"],
      },
    },
  },
  /// section
  {
    displayName: "Project Gid",
    name: "project_gid",
    type: "dropdown",
    description: "gid of the project",
    default: "",
    items: [],
    options:[],
    async init(id) {
      const logger = new CustomLogger()
      try {
        const options = await asanaController.getAllProject(id)
        this.options = options;
      } catch (error) {
         logger.error('Error occurred:', error + error.stack);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ["section"],
        name: ["create"],
      },
    },
  },{
    displayName: "Name",
    name: "name",
    type: "string",
    description: "name of the section",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["section"],
        name: ["create","update"],
      },
    },
  },{
    displayName: "Addtinal Fields",
    name: "addtional fields",
    type: "string",
    description: "",
    default: "",
    items: [],
    fields:sectionAddtionalFields,
    required: true,
    displayOptions: {
      show: {
        category: ["section"],
        name: ["create","update"],

      },
    },
  },,{
    displayName: "Section Gid",
    name: "Id",
    type: "string",
    description: "gid of th section",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["section"],
        name: ["get","update","delete"],
      },
    },
  },

  // attachment
  {
    displayName: "Parent",
    name: "parent",
    type: "string",
    description: "Required identifier of the parent task, project, or project_brief, as a string.",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["attachment"],
        name: ["create"]
      },
    },
  },{
    displayName: "Attachment Gid",
    name: "Id",
    type: "string",
    description: "gid of the attachment",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["attachment"],
        name: ["get","delete"],
      },
    },
  },{
    displayName: "Addtional Fields",
    name: "addtional fields",
    type: "string",
    description: "",
    default: "",
    items: [],
    fields:attachmentAddtionalFields,
    required: false,
    displayOptions: {
      show: {
        category: ["attachment"],
        name: ["create"],
      },
    },
  },
  
  // workspace



  {
    displayName: "Workspac Gid",
    name: "workspace_gid",
    type: "string",
    description: "Globally unique identifier for the workspace or organization.",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["workspace"],
        name: ["create","get","update"],
      },
    },
  },
  {
    displayName: "User",
    name: "user",
    type: "string",
    description: "user gid",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["Workspace"],
        name: ["create"],
      },
    },
  },
  
]
