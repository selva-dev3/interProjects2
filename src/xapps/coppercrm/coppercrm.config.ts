// coppercrm.config.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONFIGURATION FILE.
// DO NOT modify the sections labeled "AUTO-GENERATED".
//
// Copyright (c) 2025 Smackcoders. All rights reserved.
// This file is subject to the Smackcoders Proprietary License.
// Unauthorized copying or distribution is strictly prohibited.
// -----------------------------------------------------------------------------

import { CustomLogger } from "src/logger/custom.logger";
import { coppercrm } from "./coppercrm.controller";

export const XappName = "coppercrm";
export const redirect =  "https://workflow.xapplets.com/exit";

export const modules = [
  // payment required
  // {
  //   "module": "lead",
  //   "actions": [
  //     "create",
  //     "get",
  //     "getMany",
  //     "update",
  //     "delete"
  //   ],
  //   "triggers": [
  //     "lead_created",
  //     "lead_updated",
  //     "lead_deleted"
  //   ]
  // },
  {
    "module": "opportunity",
    "actions": [
      "create",
      "get",
      "getMany",
      "update",
      "delete"
    ],
    "triggers": [
      "opportunity_created",
      "opportunity_updated",
      "opportunity_deleted"
    ]
  },
  {
    "module": "person",
    "actions": [
      "create",
      "get",
      "getMany",
      "update",
      "delete"
    ],
    "triggers": [
      "person_created",
      "person_updated",
      "person_deleted"
    ]
  },
  {
    "module": "companies",
    "actions": [
      "create",
      "get",
      "getMany",
      "update",
      "delete"
    ],
    "triggers": [
      "Companies_created",
      "Companies_updated",
      "Companies_deleted"
    ]
  },
  {
    "module": "activity",
    "actions": [
      "create",
      "get",
      "getMany",
      "update",
      "delete"
    ],
    "triggers": [
      "activity_created",
      "activity_updated",
      "activity_deleted"
    ]
  },
  {
    "module": "task",
    "actions": [
      "create",
      "get",
      "getMany",
      "update",
      "delete"
    ],
    "triggers": [
      "task_created",
      "task_updated",
      "task_deleted"
    ]
  },
  {
    "module": "user",
    "actions": [
      "get",
      "getMany"
    ],
    "triggers": [
      "user_created",
      "user_updated",
      "user_deleted"
    ]
  },
  {
    "module": "project",
    "actions": [
      "create",
      "get",
      "getMany",
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
    "module": "webhooks",
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
    "module": "getfields",
    "actions": [
      "get",
      "getMany"
    ],
    "triggers": []
  }
];


export const requiredFields = {
  coppercrm: ['id'],
};

export const fields=[
  // {
  //   displayName: "Lead Id",
  //   name: "Id",
  //   type: "dropdown",
  //   description: "Id of the lead",
  //   default: "",
  //   items:[],
  //   required: true,
  //   displayOptions: {
  //     show: {
  //       category: ["lead"],
  //       name:["delete","update","get"]
  //     }
  //   },
  // },
  // {
  //   displayName: "Where",
  //   name: "where",
  //   type: "filter",
  //   description: "Specify the conditions to filter items",
  //   default: "",
  //   items: [],
  //   displayOptions: {
  //   show: {
  //   category: ["lead"],
  //   name: ["getMany"]
  //   }
  //   }
  //   },
  //   {
  //     displayName: "Name",
  //     name: "name",
  //     type: "string",
  //     description: "Name of the lead",
  //     default: "",
  //     required: true,
  //     displayOptions: {
  //       show: {
  //         category: ["lead"],
  //         name:["create","update"]
  //       }
  //     }
  //   },
  //   {
  //     displayName: "Email",
  //     name: "email",
  //     type: "collection",
  //     description: "email address of the lead",
  //     default: "",
  //     required: true,
  //     fields:[
  //       {
  //         displayName: "Email",
  //         name: "email__email",
  //         type: "string",
  //         description: "email of the lead",
  //         default: "",
  //         required: true,
  //         items:[]
  //       },
  //       {
  //         displayName: "Category",
  //         name: "email__category",
  //         type: "string",
  //         description: "category of the email of the lead",
  //         default: "",
  //         required: true,
  //         items:[],
  //       }
  //     ],
  //     displayOptions: {
  //       show: {
  //         category: ["lead"],
  //         name:["create","update"]
  //       }
  //     }
  //   },
  //   {
  //     displayName: "Address",
  //     name: "address",
  //     type: "fixedcollection",
  //     description: "address of the lead",
  //     default: "",
  //     required: true,
  //     fields:[
  //       {
  //         displayName: "street",
  //         name: "address__street",
  //         type: "string",
  //         description: "street of the lead",
  //         default: "",
  //         required: true,
  //         items:[]
  //       },
  //       {
  //         displayName: "City",
  //         name: "address__city",
  //         type: "string",
  //         description: "city of the  lead",
  //         default: "",
  //         required: true,
  //         items:[],
  //       },
  //       {
  //         displayName: "state",
  //         name: "address__state",
  //         type: "string",
  //         description: "state of the  lead",
  //         default: "",
  //         required: true,
  //         items:[],
  //       },
  //       {
  //         displayName: "Country",
  //         name: "address__country",
  //         type: "string",
  //         description: "country of the  lead",
  //         default: "",
  //         required: true,
  //         items:[],
  //       }
  //     ],
  //     displayOptions: {
  //       show: {
  //         category: ["lead"],
  //         name:["create","update"]
  //       }
  //     }
  //   },


    {
      displayName: "Person Id",
      name: "Id",
      type: "string",
      description: "Id of the person",
      default: "",
      required: true,
      displayOptions: {
        show: {
          category: ["person"],
          name:["delete","update","get"]
        }
      },
     
    },
    {
      displayName: "Where",
      name: "where",
      type: "filter",
      description: "Specify the conditions to filter items",
      default: "",
      items: [],
      displayOptions: {
      
      show: {
      category: ["person"],
      name: ["getMany"]
      }
      }
      },
      {
        displayName: "Name",
        name: "name",
        type: "string",
        description: "Name of the person",
        default: "",
        required: true,
        displayOptions: {
          show: {
            category: ["person"],
            name:["create","update"]
          }
        }
      },
      {
        displayName: "Email",
        name: "emails",
        type: "collection",
        description: "email address of the person",
        default: "",
        required: true,
        fields:[
          {
            displayName: "Email",
            name: "emails||email",
            type: "string",
            description: "email of the person",
            default: "",
            required: true,
            items:[]
          },
          {
            displayName: "Category",
            name: "emails||category",
            type: "string",
            description: "category of the email of the person",
            default: "",
            required: true,
            items:[],
          }
        ],
        displayOptions: {
          show: {
            category: ["person"],
            name:["create","update"]
          }
        }
      },
      {
        displayName: "Address",
        name: "address",
        type: "fixedcollection",
        description: "address of the Person",
        default: "",
        required: true,
        fields:[
          {
            displayName: "street",
            name: "address__street",
            type: "string",
            description: "street of the Person",
            default: "",
            required: true,
            items:[]
          },
          {
            displayName: "City",
            name: "address__city",
            type: "string",
            description: "city of the  Person",
            default: "",
            required: true,
            items:[],
          },
          {
            displayName: "state",
            name: "address__state",
            type: "string",
            description: "state of the  Person",
            default: "",
            required: true,
            items:[],
          },
          {
            displayName: "Country",
            name: "address__country",
            type: "string",
            description: "country of the  Person",
            default: "",
            required: true,
            items:[],
          }
        ],
        displayOptions: {
          show: {
            category: ["person"],
            name:["create","update"]
          }
        }
      },
      {
        displayName: "Opoortunity Id",
        name: "Id",
        type: "dropdown",
        description: "Id of the opportunity",
        default: "",
        required: true,
        displayOptions: {
          show: {
            category: ["opportunity"],
            name:["delete","update","get"]
          }
        },
      },
      {
        displayName: "Where",
        name: "where",
        type: "filter",
        description: "Specify the conditions to filter items",
        default: "",
        items: [],
        displayOptions: {
        
        show: {
        category: ["opportunity"],
        name: ["getMany"]
        }
        }
        },
        {
          displayName: "Name",
          name: "name",
          type: "string",
          description: "Name of the Opportunity",
          default: "",
          required: true,
          displayOptions: {
            show: {
              category: ["opportunity"],
              name:["create","update"]
            }
          }
        },
        {
          displayName: "Primary contact Id",
          name: "primary_contact_id",
          type: "dropdown",
          description: "Contact Id in which the opportunity is to be created",
          default: "",
          options:[],
          async init(id) {
                  const logger = new CustomLogger()
                  try {
                  const options = await coppercrm.getAllContacts(id)
                  this.options = options;
                  } catch (error) {
                      logger.error('Error occurred:', error + error.stack);
                  }
          },
          required: true,
          displayOptions: {
            show: {
              category: ["opportunity"],
              name:["create","update"]
            }
          },
        },


        {
          displayName: "Companies Id",
          name: "Id",
          type: "string",
          description: "Id of the comapny",
          default: "",
          required: true,
          displayOptions: {
            show: {
              category: ["companies"],
              name:["delete","update","get"]
            }
          },
          
        },
        {
          displayName: "Where",
          name: "where",
          type: "filter",
          description: "Specify the conditions to filter items",
          default: "",
          items: [],
          displayOptions: {
          
          show: {
          category: ["companies"],
          name: ["getMany"]
          }
          }
          },
          {
            displayName: "Name",
            name: "name",
            type: "string",
            description: "Name of the Companies",
            default: "",
            required: true,
            displayOptions: {
              show: {
                category: ["companies"],
                name:["create","update"]
              }
            }
          },
          {
            displayName: "Email Domain",
            name: "email_domain",
            type: "string",
            description: "email domain of the Companies",
            default: "",
            required: true,
            displayOptions: {
              show: {
                category: ["companies"],
                name:["create","update"]
              }
            }
          },
          {
            displayName: "Address",
            name: "address",
            type: "fixedcollection",
            description: "address of the Companies",
            default: "",
            required: true,
            fields:[
              {
                displayName: "street",
                name: "address__street",
                type: "string",
                description: "street of the Companies",
                default: "",
                required: true,
                items:[]
              },
              {
                displayName: "City",
                name: "address__city",
                type: "string",
                description: "city of the  Companies",
                default: "",
                required: true,
                items:[],
              },
              {
                displayName: "state",
                name: "address__state",
                type: "string",
                description: "state of the  Companies",
                default: "",
                required: true,
                items:[],
              },
              {
                displayName: "Country",
                name: "address__country",
                type: "string",
                description: "country of the  Companies",
                default: "",
                required: true,
                items:[],
              }
            ],
            displayOptions: {
              show: {
                category: ["companies"],
                name:["create","update"]
              }
            }
          },
          {
            displayName: "Primary contact Id",
            name: "primary_contact_id",
            type: "dropdown",
            description: "Contact Id in which the Companies is to be created",
            default: "",
            options:[],
            async init(id) {
              const logger = new CustomLogger()
              try {
              const options = await coppercrm.getAllContacts(id)
              this.options = options;
              } catch (error) {
                  logger.error('Error occurred:', error + error.stack);
              }
      },
            required: true,
            displayOptions: {
              show: {
                category: ["companies"],
                name:["create","update"]
              }
            },
          },


          {
            displayName: "Project Id",
            name: "Id",
            type: "string",
            description: "Id of the Project",
            default: "",
            required: true,
            displayOptions: {
              show: {
                category: ["project"],
                name:["delete","update","get"]
              }
            },
            
          },
          {
            displayName: "Where",
            name: "where",
            type: "filter",
            description: "Specify the conditions to filter items",
            default: "",
            items: [],
            displayOptions: {
            
            show: {
            category: ["project"],
            name: ["getMany"]
            }
            }
            },
            {
              displayName: "Name",
              name: "name",
              type: "string",
              description: "Name of the Project",
              default: "",
              required: true,
              displayOptions: {
                show: {
                  category: ["project"],
                  name:["create","update"]
                }
              }
            },
    

            {
              displayName: "Task Id",
              name: "Id",
              type: "string",
              description: "Id of the task",
              default: "",
              required: true,
              displayOptions: {
                show: {
                  category: ["task"],
                  name:["delete","update","get"]
                }
              },
             
            },
            {
              displayName: "Where",
              name: "where",
              type: "filter",
              description: "Specify the conditions to filter items",
              default: "",
              items: [],
              displayOptions: {
              
              show: {
              category: ["task"],
              name: ["getMany"]
              }
              }
              },
              {
                displayName: "Name",
                name: "name",
                type: "string",
                description: "Name of the Task",
                default: "",
                required: true,
                displayOptions: {
                  show: {
                    category: ["task"],
                    name:["create","update"]
                  }
                }
              },
              {
                displayName: "Due Date",
                name: "due_date",
                type: "date",
                description: "due date of the Task",
                default: "",
                required: true,
                displayOptions: {
                  show: {
                    category: ["task"],
                    name:["create","update"]
                  }
                }
              },
              {
                displayName: "Related resource",
                name: "related_resource",
                type: "fixedcollection ",
                description: "Resources that are related to the task",
                default: "",
                required: true,
                items:[],
                fields:[
                  {
                    displayName: "Id",
                    name: "related_resource__id",
                    type: "dropdown",
                    description: "Id to which the resource is to be related",
                    default: "",
                    required: true,
                    items:[]                                   
                  },
                  {
                    displayName: "Type",
                    name: "related_resource__type",
                    type: "dropdown",
                    description: "Type of the resource associated with the id",
                    default: "",
                    required: true,
                    items:[]                                   
                  },
                ],
                displayOptions: {
                  show: {
                    category: ["task"],
                    name:["create","update"]
                  }
                },
                
              },

              
              {
                displayName: "Activity Id",
                name: "Id",
                type: "string",
                description: "Id of the activity",
                default: "",
                required: true,
                displayOptions: {
                  show: {
                    category: ["activity"],
                    name:["delete","update","get"]
                  }
                },
                
              },
              {
                displayName: "Where",
                name: "where",
                type: "filter",
                description: "Specify the conditions to filter items",
                default: "",
                items: [],
                displayOptions: {
                
                show: {
                category: ["activity"],
                name: ["getMany"]
                }
                }
                },
                {
                  displayName: "Parent ",
                  name: "parent",
                  type: "fixedcollection ",
                  description: "parent source of the activity",
                  default: "",
                  required: true,
                  items:[],
                  fields:[
                    {
                      displayName: "Id",
                      name: "parent__id",
                      type: "dropdown",
                      description: "Id of the parent type",
                      default: "",
                      required: true,
                      items:[]                                   
                    },
                    {
                      displayName: "Type",
                      name: "parent__type",
                      type: "dropdown",
                      description: "Type of the entity",
                      default: "",
                      required: true,
                      items:[]                                   
                    },
                  ],
                  displayOptions: {
                    show: {
                      category: ["activity"],
                      name:["create","update"]
                    }
                  },
                  
                },
                {
                  displayName: "Type ",
                  name: "type",
                  type: "fixedcollection ",
                  description: "Type of the activity",
                  default: "",
                  required: true,
                  items:[],
                  fields:[
                    {
                      displayName: "Id",
                      name: "type__id",
                      type: "dropdown",
                      description: "Id of the category",
                      default: "",
                      required: true,
                      items:[]                                   
                    },
                    {
                      displayName: "category",
                      name: "type__category",
                      type: "dropdown",
                      description: "Type of the entity",
                      default: "",
                      required: true,
                      items:[] ,
                      options:[
                        {name:"User",value:"user"},
                        {name:"System",value:"system"}
                      ]                                  
                    },
                  ],
                  displayOptions: {
                    show: {
                      category: ["activity"],
                      name:["create","update"]
                    }
                  },
                  
                },

                {
                  displayName: "User Id",
                  name: "Id",
                  type: "string",
                  description: "Id of the user",
                  default: "",
                  required: true,
                  displayOptions: {
                    show: {
                      category: ["users"],
                      name:["get"]
                    }
                  },
                  
                },
                {
                  displayName: "Where",
                  name: "where",
                  type: "filter",
                  description: "Specify the conditions to filter items",
                  default: "",
                  items: [],
                  displayOptions: {
                  
                  show: {
                  category: ["users"],
                  name: ["getMany"]
                  }
                  }
                  },



                  {
                    displayName: "Webhook Id",
                    name: "Id",
                    type: "string",
                    description: "Id of the Webhook",
                    default: "",
                    required: true,
                    displayOptions: {
                      show: {
                        category: ["webhooks"],
                        name:["get","update","delete"]
                      }
                    },
                    
                  },
                  {
                    displayName: "Where",
                    name: "where",
                    type: "filter",
                    description: "Specify the conditions to filter items",
                    default: "",
                    items: [],
                    displayOptions: {
                    
                    show: {
                    category: ["webhooks"],
                    name: ["getMany"]
                    }
                    }
                    },
                    {
                      displayName: "Target ",
                      name: "target",
                      type: "string",
                      description: "url of the Webhook",
                      default: "",
                      required: true,
                      displayOptions: {
                        show: {
                          category: ["webhooks"],
                          name:["create","update"]
                        }
                      },
                    },
                    {
                      displayName: "Type ",
                      name: "type",
                      type: "dropdown",
                      description: "The entity type that this subscription is for.",
                      default: "",
                      required: true,
                      items:[],
                      options:[
                        {name:"Lead",value:"lead"},
                        {name:"Person",value:"person"},
                        {name:"Company",value:"company"},
                        {name:"Opportunity",value:"opportunity"},
                        {name:"Project",value:"project"},
                        {name:"Task",value:"task"},
                      ],
                      displayOptions: {
                        show: {
                          category: ["webhooks"],
                          name:["create","update"]
                        }
                      },
                    },
                    {
                      displayName: "Event ",
                      name: "event",
                      type: "dropdown",
                      description: "The event that will trigger notifications for this subscription.",
                      default: "",
                      required: true,
                      items:[],
                      options:[
                        {name:"Create",value:"new"},
                        {name:"Update",value:"update"},
                        {name:"Delete",value:"delete"},
                      ],
                      displayOptions: {
                        show: {
                          category: ["webhooks"],
                          name:["create","update"]
                        }
                      },
                    },      
]

export default {
  XappName,
  modules,
  fields
};
