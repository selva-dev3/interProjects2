import { Test, TestingModule } from '@nestjs/testing';
import { initializeDB } from 'src/ormconfig';
import { Credentials } from 'src/entities/Credentials';
import { AsanaController } from './asana.controller';
import { UseInterceptors } from '@nestjs/common';

describe('Asana', () => {
  let controller: AsanaController;
  let credentialId: any;
  let userId: any;
  let projectId: any;
  let taskId: any;
  let webhookId: any;
  let storyId: any;
  let attachmentId: any;
  let sectionId: any;

  const separatorIndex = process.argv.indexOf('--');
  const customArgs =
    separatorIndex !== -1 ? process.argv.slice(separatorIndex + 1) : [];

  const [node_name, user_id, ...arg] = customArgs;

  console.log(node_name, user_id);
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AsanaController],
    }).compile();

    controller = module.get<AsanaController>(AsanaController);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('authorize', async () => {
    const connection = await initializeDB();
    const credentialRepository = connection.getRepository(Credentials);
    let userid = user_id;
    const credential_id = await credentialRepository.query(
      `SELECT id FROM credentials WHERE author_id = $1 AND name = $2`,
      [user_id, node_name],
    );

    credentialId = credential_id[0].id;
    console.log('credentialsId', credentialId);
    expect(credential_id).toBeDefined();
  });

  it('get_User', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        Id: 'me',
      },
    };

    const response = await controller.getUsers(data);
    userId = response.result.response.data.workspaces[0].gid;
    console.log(userId);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('getmany_User', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        workspace: userId,
      },
    };

    const response = await controller.getmanyUsers(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('create_workspace', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        workspace_gid: userId,
        data: {
          user: 'selva@gmail.com', // your registeremail
        },
      },
    };

    const response = await controller.createWorkspace(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('update_workspace', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        Id: userId,
        data: {
          name: 'workspace',
        },
      },
    };

    const response = await controller.updateWorkspace(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('get_workspace', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        workspace_gid: userId,
      },
    };

    const response = await controller.getWorkspace(data);

    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('getmany_workspace', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {},
    };

    const response = await controller.getmanyWorkspace(data);

    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('create_projects', async () => {
    const status = 201;
    const data = {
      credentialId: credentialId,
      data: {
        data: {
          workspace: userId,
          name: 'project 15',
          public: false,
          due_date: '2025-08-02',
          notes: 'this is my 10th project',
          color: 'dark-blue',
        },
      },
    };

    const response = await controller.createProject(data);
    projectId = response.result.response.data.gid;
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('get_projects', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        Id: projectId,
      },
    };

    const response = await controller.getProject(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('update_projects', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        Id: projectId,
        data: {
          name: 'updated project',
        },
      },
    };

    const response = await controller.updateProject(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('getmany_projects', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        data: {
          workspace: userId,
        },
      },
    };

    const response = await controller.getmanyProject(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('create_Task', async () => {
    const status = 201;
    const data = {
      credentialId: credentialId,
      data: {
        data: {
          name: 'task 23',
          workspace: userId,
          assignee: 'sakthivj6@gmail.com', // register email
        },
      },
    };

    const response = await controller.createTask(data);
    taskId = response.result.response.data.gid;
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('getmany_Task', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,

      data: {
        workspace: userId,

        assignee: 'sakthivj6@gmail.com', // register email
        limit: 1,
      },
    };

    const response = await controller.getmanyTask(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('get_Task', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        Id: taskId,
      },
    };

    const response = await controller.getTask(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('update_Task', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        Id: taskId,
        data: {
          name: 'updated Tasks',
        },
      },
    };

    const response = await controller.updateTask(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('create_Story', async () => {
    const status = 201;
    const data = {
      credentialId: credentialId,
      data: {
        task_gid: taskId,
        data: {
          text: 'this is comment 120',
          html_text: '<body> this is comment</body>',
          is_pinned: true,
        },
      },
    };

    const response = await controller.createStory(data);
    storyId = response.result.response.data.gid;
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('get_Story', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        Id: storyId,
      },
    };

    const response = await controller.getStory(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('update_Story', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        Id: storyId,
        data: {
          text: 'this is comment 10',
        },
      },
    };

    const response = await controller.updateStory(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('getmany_Story', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      task_gid: taskId,
      data: {
        limit: 1,
      },
    };

    const response = await controller.getmanyStory(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('get_Story', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        Id: storyId,
      },
    };

    const response = await controller.deleteStory(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('create_Attachment', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        data: {
          parentGid: taskId, //'1210947906606395', // task Id
          filePath: '/home/selva/Downloads/one.png',
        },
      },
    };

    const response = await controller.createAttachment(data);
    attachmentId = response.result.response.data.gid;
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('getmany_Attachment', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        parent: taskId,
      },
    };

    const response = await controller.getmanyAttachment(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('create_webhook', async () => {
    const status = 201;
    const data = {
      credentialId: credentialId,
      data: {
        data: {
          resource: taskId,    // Task or Projects Id
          target:
            'https://ethical-lion-curious.ngrok-free.app/asana/asana-webhook',
        },
      },
    };

    const response = await controller.createWebhooks(data);
    webhookId = response.result.response.data.gid;
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

    it('get_webhook', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        Id: webhookId,
      },
    };

    const response = await controller.getWebhooks(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

      it('update_webhook', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        Id: webhookId,
        data:{

        }
      },
    };

    const response = await controller.updateWebhooks(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

      it('getmany_webhook', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        workspace: userId,
      },
    };

    const response = await controller.getmanyWebhooks(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

      it('delete_webhook', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        Id: webhookId,
      },
    };

    const response = await controller.deleteWebhooks(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });
  it('delete_Task', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        Id: taskId,
      },
    };

    const response = await controller.deleteTask(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });
  it('get_Attachment', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        Id: attachmentId,
      },
    };

    const response = await controller.getAttachment(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('delete_Attachment', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        Id: attachmentId,
      },
    };

    const response = await controller.deleteAttachment(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('create_section', async () => {
    const status = 201;
    const data = {
      credentialId: credentialId,
      data: {
        project_gid: projectId,
        data: {
          name: 'section 4 ',
        },
      },
    };

    const response = await controller.createSection(data);
    sectionId = response.result.response.data.gid;
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('getmany_section', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      project_gid: projectId,
      data: {
        limit: 1,
      },
    };

    const response = await controller.getmanySection(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('get_section', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        Id: sectionId,
      },
    };

    const response = await controller.getSection(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });
  it('update_section', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        Id: sectionId,
        data: {
          name: 'updated section',
        },
      },
    };

    const response = await controller.updateSection(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('delete_section', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        Id: sectionId,
      },
    };

    const response = await controller.deleteSection(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });

  it('delete_projects', async () => {
    const status = 200;
    const data = {
      credentialId: credentialId,
      data: {
        Id: projectId,
      },
    };

    const response = await controller.deleteProject(data);
    console.log(JSON.stringify(response, null, 2));
    expect(response.result.status).toBe(status);
  });
});
