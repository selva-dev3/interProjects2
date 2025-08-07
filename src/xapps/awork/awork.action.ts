export const action = {
    Projects: {
        get: 'getProject',
        create: 'createProject',
        getmany: 'getmanyProject',
        update: 'updateProject',
        delete: 'deleteProject'
    },
    ProjectTypes: {
        get: 'getProjecttypes',
        create: 'createProjecttypes',
        getmany: 'getmanyProjecttypes',
        update: 'updateProjecttypes',
        delete: 'deleteProjecttypes'
    },
    ProjectTags: {
        create: 'createProjecttags',
        get: 'getProjecttags',
        getmany: 'getmanyProjecttags',
        update: 'updateProjecttags',
        delete: 'deleteProjecttags'
    },
    ProjectComments: {
        get: 'getProjectcomments',
        create: 'createProjectcomments',
        getmany: 'getmanyProjectcomments',
        update: 'updateProjectcomments',
        delete: 'deleteProjectcomments',
    },
    Tasks: {
        get: 'getTasks',
        create: 'createTasks',
        update: 'updateTasks',
        delete: 'deleteTasks'
    },
    ProjectTasks: {
        get: 'getprojecttasks',
        create: 'createprojecttasks',
        getmany: 'getmanyprojecttasks',
        update: 'updateprojecttasks',
    },
    Companies: {
        get: 'getCompanies',
        create: 'createCompanies',
        getmany: 'getmanyCompanies',
        update: 'updateCompanies',
        delete: 'deleteCompanies'
    },
    Users: {
        get: 'getUsers',
        getmany: 'getmanyUsers',
        delete: 'deleteUsers',
        update:' updateUsers',
    },
    Roles: {
        get: 'getRoles',
        getmany: 'getmanyRoles',
        create: 'createRoles',
        delete: 'deleteRoles',
        update: 'updateRoles',
    },
    Teams: {
        get: 'getTeams',
        getmany: 'getmanyTeams',
        create: 'createTeams',
        delete: 'deleteTeams',
        update: 'updateTeams',
        adduser: 'adduserTeams',
        addproject: 'addprojectTeams'
    }
}