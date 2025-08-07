import { Test, TestingModule } from '@nestjs/testing';
import { ClickSendController } from './clicksend.controller';
import { initializeDB } from 'src/ormconfig';
import { Credentials } from 'src/entities/Credentials';
import axios from 'axios';

describe('Clicksend', () => {
  let controller: ClickSendController;
  let listId: any;
  let contactId: any;
  let smsCampaignId: any;
  let mmsCampaignId: any;
  let credentialId: any;

  const separatorIndex = process.argv.indexOf('--');
  const customArgs =
    separatorIndex !== -1 ? process.argv.slice(separatorIndex + 1) : [];

  const [node_name, user_id, ...arg] = customArgs;

  console.log(node_name,user_id)
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClickSendController],
    }).compile();

    controller = module.get<ClickSendController>(ClickSendController);
  });

  it('Should be defined', () => {
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

  it('get_Accounts', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {},
    };

    const response = await controller.getAccounts(data);

    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('create_Lists', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {
        data: {
          list_name: 'list 3',
        },
      },
    };

    const response = await controller.createLists(data);
    listId = response.result.response.data.list_id;
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('update_Lists', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {
        Id: listId,
        data: {
          list_name: 'Updated List',
        },
      },
    };

    const response = await controller.updateLists(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('get_Lists', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {
        Id: listId,
      },
    };

    const response = await controller.getLists(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('getmany_Lists', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {},
    };

    const response = await controller.getmanyLists(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('create_contact', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {
        listId: listId,
        data: {
          phone_number: '+917448746858',
          first_name: 'muthu',
          last_name: 'kumar',
        },
      },
    };

    const response = await controller.createContacts(data);
    contactId = response.result.response.data.contact_id;
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('update_Contact', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {
        listId: listId,
        Id: contactId,
        data: {
          first_name: 'Ellen145',
          last_name: 'Diaz',
          email: 'selvam@gmail.com',
        },
      },
    };

    const response = await controller.updateContacts(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });
  it('get_Contact', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {
        listId: listId,
        Id: contactId,
      },
    };

    const response = await controller.getContacts(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('delete_Contact', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {
        listId: listId,
        Id: contactId,
      },
    };

    const response = await controller.getContacts(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('create_SMS', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {
        data: {
          messages: [
            {
              source: 'php',
              body: 'Chocolate bar icing icing oat cake carrot cake jelly cotton MWEvciEPIr.',
              to: '+918825608776',
            },
          ],
        },
      },
    };

    const response = await controller.createSms(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('cancelAll_SMS', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {},
    };

    const response = await controller.cancelAllSms(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('getmany_SMS', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {},
    };

    const response = await controller.getmanySms(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('createsms_Campaign', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {
        data: {
          list_id: listId,
          name: 'My Scheduled Campaign',
          body: 'Hey mapla! This SMS is scheduled with custom sender overrides ',
        },
      },
    };

    const response = await controller.createSmsCampaign(data);
    smsCampaignId = response.result.response.data.sms_campaign.sms_campaign_id;
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('getsms_Campaign', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {
        Id: smsCampaignId,
      },
    };

    const response = await controller.getSmsCampaign(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('getmanysms_Campaign', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {
        // "exe_lastupdatedtime":"2025-07-29",
        argument: {
          date_from: '2015-06-25T18:10:16Z',
          date_to: '2015-06-25T18:10:16Z',
        },
        data: {
          limit: 16,
        },
      },
    };

    const response = await controller.getmanySmsCampaign(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('createmms_Campaign', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {
        data: {
          media_file:
            'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaW8ycGhiemRxZzJhbHYzZ2pucTZkYml4dHJseWFjcnhnYzMzZzFwNSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7WTAkv7Ze17SWMOQ/giphy.gif',
          list_id: listId,
          name: 'My Campaign 3',
          from: '+918825608776',
          body: 'This is my new campaign message.',
          schedule: 1444821615,
          subject: 'test',
        },
      },
    };

    const response = await controller.createMmsCampaign(data);
    mmsCampaignId = response.result.response.data.mms_campaign_id;
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('getmms_Campaign', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {
        Id: mmsCampaignId,
      },
    };

    const response = await controller.getMmsCampaign(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('getmanymms_Campaign', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {},
    };

    const response = await controller.getmanyMmsCampaign(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('delete_Lists', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {
        Id: listId,
      },
    };

    const response = await controller.deleteLists(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('create_voice', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {
        data: {
          schedule: '2025-05-31T10:00:00',
          messages: [
            {
              voice: 'male',
            },
          ],
        },
      },
    };

    const response = await controller.createVoice(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('cancelAll_Voice', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {},
    };

    const response = await controller.cancelAllyVoice(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });
  it('getmany_voice', async () => {
    const status = 200;
    const data = {
      credentialsId: credentialId,
      data: {
        // "exe_lastupdatedtime":"2025-07-29",
        argument: {
          date_from: '2025-07-31T10:08:29+00:00',
          date_to: '2025-08-01T05:08:29+00:00',
        },
        data: {
          limit: 1,
        },
      },
    };

    const response = await controller.getVoice(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });
});
