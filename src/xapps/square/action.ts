export const action = {
    Customers:{
        create: 'createCustomers',
        update: 'updateCustomers',
        delete: 'deleteCustomers',
        get: 'getCustomers',
        getmany: 'getmanyCustomers'
    },
    Orders:{
        create: 'createOrders',
        get: 'getOrders',
        getmany: 'getmanyOrders',

    },
    CatalogItem:{
        create: 'createCatlogItem',
        delete: 'deleteCatlogItems',
        get_catalog_item: 'getCatlogItems',
        getmany: 'getmanyCatlogItems'
    },
    CatlogTax:{
        create: 'createCatlogTax',
        delete: 'deleteCatlogTax',
        get: 'getCatlogTax',
        getmany: 'getmanyCatlogTax'
    },
    Payments:{
        create: 'createPayments',
        get: 'getPayments',
        getmany: 'getManyPayments',

    },
    Refunds:{
        refunds: 'refundPayments'
    },
    Invoices:{
        create: 'createInvoices',
        update: 'updateInvoices',
        getmany: 'getmanyInvoices',
    },
    Locations:{
        get: 'getLocations',
        getmany: 'getmanyLocations',
    }
}