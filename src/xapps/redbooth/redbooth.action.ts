export const action = {
    Tasks: {
        create: 'createTask',
        update: 'updateTask',
        get: 'getTask',
        getmany: 'getmanyTask',
        delete: 'deleteTask'
    },
    Subtasks: {
        create: 'createSubtask',
        update: 'updateSubtask',
        getmany: 'getmanySubtask',
        delete: 'deleteSubtask'
    },
    TaskList: {
        create: 'createtaskList',
        update: 'updateTaskList',
        get: 'getTasklist',
        getmany: 'getmanyTasklist',
        delete: 'deleteTasklist'
    } ,
    Comments: {
        create: 'createComment',
        update: 'updateComment',
        get: 'getComment',
        getmany: 'getmanyComment',
        delete: 'deleteComment'
    },
    Projects: {
        create: 'createProject',
        get: 'getProject',
        update: 'updateProject',
        getmany: 'getmanyProject',
        delete: 'deleteProject'
    },
    Organization: {
        create: 'createOrganization',
        get: 'getOrganization'
    }
}