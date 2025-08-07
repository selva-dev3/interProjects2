export const action = {
    spreadsheet: {
        create: 'createSpreadSheet'
    },
    Worksheet : {
        create: 'createWorksheet',
        getmany: 'getmanyworksheet',

    },
    ContentAPIs: {
        create: 'createrow',
        delete: 'deleteRow'
    },
    TabularData: {
        insertcolumns: 'insertColumns',
        create: 'addRecordsToWorksheet',
        delete: 'deleteRecords',
        getmany: 'getmanyRecords',
        update: 'updateRecords',
    }
}