export const action = {
    Usergroups: {
        create: 'createUsergroup',
        get: 'getUsergroup',
        update: 'updateUsergroup',
        getmany: 'getmanyUsergroup',
        delete: 'deleteUsergroup'
    },
    Users: {
        create: 'createUser',
        get: 'getUser',
        getmany: 'getmanyUser',
        update: 'updateUser',
        delete: 'deleteUser'
    },
    Apps: {
        create: 'createApp',
        get: 'getApp',
        getmany: 'getmanyApp',
        update: 'updateApp',
        delete: 'deleteApp'
    },
    Metasites: {
        create: 'createMetasite',
        get: 'getMetasite',
        getmany: 'getmanyMetasite',
        update: 'updateMetasite',
        delete: 'deleteMetasite'
    },
    Metasitesapps: {
        create: 'createMetasiteapp',
        get: 'getMetasiteapp',
        getmany: 'getmanyMetasiteapp',
        delete: 'deleteMetasiteapp',
    },
    Usergrouppermissionforapp: {
        create: 'createUsergrouppermissionforapp',
        get: 'getUsergrouppermissionforapp',
    },
    Usergrouppermissionformetasite: {
        create: 'createUsergrouppermissionformetasite',
        get: 'getUsergrouppermissionformetasite'
    },
    Globalaction: {
        getmany: 'getmanyGlobalaction'
    }

}