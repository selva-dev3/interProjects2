// awork.controller.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONTROLLER FILE.
// DO NOT modify the auto-generated endpoints below.
// For custom integration logic, extend the helper "performaworkAction".
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
} from '@nestjs/common';
import { Request, Response } from 'express';
import axios, { Method } from 'axios';
import * as crypto from 'crypto';
import { initializeDB } from '../../ormconfig';
import { Credentials } from '../../entities/Credentials';
import { CustomLogger } from '../../logger/custom.logger';
import config, {
  XappName,
  fields,
  modules as xappModules,
} from './awork.config';
import { randomBytes } from 'crypto';
import { CredentialController } from 'src/credential/credential.controller';

@Controller('awork')
export class aworkController {
  private CredentialController = new CredentialController();
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
      !reqBody.clientSecret 
    ) {
      throw new HttpException(
        'Missing OAuth parameters',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const { baseUrl, node, userId } = reqBody;
      const state = randomBytes(16).toString('hex');
      const scope = encodeURIComponent("offline_access")

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


    let clientId: any = reqBody.client;
    let clientSecret: any = reqBody.clientSecret;
    let redirectUri: any = reqBody.redirectUri;
    let zapikey: any = reqBody.zapikey;

    if(userId.length !== undefined){
        const connection = await initializeDB();
        
        const credentialRepository = connection.getRepository(Credentials);
       
        const zohoauthdata = await credentialRepository.query(
            `SELECT id,name,type,auth_data
            FROM credentials
            WHERE author_id = $1
            AND name = $2
            ORDER BY created_at ASC
            LIMIT 1`,       
            [userId, name],
        );

        if(zohoauthdata.length > 0){
            const authData = zohoauthdata[0].auth_data;
            clientId = authData.clientId;
            clientSecret = authData.clientSecret;
            redirectUri = authData.redirectUri;
        }else{
            clientId = process.env.AWORK_CLIENT_ID;
            clientSecret = process.env.AWORK_CLIENT_SECRET;
            redirectUri = process.env.AWORK_REDIRECT_URI;
        }
    }
    console.log(clientId)
      // Construct the OAuth URL.
      // NOTE: Update the URL if your xapp uses a different authentication endpoint.
      authUrl = `${authUrl}?client_id=${clientId}&response_type=code&grant_type=authorization_code&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
      const data = {
        client_id: clientId,
        client_secret: clientSecret,
        redirectUri: redirectUri,
        state: state,
        tokenUrl: tokenUrl,
        authUrl: authUrl,   
        zapikey: zapikey,
        scope: scope,
        baseUrl: baseUrl
      };
      const credentialsRequest = {
        data,
        name,
        type,
        userId,
      };
     
      if (reqBody.id) {
        await this.CredentialController.updateCredentials(reqBody.id, data);
        this.logger.debug(
          'Credentials with ID updated successfully',
          reqBody.id,
        );
        this.logger.debug(`${XappName} auth URL:`, authUrl);
        return res.send({ message: authUrl });
      } else {
        await this.CredentialController.createCredentials(
          credentialsRequest
        );
        console.log('Credentials stored in database');
        this.logger.debug(`${XappName} auth URL:`, authUrl);
        return res.json({ message: authUrl });
      }
    } catch (error) {
        console.log(error.response || error.message);
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
      const code = req.query.code as string;
      const state = req.query.state as string;
      const connection = await initializeDB();
      const credRepository = connection.getRepository(Credentials);
      // TODO: Implement token exchange using the provided code.
      // NOTE: Save the access token and handle refresh token logic.
      const credential = await credRepository
        .createQueryBuilder('credentials')
        .where("credentials.auth_data->>'state'=:state", { state })
        .getOne();
      const data = {
        grant_type: 'authorization_code',
        redirect_uri: credential.authData.redirectUri,
        code: code,
      };
      const clientId = credential.authData.client_id;
      const clientSecret = credential.authData.client_secret;
      const tokenUrl = credential.authData.tokenUrl;
      const credentials = btoa(`${clientId}:${clientSecret}`);
      const result = await axios.post(
        tokenUrl,
        data,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `basic ${credentials}`,
          },
        },
      );
      credential.authData['token'] = result.data;
      await this.CredentialController.updateCredentials(
        credential.id,
        credential.authData,
      );
      return res.json(result.data);
    } catch (error) {
      this.logger.error('Error in callback:', error);
      throw new HttpException(
        'Callback error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Refresh token endpoint.
   * This endpoint should handle token expiry and refresh the access token.
   * Implement the refresh logic based on your authentication provider.
   */
  @Post('refreshToken')
  async refreshToken(@Body() credentialId: string) {
    try {
      // const { credentialId } = reqBody
      // TODO: Implement the refresh token logic here.
      // Example: Request a new access token using the refresh token.
      const connection = await initializeDB();
      const credRepository = connection.getRepository(Credentials);
      const credential: any = await credRepository.findOne({
        where: { id: credentialId },
      });
      const data = {
        grant_type: 'refresh_token',
        refresh_token: credential.authData.token.refresh_token,
      };
      const clientId = credential.authData.client_id;
      const clientSecret = credential.authData.client_secret;
      const credentials = btoa(`${clientId}:${clientSecret}`);
      const result = await axios.post(
        `https://api.awork.com/api/v1/accounts/token`,
        data,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `basic ${credentials}`,
          },
        },
      );
      credential.authData.token = result.data;
      await this.CredentialController.updateCredentials(
        credentialId,
        credential.authData,
      );
      return {
        // message: `${XappName} access token refreshed successfully`,
        accessToken: result.data,
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
     * [AUTO-GENERATED] Endpoint for module "project" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "f6191bee-3132-4ed1-86c7-4c69a6604c60"
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
      const result = await this.performaworkAction(
        'projects',
        'get',
        'get',
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
      return res.json({
        message: `awork project get executed successfully`,
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
     * [AUTO-GENERATED] Endpoint for module "project" action "create".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "name": "Project 10"
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
      const result = await this.performaworkAction(
        'projects',
        'create',
        'post',
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
      return res.json({
        message: `awork project create executed successfully`,
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
     * [AUTO-GENERATED] Endpoint for module "project" action "getmany".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - Filters: object (optional filters for querying records)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId": "{{credentialId}}",
    "data": {
        "orderby": "updatedOn asc",
        "page": 1,
        "pageSize": 2
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
      const result = await this.performaworkAction(
        'projects',
        'getmany',
        'get',
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

      return res.json({
        message: `awork project getmany executed successfully`,
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
     * [AUTO-GENERATED] Endpoint for module "project" action "update".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to update)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "b4d7544e-aa43-4597-b8eb-a6eb22986144",
        "data": {
            "name": "Project 2"
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
      const result = await this.performaworkAction(
        'projects',
        'update',
        'put',
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
      return res.json({
        message: `awork project update executed successfully`,
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
     * [AUTO-GENERATED] Endpoint for module "project" action "delete".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to delete)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "id": "34864dfb-8865-40e9-b5cf-48f158aaca72",
        "data": {}
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
      const result = await this.performaworkAction(
        `projects/${data.data.id}/delete`,
        'delete',
        'post',
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
      return res.json({
        message: `awork project delete executed successfully`,
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
     * [AUTO-GENERATED] Endpoint for module "projecttypes" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "340b4efb-da41-419d-b8f4-6ef47e02a485"
    }
}
     */

  @Post('projecttypes/get')
  async getProjecttypes(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'projecttypes',
        'get',
        'get',
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
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getProjecttypes',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork projecttypes get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in projecttypes/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "projecttypes" action "create".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "name": "Project Types 10 "
        }
    }
}
     */

  @Post('projecttypes/create')
  async createProjecttypes(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'projecttypes',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createProjecttypes',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork projecttypes create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in projecttypes/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "projecttypes" action "getmany".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - Filters: object (optional filters for querying records)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "orderby":"updatedOn asc",
        "page":6,
        "pageSize":2
    }
}
     */

  @Post('projecttypes/getmany')
  async getmanyProjecttypes(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'projecttypes',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyProjecttypes',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork projecttypes getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in projecttypes/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "projecttypes" action "update".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to update)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "340b4efb-da41-419d-b8f4-6ef47e02a485",
        "data": {
            "name": "Project Types 1"
        }
    }
}
     */

  @Post('projecttypes/update')
  async updateProjecttypes(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'projecttypes',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateProjecttypes',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork projecttypes update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in projecttypes/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
    * [AUTO-GENERATED] Endpoint for module "projecttypes" action "update".
    *  - Request Parameters (data): 
    * - CredentialId: string
    * - ModuleData: object (data to update)
    * - Calls the integration helper "performaworkAction".
    * DO NOT modify the method signature.
    *  Example usage:
    *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "projectTypeId": "340b4efb-da41-419d-b8f4-6ef47e02a485"
        }
    }
}
    */

  @Post('projecttypes/delete')
  async deleteProjecttypes(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        `projecttypes/${data.data.data.projectTypeId}/delete`,
        'delete',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteProjecttypes',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork projecttypes update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in projecttypes/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "projecttags" action "create".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId": "{{credentialId}}",
    "data": {
        "projectId": "b4d7544e-aa43-4597-b8eb-a6eb22986144",
        "data": [
            {
                "name": "tag 2"
            }
        ]
    }
}
     */

  @Post('projecttags/create')
  async createProjecttags(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        `projects/${data.data.projectId}/addtags`,
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createProjecttags',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork projecttags create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in projecttags/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "projecttags" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "projectId": "b4d7544e-aa43-4597-b8eb-a6eb22986144" // project id
    }
}
     */

  @Post('projecttags/get')
  async getProjecttags(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        `projects/${data.data.projectId}/tags`,
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getProjecttags',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork projecttags get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in projecttags/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "projecttags" action "getmany".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - Filters: object (optional filters for querying records)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId": "{{credentialId}}",
    "data": {}
}
     */

  @Post('projecttags/getmany')
  async getmanyProjecttags(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'projects/tags',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyProjecttags',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork projecttags getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in projecttags/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "projecttags" action "update".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to update)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "projectId": "b4d7544e-aa43-4597-b8eb-a6eb22986144", // project id
        "data": {
            "oldTagName": "tag 1",
            "newTag": {
                "name": "TAG 1",
                "color": null
            }
        }
    }
}
     */

  @Post('projecttags/update')
  async updateProjecttags(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        `projects/${data.data.projectId}/updatetags`,
        'update',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateProjecttags',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork projecttags update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in projecttags/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "projecttags" action "delete".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to delete)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId": "{{credentialId}}",
    "data": {
        "projectId": "b4d7544e-aa43-4597-b8eb-a6eb22986144", // project id
        "data": [
            {
                "name": "tag 2"
            }
        ]
    }
}
     */

  @Post('projecttags/delete')
  async deleteProjecttags(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        `projects/${data.data.projectId}/deletetags`,
        'delete',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteProjecttags',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork projecttags delete executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in projecttags/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "projectcomments" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId": "{{credentialId}}",
    "data": {
        "projectId": "b4d7544e-aa43-4597-b8eb-a6eb22986144", // project id
        "Id": "cb988f70-89ec-4424-bfeb-c6d138a41b30"
    }
}
     */

  @Post('projectcomments/get')
  async getProjectcomments(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        `projects/${data.data.projectId}/comments`,
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getProjectcomments',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork projectcomments get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in projectcomments/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "projectcomments" action "create".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId": "{{credentialId}}",
    "data": {
        "projectId": "b4d7544e-aa43-4597-b8eb-a6eb22986144", // project id
        "data": {
            "message": "message 11"
        }
    }
}
     */

  @Post('projectcomments/create')
  async createProjectcomments(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        `projects/${data.data.projectId}/comments`,
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createProjectcomments',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork projectcomments create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in projectcomments/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "projectcomments" action "getmany".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - Filters: object (optional filters for querying records)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "projectId": "b4d7544e-aa43-4597-b8eb-a6eb22986144", // project id
    }
}
     */

  @Post('projectcomments/getmany')
  async getmanyProjectcomments(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        `projects/${data.data.projectId}/comments?pageSize=1`,
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyProjectcomments',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork projectcomments getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in projectcomments/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "projectcomments" action "update".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to update)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId": "{{credentialId}}",
    "data": {
        "projectId": "b4d7544e-aa43-4597-b8eb-a6eb22986144", // project id
        "Id": "cb988f70-89ec-4424-bfeb-c6d138a41b30", // comment id
        "data": {
            "message": "MESSAGE 1 "
        }
    }
}
     */

  @Post('projectcomments/update')
  async updateProjectcomments(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        `projects/${data.data.projectId}/comments`,
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateProjectcomments',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork projectcomments update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in projectcomments/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "projectcomments" action "delete".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to delete)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "projectId": "b4d7544e-aa43-4597-b8eb-a6eb22986144", // project id
        "Id": "cb988f70-89ec-4424-bfeb-c6d138a41b30" // comment id
    }
}
     */

  @Post('projectcomments/delete')
  async deleteProjectcomments(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        `projects/${data.data.projectId}/comments`,
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteProjectcomments',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork projectcomments delete executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in projectcomments/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "tasks" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"061d3fed-8301-4953-997f-b0dcaa469eea"
    }
}
     */

  @Post('tasks/get')
  async getTasks(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction('tasks', 'get', 'get', data);
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getTasks',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork tasks get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in tasks/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "tasks" action "create".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "name": "Task 2",
            "BaseType": "projecttask",
            "TaskStatusId": "87fcfd12-274e-4a6f-b65f-296a1603fc36",
            "typeOfWorkId": "f1d4d67c-29a7-4c84-9eaa-9f00b5f7d379",
            "entityId": "b4d7544e-aa43-4597-b8eb-a6eb22986144"
        }
    }
}
     */

  @Post('tasks/create')
  async createTasks(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'tasks',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createTasks',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork tasks create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in tasks/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "tasks" action "update".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to update)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "c1e66b2f-57a7-4fe3-b276-60a161827d44",
        "data": {
            "name": "TASK 1"
        }
    }
}
     */

  @Post('tasks/update')
  async updateTasks(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'tasks',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateTasks',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork tasks update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in tasks/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
    * [AUTO-GENERATED] Endpoint for module "tasks" action "delete".
    *  - Request Parameters (data): 
    * - CredentialId: string
    * - ModuleData: object (data to update)
    * - Calls the integration helper "performaworkAction".
    * DO NOT modify the method signature.
    *  Example usage:
    * {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "taskIds": [
                "c1e66b2f-57a7-4fe3-b276-60a161827d44"
            ]
        }
    }
}
    */

  @Post('tasks/delete')
  async deleteTasks(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'tasks/delete',
        'delete',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteTasks',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork tasks update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in tasks/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "projecttasks" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "projectId":"00860eac-efd7-4bf8-8d3b-1d1cab6e1218",
     "Id":"94ccac34-31f6-4c1b-a22e-ee8519792264"
    }
}
     */

  @Post('projecttasks/get')
  async getprojecttasks(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        `projects/${data.data.projectId}/taskstatuses`,
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getprojecttasks',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork projecttasks get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in projecttasks/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "projecttasks" action "create".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "projectId":"00860eac-efd7-4bf8-8d3b-1d1cab6e1218",
     "data":{
        "name":"new",
        "type":"progress"
     }
    }
}
     */

  @Post('projecttasks/create')
  async createprojecttasks(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        `projects/${data.data.projectId}/taskstatuses`,
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createprojecttasks',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork projecttasks create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in projecttasks/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "projecttasks" action "getmany".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - Filters: object (optional filters for querying records)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "page":1,
        "pageSize":1,
        "orderBy":"updatedOn asc"
    }
}
     */

  @Post('projecttasks/getmany')
  async getmanyprojecttasks(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'me/projecttasks',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyprojecttasks',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork projecttasks getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in projecttasks/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "projecttasks" action "update".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to update)
     * - Calls the integration helper "performaworkAction".
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

  @Post('projecttasks/update')
  async updateprojecttasks(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        `projects/${data.data.projectId}/taskstatuses`,
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateprojecttasks',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork projecttasks update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in projecttasks/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "companies" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"80bf4da4-2bd2-472d-b95f-2006a8bcce81"
    }
}
     */

  @Post('companies/get')
  async getCompanies(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'companies',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getCompanies',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork companies get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in companies/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "companies" action "create".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data":{
        "data":{
            "name":"company 10"
        }
    }
}
     */

  @Post('companies/create')
  async createCompanies(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'companies',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompanies',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork companies create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in companies/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "companies" action "getmany".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - Filters: object (optional filters for querying records)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data":{
        "orderby":"updatedOn asc",
        "page":4,
        "pageSize":2
    }
}
     */

  @Post('companies/getmany')
  async  getmanyCompanies(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'companies',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyCompanies',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork companies getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in companies/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "companies" action "update".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to update)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "735a9873-1301-4771-bc62-9a23e44764d6", // company id
        "data": {
            "name": "COMPANY 2"
        }
    }
}
     */

  @Post('companies/update')
  async updateCompanies(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'companies',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateCompanies',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork companies update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in companies/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "companies" action "delete".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - Calls the integration helper "performaworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "companyId": "80bf4da4-2bd2-472d-b95f-2006a8bcce81",
        "data": {
            "deleteOperation": "delete"
        }
    }
}
   */

  @Post('companies/delete')
  async deleteCompanies(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        `companies/${data.data.companyId}/delete`,
        'delete',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteCompanies',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork companies update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in companies/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "users" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "1a8d8c92-02eb-4e35-bb81-07883502e7c2"
    }
}
     */

  @Post('users/get')
  async getUsers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction('users', 'get', 'get', data);
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getUsers',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork users get executed successfully`,
        result,
        status: result.status,
      });
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
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data":{
        "orderby":"updatedOn asc",
        "page":2,
        "pageSize":1
    }
}
     */

  @Post('users/getmany')
  async getmanyUsers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'users',
        'getmany',
        'get',
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
      return res.json({
        message: `awork users getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in users/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "users" action "delete".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to delete)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"8b0b23e7-6d2f-44fe-9b97-9d02b990a151"
    }
}
     */

  @Post('users/delete')
  async deleteUsers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'users',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteUsers',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork users delete executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in users/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "users" action "update".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to update)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "1a8d8c92-02eb-4e35-bb81-07883502e7c2",
        "data": {
            "firstName": "Harish"
        }
    }
}
     */

  @Post('users/update')
  async updateUsers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'users',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateUsers',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork users update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in users/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "roles" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"f996e035-bbc1-4f03-b9e8-7bd43c2bde66"
    }
}
     */

  @Post('roles/get')
  async getRoles(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction('roles', 'get', 'get', data);
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getRoles',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork roles get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in roles/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  /**
    * [AUTO-GENERATED] Endpoint for module "roles" action "getmany".
    *  - Request Parameters (data): 
    * - CredentialId: string
    * - RecordId: string (ID of the record to fetch)
    * - Calls the integration helper "performaworkAction".
    * DO NOT modify the method signature.
    *  Example usage:
    *  {
    "credentialId": "{{credentialId}}",
    "data": {}
}
    */

  @Post('roles/getmany')
  async getmanyRoles(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction('roles', 'get', 'get', data);
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyRoles',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork roles get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in roles/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "roles" action "create".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "name": "Designer"
        }
    }
}
     */

  @Post('roles/create')
  async createRoles(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'roles',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createRoles',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork roles create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in roles/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "roles" action "delete".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to delete)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "roleId":"4adce376-e524-49b3-ad21-1142fe1b2035",
        "data":{

        }
    }
}
     */

  @Post('roles/delete')
  async deleteRoles(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        `roles/${data.data.roleId}/delete`,
        'delete',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteRoles',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork roles delete executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in roles/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "roles" action "update".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to update)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "4adce376-e524-49b3-ad21-1142fe1b2035",
        "data": {
            "name": "Designer"
        }
    }
}
     */

  @Post('roles/update')
  async updateRoles(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'roles',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateRoles',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork roles update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in roles/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "teams" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
     "Id":"2e8dc4cc-c9b5-42fd-87fd-501818cdfd41"
    }
}
     */

  @Post('teams/get')
  async getTeams(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction('teams', 'get', 'get', data);
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getTeams',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork teams get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in teams/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "teams" action "getmany".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - Filters: object (optional filters for querying records)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "includeUserIds":true,
        "includeProjectIds":true
    }
}
     */

  @Post('teams/getmany')
  async getmanyTeams(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'teams',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyTeams',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork teams getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in teams/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "teams" action "create".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "data":{
            "name":"Team 2"
        }
    }
}
     */

  @Post('teams/create')
  async createTeams(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'teams',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createTeams',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork teams create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in teams/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "teams" action "delete".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to delete)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"fbf01cdb-7984-46e3-b525-62713e0c0a4a"
    }
}
     */

  @Post('teams/delete')
  async deleteTeams(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'teams',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteTeams',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork teams delete executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in teams/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "teams" action "update".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to update)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"230fe840-fade-4cb6-81de-241f910cc6f9",
        "data":{
            "name":"updated  by selva"
        }
    }
}
     */

  @Post('teams/update')
  async updateTeams(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        'teams',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateTeams',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork teams update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in teams/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "teams" action "adduser".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (action-specific data)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data":{
        "teamId":"2e8dc4cc-c9b5-42fd-87fd-501818cdfd41",
        "data":["1a8d8c92-02eb-4e35-bb81-07883502e7c2"]
    }
}
     */

  @Post('teams/adduser')
  async adduserTeams(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        `teams/${data.data.teamId}/addusers`,
        'adduser',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'adduserTeams',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork teams adduser executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in teams/adduser:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "teams" action "addproject".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (action-specific data)
     * - Calls the integration helper "performaworkAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data":{
        "teamId":"2e8dc4cc-c9b5-42fd-87fd-501818cdfd41",
        "data":["b4d7544e-aa43-4597-b8eb-a6eb22986144"]
    }
}
     */

  @Post('teams/addproject')
  async addprojectTeams(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performaworkAction(
        `teams/${data.data.teamId}/addprojects`,
        'addproject',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'addprojectTeams',
          functionArgs,
          data.credentialId,
        );
      }
      return res.json({
        message: `awork teams addproject executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in teams/addproject:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // fields

  @Post('project/getAll')
  async getallProject(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data = {
        credentialId: data,
        data: {},
      };
      const result = await this.performaworkAction(
        'projects',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getallProject',
          functionArgs,
          data.credentialId,
        );
      }
      return result.response.map((data) => ({
        value: data.id,
        name: data.name,
      }));
    } catch (error) {
      this.logger.error(`Error in project/getAll:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('projecttypes/getAll')
  async getallProjecttypes(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data = {
        credentialId: data,
        data: {},
      };
      const result = await this.performaworkAction(
        'projecttypes',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getallProjecttypes',
          functionArgs,
          data.credentialId,
        );
      }
      return result.response.map((data) => ({
        value: data.id,
        name: data.name,
      }));
    } catch (error) {
      this.logger.error(`Error in projecttypes/getAll:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('projectcomments/getAll')
  async getallProjectcomments(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data = {
        credentialId: data,
        data: {
          projectId: 'b4d7544e-aa43-4597-b8eb-a6eb22986144', // project id
        },
      };
      const result = await this.performaworkAction(
        `projects/${data.data.projectId}/comments`,
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getallProjectcomments',
          functionArgs,
          data.credentialId,
        );
      }
      return result.response.map((data) => ({
        value: data.id,
        message: data.message,
      }));
    } catch (error) {
      this.logger.error(`Error in projectcomments/getAll:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('projecttasks/getAll')
  async getallprojecttasks(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data = {
        credentialId: data,
        data: {},
      };
      const result = await this.performaworkAction(
        'me/projecttasks',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getallprojecttasks',
          functionArgs,
          data.credentialId,
        );
      }
      return {
        result,
      };
    } catch (error) {
      this.logger.error(`Error in projecttasks/getAll:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('companies/getAll')
  async getallCompanies(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data = {
        credentialId: data,
        data: {},
      };
      const result = await this.performaworkAction(
        'companies',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getallCompanies',
          functionArgs,
          data.credentialId,
        );
      }
      return result.response.map((data) => ({
        value: data.id,
        name: data.name,
      }));
    } catch (error) {
      this.logger.error(`Error in companies/getAll:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('users/getAll')
  async getallUsers(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data = {
        credentialId: data,
        data: {},
      };
      const result = await this.performaworkAction(
        'users',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getallUsers',
          functionArgs,
          data.credentialId,
        );
      }
      return result.response.map((data) => ({
        value: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
      }));
    } catch (error) {
      this.logger.error(`Error in users/getAll:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('roles/getAll')
  async getallRoles(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data = {
        credentialId: data,
        data: {},
      };
      const result = await this.performaworkAction('roles', 'get', 'get', data);
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getallRoles',
          functionArgs,
          data.credentialId,
        );
      }
      return result.response.map((data) => ({
        value: data.id,
        name: data.name,
      }));
    } catch (error) {
      this.logger.error(`Error in roles/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('teams/getAll')
  async getallTeams(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data = {
        credentialId: data,
        data: {},
      };
      const result = await this.performaworkAction(
        'teams',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getallTeams',
          functionArgs,
          data.credentialId,
        );
      }
      return result.response.map((data) => ({
        value: data.id,
        name: data.name,
      }));
    } catch (error) {
      this.logger.error(`Error in teams/getAll:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async initialize(credentialId) {
    try {
      const id: any = credentialId;
      const connection = await initializeDB();
      const credRepository = connection.getRepository(Credentials);
      const credentialRepository = await credRepository.findOne({
        where: { id },
      });
      const access_token =
        await credentialRepository.authData.token.access_token;
        const baseUrl = await credentialRepository.authData.baseUrl;
      return { access_token ,baseUrl};
    } catch (error) {
      this.logger.error('Error initializing Node:', error + error.stack);
    }
  }

  /**
   * [AUTO-GENERATED] Helper method to perform a awork action.
   * This method is a stub—extend it to integrate with the actual API for your xapp.
   *
   * Validations:
   * - Ensure that the provided module and action are supported.
   * - Validate the "data" structure as needed.
   *
   * DO NOT change the method signature.
   */
  private async performaworkAction(
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
    const resultData = this.curl(module, action, method, data);
    return resultData;
  }

  public async curl(
    module: string,
    action: string,
    method: string,
    argumentdata: any,
  ) {
    try {
      const { credentialId, data } = argumentdata;
      const initializeData: any = await this.initialize(credentialId);
      console.log(initializeData);
      const { access_token ,baseUrl} = initializeData;
      let url = `${baseUrl}/${module}`;
      if (data.Id) url += `/${data.Id}`;
      if (module === 'teams' && action === 'get') {
        url += `?includeUserIds=true&includeProjectIds=true`;
      }
      const option: any = {
        method,
        url,
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      };
      if (action === 'getmany') {
        if (argumentdata) option.params = data;
      } else {
        if (argumentdata) option.data = data.data;
      }
      console.log(option);
      const response = await axios(option);
      return { response: response.data, status: response.status };
    } catch (error) {
        console.log(error.response || error.message)
      return {
        response: [error.response?.data || error.message],
        status: error.status || 500,
      };
    }
  }

  private async generateFields(category: string, name: string, data: any) {
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

  @Post('get/fields')
  async getfields(@Body() body: { category: string; name: string; data: any }) {
    const { category, name, data } = body;
    try {
      await initializeFields(data);
      const relevantFields = await this.generateFields(category, name, data);
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
export const awork = new aworkController();
