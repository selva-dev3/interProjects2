export const action = {
    Indexes: {
        create: 'createIndexes',
        update: 'updateIndexes',
        get: 'getIndexes',
        getmany: 'getmanyIndexes',
        delete: 'deleteIndexes'
    },
    Namespaces: {
        get: 'getNamespaces',
        getmany: 'getmanyNamespaces',
        delete: 'deleteNamespaces'
    },
    Vectors: {
        create: 'createVectors',
        update: 'updateVectors',
        delete: 'deleteVectors',
        get: 'getVectors',
        getmany: 'getmanyVectors'
    },
    Backups: {
        create: 'createBackups',
        get: 'getBackups',
        getmany: 'getmanyBackups',
        delete: 'deleteBackups'
    },
    vectorsSearch: {
        search: 'searchvectorsSearch'
    },
    Assistant: {
        create: 'createAssistant',
        get: 'getAssistant',
        update: 'updateAssistant',
        getmany: 'getmanyAssistant',
        delete: 'deleteAssistant'
    },
    File: {
        create: 'createFile',
        get: 'getFile',
        getmany: 'getmanyFile',
        delete: 'deleteFile'
    },
    ContextSnippets: {
        get: 'getContextSnippets',
    },
    Chat: {
        chatwithAssistant: 'chatwithassistantChat',
        chatwithopenaiChat : 'chatwithopenaiChat'
    }
}