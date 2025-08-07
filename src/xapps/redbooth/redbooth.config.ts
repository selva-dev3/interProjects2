// redbooth.config.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONFIGURATION FILE.
// DO NOT modify the sections labeled "AUTO-GENERATED".
//
// Copyright (c) 2025 Smackcoders. All rights reserved.
// This file is subject to the Smackcoders Proprietary License.
// Unauthorized copying or distribution is strictly prohibited.
// -----------------------------------------------------------------------------
import { redboothController } from "./redbooth.controller";
export const XappName = "redbooth";
export const modules = [
  {
    "module": "task",
    "actions": [
      "create",
      "update",
      "get",
      "getmany",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "subtask",
    "actions": [
      "create",
      "update",
      "get",
      "getmany",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "tasklist",
    "actions": [
      "create",
      "update",
      "get",
      "getmany",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "comment",
    "actions": [
      "create",
      "update",
      "get",
      "getmany",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "project",
    "actions": [
      "create",
      "update",
      "get",
      "getmany",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "organization",
    "actions": [
      "getmany",
      'create'
    ],
    "triggers": []
  },
  {
    "module": "workspace",
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

// -------task module------//

export const createAndUpdateTaskFields = [
  {
    "displayName": "Description",
    "name": "description",
    "type": "string",
    "required": false,
    "description": "Description of the task that will stay on the top of it. Example: Example description",
    "items": [],
    "options": []
  },
  {
    "displayName": "Isprivate",
    "name": "is_private",
    "type": "string",
    "required": false,
    "description": "This parameter is used to manage rights & permissions. Default: false. Example: false",
    "items": [],
    "options": []
  },
  {
    "displayName": "Status",
    "name": "status",
    "type": "string",
    "required": false,
    "description": "Tasks can have different status: open or resolved. Default: new. Example: open",
    "items": [],
    "options": []
  },
  {
    "displayName": "Urgent",
    "name": "urgent",
    "type": "string",
    "required": false,
    "description": "This parameter denotes whether or not a task is urgent. Default: false. Example: false",
    "items": [],
    "options": []
  },
  {
    "displayName": "Due_on",
    "name": "due_on",
    "type": "string",
    "required": false,
    "description": "The due date for the task, of the form “yyyy-mm-dd”.",
    "items": [],
    "options": []
  },
  {
    "displayName": "AssignedUser_ids",
    "name": "assigned_user_ids",
    "type": "array",
    "required": false,
    "description": "The Ids of the users assigned to the task.",
    "items": [],
    "options": []
  }
]


// ----subTask module-----//

export const createAndUpdateSubtaskFiields = [
  {
    "displayName": "Resolved",
    "name": "resolved",
    "type": "string",
    "required": false,
    "description": "This parameter determines if the subtask has been resolved or not. Default: false. Example: true",
    "items": [],
    "options": []
  },
  {
    "displayName": "Position",
    "name": "position",
    "type": "integer",
    "required": false,
    "description": "Position of the subtask in the subtask list, inside the task. Example: 1",
    "items": [],
    "options": []
  }
]

// -----taskList module----//

export const createAndUpdateTaskListFields = [
  {
    "displayName": "Archived",
    "name": "archived",
    "type": "string",
    "required": false,
    "description": "TaskLists can be archived, so this parameter can be =true or =false. To get archived and not archived task lists you have to pass archived=true,false. Default: false. Example: false",
    "items": [],
    "options": []
  }
]

// ----comment module----//

export const createAndUpdateCommmentFields = [
  {
    "displayName": "Body",
    "name": "body",
    "type": "string",
    "required": false,
    "description": "Body of the comment. Example: Example body",
    "items": [],
    "options": []
  },
  {
    "displayName": "Minutes",
    "name": "minutes",
    "type": "integer",
    "required": false,
    "description": "This parameter is used to add time spent to a task. Example: 60",
    "items": [],
    "options": []
  },
  {
    "displayName": "TimeTrackingOn",
    "name": "time_tracking_on",
    "type": "date",
    "required": false,
    "description": "Enables us to add time spent in a different date than the current date, that would be the default value. Example: 2014-06-26",
    "items": [],
    "options": []
  }
]

// ----project module---//

export const createAndUpdateProjectFields = [
  {
    "displayName": "TracksTime",
    "name": "tracks_time",
    "type": "string",
    "required": false,
    "description": "This parameter can be true/false to enable/disable time tracking. Default: false. Example: true",
    "items": [],
    "options": []
  },
  {
    "displayName": "Public",
    "name": "public",
    "type": "string",
    "required": false,
    "description": "This parameter is used to manage rights & permissions. It can be =true or =false and it determines if the project can be viewed by anyone in the organization or not. Default: true. Example: true",
    "items": [],
    "options": []
  },

]

export const fields = [

  //-----task module-----//

  {
    displayName: "ProjectId",
    name: "project_id",
    type: "string",
    default: "",
    description: "Id of the project to which the element will belong after posting it.",
    items: [],
    required: true,
    options: [],
        async init(data) {
      try {
        const list = await redboothController.getAllProjects(data);
        console.log(list)
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["events"],
        name: ["create"],
      }
    }
  },
  {
    displayName: "TaskListId",
    name: "task_list_id",
    type: "string",
    default: "",
    description: "The TaskList id of the TaskList to which the new task will belong.",
    items: [],
    required: true,
    options: [],
        async init(data) {
      try {
        const list = await redboothController.getAllTaskList(data);
        console.log(list)
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["task"],
        name: ["create"],
      }
    }
  },
  {
    displayName: "Name",
    name: "name",
    type: "string",
    default: "",
    description: "The name that the task will have.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["task"],
        name: ["create"],
      }
    }
  },
  {
    displayName: "TaskId",
    name: "task_id",
    type: "string",
    default: "",
    description: "id of the task will have",
    items: [],
    required: true,
    options: [],
        async init(data) {
      try {
        const list = await redboothController.getAllTask(data);
        console.log(list)
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["task"],
        name: ["get", "update", "delete"],
      }
    }
  },
  {
    displayName: "Additional Fields",
    name: "additionalFields",
    type: "collection",
    placeholder: "Add Field",
    default: {},
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ["task"],
        name: ["create", "update"],
      }
    },
    fields: createAndUpdateTaskFields,
  },
  {
    displayName: "ReturnAll",
    name: "returnAll",
    type: "collection",
    placeholder: "Add Field",
    default: {},
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ["task"],
        name: ["getmany"],
      }
    },
    async init(data) {
      try {
        const list = await redboothController.getAllTask(data);
        console.log(list)
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
  },

  // ---subtask module---//

  {
    displayName: "TaskId",
    name: "task_id",
    type: "string",
    default: "",
    description: "The name that the subtask will have",
    items: [],
    required: true,
    options: [],
        async init(data) {
      try {
        const list = await redboothController.getAllTask(data);
        console.log(list)
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["subtask"],
        name: ["create", "update"],
      }
    }
  },
  {
    displayName: "Name",
    name: "name",
    type: "string",
    default: "",
    description: "id of the task will have",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["subtask"],
        name: ["create", "update"],
      }
    }
  },
  {
    displayName: "SubtaskId",
    name: "subtask_id",
    type: "string",
    default: "",
    description: "Id of the subtask that we are looking for.",
    items: [],
    required: true,
    options: [],
        async init(data) {
      try {
        const list = await redboothController.getAllsubTask(data);
        console.log(list)
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["subtask"],
        name: ["get", "update", "delete"],
      }
    }
  },
  {
    displayName: "Additional Fields",
    name: "additionalFields",
    type: "collection",
    placeholder: "Add Field",
    default: {},
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ["subtask"],
        name: ["create", "update"],
      }
    },
    fields: createAndUpdateSubtaskFiields,
  },
  {
    displayName: "TaskId",
    name: "task_id",
    type: "collection",
    placeholder: "Add Field",
    default: {},
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["subtask"],
        name: ["getmany"],
      }
    },
    async init(data) {
      try {
        const list = await redboothController.getAllTask(data);
        console.log(list)
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
  },
    {
    displayName: "ReturnAll",
    name: "returnAll",
    type: "collection",
    placeholder: "Add Field",
    default: {},
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ["subtask"],
        name: ["getmany"],
      }
    },
    async init(data) {
      try {
        const list = await redboothController.getAllsubTask(data);
        console.log(list)
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
  },
  // ---taskList module-----//

  {
    displayName: "ProjectId",
    name: "project_id",
    type: "string",
    default: "",
    description: "id of the project to which the element will belong after posting it.",
    items: [],
    required: true,
    options: [],
        async init(data) {
      try {
        const list = await redboothController.getAllProjects(data);
        console.log(list)
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["taskList"],
        name: ["create"],
      }
    }
  },
  {
    displayName: "Name",
    name: "Name",
    type: "string",
    default: "",
    description: "The name that the TaskList will have.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["taskList"],
        name: ["create"],
      }
    }
  },
  {
    displayName: "TaskListId",
    name: "taskList_id",
    type: "string",
    default: "",
    description: "The name that the TaskList will have.",
    items: [],
    required: true,
    options: [],
        async init(data) {
      try {
        const list = await redboothController.getAllTaskList(data);
        console.log(list)
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["taskList"],
        name: ["get", "update", "delete"],
      }
    }
  },
  {
    displayName: "Additional Fields",
    name: "additionalFields",
    type: "collection",
    placeholder: "Add Field",
    default: {},
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ["taskList"],
        name: ["create", "update"],
      }
    },
    fields: createAndUpdateTaskListFields,
  },
  {
    displayName: "ReturnAll",
    name: "returnAll",
    type: "collection",
    placeholder: "Add Field",
    default: {},
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ["taskList"],
        name: ["getmany"],
      }
    },
    async init(data) {
      try {
        const list = await redboothController.getAllTaskList(data);
        console.log(list)
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
  },

  // ----comment module-----//
  {
    displayName: "TargetType",
    name: "target_type",
    type: "string",
    default: "",
    description: "Comments can be part of a conversation or part of a task. ",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["comment"],
        name: ["create"],
      }
    }
  },
  {
    displayName: "TargetId",
    name: "target_id",
    type: "string",
    default: "",
    description: "Id of the element to which the comment will belong. If it is going to be part of a task, the task’s id.",
    items: [],
    required: true,
    options: [],
        async init(data) {
      try {
        const list = await redboothController.getAllTask(data);
        console.log(list)
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["comment"],
        name: ["create"],
      }
    }
  },
  {
    displayName: "CommentId",
    name: "commentId",
    type: "string",
    default: "",
    description: "Id of the comment that we are looking for.",
    items: [],
    required: true,
    options: [],
        async init(data) {
      try {
        const list = await redboothController.getAllComments(data);
        console.log(list)
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["comment"],
        name: ["update", 'delete', "get"],
      }
    }
  },
  {
    displayName: "Additional Fields",
    name: "additionalFields",
    type: "collection",
    placeholder: "Add Field",
    default: {},
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ["comment"],
        name: ["create", "update"],
      }
    },
    fields: createAndUpdateCommmentFields,
  },
  {
    displayName: "ReturnAll",
    name: "returnAll",
    type: "collection",
    placeholder: "Add Field",
    default: {},
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ["comment"],
        name: ["getmany"],
      }
    },
    async init(data) {
      try {
        const list = await redboothController.getAllComments(data);
        console.log(list)
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
  },

  // ------project module---//

  {
    displayName: "Name",
    name: "Name",
    type: "string",
    default: "",
    description: "The name that the project will have.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["project"],
        name: ["create", "update"],
      }
    }
  },
  {
    displayName: "OrganizationId",
    name: "organization_id",
    type: "string",
    default: "",
    description: "Id of the organization to which the project will belong after posting it.",
    items: [],
    required: true,
    options: [],
        async init(data) {
      try {
        const list = await redboothController.getAllOrganization(data);
        console.log(list)
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["project"],
        name: ["create", "update"],
      }
    }
  },
  {
    displayName: "PublishPages",
    name: "publish_pages",
    type: "string",
    default: "",
    description: "This parameter enables/disables the usage of public notes in a project.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["project"],
        name: ["create", "update"],
      }
    }
  },

  {
    displayName: "ProjectId",
    name: "project_id",
    type: "string",
    default: "",
    description: "Id of the organization to which the project will belong after posting it.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["project"],
        name: ["update", "delete", "get"],
      }
    }
  },
  {
    displayName: "Additional Fields",
    name: "additionalFields",
    type: "collection",
    placeholder: "Add Field",
    default: {},
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ["project"],
        name: ["create", "update"],
      }
    },
    fields: createAndUpdateProjectFields,
  },
  {
    displayName: "ReturnAll",
    name: "returnAll",
    type: "collection",
    placeholder: "Add Field",
    default: {},
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ["project"],
        name: ["getmany"],
      }
    },
    async init(data) {
      try {
        const list = await redboothController.getAllProjects(data);
        console.log(list)
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
  },

  // ----organisization module---//
  {
    displayName: "Name",
    name: "Name",
    type: "string",
    default: "",
    description: "The name that the organization will have.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["organization"],
        name: ["create"],
      }
    }
  },
  {
    displayName: "Permalink",
    name: "permalink",
    type: "string",
    default: "",
    description: "Permalink the organization will have.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["organization"],
        name: ["create"],
      }
    }
  },
  {
    displayName: "Domain",
    name: "domain",
    type: "string",
    default: "",
    description: "Domain the organization will have.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["organization"],
        name: ["create"],
      }
    }
  },
  {
    displayName: "OrganizationId",
    name: "organization_id",
    type: "string",
    default: "",
    description: "id of the organization will have.",
    items: [],
    required: true,
    options: [],
    displayOptions: {
      show: {
        category: ["organization"],
        name: ["get"],
      }
    }
  },
  {
    displayName: "Additional Fields",
    name: "additionalFields",
    type: "collection",
    placeholder: "Add Field",
    default: {},
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ["organization"],
        name: ["create"],
      }
    },
  },
    {
    displayName: "ReturnAll",
    name: "returnAll",
    type: "collection",
    placeholder: "Add Field",
    default: {},
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ["organization"],
        name: ["getmany"],
      }
    },
    async init(data) {
      try {
        const list = await redboothController.getAllOrganization(data);
        console.log(list)
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
  },
]