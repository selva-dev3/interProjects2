// asana.controller.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONTROLLER FILE.
// DO NOT modify the auto-generated endpoints below.
// For custom integration logic, extend the helper "performasanaAction".
//
// Copyright (c) 2025 Smackcoders. All rights reserved.
// This file is subject to the Smackcoders Proprietary License.
// Unauthorized copying or distribution is strictly prohibited.
// -----------------------------------------------------------------------------

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
  Headers,
} from '@nestjs/common';
import { Request, response, Response } from 'express';
import * as FormData from 'form-data';
import * as fs from 'fs';
import axios, { Method } from 'axios';
import { initializeDB } from '../../ormconfig';
import { Credentials } from '../../entities/Credentials';
import { CustomLogger } from '../../logger/custom.logger';
import config, {
  XappName,
  fields,
  modules as xappModules,
} from './asana.config';

import { randomBytes } from 'crypto';
import { CredentialController } from 'src/credential/credential.controller';
let projectOffset, taskOffset, workspaceOffset, storyOffset, sectionOffset;

@Controller('asana')
export class AsanaController {
  private credentialsController = new CredentialController();
  private logger = new CustomLogger();

  /**
   * [AUTO-GENERATED] OAuth authorize endpoint.
   * This endpoint initiates the authentication flow.
   * Implement the actual token request and error handling as needed.
   */
  @Post('authorize')
  async authorize(@Body() reqBody: any, @Res() res: Response) {
    if (
      !reqBody.clientId ||
      !reqBody.redirectUri ||
      !reqBody.type ||
      !reqBody.clientSecret ||
      !reqBody.name
    ) {
      throw new HttpException(
        'Missing OAuth parameters',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const { baseUrl, node, userId } = reqBody;
      const state = randomBytes(16).toString('hex');

      let name = reqBody.name;
      let type = reqBody.type;
      let authUrl = reqBody.authUrl;
      let tokenUrl = reqBody.tokenUrl;

      //   if (tokenurl) {
      //     const domain = tokenurl.split('/')[2].split('.');
      //     dataCenter = tokenurl.includes('.com.cn')
      //       ? 'com.cn'
      //       : tokenurl.includes('.com.au')
      //         ? 'com.au'
      //         : domain.pop();
      //   } else {
      //     const domain = baseurl.split('/')[2].split('.');
      //     dataCenter = baseurl.includes('.com.cn')
      //       ? 'com.cn'
      //       : baseurl.includes('.com.au')
      //         ? 'com.au'
      //         : domain.pop();
      //   }

      let clientId = reqBody.clientId;
      let clientSecret = reqBody.clientSecret;
      let redirectUri = reqBody.redirectUri;
      let zapikey = reqBody.zapikey;
      console.log('reqBody:', reqBody);
      if (userId.length !== undefined) {
        const connection = await initializeDB();
        const credentialsRepository = connection.getRepository(Credentials);

        const zohoauthdata = await credentialsRepository.query(
          `SELECT id,name,auth_data
            FROM credentials
            WHERE author_id = $1
            AND name = $2 
            LIMIT 1`,
          [userId, `zohocrm_${node}`],
        );

        console.log('zohoauthdata:', zohoauthdata);
        if (zohoauthdata.length > 0) {
          const authData = zohoauthdata[0].auth_data;
          clientId = authData.clientId;
          clientSecret = authData.clientSecret;
          redirectUri = authData.redirectUri;
        } else {
          clientId = process.env.ASANA_CLIENT_ID;
          clientSecret = process.env.ASANA_CLIENT_SECRET;
          redirectUri = process.env.ASANA_REDIRECT_URI;
        }
      }

      const data = {
        clientId,
        clientSecret,
        redirectUri,
        authUrl,
        tokenUrl,
        state,
        baseUrl,
        zapikey,
      };
      const reqbody = {
        name,
        type,
        data,
        userId,
      };

      let result;
      if (reqBody.id) {
        result = await this.credentialsController.updateCredentials(
          reqBody.id,
          data,
        );
        this.logger.debug(
          `Credentials with ID updated successfully :`,
          reqBody.id,
        );
      } else {
        result = await this.credentialsController.createCredentials(reqbody);
        this.logger.debug(`New credentials created for:`, name);
      }
      if (!result) {
        throw new HttpException(
          'Credentials strore faild',
          HttpStatus.BAD_REQUEST,
        );
      }

      authUrl = `${authUrl}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=default`;
      this.logger.debug(`${XappName} auth URL:`, authUrl);
      return res.send({ message: authUrl });
    } catch (error) {
      console.log(error);
      this.logger.error('Error in authorize:', error);
      throw new HttpException(
        'Authorization error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] OAuth callback endpoint.
   * Implement token exchange, credential update, and refreshToken handling here.
   */
  @Get('callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    try {
      console.log('Full callback query:', req.query);
      const code = req.query.code as string;
      const state = req.query.state as string;
      const connection = await initializeDB();
      const credRepository = connection.getRepository(Credentials);
      const credential = await credRepository
        .createQueryBuilder('credentials')
        .where("credentials.auth_data->>'state'=:state", { state })
        .getOne();
      const { clientId, clientSecret, redirectUri, tokenUrl } =
        credential.authData;

      const data = {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code,
      };
      const result = await axios.post(tokenUrl, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      credential.authData['token'] = result.data;

      await this.credentialsController.updateCredentials(
        credential.id,
        credential.authData,
      );
      // Import redirect URL from config
      const { redirect } = await import('./asana.config');
      // Redirect user to frontend
      return res.redirect(redirect);
    } catch (error) {
      console.log('error:', error);
      this.logger.error('Error in callback:', error);
      throw new HttpException(
        'Callback error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // /**
  //  * [AUTO-GENERATED] Refresh token endpoint.
  //  * This endpoint should handle token expiry and refresh the access token.
  //  * Implement the refresh logic based on your authentication provider.
  //  */
  @Post('refreshToken')
  async refreshToken(@Body() reqBody: any) {
    try {
      const id = reqBody.credentialId;
      const connection = await initializeDB();
      const credRepository = connection.getRepository(Credentials);
      const credentialRepository: any = await credRepository.findOne({
        where: { id: id },
      });
      const { clientId, clientSecret, token } = credentialRepository.authData;
      const refreshToken = token.refresh_token;
      const data = {
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      };
      console.log('data:', data);
      const result = await axios.post(
        `https://app.asana.com/-/oauth_token`,
        data,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      const tokens = result.data;
      credentialRepository.authData['token'] = tokens;
      credentialRepository.authData['token']['refresh_token'] = refreshToken;
      await this.credentialsController.updateCredentials(
        credentialRepository.id,
        credentialRepository.authData,
      );
      console.log('token saved');
      return {
        message: `${XappName} access token refreshed successfully`,
        Tokens: tokens,
      };
    } catch (error) {
      console.log('error:', error);
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
      console.log('hello');
      await this.refreshToken(credentialId);
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

  // ---------------------------------------------------------------------------
  // AUTO-GENERATED ENDPOINTS FOR MODULE ACTIONS (as defined in the blueprint JSON)
  // ---------------------------------------------------------------------------

  /**
     * [AUTO-GENERATED] Endpoint for module "users" action "create".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "CredentialId": "your-credential-id",
    "ModuleData": {
      "field1": "value1",
      "field2": "value2"
    }
  }
     */

  // @Post('users/create')
  // async createUsers(@Body() data: any) {
  //     if (!data) {
  //         throw new HttpException('Request body cannot be empty', HttpStatus.BAD_REQUEST);
  //     }
  //     try {
  //         const result = await this.performasanaAction('users', 'create', 'POST', data);
  //         if (result.status === 401) {
  //             const functionArgs = Array.from(arguments).slice(0, 2);
  //             const result = await this.AuthError("createUsers", functionArgs, data.credentialId)
  //         }

  //         return ({
  //             message: `asana users create executed successfully`,
  //             result,
  //         });
  //     } catch (error) {
  //         this.logger.error(`Error in users/create:`, error);
  //         throw new HttpException(
  //             error.message || 'Internal server error',
  //             HttpStatus.INTERNAL_SERVER_ERROR
  //         );
  //     }
  // }

  /**
     * [AUTO-GENERATED] Endpoint for module "users" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"f1cbafa4-bb9d-4aa1-bef4-e52c3639b0c5",
    "data":{
            "Id":"me"
    }
}
     */

  @Post('users/get')
  async getUsers(@Body() data: any) {
    if (!data || !data.credentialId) {
      throw new HttpException(
        'Request body cannot be empty ',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction('users', 'get', 'GET', data);
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getUsers',
          functionArgs,
          data.credentialId,
        );
        return result;
      }

      return {
        message: `asana users get executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in users/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "users" action "getmany".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - Filters: object (optional filters for querying records)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"f1cbafa4-bb9d-4aa1-bef4-e52c3639b0c5",
    "data":{}
}
     */

  @Post('users/getmany')
  async getmanyUsers(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      console.log('hello');
      const result = await this.performasanaAction(
        'users',
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyUsers',
          functionArgs,
          data.credentialId,
        );
      }
      console.log('hello2');

      return {
        message: `asana users getmany executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in users/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "attachment" action "create".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"f1cbafa4-bb9d-4aa1-bef4-e52c3639b0c5",  
    "data":{
    "data":{
    "parentGid":"1209415028741435",
    "filePath":"C:\\Users\\Harish R\\Pictures\\Screenshots\\Screenshot 2025-02-18 152216.png"
    }   
}
}
     */

  @Post('attachment/create')
  async createAttachment(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      let form = new FormData();
      form.append('file', fs.createReadStream(data.data.data.filePath));
form.append('parent', data.data.data.parentGid); // Your task or project GID
data.data.data= {form:form}
      console.log('afd',data.data)
      const result = await this.performasanaAction(
        'attachments',
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createAttachment',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana attachment create executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in attachment/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "attachment" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"f1cbafa4-bb9d-4aa1-bef4-e52c3639b0c5",
    "data":{
    "Id":"1209431724875875"
}
}
     */

  @Post('attachment/get')
  async getAttachment(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'attachments',
        'get',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getAttachment',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana attachment get executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in attachment/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "attachment" action "getmany".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - Filters: object (optional filters for querying records)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"f1cbafa4-bb9d-4aa1-bef4-e52c3639b0c5",
    "data":{
            "parent":"1209414838268855"
    }
}
     */

  @Post('attachment/getmany')
  async getmanyAttachment(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'attachments',
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyAttachment',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana attachment getmany executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in attachment/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "attachment" action "delete".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to delete)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
        "credentialId":"f1cbafa4-bb9d-4aa1-bef4-e52c3639b0c5",
    "data":{
    "Id":"1209859261803912"
}
}
     */

  @Post('attachment/delete')
  async deleteAttachment(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'attachments',
        'delete',
        'DELETE',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteAttachment',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana attachment delete executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in attachment/delete:`, error);
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
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"f1cbafa4-bb9d-4aa1-bef4-e52c3639b0c5",
    "data":{
        "data":{
    "workspace":"1209385139109598",
    "name":"project 15",
    "public":false,
    "due_date":"2025-03-13",
    "notes":"this is my 10th project",
    "color":"dark-blue"

        }
    }
}
     */

  @Post('project/create')
  async createProject(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'projects',
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createProject',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana project create executed successfully`,
        result,
        status: result.status,
      };
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
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"f1cbafa4-bb9d-4aa1-bef4-e52c3639b0c5",
    "data":{
        "Id":"1209415028741435"
    }
}
     */

  @Post('project/get')
  async getProject(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'projects',
        'get',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getProject',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana project get executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in project/get:`, error);
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
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"f1cbafa4-bb9d-4aa1-bef4-e52c3639b0c5",
    "data":{
        "limit":2,
        "workspace":"1209385139109598"    }
}
     */

  @Post('project/getmany')
  async getmanyProject(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = projectOffset
        ? `projects?offset=${projectOffset}`
        : 'projects';
      const result = await this.performasanaAction(url, 'getmany', 'GET', data);
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyProject',
          functionArgs,
          data.credentialId,
        );
      }
      console.log('result:', result);
      if (result.response.next_page && result.response.next_page !== null) {
        projectOffset = result.response.next_page.offset;
      }
      return {
        message: `asana project getmany executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in project/getmany:`, error);
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
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"f1cbafa4-bb9d-4aa1-bef4-e52c3639b0c5",

    "data":{
        "Id":"1209833074778337",
        "data":{
        "name": "PROJECT 13",
        "notes": "this is my first project"
    }}
}
     */

  @Post('project/update')
  async updateProject(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'projects',
        'update',
        'PUT',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateProject',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana project update executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in project/update:`, error);
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
     * - RecordId: string (ID of the record to delete)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"eb34ad74-a456-4156-a2e9-f23f2ad51c7a",
    "data":{
        "Id":"1209852929340784"
    }
}
     */

  @Post('project/delete')
  async deleteProject(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'projects',
        'delete',
        'DELETE',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteProject',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana project delete executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in project/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "task" action "create".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"eb34ad74-a456-4156-a2e9-f23f2ad51c7a",
    "data":{
        "data":{
              "name":"task 23",
        "workspace":"1209385139109598"
        ,"assignee":"harishnarayananh1@gmail.com"
        }
    }
}
     */

  @Post('task/create')
  async createTask(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'tasks',
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createTask',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana task create executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in task/create:`, error);
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
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"eb34ad74-a456-4156-a2e9-f23f2ad51c7a",
    "data":{
        "Id":"1209421389388940"
    }
}
     */

  @Post('task/get')
  async getTask(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction('tasks', 'get', 'GET', data);
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getTask',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana task get executed successfully`,
        result,
        status: result.status,
      };
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
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *{
    "credentialId":"f1cbafa4-bb9d-4aa1-bef4-e52c3639b0c5",
    "data":{
            "assignee":"harishnarayananh1@gmail.com",
    "workspace":"1209385139109598",
    "limit":1
    }
}
     */

  @Post('task/getmany')
  async getmanyTask(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = taskOffset ? `tasks?offset=${taskOffset}` : 'tasks';
      const result = await this.performasanaAction(url, 'getmany', 'GET', data);
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyTask',
          functionArgs,
          data.credentialId,
        );
      }
      if ( result.response.next_page && result.response.next_page !== null) {
        taskOffset = result.response.next_page.offset;
      }

      return {
        message: `asana task getmany executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in task/getmany:`, error);
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
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"eb34ad74-a456-4156-a2e9-f23f2ad51c7a",
    "data":{
        "Id":"1209421389388940",
        "data":{
            "name": "TASK 20"
        }
    }
}
     */

  @Post('task/update')
  async updateTask(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'tasks',
        'update',
        'PUT',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateTask',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana task update executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in task/update:`, error);
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
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"eb34ad74-a456-4156-a2e9-f23f2ad51c7a",
    "data":{
        "Id":"1209421389388940"
    }
}
     */

  @Post('task/delete')
  async deleteTask(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'tasks',
        'delete',
        'DELETE',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteTask',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana task delete executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in task/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "workspace" action "create".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
        "credentialId":"f1cbafa4-bb9d-4aa1-bef4-e52c3639b0c5",

    "data":{
        "workspace_gid":"1209385139109598",
        "data":{
        "user":"harishnarayananh1@gmail.com"
        }
    }
}
     */

  @Post('workspace/create')
  async createWorkspace(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        `workspaces/${data.data.workspace_gid}/addUser`,
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createWorkspace',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana workspace create executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in workspace/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "workspace" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"eb34ad74-a456-4156-a2e9-f23f2ad51c7a",
    "data":{
        "Id":"1209666183538963"
    }
}
     */

  @Post('workspace/get')
  async getWorkspace(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'workspaces',
        'get',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getWorkspace',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana workspace get executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in workspace/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "workspace" action "getmany".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - Filters: object (optional filters for querying records)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"f1cbafa4-bb9d-4aa1-bef4-e52c3639b0c5",
    "data":{
        "limit":1
    }
}
     */

  @Post('workspace/getmany')
  async getmanyWorkspace(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = workspaceOffset
        ? `workspaces?offset=${workspaceOffset}`
        : 'workspaces';
      const result = await this.performasanaAction(url, 'getmany', 'GET', data);
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyWorkspace',
          functionArgs,
          data.credentialId,
        );
      }
      if (result.response.next_page && result.response.next_page !== null) {
        workspaceOffset = result.response.next_page.offset;
      }
      return {
        message: `asana workspace getmany executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in workspace/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "workspace" action "update".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to update)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"eb34ad74-a456-4156-a2e9-f23f2ad51c7a",
    "data":{
        "Id":"1209385139109586",
        "data":{
                "name": "My Workspace "
        }
    }
}
     */

  @Post('workspace/update')
  async updateWorkspace(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'workspaces',
        'update',
        'PUT',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateWorkspace',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana workspace update executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in workspace/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  

  /**
     * [AUTO-GENERATED] Endpoint for module "story" action "create".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"eb34ad74-a456-4156-a2e9-f23f2ad51c7a",
    "data":{
        "task_gid":"1209414838268855",
        "data":{
                "text":"this is comment 120",
    "html_text":"<body> this is comment</body>",
    "is_pinned":true
        }

    }

}
     */

  @Post('story/create')
  async createStory(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        `tasks/${data.data.task_gid}/stories`,
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createStory',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana story create executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in story/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "story" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
        "credentialId":"eb34ad74-a456-4156-a2e9-f23f2ad51c7a",
"data":{
    "Id":"1209439707442252"
}
}
     */

  @Post('story/get')
  async getStory(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'stories',
        'get',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getStory',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana story get executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in story/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "story" action "getmany".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - Filters: object (optional filters for querying records)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"f1cbafa4-bb9d-4aa1-bef4-e52c3639b0c5",

        "task_gid":"1209414838268855",
        "data":{
            "limit":1
        }
}
     */

  @Post('story/getmany')
  async getmanyStory(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = storyOffset
        ? `tasks/${data.task_gid}/stories?offset=${storyOffset}`
        : `tasks/${data.task_gid}/stories`;
      const result = await this.performasanaAction(url, 'getmany', 'GET', data);
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyStory',
          functionArgs,
          data.credentialId,
        );
      }
      if (result.response.next_page && result.response.next_page !== null) {
        storyOffset = result.response.next_page.offset;
      }
      return {
        message: `asana story getmany executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in story/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "story" action "update".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to update)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
        "credentialId":"eb34ad74-a456-4156-a2e9-f23f2ad51c7a",
        "data":{
            "Id":"1209852970604777",
            "data":{
            "text": "this is comment 10"

            }
        }
}
     */

  @Post('story/update')
  async updateStory(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'stories',
        'update',
        'PUT',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateStory',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana story update executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in story/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "story" action "delete".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to delete)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
        "credentialId":"eb34ad74-a456-4156-a2e9-f23f2ad51c7a",
"data":{
    "Id":"1209852759218644"
}
}
     */

  @Post('story/delete')
  async deleteStory(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'stories',
        'delete',
        'DELETE',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteStory',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana story delete executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in story/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "webhooks" action "create".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"f1cbafa4-bb9d-4aa1-bef4-e52c3639b0c5",
    "data":{
        "data":{
            "resource":"1209415028741435",
"target":"https://105f-2409-40f4-1020-8b5a-8cdd-9a85-fd29-2e49.ngrok-free.app/asana/receive",
"filters": [
      {
        "resource_type": "project",
        "action": "changed",
        "fields": [
          "due_at",
          "due_on",
          "dependencies"
        ]
      }
    ]     }
    }
}
     */

  @Post('webhooks/create')
  async createWebhooks(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'webhooks',
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createWebhooks',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana webhooks create executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in webhooks/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "webhooks" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
        "credentialId":"f1cbafa4-bb9d-4aa1-bef4-e52c3639b0c5",
"data":{
    "Id":"1209858950924299"
}
}
     */

  @Post('webhooks/get')
  async getWebhooks(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'webhooks',
        'get',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getWebhooks',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana webhooks get executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in webhooks/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

//  dummy function only use for webhook create
  @Post('asana-webhook')
  async one(@Headers('X-Hook-Secret') hookSecret: string,
    @Req() req: Request,
    @Res() res: Response,){
    try{

  if (hookSecret) {
    res.set('X-Hook-Secret', hookSecret);
    return res.status(200).send();
  }
  console.log('Webhook payload:', req.body);
  res.status(200).send('OK');

    }catch(error){
      console.log(error)
    }
  }
  /**
     * [AUTO-GENERATED] Endpoint for module "webhooks" action "getmany".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - Filters: object (optional filters for querying records)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"f1cbafa4-bb9d-4aa1-bef4-e52c3639b0c5",
    "data":{
        "workspace":"1209666183538963"
    }
}
     */

  @Post('webhooks/getmany')
  async getmanyWebhooks(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'webhooks',
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyWebhooks',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana webhooks getmany executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in webhooks/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "webhooks" action "update".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to update)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
        "credentialId":"f1cbafa4-bb9d-4aa1-bef4-e52c3639b0c5",

"data":{
    "Id":"1209858950924299",
    "data":{
        
    }
}
}
     */

  @Post('webhooks/update')
  async updateWebhooks(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'webhooks',
        'update',
        'PUT',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateWebhooks',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana webhooks update executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in webhooks/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "webhooks" action "delete".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to delete)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
        "credentialId":"f1cbafa4-bb9d-4aa1-bef4-e52c3639b0c5",

"data":{
    "Id":"1209858950924299"
}
}
     */

  @Post('webhooks/delete')
  async deleteWebhooks(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'webhooks',
        'delete',
        'DELETE',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteWebhooks',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana webhooks delete executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in webhooks/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "section" action "create".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"eb34ad74-a456-4156-a2e9-f23f2ad51c7a",
    "data":{
         "project_gid":"1209415028741435",
    "data":{
        "name":"section 4 "
    }
    }
}
     */

  @Post('section/create')
  async createSection(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        `projects/${data.data.project_gid}/sections`,
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createSection',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana section create executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in section/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "section" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"eb34ad74-a456-4156-a2e9-f23f2ad51c7a",
    "data":{
        "Id":"1209439843043362"
        }
}
     */

  @Post('section/get')
  async getSection(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'sections',
        'get',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getSection',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana section get executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in section/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "section" action "getmany".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - Filters: object (optional filters for querying records)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"f1cbafa4-bb9d-4aa1-bef4-e52c3639b0c5",
"project_gid":"1209415028741435",
"data":{
    "limit":1

}
}
     */

  @Post('section/getmany')
  async getmanySection(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = sectionOffset
        ? `projects/${data.project_gid}/sections?offset=${sectionOffset}`
        : `projects/${data.project_gid}/sections`;
      const result = await this.performasanaAction(url, 'getmany', 'GET', data);
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanySection',
          functionArgs,
          data.credentialId,
        );
      }
      if (result.response.next_page  && result.response.next_page !== null) {
        sectionOffset = result.response.next_page.offset;
      }
      return {
        message: `asana section getmany executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in section/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "section" action "update".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to update)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
        "credentialId":"eb34ad74-a456-4156-a2e9-f23f2ad51c7a",
"data":{
    "Id":"1209852811698561",
    "data":{
        "name":"SECTION 4"
    }
}
}
     */

  @Post('section/update')
  async updateSection(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'sections',
        'update',
        'PUT',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateSection',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana section update executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in section/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "section" action "delete".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to delete)
     * - Calls the integration helper "performasanaAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
        "credentialId":"eb34ad74-a456-4156-a2e9-f23f2ad51c7a",
"data":{
    "Id":"1209852811698561"
}
}
     */

  @Post('section/delete')
  async deleteSection(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'sections',
        'delete',
        'DELETE',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getUsers',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana section delete executed successfully`,
        result,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error in section/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // fields

  @Post('project/getAll')
  async getAllProject(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performasanaAction(
        'projects',
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyProject',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        message: `asana project getmany executed successfully`,
        result: result.response.data.map((data) => ({
          gid: data.gid,
          name: data.name,
        })),
      };
    } catch (error) {
      this.logger.error(`Error in project/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('task/getAll')
  async getAllTask(credentialId) {
    const data = {
      credentialId: credentialId,
      data: {},
    };
    try {
      const result = await this.performasanaAction(
        'tasks',
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyTask',
          functionArgs,
          data.credentialId,
        );
      }
      return result.response.data.map((data) => ({
        value: data.gid,
        name: data.name,
      }));
    } catch (error) {
      this.logger.error(`Error in task/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('workspace/getAll')
  async getAllWorkspace(credentialId) {
    try {
      const data = {
        credentialId: credentialId,
        data: {},
      };
      const result = await this.performasanaAction(
        'workspaces',
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyWorkspace',
          functionArgs,
          data.credentialId,
        );
      }
      return result.response.data.map((data) => ({
        value: data.gid,
        name: data.name,
      }));
    } catch (error) {
      this.logger.error(`Error in workspace/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async initialize(credentialId) {
    try {
      const id: any = credentialId;
      const connection = await initializeDB();
      const credRepository = connection.getRepository('Credentials');
      const credentialRepository = await credRepository.findOne({
        where: { id },
      });
      const access_token = credentialRepository.authData.token.access_token;
      return access_token;
    } catch (error) {
      this.logger.error('Error initializing Node:', error + error.stack);
    }
  }

  /**
   * [AUTO-GENERATED] Helper method to perform a asana action.
   * This method is a stub—extend it to integrate with the actual API for your xapp.
   *
   * Validations:
   * - Ensure that the provided module and action are supported.
   * - Validate the "data" structure as needed.
   *
   * DO NOT change the method signature.
   */

  private async performasanaAction(
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

  public async curl(
    module: string,
    action: string,
    method: string,
    argumentdata: any,
  ): Promise<any> {
    try {
      const { credentialId, data } = argumentdata;
      const initializeData = await this.initialize(credentialId);
      const access_token = initializeData;
      const baseUrl = `https://app.asana.com/api/1.0/`;
      let url = `${baseUrl}${module}`;
      if (data.Id) url += `/${data.Id}`;

      const options: any = {
        method,
        url,
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      };
      if (action === 'getmany') {
        if (argumentdata) options.params = data;
      } else {
        options.data = argumentdata
          ? action === 'get'
            ? data.data
            : { data: data.data }
          : undefined;
      }

     

      if(module=== 'attachments' && action==='create'){
        let form = data.data.form;
        options.headers = {
          ...form.getHeaders(),
           Authorization: `Bearer ${access_token}`
        }
        options.data = data.data.form
      }
     
      const response = await axios(options);
      return { response: response.data, status: response.status };
    } catch (error) {
      console.log(error.response || error.message);
      return {
        response: [error.response?.data || error.message],
        status: error.status || 500,
      };
    }
  }

  private async generateFields(category: string, name: string) {
    if (!fields || !Array.isArray(fields)) {
      throw new Error('Fields array is not defined or is not an array.');
    }
    const filteredFields = fields.filter(
      (field) =>
        field?.displayOptions &&
        field.displayOptions.show &&
        field.displayOptions.show.category &&
        field.displayOptions.show.category.includes(category) &&
        (field.displayOptions.show.name
          ? field.displayOptions.show.name.includes(name)
          : true),
    );
    return filteredFields;
  }

  @Post('getfields')
  async getfields(
    @Body() body: { category: string; name: string; credentialId: any },
  ) {
    const { category, name, credentialId } = body;
    try {
      await initializeFields(credentialId);
      const relevantFields = await this.generateFields(category, name);
      return relevantFields;
    } catch (error) {
      return [];
    }
  }
}
async function initializeFields(data) {
  for (const field of fields) {
    if (typeof field?.init === 'function') {
      await field.init(data);
    }
  }
}
export const asanaController = new AsanaController();
