// awork.config.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONFIGURATION FILE.
// DO NOT modify the sections labeled "AUTO-GENERATED".
//
// Copyright (c) 2025 Smackcoders. All rights reserved.
// This file is subject to the Smackcoders Proprietary License.
// Unauthorized copying or distribution is strictly prohibited.
// -----------------------------------------------------------------------------

import { awork } from "./awork.controller";

export const XappName = "awork";
export const modules = [
  {
    "module": "project",
    "actions": [
      "get",
      "create",
      "getmany",
      "update",
      "delete"
    ]
  },
  {
    "module": "projecttypes",
    "actions": [
      "get",
      "create",
      "getmany",
      "update"
    ]
  },
  {
    "module": "projecttags",
    "actions": [
      "create",
      "get",
      "getmany",
      "update",
      "delete"
    ]
  },
  {
    "module": "projectcomments",
    "actions": [
      "get",
      "create",
      "getmany",
      "update",
      "delete"
    ]
  },
  {
    "module": "tasks",
    "actions": [
      "get",
      "create",
      "delete",
      "update"
    ]
  },
  {
    "module": "projecttasks",
    "actions": [
      "get",
      "create",
      "getmany",
      "update"
    ]
  },
  {
    "module": "companies",
    "actions": [
      "get",
      "create",
      "getmany",
      "update",
      "delete"
    ]
  },
  {
    "module": "users",
    "actions": [
      "get",
      "getmany",
      "delete",
      "update"
    ]
  },
  {
    "module": "roles",
    "actions": [
      "getmany",
      "get",
      "create",
      "delete",
      "update"
    ]
  },
  {
    "module": "teams",
    "actions": [
      "get",
      "getmany",
      "create",
      "delete",
      "update",
      "adduser",
      "addproject"
    ]
  }
];

export default {
  XappName,
  modules,
};

const projectAdditionalFields = [

  {
    displayName: "Is Private",
    name: "isPrivate",
    type: "boolean",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Description",
    name: "description",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Start Date",
    name: "startDate",
    type: "date",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Due Date",
    name: "dueDate",
    type: "date",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Company Id",
    name: "companyId",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Time Budget",
    name: "timeBudget",
    type: "integer ",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Is Billable By Default",
    name: "isBillableByDefault",
    type: "boolean ",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Project Type Id",
    name: "projectTypeId",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Color",
    name: "color",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Deduct Non Billable Hours",
    name: "deductNonBillableHours",
    type: "boolean",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Project Status Id",
    name: "projectStatusId",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Project Template Id",
    name: "projectTemplateId",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Public Project Template Id",
    name: "publicProjectTemplateId",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "",
    name: "",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },

]

const projectAdditionalFields2 = [

  {
    displayName: "Is Private",
    name: "isPrivate",
    type: "boolean",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Description",
    name: "description",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Start Date",
    name: "startDate",
    type: "date",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Due Date",
    name: "dueDate",
    type: "date",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Company Id",
    name: "companyId",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Time Budget",
    name: "timeBudget",
    type: "integer ",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Is Billable By Default",
    name: "isBillableByDefault",
    type: "boolean ",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Project Type Id",
    name: "projectTypeId",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Color",
    name: "color",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Deduct Non Billable Hours",
    name: "deductNonBillableHours",
    type: "boolean",
    description: "",
    default: "",
    items: [],
    required: false
  }
]

const projectTypesAdditionalFields = [

  {
    displayName: "Description",
    name: "description",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Icon",
    name: "icon",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },

]
const projecttagsAdditionalFields = [

  {
    displayName: "Color",
    name: "color",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },

]

const projectcommentsAdditionalFields = [
  {
    displayName: "User Id",
    name: "userId",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Previews",
    name: "previews",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Is Hidden For ConnectUsers",
    name: "isHiddenForConnectUsers",
    type: "boolean",
    description: "",
    default: "",
    items: [],
    required: false
  },

]

const companiesAdditionalFields = [
  {
    displayName: "Description",
    name: "description",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Industry",
    name: "industry",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },

]

const companiesAdditionalFields2 = [

  {
    displayName: "Move To Company",
    name: "moveToCompany",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Delete Operation",
    name: "deleteOperation",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },

]

const usersAdditionalFields = [
  {
    displayName: "First Name",
    name: "firstName",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Last Name",
    name: "lastName",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Birth Date",
    name: "birthDate",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Gender",
    name: "gender",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Title",
    name: "title",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Position",
    name: "position",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Language",
    name: "language",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },

]

const rolesAdditionalfields = [
  {
    displayName: "Is Admin Role",
    name: "isAdminRole",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Is Guest Role",
    name: "isGuestRole",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },

]

const teamsAdditionalFields = [
  {
    displayName: "Icon",
    name: "icon",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Color",
    name: "color",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },

]

