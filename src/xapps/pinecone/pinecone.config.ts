// pinecone.config.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONFIGURATION FILE.
// DO NOT modify the sections labeled "AUTO-GENERATED".
//
// Copyright (c) 2025 Smackcoders. All rights reserved.
// This file is subject to the Smackcoders Proprietary License.
// Unauthorized copying or distribution is strictly prohibited.
// -----------------------------------------------------------------------------
import { pineconeController } from "./pinecone.controller";
export const XappName = "Pinecone";

export const redirect =  "https://workflow.xapplets.com/exit";
export const modules = [
  {
    "module": "indexes",
    "actions": [
      "create",
      "update",
      "get",
      "getMany",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "namespaces",
    "actions": [
      "get",
      "getMany",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "vectors",
    "actions": [
      "create",
      "delete",
      "get",
      "getMany",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "imports",
    "actions": [
      "create",
      "get",
      "getMany",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "backups",
    "actions": [
      "create",
      "get",
      "getMany",
      "delete"
    ],
    "triggers": []
  },
  {
    //Payment required
    "module": "collections",
    "actions": [
      "create",
      "get",
      "getMany",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "search",
    "actions": [
      "searchVectors",
    ],
    "triggers": []
  },
  {
    "module": "backups",
    "actions": [
      "create",
      "get",
      "getMany",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "assistant",
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
    "module": "file",
    "actions": [
      "create",
      "get",
      "getMany",
      "delete"
    ],
    "triggers": []
  },
  {
    "module": "context-snippets",
    "actions": [
      "get"
    ],
    "triggers": []
  },
  {
    "module": "evaluation",
    "actions": [
      "evaluate"
    ],
    "triggers": []
  },
  {
    "module": "chat",
    "actions": [
      "chatwithAssistant",
      "chatwithOpenAI"
    ],
    "triggers": []
  }
];

export default {
  XappName,
  modules,
};


export const createIndexesFields = [
  {
  displayName: "Tags",
  name: "tags",
  type: "objects",
  required: false,
  description: "Custom user tags added to an index. Keys must be 80 characters or less. Values must be 120 characters or less.",
  options: [],
  item: [],
},
  {
  displayName: "Vector Type",
  name: "vector_type",
  type: "string",
  required: false,
  description: "The index vector type. You can use 'dense' or 'sparse'. If 'dense', the vector dimension must be specified. If 'sparse', the vector dimension should not be specified.",
  options: [],
  item: [],
},
]

//INDEXES MODULE 
export const UpdateIndexesFields = [
  {
  displayName: "Deletion Protection",
  name: "deletion_protection",
  type: "string",
  required: false,
  description: "Whether deletion protection is enabled/disabled for the index. (e.g., disabled, enabled ).",
  options: [],
  item: [],
},
{
  displayName: "Tags",
  name: "tags",
  type: "string",
  required: false,
  description: "Custom user tags added to an index. Keys must be 80 characters or less. Values must be 120 characters or less.",
  options: [],
  item: [],
},
]

//NAMESPACES MODULE 
export const getManyNameSpacesFields = [
   {
    displayName: "Limit",
    name: "limit",
    type: "number",
    required: false,
    description: "Max number of namespaces to return per page.",
    options: [],
    item: []
  },
  {
    displayName: "Pagination Token",
    name: "paginationToken",
    type: "string",
    required: false,
    description: "Pagination token to continue a previous listing operation.",
    options: [],
    item: []
  }
]

// VECTOR MODULE

export const createVectorsFields  =[ 
  {
  displayName: "Indices",
  name: "vectors||sparseValues__indices",
  type: "int[]",
  required: false,
  description: "The indices of the sparse data.",
  options: [],
  item: [],
},
  {
  displayName: "Values",
  name: "vectors||sparseValues__values",
  type: "string",
  required: false,
  description: "The corresponding values of the sparse data, which must be with the same length as the indices.",
  options: [],
  item: [],
},
  {
  displayName: "MetaData",
  name: "vectors||metadata",
  type: "string",
  required: false,
  description: "This is the metadata included in the request.",
  options:[],
  item: [],
},
]

export const updateeVectorsFields  =[ 
    {
  displayName: "Values",
  name: "values",
  type: "string",
  required: false,
  description: "Vector data.",
  options: [],
  item: [],
},
  {
  displayName: "Indices",
  name: "vectors||sparseValues__indices",
  type: "string",
  required: false,
  description: "The indices of the sparse data.",
  options: [],
  item: [],
},
  {
  displayName: "Values",
  name: "vectors||sparseValues__values",
  type: "string",
  required: false,
  description: "The corresponding values of the sparse data, which must be with the same length as the indices.",
  options: [],
  item: [],
},
  {
  displayName: "SetMetaData",
  name: "setMetadata",
  type: "string",
  required: false,
  description: "Metadata to set for the vector.",
  options: [],
  item: [],
},
]

export const getManyVectors = [
  {
    displayName: "Prefix",
    name: "prefix",
    type: "string",
    required: false,
    description: "The vector IDs to fetch. Does not accept values containing spaces.",
    options: [],
    item: []
  },
  {
    displayName: "Limit",
    name: "limit",
    type: "number",
    required: false,
    description: "Max number of IDs to return per page. Default is 100.",
    options: [],
    item: []
  },
  {
    displayName: "Pagination Token",
    name: "paginationToken",
    type: "string",
    required: false,
    description: "Pagination token to continue a previous listing operation.",
    options: [],
    item: []
  },
  {
    displayName: "Namespace",
    name: "namespace",
    type: "string",
    required: false,
    description: "Namespace to scope the query.",
    options: [],
    item: []
  }
]

export const fecthVectorFields =[
  {
    displayName: "IDs",
    name: "ids",
    type: "string",
    required: true,
    description: "The vector IDs to fetch. Does not accept values containing spaces.",
    options: [],
    item: []
  },
  {
    displayName: "Namespace",
    name: "namespace",
    type: "string",
    required: false,
    description: "Namespace to scope the query.",
    options: [],
    item: []
  }
]

export const deleteVectorsFields =[
  {
    displayName: "IDs",
    name: "ids",
    type: "string[]",
    required: false,
    description: "Vectors to delete. Does not accept values containing spaces.",
    options: [],
    item: []
  },
  {
    displayName: "Delete All",
    name: "deleteAll",
    type: "boolean",
    required: false,
    description: "Indicates that all vectors in the index namespace should be deleted. Mutually exclusive with 'ids' and 'filter'.",
    options: [],
    item: []
  },
  {
    displayName: "Namespace",
    name: "namespace",
    type: "string",
    required: false,
    description: "The namespace to delete vectors from, if applicable.",
    options: [],
    item: []
  },
  {
    displayName: "Filter",
    name: "filter",
    type: "object",
    required: false,
    description: "Metadata filter to select vectors to delete. Not supported for serverless indexes. Mutually exclusive with 'ids' and 'deleteAll'.",
    options: [],
    item: []
  }
]


//BACKUP MODULE
export const createBackupsFields =[
  {
    displayName: "Name",
    name: "name",
    type: "string",
    required: true,
    description: "The name of the backup.",
    options: [],
    item: []
  },
  {
    displayName: "Description",
    name: "description",
    type: "string",
    required: false,
    description: "A description of the backup.",
    options: [],
    item: []
  }
]

export const getManyBackupsFieds =[
  {
    displayName: "Limit",
    name: "limit",
    type: "number",
    required: false,
    description: "The number of results to return per page. Range: 1 to 100. Default is 10.",
    options: [],
    item: []
  },
  {
    displayName: "Pagination Token",
    name: "paginationToken",
    type: "string",
    required: false,
    description: "The token to use to retrieve the next page of results.",
    options: [],
    item: []
  }
]

//SEARCH WITH VECTOR MODULE
export const searchWithVectorFields = [
    {
    displayName: "ID",
    name: "id",
    type: "string",
    required: false,
    description: "The unique ID of the vector to be used as a query vector. Only one of 'id' or 'vector' should be used.",
    options: [],
    item: []
  },
   {
    displayName: "Sparse Vector",
    name: "sparseVector",
    type: "object",
    required: false,
    description: "Vector sparse data. Represented as a list of indices and corresponding values of equal length.",
    options: [],
    item: []
  },
    {
    displayName: "Include Metadata",
    name: "includeMetadata",
    type: "boolean",
    required: false,
    description: "Indicates whether metadata is included in the response. Default is false.",
    options: [],
    item: []
  },
   {
    displayName: "Include Values",
    name: "includeValues",
    type: "boolean",
    required: false,
    description: "Indicates whether vector values are included in the response. Default is false.",
    options: [],
    item: []
  },
    {
    displayName: "Filter",
    name: "filter",
    type: "object",
    required: false,
    description: "Filter using vector metadata. Mutually exclusive with using 'id' or 'vector' together.",
    options: [],
    item: []
  },

]


//ASSISTANT MODULE

export const createAndUpdateAssistantFields = [
  {
    displayName: "Instructions",
    name: "instructions",
    type: "string",
    required: false,
    description: "Description or directive for the assistant to apply to all responses.",
    options: [],
    item: []
  },
  {
    displayName: "Metadata",
    name: "metadata",
    type: "object",
    required: false,
    description: "Custom metadata for the assistant.",
    options: [],
    item: []
  },
  {
    displayName: "Region",
    name: "region",
    type: "options",
    required: false,
    description: "The region to deploy the assistant in. Available options: 'us' or 'eu'. Default is 'us'.",
    options: [
      { name: "us", value: "us" },
      { name: "eu", value: "eu" }
    ],
    item: []
  }
]

//  context-snippets module

export const getContextSnippetsFields = [
  {
    displayName: "Filter",
    name: "filter",
    type: "object",
    required: false,
    description: "Optionally filter which documents can be retrieved using metadata fields. Example: { \"genre\": { \"$ne\": \"documentary\" } }",
    options: [],
    item: []
  },
  {
    displayName: "Messages",
    name: "messages",
    type: "object[]",
    required: false,
    description: "The list of messages to use for generating the context. Exactly one of 'query' or 'messages' must be provided.",
    options: [],
    item: []
  },
  {
    displayName: "Top K",
    name: "top_k",
    type: "number",
    required: false,
    description: "Maximum number of context snippets to return. Default is 16. Max is 64.",
    options: [],
    item: []
  },
  {
    displayName: "Snippet Size",
    name: "snippet_size",
    type: "number",
    required: false,
    description: "Maximum context snippet size. Default is 2048 tokens. Range: 512 - 8192.",
    options: [],
    item: []
  }
]

export const chatwithAssistantFields = [
  {
    displayName: "Stream",
    name: "stream",
    type: "boolean",
    required: false,
    description: "If true, returns a stream of responses. Default is false.",
    options: [],
    item: []
  },
  {
    displayName: "Model",
    name: "model",
    type: "string",
    required: false,
    description: "The LLM to use for answer generation. Options: gpt-4o, claude-3-5-sonnet. Default is gpt-4o.",
    options: [
      { name: "gpt-4o", value: "gpt-4o" },
      { name: "claude-3-5-sonnet", value: "claude-3-5-sonnet" }
    ],
    item: []
  },
  {
    displayName: "Filter",
    name: "filter",
    type: "object",
    required: false,
    description: "Filter documents using metadata fields. Example: { \"genre\": { \"$ne\": \"documentary\" } }",
    options: [],
    item: []
  },
  {
    displayName: "JSON Response",
    name: "json_response",
    type: "boolean",
    required: false,
    description: "If true, instructs the assistant to return a JSON response. Cannot be used with streaming.",
    options: [],
    item: []
  },
  {
    displayName: "Include Highlights",
    name: "include_highlights",
    type: "boolean",
    required: false,
    description: "If true, highlights from referenced documents will be included.",
    options: [],
    item: []
  },
  {
    displayName: "Context Options - Top K",
    name: "context_options.top_k",
    type: "number",
    required: false,
    description: "Max number of context snippets to use. Default is 16. Max is 64.",
    options: [],
    item: []
  },
  {
    displayName: "Context Options - Snippet Size",
    name: "context_options.snippet_size",
    type: "number",
    required: false,
    description: "Max context snippet size in tokens. Default is 2048. Range: 512–8192.",
    options: [],
    item: []
  }
]

export const chatwithOpenAIFields = [
  {
    displayName: "Stream",
    name: "stream",
    type: "boolean",
    required: false,
    description: "If true, returns a stream of responses. Default is false.",
    options: [],
    item: []
  },
  {
    displayName: "Model",
    name: "model",
    type: "string",
    required: false,
    description: "The large language model to use for answer generation. Default is gpt-4o.",
    options: [
      { name: "gpt-4o", value: "gpt-4o" },
      { name: "claude-3-5-sonnet", value: "claude-3-5-sonnet" }
    ],
    item: []
  },
  {
    displayName: "Filter",
    name: "filter",
    type: "object",
    required: false,
    description: "Optionally filter which documents can be retrieved using metadata fields. Example: { \"genre\": { \"$ne\": \"documentary\" } }",
    options: [],
    item: []
  }
]


export const fields = [
//DATABASES

  //INDEXES MODULE
  {
    displayName: "Index Name",
    name: "name",
    type: "string",
    required: true,
    description: "Configuration for creating the index.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["indexes"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Dimension",
    name: "dimension",
    type: "number",
    required: true,
    description: "Number of dimensions for the vector.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["indexes"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Metric",
    name: "metric",
    type: "string",
    required: true,
    description: "Similarity metric to use (e.g., cosine).",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["indexes"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Cloud Provider",
    name: "spec__serverless__cloud",
    type: "string",
    required: true,
    description: "Cloud provider name (e.g., aws).",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["indexes"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Region",
    name: "spec__serverless__region",
    type: "string",
    required: true,
    description: "Cloud region (e.g., us-east-1).",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["indexes"],
        name: ["create"]
      }
    }
  },
    {
    displayName: "Index Name",
    name: "Id",
    type: "string",
    required: true,
    description: "Provide Indexes's Name for actions.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["indexes"],
        name: ["update","delete","get"]
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
        category: ["indexes"],
        name: ["update"]
      }
    },
    fields: UpdateIndexesFields
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
        category: ["indexes"],
        name: ["create"]
      }
    },
    fields: createIndexesFields
  },
  
  

  //NAMESPACES MODULE
    {
    displayName: "NameSpaces Name",
    name: "Id",
    type: "string",
    required: true,
    description: "Provide NameSpaces's Name for actions.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["namespaces"],
        name: ["delete","get"]
      }
    }
  },
  

   {
    displayName: "IndexHost Name",
    name: "indexHost",
    type: "dropdown",
    default: "",
    items: [],
    required: false,
    options: [],
    async init(data) {
      try {
        const list = await pineconeController.getAllIndexes(data);
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["namespace"],
        name: ["create","update", "get", "delete", "getMany"]
      }
    },
  },

  // VECTOR MODULE
      {
    displayName: "NameSpaces Name",
    name: "namespace",
    type: "string",
    required: true,
    description: "The namespace where you upsert vectors.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["vectors"],
        name: ["create","update"]
      }
    }
  },
  {
    displayName: "ID",
    name: "vectors||id",
    type: "string",
    required: true,
    description: "The namespace where you upsert vectors and Required string length: 1 - 512.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["vectors"],
        name: ["create"]
      }
    }
  },

  {
    displayName: "Values",
    name: "vectors||values",
    type: "int[]",
    required: true,
    description: "This is the vector data included in the request..",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["vectors"],
        name: ["create",]
      }
    }
  },

   {
    displayName: "vector ID",
    name: "Id",
    type: "string",
    required: true,
    description: "The namespace where you upsert vectors and Required string length: 1 - 512.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["vectors"],
        name: ["update"]
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
        category: ["vectors"],
        name: ["create"]
      }
    },
    fields: createVectorsFields
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
        category: ["vectors"],
        name: ["get"]
      }
    },
    fields: fecthVectorFields
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
        category: ["vectors"],
        name: ["delete"]
      }
    },
    fields: deleteVectorsFields
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
        category: ["vectors"],
        name: ["update"]
      }
    },
    fields: updateeVectorsFields
  },

 

  //BACKUP MODULE
      {
    displayName: "Backup ID",
    name: "Id",
    type: "string",
    required: true,
    description: "The ID of the backup to actions.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["backups"],
        name: ["delete","get"]
      }
    }
  },

  {
    displayName: "Name",
    name: "name",
    type: "string",
    required: true,
    description: "The name of the backup.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["backups"],
        name: ["create"]
      }
    },
  },
  {
    displayName: "Description",
    name: "description",
    type: "string",
    required: false,
    description: "A description of the backup.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["backups"],
        name: ["create"]
      }
    },
  },



  //SEARCH WITH VECTOR
    {
    displayName: "Top K",
    name: "topK",
    type: "number",
    required: true,
    description: "The number of results to return for each query. Range: 1 to 10000.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["search"],
        name: ["searchVectors"]
      }
    }
  },
      {
      displayName: "Vector",
    name: "vector",
    type: "number",
    required: true,
    description: "The query vector. Must match index dimension. Only one of 'id' or 'vector' should be used.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["search"],
        name: ["searchVectors"]
      }
    }
  },
      {
    displayName: "Namespace",
    name: "namespace",
    type: "string",
    required: true,
    description: "The namespace to query.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["search"],
        name: ["searchVectors"]
      }
    }
  },


  //ASSISTANT MODULE
        {
       displayName: "Name",
    name: "name",
    type: "string",
    required: true,
    description: "The name of the assistant. Must be 1-45 characters, start and end with an alphanumeric character, and consist only of lowercase alphanumeric characters or '-'.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["assistant"],
        name: ["create"]
      }
    }
  },
      {
    displayName: "Assistant Name",
    name: "Id",
    type: "string",
    required: true,
    description: "Provide Assistant's Name for actions.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["assistant"],
        name: ["update","delete","get"]
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
        category: ["assistant"],
        name: ["create","update"]
      }
    },
    fields: createAndUpdateAssistantFields
  },
  // FILE MODULE
   {
    displayName: "AssistantName",
    name: "assistantName",
    type: "dropdown",
    items: [],
    required: false,
    options: [],
    async init(data) {
      try {
        const list = await pineconeController.getAllAssistant(data);
        this.options = list;
      } catch (error) {
        return ({ 'Error occurred': error });
      }
    },
    displayOptions: {
      show: {
        category: ["file", "contextsnippets", "chatwithAssistant","chatwithopenai"],
        name: ["delete","get", "upload","chat"]
      }
    },
  },

  {
    displayName: "File",
    name: "file",
    type: "file",
    required: true,
    description: "The file to upload.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["file"],
        name: ["upload"]
      }
    }
  },
  {
    displayName: "File Id",
    name: "Id",
    type: "string",
    required: true,
    description: "Provide File's id for actions.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["file"],
        name: ["delete","get"]
      }
    }
  },

 

  // CONTEXT-SNIPPETS MODULE
    {
    displayName: "Query",
    name: "query",
    type: "string",
    required: true,
    description: "The query used to generate the context. Exactly one of 'query' or 'messages' must be provided.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["contextsnippets"],
        name: ["get"]
      }
    },
    fields:getContextSnippetsFields
  },

  //CHATBOT WITH ASSISTANT MODULE
    {
    displayName: "Messages",
    name: "messages",
    type: "string",
    required: true,
    description: "The list of messages to use for assistant response generation.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["chatwithAssistant"],
        name: ["chat"]
      }
    },
  },
      {
    displayName: "Role",
    name: "messages||role",
    type: "string",
    required: true,
    description: "Role of the message such as 'user' or 'assistant'.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["chatwithAssistant","chatwithopenai"],
        name: ["chat"]
      }
    },
  },
        {
    displayName: "Content",
    name: "messages||content",
    type: "string",
    required: true,
    description: "Content of the message.",
    options: [],
    item: [],
    displayOptions: {
      show: {
        category: ["chatwithAssistant","chatwithopenai"],
        name: ["chat"]
      }
    },
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
        category: ["chatwithAssistant"],
        name: ["chat"]
      }
    },
    fields: chatwithAssistantFields
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
        category: ["chatwithopenai"],
        name: ["chat"]
      }
    },
    fields: chatwithOpenAIFields
  },
]