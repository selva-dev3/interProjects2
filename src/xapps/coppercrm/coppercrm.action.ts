import { create } from 'domain';

export const action = {
  Opportunities: {
    create: 'createOpportunity',
    get: 'getOpportunity',
    getmany: 'getmanyOpportunity',
    update: 'updateOpportunity',
    delete: 'deleteOpportunity',
  },
  People: {
    create: 'createPerson',
    get: 'getPerson',
    getmany: 'getmanyPerson',
    update: 'updatePerson',
    delete: 'deletePerson',
  },
  Companies: {
    create: 'createCompanies',
    get: 'getCompanies',
    getmany: 'getmanyCompanies',
    update: 'updateCompanies',
    delete: 'deleteCompanies',
  },
  Tasks: {
    create: 'createTask',
    get: 'getTask',
    getmany: 'getmanyTask',
    update: 'updateTask',
    delete: 'deleteTask',
  },
  Activities: {
    create: 'createActivity',
    get: 'getActivity',
    getmany: 'getmanyActivity',
    update: 'updateActivity',
    delete: 'deleteActivity',
  },
  AccountandUsers: {
    get: 'getUser',
    getmany: 'getmanyUser',
  },
  Projects: {
    create: 'createProject',
    get: 'getProject',
    getmany: 'getmanyProject',
    update: 'updateProject',
    delete: 'deleteProject',
  },
  Webhooks: {
    create: 'createWebhooks',
    get: 'getWebhooks',
    getmany: 'getmanyWebhooks',
    update: 'updateWebhooks',
    delete: 'deleteWebhooks',    
  }
};
