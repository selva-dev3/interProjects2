import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import axios from 'axios';
import * as crypto from 'crypto';
import { CredentialController } from 'src/credential/credential.controller';
import { Credentials } from 'src/entities/Credentials';
import { initializeDB } from 'src/ormconfig';
import { CustomLogger } from 'src/logger/custom.logger';
import config, {
  XappName,
  fields,
  modules,
  fields as xappModules,
} from './redbooth.config';
@Controller('redbooth')
export class RedboothController {
  private credentialController = new CredentialController();
  private logger = new CustomLogger();

  /**
   * [AUTO-GENERATED] OAuth authorize endpoint.
   * This endpoint initiates the authentication flow.
   * Implement the actual token request and error handling as needed.
   */

  @Post('authorize')
  async authorize(@Body() reqBody: any, @Res() res: Response) {
    if (!reqBody.clientId || !reqBody.redirectUri) {
      throw new HttpException(
        'Missing OAuth parameters',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const { userId, node, baseUrl } = reqBody;
      // Construct the OAuth URL.
      // NOTE: Update the URL if your xapp uses a different authentication endpoint.
      const state = crypto.randomBytes(16).toString('hex');

      let dataCenter: string;
      let type: string = reqBody.type;
      let authUrl: string = reqBody.authUrl;
      let tokenUrl: string = reqBody.tokenUrl;
      let name: string = reqBody.name;

      //   if (tokenUrl) {
      //     const domain = tokenUrl.split('/')[2].split('.');
      //     dataCenter = tokenUrl.includes('.com.cn')
      //       ? 'com.cn'
      //       : tokenUrl.includes('.com.au')
      //         ? 'com.au'
      //         : domain.pop();
      //   } else {
      //     const domain = baseUrl.split('/')[2].split('.');
      //     dataCenter = baseUrl.includes('.com.cn')
      //       ? 'com.cn'
      //       : baseUrl.includes('.com.au')
      //         ? 'com.au'
      //         : domain.pop();
      //   }

      let clientId: any = reqBody.clientId;
      let clientSecret: any = reqBody.clientSecret;
      let redirectUri: any = reqBody.redirectUri;
      let zapikey: any = reqBody.zapikey;

      if (userId.length !== undefined) {
        const connection = await initializeDB();
        const credentialRepository = connection.getRepository(Credentials);

        const zohoauthdata = await credentialRepository.query(
          `SELECT id,name,type,auth_data
            FROM credentials
            WHERE author_id = $1
            AND name = $2
            ORDER BY created_at ASC
            LIMIT 1`,
          [userId, `zohocrm_${node}`],
        );

        if (zohoauthdata > 0) {
          const authData = zohoauthdata[0].auth_data;
          clientId = authData.clientId;
          clientSecret = authData.clientId;
          redirectUri = authData.redirectUri;
        } else {
          clientId = process.env.REDBOOTH_CLIENT_ID;
          clientSecret = process.env.REDBOOTH_CLIENT_SECRET;
          redirectUri = process.env.REDBOOTH_REDIRECT_URI;
        }
      }
      const data = {
        clientId: clientId,
        clientSecret: clientSecret,
        redirectUri: redirectUri,
        state: state,
        authUrl: authUrl,
        tokenUrl: tokenUrl,
        baseUrl: baseUrl,
      };
      const reqbody = {
        name: name,
        type: type,
        data: data,
        userId: userId,
      };
      if (reqBody.id) {
        // Update existing credentials
        await this.credentialController.updateCredentials(reqBody.id, data);
        this.logger.debug(
          `Credentials with ID updated successfully :`,
          reqBody.id,
        );
      } else {
        await this.credentialController.createCredentials(reqbody);
        this.logger.debug(`New credentials created for :`, name);
      }

      authUrl = `${authUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&state=${state}`;

      this.logger.debug(`${XappName} auth URL:`, authUrl);
      return res.json(authUrl);
    } catch (error) {
      this.logger.error('Error in authorize:', error);
      throw new HttpException(
        'Authorization error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get('callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    try {
      const code = req.query.code as string;
      const state = req.query.state as string;
      if (!code) {
        throw new HttpException('Missing code', HttpStatus.BAD_REQUEST);
      }
      const connection = await initializeDB();
      const credRespository = connection.getRepository(Credentials);
      const credential = await credRespository
        .createQueryBuilder('credentials')
        .where("credentials.auth_data->>'state' = :state", { state })
        .getOne();

      console.log('credential', credential);

      if (!credential) {
        throw new HttpException(
          'Invalid state parameter',
          HttpStatus.NOT_FOUND,
        );
      }

      const { clientId, clientSecret, redirectUri ,tokenUrl} = credential.authData;
      const tokenRequestData = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }).toString();
      // TODO: Implement token exchange using the provided code.
      // NOTE: Save the access token and handle refresh token logic.
      const tokenResponse = await axios.post(
        tokenUrl,
        tokenRequestData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      console.log('Sending token request with:', tokenResponse.data);
      credential.authData['token'] = tokenResponse.data;
      credential.authData['refreshToken'] =
        credential.authData['token'].refresh_token;
      await this.credentialController.updateCredentials(
        credential.id,
        credential.authData,
      );
      return res.json({
        response: tokenResponse.data,
        status: tokenResponse.status,
      });
    } catch (error) {
      this.logger.error('Error in callback:', error);
      throw new HttpException(
        'Callback error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('refreshToken')
  async refreshToken(@Body() reqBody: any) {
    if (!reqBody.credentialId) {
      throw new HttpException('Missing refresh token', HttpStatus.BAD_REQUEST);
    }
    try {
      const id = reqBody.credentialId;

      const connection = await initializeDB();
      const credRespository = connection.getRepository(Credentials);
      const credentialRepository = await credRespository.findOne({
        where: { id },
      });
      console.log('credRespository', credentialRepository);

      const { clientId, clientSecret, token } = credentialRepository.authData;
      const refreshToken = token.refresh_token;
      console.log('refreshToken    :', refreshToken);

      const tokenRequestData = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString();

      console.log('token requestdata   :', tokenRequestData);
      const tokenResponse = await axios.post(
        `https://redbooth.com/oauth2/token`,
        tokenRequestData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      console.log('refreshToken   ', tokenResponse.data);
      const tokens = tokenResponse.data;
      credentialRepository.authData['token'] = tokens;
      const data = credentialRepository.authData;
      await this.credentialController.updateCredentials(
        credentialRepository.id,
        data,
      );
      const updatecred: any = await credRespository.findOne({ where: { id } });
      console.log('refreshed  ', updatecred);
      return {
        message: `${XappName} access token refreshed successfully`,
        accessToken: tokens,
      };
    } catch (error) {
      this.logger.error('Error in refreshToken:', error);
      throw new HttpException(
        'Refresh token error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async AuthError(
    functionName: string,
    functionArgs: any[],
    credentialId: string,
  ) {
    try {
      await this.refreshToken({ credentialId });
      const argsArray = Array.isArray(functionArgs)
        ? functionArgs
        : [functionArgs];
      const result = await this[functionName](...argsArray);
      return result;
    } catch (error) {
      this.logger.error('Error refreshing token:', error + error.stack);
      return error;
    }
  }

  /**
 * [AUTO-GENERATED] Endpoint for module "task" action "create".
 *  - Request Parameters (data): 
 * - CredentialId: string
 * - ModuleData: object (data to create)
 * - Calls the integration helper "performredboothAction".
 * DO NOT modify the method signature.
 *  Example usage:
 *  {
    "credentialId": "3fd11e99-ccbb-403a-8354-3d9ad64ae950",
    "data": {
        "data": {
            "project_id":"2268977",
            "task_list_id":"6780932",
            "name":"to-do-list"
        }
    }
}
 */

  @Post('task/create')
  async createTask(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'tasks',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createTask',
          functionArgs,
          data.credentialId,
        );
        return result;
      }

      return res.json({
        message: `redbooth task create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in task/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
  * [AUTO-GENERATED] Endpoint for module "task" action "update".
  *  - Request Parameters (data): 
  * - CredentialId: string
  * - ModuleData: object (data to update)
  * - Calls the integration helper "performredboothAction".
  * DO NOT modify the method signature.
  *  Example usage:
  *  {
    "credentialId": "3fd11e99-ccbb-403a-8354-3d9ad64ae950",
    "data": {
        "Id":"61068546",
        "data": {
            "project_id":"2268977",
            "task_list_id":"6780932",
            "name":"daily task"
        }
    }
}
  */

  @Post('task/update')
  async updateTask(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'tasks',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateTask',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth task update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in task/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "task" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performredboothAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "3fd11e99-ccbb-403a-8354-3d9ad64ae950",
    "data": {
        "Id":"61068546",
        "data": {
            
        }
    }
}
   */

  @Post('task/get')
  async getTask(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'tasks',
        'get',
        'get',
        data,
      );
      return res.json({
        message: `redbooth task get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in task/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
      * [AUTO-GENERATED] Endpoint for module "task" action "getmany".
      *  - Request Parameters (data): 
      * - CredentialId: string
      * - Filters: object (optional filters for querying records)
      * - Calls the integration helper "performredboothAction".
      * DO NOT modify the method signature.
      *  Example usage:
      *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
                    //    "organization_id":"774008"
            // "project_id":2271958
            // "user_id": 6367122
            // "task_list_id":"6801905"
            // "assigned":false
            // "archived":true
            // "created_from":1752660219
            // "created_to":1752658594
        }
    }
}
      */

  @Post('task/getmany')
  async getmanyTask(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'tasks',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyTask',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth task getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in task/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
    * [AUTO-GENERATED] Endpoint for module "task" action "delete".
    *  - Request Parameters (data): 
    * - CredentialId: string
    * - RecordId: string (ID of the record to delete)
    * - Calls the integration helper "performredboothAction".
    * DO NOT modify the method signature.
    *  Example usage:
    * {
    "credentialId": "3fd11e99-ccbb-403a-8354-3d9ad64ae950",
    "data": {
        "Id":"61068676",
        "data": {
           
        }
    }
}
    */

  @Post('task/delete')
  async deleteTask(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'tasks',
        'delete',
        'delete',
        data,
      );
      return res.json({
        message: `redbooth task delete executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in task/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "subtask" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performredboothAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "3fd11e99-ccbb-403a-8354-3d9ad64ae950",
    "data": {
        "data": {
            "task_id": "61068546",
            "name": "to_do"
        }
    }
}

   */

  @Post('subtask/create')
  async createSubtask(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'subtasks',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createSubTask',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth subtask create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in subtasks/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
  * [AUTO-GENERATED] Endpoint for module "subtask" action "update".
  *  - Request Parameters (data): 
  * - CredentialId: string
  * - ModuleData: object (data to update)
  * - Calls the integration helper "performredboothAction".
  * DO NOT modify the method signature.
  *  Example usage:
  *  {
    "credentialId": "3fd11e99-ccbb-403a-8354-3d9ad64ae950",
    "data": {
        "Id":"37437954",
        "data": {
            "task_id": "61068546",
            "name": "to_do list"
        }
    }
}


  */

  @Post('subtask/update')
  async updateSubtask(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'subtasks',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateSubtask',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth subtask update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in subtask/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //     /**
  //    * [AUTO-GENERATED] Endpoint for module "subtask" action "get".
  //    *  - Request Parameters (data):
  //    * - CredentialId: string
  //    * - RecordId: string (ID of the record to fetch)
  //    * - Calls the integration helper "performredboothAction".
  //    * DO NOT modify the method signature.
  //    *  Example usage:
  //    *  {
  //   "CredentialId": "your-credential-id",
  //   "RecordId": "record-id"
  // }
  //    */

  //======== improper documenntation there is no API ENDPOINT  for get subtask by id=======//

  // @Post('subtask/get')
  // async getSubtask(@Body() data: any, @Res() res: Response) {
  //     if (!data) {
  //         throw new HttpException('Request body cannot be empty', HttpStatus.BAD_REQUEST);
  //     }
  //     try {
  //         data['functionName'] = "getSubTask"
  //         const result = await this.performRedboothAction('subtasks', 'get', 'get', data);
  //         if (result.status === 401) {
  //             const functionArgs = Array.from(arguments).slice(0, 2);
  //             const result = await this.AuthError("getSubTask", functionArgs, data.credentialId);
  //             return result;
  //         }
  //         return res.json({
  //             message: `redbooth subtask get executed successfully`,
  //             result,
  //         });
  //     } catch (error) {
  //         this.logger.error(`Error in subtask/get:`, error);
  //         throw new HttpException(
  //             error.message || 'Internal server error',
  //             HttpStatus.INTERNAL_SERVER_ERROR
  //         );
  //     }
  // }

  /**
  * [AUTO-GENERATED] Endpoint for module "subtask" action "getmany".
  *  - Request Parameters (data): 
  * - CredentialId: string
  * - Filters: object (optional filters for querying records)
  * - Calls the integration helper "performredboothAction".
  * DO NOT modify the method signature.
  *  Example usage:
  *  {
    "credentialId": "3fd11e99-ccbb-403a-8354-3d9ad64ae950",
    "data": {
        
        "data": {
            "task_id":"61068546"
        }
    }
}
  */

  @Post('subtask/getmany')
  async getmanySubtask(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'subtasks',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanySubTask',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth subtask getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in subtask/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
      * [AUTO-GENERATED] Endpoint for module "subtask" action "delete".
      *  - Request Parameters (data): 
      * - CredentialId: string
      * - RecordId: string (ID of the record to delete)
      * - Calls the integration helper "performredboothAction".
      * DO NOT modify the method signature.
      *  Example usage:
      *  {
    "credentialId": "3fd11e99-ccbb-403a-8354-3d9ad64ae950",
    "data": {
        "Id":"37438084",
        "data": {
           
        }
    }
}
      */

  @Post('subtask/delete')
  async deleteSubtask(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'subtasks',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteSubTask',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth subtask delete executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in subtask/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  /**
 * [AUTO-GENERATED] Endpoint for module "tasklist" action "create".
 *  - Request Parameters (data): 
 * - CredentialId: string
 * - ModuleData: object (data to create)
 * - Calls the integration helper "performredboothAction".
 * DO NOT modify the method signature.
 *  Example usage:
 *  {
    "credentialId": "3fd11e99-ccbb-403a-8354-3d9ad64ae950",
    "data": {
        "data": {
            "project_id":"2268977",
            "name":"taskList 1"
        }
    }
}
 */

  @Post('taskList/create')
  async createtaskList(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'task_lists',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createTasklist',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth taskList create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in taskList/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
 * [AUTO-GENERATED] Endpoint for module "tasklist" action "update".
 *  - Request Parameters (data): 
 * - CredentialId: string
 * - ModuleData: object (data to update)
 * - Calls the integration helper "performredboothAction".
 * DO NOT modify the method signature.
 *  Example usage:
 * {
    "credentialId": "3fd11e99-ccbb-403a-8354-3d9ad64ae950",
    "data": {
        "Id":"6780932",
        "data": {
           "name":"task List 1"
        }
    }
}
 */

  @Post('taskList/update')
  async updateTaskList(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'task_lists',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateTaskList',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth tasklist update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in taskList/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tasklist" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performredboothAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "3fd11e99-ccbb-403a-8354-3d9ad64ae950",
    "data": {
        "Id":"6780932",
        "data": {
            
        }
    }
}
   */

  @Post('taskList/get')
  async getTasklist(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'task_lists',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getTaskList',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth taskList get  executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in taskList/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
  * [AUTO-GENERATED] Endpoint for module "tasklist" action "getmany".
  *  - Request Parameters (data): 
  * - CredentialId: string
  * - Filters: object (optional filters for querying records)
  * - Calls the integration helper "performredboothAction".
  * DO NOT modify the method signature.
  *  Example usage:
  *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            // "organization_id":"774008"
            // "project_id":2271958
            // "user_id": 6367122
            // "archived":false
         
        }
    }
}
  */

  @Post('taskList/getmany')
  async getmanyTasklist(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'task_lists',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyTaskList',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth taskList getmany  executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in taskList/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tasklist" action "delete".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to delete)
   * - Calls the integration helper "performredboothAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "3fd11e99-ccbb-403a-8354-3d9ad64ae950",
    "data": {
        "Id":"6780871",
        "data": {
            
        }
    }
}
   */

  @Post('taskList/delete')
  async deleteTasklist(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'task_lists',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteTaskList',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth tasklist delete executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in tasklist/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "comment" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performredboothAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "3fd11e99-ccbb-403a-8354-3d9ad64ae950",
    "data": {
        "data": {
            "target_type":"task",
            "target_id":"61068546",
            "body":"hiiiii"
        }
    }
}
   */

  @Post('comment/create')
  async createComment(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'comments',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createComments',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth comment create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in comment/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "comment" action "update".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to update)
   * - Calls the integration helper "performredboothAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "3fd11e99-ccbb-403a-8354-3d9ad64ae950",
    "data": {
        "Id":"285855933",
        "data": {
            "target_type":"task",
            "target_id":"61068546",
            "body":"hiiiii everyone"
        }
    }
}
   */

  @Post('comment/update')
  async updateComment(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'comments',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateComments',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth comment update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in comment/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "comment" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performredboothAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "CredentialId": "your-credential-id",
    "RecordId": "record-id"
  }{
    "credentialId": "3fd11e99-ccbb-403a-8354-3d9ad64ae950",
    "data": {
        "Id":"285855933",
        "data": {
           
        }
    }
}
     */

  @Post('comment/get')
  async getComment(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'comments',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getComments',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth comment get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in comment/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "comment" action "getmany".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - Filters: object (optional filters for querying records)
     * - Calls the integration helper "performredboothAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "target_type":"task",
            "target_id":"61442378",
            // "organization_id":"774008"
            // "project_id":"2271958"
        }
    }
}
     */

  @Post('comment/getmany')
  async getmanyComment(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'comments',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyComments',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth comment getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in comment/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
      * [AUTO-GENERATED] Endpoint for module "comment" action "delete".
      *  - Request Parameters (data): 
      * - CredentialId: string
      * - RecordId: string (ID of the record to delete)
      * - Calls the integration helper "performredboothAction".
      * DO NOT modify the method signature.
      *  Example usage:
      *  {
     "CredentialId": "your-credential-id",
     "RecordId": "record-id"
   }{
    "credentialId": "3fd11e99-ccbb-403a-8354-3d9ad64ae950",
    "data": {
        "Id":"285855928",
        "data": {
        }
    }
}
      */

  @Post('comment/delete')
  async deleteComment(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'comments',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteComments',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth comment delete executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in comment/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
 * [AUTO-GENERATED] Endpoint for module "project" action "create".
 *  - Request Parameters (data): 
 * - CredentialId: string
 * - ModuleData: object (data to create)
 * - Calls the integration helper "performredboothAction".
 * DO NOT modify the method signature.
 *  Example usage:
 * {
    "credentialId": "3fd11e99-ccbb-403a-8354-3d9ad64ae950",
    "data": {
        "data": {
            "organization_id":"773486",
            "name":"smack",
            "publish_pages":true
        }
    }
}
 */

  @Post('project/create')
  async createProject(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'projects',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createTask',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth project create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in project/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
 * [AUTO-GENERATED] Endpoint for module "project" action "get".
 *  - Request Parameters (data): 
 * - CredentialId: string
 * - ModuleData: object (data to update)
 * - Calls the integration helper "performredboothAction".
 * DO NOT modify the method signature.
 *  Example usage:
 *  {
    "credentialId": "3fd11e99-ccbb-403a-8354-3d9ad64ae950",
    "data": {
        "Id":"2268977",
        "data": {}
    }
}
 */

  @Post('project/get')
  async getProject(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'projects',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createProjects',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth project get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in project/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
 * [AUTO-GENERATED] Endpoint for module "project" action "update".
 *  - Request Parameters (data): 
 * - CredentialId: string
 * - ModuleData: object (data to update)
 * - Calls the integration helper "performredboothAction".
 * DO NOT modify the method signature.
 *  Example usage:
 * {
    "credentialId": "3fd11e99-ccbb-403a-8354-3d9ad64ae950",
    "data": {
        "Id":"2268977",
        "data": {
            "organization_id":"773486",
            "name":"smack project",
            "publish_pages":true,
            "include_weekend_days":true
        }
    }
}
 */

  @Post('project/update')
  async updateProject(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'projects',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createProjects',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth project update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in project/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
 * [AUTO-GENERATED] Endpoint for module "project" action "getmany".
 *  - Request Parameters (data): 
 * - CredentialId: string
 * - Filters: object (optional filters for querying records)
 * - Calls the integration helper "performredboothAction".
 * DO NOT modify the method signature.
 *  Example usage:
 * {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            // "organization_id":"774008"
            // "order":"created_at-ASC
            // "per_page":1
        }
    }
}
 */

  @Post('project/getmany')
  async getmanyProject(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'projects',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createProjects',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth project getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in project/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
* [AUTO-GENERATED] Endpoint for module "project" action "delete".
*  - Request Parameters (data): 
* - CredentialId: string
* - ModuleData: object (data to create)
* - Calls the integration helper "performredboothAction".
* DO NOT modify the method signature.
*  Example usage:
* {
    "credentialId": "3fd11e99-ccbb-403a-8354-3d9ad64ae950",
    "data": {
        "Id":"2269008",
        "data": {
            
        }
    }
}
*/

  @Post('project/delete')
  async deleteProject(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'projects',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createProjects',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth project create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in project/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
  * [AUTO-GENERATED] Endpoint for module "organization" action "create".
  *  - Request Parameters (data): 
  * - CredentialId: string
  * - RecordId: string (ID of the record to fetch)
  * - Calls the integration helper "performredboothAction".
  * DO NOT modify the method signature.
  *  Example usage:
  *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "name":"new organization",
            "permalink":false,
            "domain":true
        }
    }
}
  */

  @Post('organization/create')
  async createOrganization(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'organizations',
        'create',
        'post',
        data,
      );
      return res.json({
        message: `redbooth organization get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in organization/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //   {
  //     "credentialId": "{{credentialId}}",
  //     "data": {
  //         "data": {
  //             // "order":"created_at-ASC"
  //             "per_page":1,
  //             "page":3
  //         }
  //     }
  // }

  @Post('organization/get')
  async getOrganization(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'organizations',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getOrganizations',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `redbooth organizations get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in organizations/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // /**
  //    * [AUTO-GENERATED] Endpoint for module "workspace" action "get".
  //    *  - Request Parameters (data):
  //    * - CredentialId: string
  //    * - RecordId: string (ID of the record to fetch)
  //    * - Calls the integration helper "performredboothAction".
  //    * DO NOT modify the method signature.
  //    *  Example usage:
  //    *  {
  //   "CredentialId": "your-credential-id",
  //   "RecordId": "record-id"
  // }
  //    */

  //======= improper documentation there is no API endpoint to get workspace ======//

  // @Post('workspace/get')
  // async getWorkspace(@Body() data: any, @Res() res: Response) {
  //     if (!data) {
  //         throw new HttpException('Request body cannot be empty', HttpStatus.BAD_REQUEST);
  //     }
  //     try {
  //         const result = await this.performRedboothAction('workspace', 'get', data);
  //         return res.json({
  //             message: `redbooth workspace get executed successfully`,
  //             result,
  //         });
  //     } catch (error) {
  //         this.logger.error(`Error in workspace/get:`, error);
  //         throw new HttpException(
  //             error.message || 'Internal server error',
  //             HttpStatus.INTERNAL_SERVER_ERROR
  //         );
  //     }
  // }

  async getAllOrganization(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'organizations',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getOrganizations',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return result.response.map((data) => ({
        name: data.name,
        value: data.id,
      }));
    } catch (error) {
      this.logger.error(`Error in organizations/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getAllTask(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'tasks',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getallTask',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return result.response.map((data) => ({
        name: data.name,
        value: data.id,
      }));
    } catch (error) {
      this.logger.error(`Error task/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllsubTask(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const task_id = '61442382';
      const result = await this.performRedboothAction(
        `subtasks?task_id=${task_id}`,
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getallsubTask',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return result.response.map((data) => ({
        name: data.name,
        value: data.id,
      }));
    } catch (error) {
      this.logger.error(`Error subTask/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllTaskList(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'task_lists',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getallTaskList',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return result.response.map((data) => ({
        name: data.name,
        value: data.id,
      }));
    } catch (error) {
      this.logger.error(`Error taskList/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllComments(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const id = data.credentialId;
      const initializedata: any = await this.initialize(id);
      const task_id = initializedata.task_id;
      console.log('task', initializedata);

      const result = await this.performRedboothAction(
        `comments?target_id=${task_id}&target_type=task`,
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getallComments',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return result.response.map((data) => ({
        name: data.body,
        value: data.id,
      }));
    } catch (error) {
      this.logger.error(`Error commments/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllProjects(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performRedboothAction(
        'projects',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getallProjects',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return result.response.map((data) => ({
        name: data.name,
        value: data.id,
      }));
    } catch (error) {
      this.logger.error(`Error projects/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async generateFields(category: string, name: string) {
    if (!fields || !Array.isArray(fields)) {
      throw new Error('Fields array is not defined or is not an array.');
    }
    const filteredFields = fields.filter(
      (field) =>
        field.displayOptions &&
        field.displayOptions.show &&
        field.displayOptions.show.category &&
        field.displayOptions.show.category.includes(category) &&
        (field.displayOptions.show.name
          ? field.displayOptions.show.name.includes(name)
          : true),
    );
    return filteredFields;
  }

  @Post('getFields')
  async getfields(
    @Body() body: { category: string; name: string; credentialId: any },
  ) {
    const { category, name, credentialId } = body;
    try {
      const value = await this.initializeFields(credentialId);
      const relevantFields = await this.generateFields(category, name);
      return relevantFields;
    } catch (error) {
      return [];
    }
  }

  async initializeFields(data) {
    for (const field of fields) {
      if (typeof field.init === 'function') {
        const datas = { credentialId: data, data: {} };
        await field.init(datas);
      }
    }
  }

  public async initialize(credentialId) {
    try {
      const id = credentialId;
      const connection = await initializeDB();
      const credRepository = connection.getRepository(Credentials);
      const credentialRespository = await credRepository.findOne({
        where: { id },
      });
      console.log('db data', credentialRespository);
      const access_token = credentialRespository.authData.token.access_token;
      const baseUrl = credentialRespository.authData.baseUrl;
      return {
        access_token: access_token,
        baseUrl: baseUrl,
      };
    } catch (error) {
      this.logger.error('Error initializing twitter :', error + error.stack);
    }
  }

  public async curl(
    module: string,
    action: string,
    method: string,
    argumentdata,
  ) {
    try {
      const { credentialId, data } = argumentdata;
      const initializeData: any = await this.initialize(credentialId);
      const { access_token, baseUrl } = initializeData;
      let url = `${baseUrl}/${module}`;
      if (data.Id) {
        url += `/${data.Id}`;
      }
      const options: any = {
        method,
        url,
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      };
      if (action === 'getmany') {
        if (argumentdata) options.params = data.data;
      } else {
        if (argumentdata) options.data = data.data;
      }
      console.log('options data  ', options);
      const response = await axios(options);
      console.log('responseContent', response);
      return { response: response.data, status: response.status };
    } catch (error) {
      console.log(error.response);
      return {
        response: [error.response?.data || error.message],
        status: error.status || 500,
      };
    }
  }

  private async performRedboothAction(
    module: string,
    action: string,
    method: string,
    data: any,
  ): Promise<any> {
    // TODO: Implement the actual integration logic.
    // For example:
    // 1. Initialize your API client using a refresh token or saved credentials.
    // 2. Validate that 'data' contains required fields (CredentialId, ModuleId, ModuleData).
    // 3. Use the correct HTTP method based on the action (GET, POST, PATCH, DELETE, etc.).
    // 4. Handle errors and return the API response.
    // 5. If the access token is expired, call the refreshToken endpoint.
    const resultData = await this.curl(module, action, method, data);
    return resultData;
  }
}
export const redboothController = new RedboothController();
