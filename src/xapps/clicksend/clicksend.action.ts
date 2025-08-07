export const action = {
    Account: {
        get: 'getAccounts'
    },
    Lists: {
        create: 'createLists',
        update: 'updateLists',
        get: 'getLists',
        getmany: 'getmanyLists',
        delete: 'deleteLists'
    },
    Contacts: {
        create: 'createContacts',
        update: 'updateContacts',
        get: 'getContacts',
        delete: 'deleteContacts',
    },
    SMS: {
        create: 'createSms',
        delete: 'cancelAllSms',
        getmany: 'getmanySms'
    },
    SMSCampaign:{
        create: 'createSmsCampaign',
        get: 'getSmsCampaign',
        getmany: 'getmanySmsCampaign',

    },
    MMSCampaign: {
        create: 'createMmsCampaign',
        get: 'getMmsCampaign',
        getmany: 'getmanyMmsCampaign',

    },
    Voice: {
        create: 'createVoice',
        get: 'getVoice',
        delete: 'cancelAllyVoice'
    }
}