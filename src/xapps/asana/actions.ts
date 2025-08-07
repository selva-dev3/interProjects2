export const action ={
    Users: {
        get: 'getUsers',
        getmany: 'getmanyUsers'
    },
    Attachments: {
        create: 'createAttachment',
        get: 'getAttachment',
        getmany: 'getmanyAttachment',
        delete: 'deleteAttachment',
    },
    Projects: {
        create: 'createProject',
        get: 'getProject',
        getmany: 'getmanyProject',
        update: 'updateProject',
        delete: 'deleteProject'
    },
    Tasks: {
        create: 'createTask',
        get: 'getTask',
        getmany: 'getmanyTask',
        update: 'updateTask',
        delete: 'deleteTask',
    },
    Workspaces: {
        create: 'createWorkspace',
        get: 'getWorkspace',
        getmany: 'getmanyWorkspace',
        update: 'updateWorkspace'
    },
    Stories: {
        create: 'createStory',
        get: 'getStory',
        getmany: 'getmanyStory',
        update: 'updateStory',
        delete: 'deleteStory'
    },
    Webhooks: {
        create: 'createWebhooks',
        get: 'getWebhooks',
        getmany: 'getmanyWebhooks',
        update: 'updateWebhooks',
        delete: 'deleteWebhooks'
    },
    Sections: {
        create: 'createSection',
        get: 'getSection',
        getmany: 'getmanySection',
        update: 'updateSection',
        delete: 'deleteSection'
    }
}