const TaskAdditionalFields = [
  {
    displayName: "Description",
    name: "description",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Is Prio",
    name: "isPrio",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Start On",
    name: "startOn",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Due On",
    name: "dueOn",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Lane Order",
    name: "laneOrder",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Planned Duration",
    name: "plannedDuration",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Order",
    name: "order",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Subtask Order",
    name: "subtaskOrder",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Parent Id",
    name: "parentId",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Lists",
    name: "lists__id",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Lists",
    name: "lists__order",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "",
    name: "",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
]

const TaskAdditionalFields2 = [
  {
    displayName: "Description",
    name: "description",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Is Prio",
    name: "isPrio",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Start On",
    name: "startOn",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Due On",
    name: "dueOn",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Lane Order",
    name: "laneOrder",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Planned Duration",
    name: "plannedDuration",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: false
  },

]
export const fields = [

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
    displayName: "Additional Fields",
    name: "additional fields",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["project"],
        name: ["create"],
      },
    },
    fields: projectAdditionalFields
  },
  {
    displayName: "Additional Fields",
    name: "additional fields",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["project"],
        name: ["update"],
      },
    },
    fields: projectAdditionalFields2
  },
  {
    displayName: "Project Id",
    name: "Id",
    type: "string",
    description: "",
    default: "",
    items: [],
    options: [],
    async init(data) {
      try {
        const options = await awork.getallProject(data)
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ["project"],
        name: ["update", "get", "delete"],
      },
    },
  },

  {
    displayName: "Project getmany",
    name: "projectgetmany",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    options: [],
    async init(data) {
      try {
        const options = await awork.getallProject(data)
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    displayOptions: {
      show: {
        category: ["project"],
        name: ["getmany"],
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
        category: ["project types"],
        name: ["create", "update"],
      },
    },
  },
  {
    displayName: "Additional Fields",
    name: "additional fields",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["project types"],
        name: ["create", "update"],
      },
    },
    fields: projectTypesAdditionalFields
  },
  {
    displayName: "Project Type ID",
    name: "Id",
    type: "string",
    description: "",
    default: "",
    items: [],
    options: [],
    async init(data) {
      try {
        const options = await awork.getallProjecttypes(data)
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ["project types"],
        name: ["get", "update", "delete"],
      },
    },
  },
  {
    displayName: "Project Types getmany",
    name: "projectgetmany",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    options: [],
    async init(data) {
      try {
        const options = await awork.getallProjecttypes(data)
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    displayOptions: {
      show: {
        category: ["project types"],
        name: ["getmany"],
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
        category: ["project tags"],
        name: ["create", "delete"],
      },
    },
  },
  {
    displayName: "Additionl Fields",
    name: "additional fields",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["project tags"],
        name: ["create", "update"],
      },
    },
    fields: projecttagsAdditionalFields
  },
  {
    displayName: "Project Id",
    name: "Id",
    type: "string",
    description: "",
    default: "",
    items: [],
    options: [],
    async init(data) {
      try {
        const options = await awork.getallProject(data)
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ["project tags"],
        name: ["update", "get"],
      },
    },
  },
  {
    displayName: "Old Tag Name",
    name: "oldTagName",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["project tags"],
        name: ["update"],
      },
    },
  },
  {
    displayName: "New Tag",
    name: "newTag__name",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["project tags"],
        name: ["update"],
      },
    },
  },


  // project comments
  {
    displayName: "Project Id",
    name: "Id",
    type: "string",
    description: "",
    default: "",
    items: [],
    
    required: true,
options: [],
    async init(data) {
      try {
        const options = await awork.getallProject(data)
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    displayOptions: {
      show: {
        category: ["project comments"],
        name: ["create", "update", "delete", "get"],
      },
    },
  },
  {
    displayName: "Comment Id",
    name: "Id",
    type: "string",
    description: "",
    default: "",
    items: [],
    options: [],
    async init(data) {
      try {
        const options = await awork.getallProjectcomments(data)
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ["project comments"],
        name: ["create", "update", "delete", "get"],
      },
    },
  },
  {
    displayName: "Message",
    name: "message",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["project comments"],
        name: ["create"],
      },
    },
  },
  {
    displayName: "Additional Fields",
    name: "additional fields",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["project comments"],
        name: ["create", "update"],
      },
    },
    fields: projectcommentsAdditionalFields
  },
  {
    displayName: "Project  Comments getmany",
    name: "projectcommentsgetmany",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    options: [],
    async init(data) {
      try {
        const options = await awork.getallProjectcomments(data)
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    displayOptions: {
      show: {
        category: ["project comments"],
        name: ["getmany"],
      },
    },
  },


  //companies
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
        category: ["companies"],
        name: ["create", "update"],
      },
    },
  },
  {
    displayName: "Companies getmany",
    name: "companiesgetmany",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    options: [],
    async init(data) {
      try {
        const options = await awork.getallCompanies(data)
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    displayOptions: {
      show: {
        category: ["companies"],
        name: ["getmany"],
      },
    },
  },
  {
    displayName: "Additional Fields",
    name: "additional fields",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["comapnies"],
        name: ["create", "update"],
      },
    },
    fields: companiesAdditionalFields
  },
  {
    displayName: "Comapany Id",
    name: "Id",
    type: "string",
    description: "",
    default: "",
    items: [],
    options: [],
    async init(data) {
      try {
        const options = await awork.getallCompanies(data)
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ["companies"],
        name: ["get", "update", "delete"],
      },
    },
  },
  {
    displayName: "Additional Fields",
    name: "additional fields",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["companies"],
        name: ["delete"],
      },
    },
    fields: companiesAdditionalFields2
  },


  // Users
  {
    displayName: "User Id",
    name: "Id",
    type: "string",
    description: "",
    default: "",
    items: [],
     async init(data) {
      try {
        const options = await awork.getallUsers(data)
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ["users"],
        name: ["get", "update", "delete"],
      },
    },
  },
  {
    displayName: "Users getmany",
    name: "usersgetmany",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    options: [],
    async init(data) {
      try {
        const options = await awork.getallUsers(data)
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    displayOptions: {
      show: {
        category: ["users"],
        name: ["getmany"],
      },
    },
  },
  {
    displayName: "Additional Fields",
    name: "additional fields",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["users"],
        name: ["update"],
      },
    },
    fields: usersAdditionalFields
  },

  // Roles
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
        category: ["roles"],
        name: ["create", "update"],
      },
    },
  },
  {
    displayName: "Roles getmany",
    name: "rolesgetmany",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    options: [],
    async init(data) {
      try {
        const options = await awork.getallRoles(data)
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    displayOptions: {
      show: {
        category: ["roles"],
        name: ["getmany"],
      },
    },
  },
  {
    displayName: "Additional Fields",
    name: "additional fileds",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["roles"],
        name: ["create", "update"],
      },
    },
    fields: rolesAdditionalfields
  },
  {
    displayName: "roleId",
    name: "Id",
    type: "string",
    description: "",
    default: "",
    items: [],
    options: [],
    async init(data) {
      try {
        const options = await awork.getallRoles(data)
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ["roles"],
        name: ["get", "update", "delete"],
      },
    },
  },

  // teams
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
        category: ["teams"],
        name: ["create"],
      },
    },
  },
  {
    displayName: "Teams getmany",
    name: "teamsgetmany",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    options: [],
    async init(data) {
      try {
        const options = await awork.getallTeams(data)
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    displayOptions: {
      show: {
        category: ["teams"],
        name: ["getmany"],
      },
    },
  },
  {
    displayName: "Additional Fields",
    name: "additional fields",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["teams"],
        name: ["create", "update"],
      },
    },
    fields: teamsAdditionalFields
  },
  {
    displayName: "Team Id",
    name: "Id",
    type: "string",
    description: "",
    default: "",
    items: [],
    options: [],
    async init(data) {
      try {
        const options = await awork.getallTeams(data)
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    required: true,
    displayOptions: {
      show: {
        category: ["teams"],
        name: ["get", "update", "delete", "addproject", "adduser"],
      },
    },
  },

  // tasks  
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
        category: ["task"],
        name: ["create", "update"],
      },
    },
  },
  {
    displayName: "Type Of work Id",
    name: "typeOfworkId",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["task"],
        name: ["create"],
      },
    },
  },
  {
    displayName: "Task Status Id",
    name: "taskStatusId",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["task"],
        name: ["create"],
      },
    },
  },
  {
    displayName: "Entity Id",
    name: "entityId",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["task"],
        name: ["create"],
      },
    },
  },
  {
    displayName: "Base Type",
    name: "baseType",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["task"],
        name: ["create"],
      },
    },
  },
  {
    displayName: "Additional Fields",
    name: "additional fields",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["task"],
        name: ["create"],
      },
    },
    fields: TaskAdditionalFields
  },
  {
    displayName: "Additional Fields",
    name: "additional fields",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["task"],
        name: ["update"],
      },
    },
    fields: TaskAdditionalFields2
  },
  {
    displayName: "Task Id",
    name: "Id",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["task"],
        name: ["update", "get", "delete"],
      },
    },
  },

  {
    displayName: "Project Id",
    name: "Id",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    options: [],
    async init(data) {
      try {
        const options = await awork.getallProject(data)
        this.options = options;
      } catch (error) {
        console.error('Error occurred:', error);
      }
    },
    displayOptions: {
      show: {
        category: ["project task"],
        name: ["create", "get"],
      },
    },
  },

  {
    displayName: "Task Status Id",
    name: "Id",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["project"],
        name: ["update", "get"],
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
        name: ["update", "create"],
      },
    },
  },
  {
    displayName: "Type",
    name: "type",
    type: "string",
    description: "",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["project"],
        name: ["update", "create"],
      },
    },
  },


]