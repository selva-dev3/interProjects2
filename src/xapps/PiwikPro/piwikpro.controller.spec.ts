import { Test, TestingModule } from '@nestjs/testing';
import { PiwikproController } from './piwikpro.controller';
import { initializeDB } from 'src/ormconfig';
import { Credentials } from 'src/entities/Credentials';

describe('PiwikPro', () => {
  let controller: PiwikproController;
  let id: any;
  let credentialId: any;

  const separatorIndex = process.argv.indexOf('--');
  const customArgs =
    separatorIndex !== -1 ? process.argv.slice(separatorIndex + 1) : [];

  const [node_name, testModule, user_id, ...arg] = customArgs;

  console.log('name', node_name, user_id);
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PiwikproController],
    }).compile();

    controller = module.get<PiwikproController>(PiwikproController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('authorize', async () => {
    const connection = await initializeDB();
    const credentialRepository = connection.getRepository(Credentials);
    let userId = user_id;
    const credential_id = await credentialRepository.query(
      `SELECT id FROM credentials WHERE author_id = $1 AND name = $2`,
      [userId, node_name],
    );

    credentialId = credential_id[0].id;
    console.log('credentialsId', credentialId);
    expect(credential_id).toBeDefined();
  });

  (testModule === 'Usergroups' ? describe : describe.skip)('Usergroups', () => {
    it('create_Usergroups', async () => {
      const status = 201;
      const data = {
        credentialId: credentialId,
        data: {
          data: {
            type: 'ppms/user-group', // ← Replace with the correct type
            attributes: {
              name: 'newone create', // ← Replace with the desired name
            },
          },
        },
      };

      const response = await controller.createUsergroup(data);
      id = response.result.response.data.id;
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });

    it('update_Usergroups', async () => {
      const status = 204;
      const data = {
        credentialId: credentialId,
        data: {
          Id: id,
          data: {
            attributes: {
              name: 'updated ',
            },
          },
        },
      };

      const response = await controller.updateUsergroup(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });


    it('get_Usergroups', async () => {
      const status = 200;
      const data = {
        credentialId: credentialId,
        data: {
          Id: id,
        },
      };

      const response = await controller.getUsergroup(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });
    it('getmany_Usergroups', async () => {
      const status = 200;
      const data = {
        credentialId: credentialId,
        data: {},
      };

      const response = await controller.getmanyUsergroup(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });

    it('delete_Usergroups', async () => {
      const status = 204;
      const data = {
        credentialId: credentialId,
        data: {
          Id: id
        },
      };

      const response = await controller.deleteUsergroup(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });

   
  });
   (testModule === 'User' ? describe : describe.skip)('User', () => {
    it('create_User', async () => {
      const status = 201;
      const data = {
        credentialId: credentialId,
        data: {
          data: {
             "attributes": {
                "password": "Selvam@1520000",
                "email": "selvakumar50000@gmail.com "
            }
          },
        },
      };

      const response = await controller.createUser(data);
      id = response.result.response.data.id;
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });

    it('update_User', async () => {
      const status = 204;
      const data = {
        credentialId: credentialId,
        data: {
          Id: id,
          data: {
            "attributes": {
                "role": "OWNER"
            }
          },
        },
      };

      const response = await controller.updateUser(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });


    it('get_User', async () => {
      const status = 200;
      const data = {
        credentialId: credentialId,
        data: {
          Id: id,
        },
      };

      const response = await controller.getUser(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });
    it('getmany_User', async () => {
      const status = 200;
      const data = {
        credentialId: credentialId,
        data: {},
      };

      const response = await controller.getmanyUser(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });

    it('delete_User', async () => {
      const status = 204;
      const data = {
        credentialId: credentialId,
        data: {
          Id: id
        },
      };

      const response = await controller.deleteUser(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });
  });

  (testModule === 'Apps' ? describe : describe.skip)('Apps', () => {
    it('create_App', async () => {
      const status = 201;
      const data = {
        credentialId: credentialId,
        data: {
          data: {
              "attributes": {
                "appType": "web",
                "name": "App18",
                "urls": [
                    "https://productstrial.com"
                ]
            }
          },
        },
      };

      const response = await controller.createApp(data);
      id = response.result.response.data.id;
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });

    it('update_App', async () => {
      const status = 204;
      const data = {
        credentialId: credentialId,
        data: {
          Id: id,
          data: {
            "attributes": {
                    "name": " App 100",
                    "urls": [
                        "https://productivity.com"
                    ]
                
            }
          },
        },
      };

      const response = await controller.updateApp(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });


    it('get_App', async () => {
      const status = 200;
      const data = {
        credentialId: credentialId,
        data: {
          Id: id,
        },
      };

      const response = await controller.getApp(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });
    it('getmany_App', async () => {
      const status = 200;
      const data = {
        credentialId: credentialId,
        data: {},
      };

      const response = await controller.getmanyApp(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });

    it('delete_App', async () => {
      const status = 204;
      const data = {
        credentialId: credentialId,
        data: {
          Id: id
        },
      };

      const response = await controller.deleteApp(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });
  });

  (testModule === 'Metasites' ? describe : describe.skip)('Metasites', () => {
    it('create_Metasite', async () => {
      const status = 201;
      const data = {
        credentialId: credentialId,
        data: {
          data: {
              "attributes": {
                "name": "metasite new"
            }
          },
        },
      };

      const response = await controller.createMetasite(data);
      id = response.result.response.data.id;
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });

    it('update_Metasite', async () => {
      const status = 204;
      const data = {
        credentialId: credentialId,
        data: {
          Id: id,
          data: {
            "attributes": {
                "name": "Metasite 101"
            }
          },
        },
      };

      const response = await controller.updateMetasite(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });


    it('get_Metasite', async () => {
      const status = 200;
      const data = {
        credentialId: credentialId,
        data: {
          Id: id,
        },
      };

      const response = await controller.getMetasite(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });
    it('getmany_Metasite', async () => {
      const status = 200;
      const data = {
        credentialId: credentialId,
        data: {},
      };

      const response = await controller.getmanyMetasite(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });

    it('delete_Metasite', async () => {
      const status = 204;
      const data = {
        credentialId: credentialId,
        data: {
          Id: id
        },
      };

      const response = await controller.deleteMetasite(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });
  });
    (testModule === 'MetasiteApps' ? describe : describe.skip)('MetasiteApps', () => {
    it('create_MetasiteApp', async () => {
      const status = 204;
      const data = {
        credentialId: credentialId,
        data: {
          "id": "22092366-228e-462c-8440-290df9884837", // metasite id
        "data": [
            {
                "id": "6ac38ade-4f19-410c-b9e0-c032b2c3ef43" // app id
            }
        ]
    
        },
      };

      const response = await controller.createMetasiteapp(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });

    it('get_MetasiteApp', async () => {
      const status = 200;
      const data = {
        credentialId: credentialId,
        data: {
          id: "22092366-228e-462c-8440-290df9884837",
        },
      };

      const response = await controller.getMetasiteapp(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });
    it('getmany_MetasiteApps', async () => {
      const status = 200;
      const data = {
        credentialId: credentialId,
        data: {},
      };

      const response = await controller.getmanyMetasiteapp(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });

    it('delete_MetasiteApp', async () => {
      const status = 204;
      const data = {
        credentialId: credentialId,
        data: {
          "id": "40d09181-cf8e-4b3c-940f-54c7e8799013", // metasite id
        "data": [
            {
                "id": "97be9d2d-f9a7-48fc-854b-10001bc14c3b" // app id
            }
        ]
        },
      };

      const response = await controller.deleteMetasiteapp(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });
  });

  (testModule === 'Globalaction' ? describe : describe.skip)('Globalaction', () => {
    it('getmany_Globalactions', async () => {
      const status = 200;
      const data = {
        credentialId: credentialId,
        data: {
         
    
        },
      };

      const response = await controller.getmanyGlobalaction(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });
  });

  (testModule === 'Usergrouppermissionformetasite' ? describe : describe.skip)('Usergrouppermissionformetasite', () => {
    it('create_Usergrouppermissionformetasite', async () => {
      const status = 204;
      const data = {
        credentialId: credentialId,
        data: {
         "id": "22092366-228e-462c-8440-290df9884837", // metasite id
        "Id": "bd1c4bc6-6552-4207-8e04-fabe9c48215d", //usergroup id
        "data": {
            "attributes": {
                "permission": "view"
            }
        }
    
        },
      };

      const response = await controller.createUsergrouppermissionformetasite(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });
        it('getmany_Usergrouppermissionformetasite', async () => {
      const status = 200;
      const data = {
        credentialId: credentialId,
        data: {
         id: "22092366-228e-462c-8440-290df9884837" // metasite id
    
        },
      };

      const response = await controller.getUsergrouppermissionformetasite(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });
  });

    (testModule === 'Usergrouppermissionforapp' ? describe : describe.skip)('Usergrouppermissionforapp', () => {
    it('create_Usergrouppermissionforapp', async () => {
      const status = 204;
      const data = {
        credentialId: credentialId,
        data: {
                "id": "6ac38ade-4f19-410c-b9e0-c032b2c3ef43",    // app id
        "Id": "a1151af5-2a66-4c91-894c-7495e52c9c60",     // user group id
        "data": {
            "attributes": {
                "permission": "view"
            }
        }
    
        },
      };

      const response = await controller.createUsergrouppermissionforapp(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });
        it('getmany_Usergrouppermissionforapp', async () => {
      const status = 200;
      const data = {
        credentialId: credentialId,
        data: {
           "id": "6ac38ade-4f19-410c-b9e0-c032b2c3ef43" //  app Id
    
        },
      };

      const response = await controller.getUsergrouppermissionforapp(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });
  });
    (testModule === 'Userwithaction' ? describe : describe.skip)('Userwithaction', () => {
    it('getmany_Userwithaction', async () => {
      const status = 200;
      const data = {
        credentialId: credentialId,
        data: {
          "action":"delete"
    
        },
      };

      const response = await controller.getUserwithaction(data);
      console.log(JSON.stringify(response, null, 2));
      expect(response.result.status).toBe(status);
    });
  });
});
