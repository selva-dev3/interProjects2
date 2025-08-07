// piwikpro.controller.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONTROLLER FILE.
// DO NOT modify the auto-generated endpoints below.
// For custom integration logic, extend the helper "performpiwikproAction".
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
} from './piwikpro.config';
import { CredentialController } from 'src/credential/credential.controller';
import { ReturnDocument } from 'typeorm';
import { accessSync } from 'fs';

@Controller('piwikpro')
export class PiwikproController {
  private offset = 0;
  useroffset = 0;
  appoffset = 0;
  metasiteoffset = 0;
  metasiteappoffset = 0;
  private logger = new CustomLogger();
  private credentialsController = new CredentialController();

  /**
   * [AUTO-GENERATED] OAuth authorize endpoint.
   * This endpoint initiates the authentication flow.
   * Implement the actual token request and error handling as needed.
   */
  @Post('authorize')
  async authorize(@Body() reqBody: any) {
    if (!reqBody.clientId || !reqBody.clientSecret) {
      throw new HttpException(
        'Missing OAuth parameters',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const { baseUrl, userId } = reqBody;
      // Construct the OAuth URL.
      // NOTE: Update the URL if your xapp uses a different authentication endpoint.

      let type: string = reqBody.type;
      let authurl: string = `${baseUrl}/auth/token`;
      let name: string = reqBody.name;
      let clientId: any = reqBody.clientId;
      let clientSecret: any = reqBody.clientSecret;
      const state = crypto.randomBytes(16).toString('hex');

      if (userId.length !== undefined) {
        const connection = await initializeDB();
        const credentialRepository = connection.getRepository(Credentials);

        const piwikproauthdata = await credentialRepository.query(
          `SELECT id,name,type,auth_data 
          FROM  credentials
          WHERE author_id = $1
          AND name =$2 
          ORDER BY created_at ASC
          LIMIT 1`,
          [userId, name],
        );

        if (piwikproauthdata.length > 0) {
          const authData = piwikproauthdata[0].auth_data;
          clientId = authData.clientId;
          clientSecret = authData.clientSecret;
        } else {
          clientId = process.env.PIWIKPRO_CLIENT_ID;
          clientSecret = process.env.PIWIKPRO_CLIENT_SECRET;
        }
      }
      const authUrl = `${baseUrl}/auth/token`;
      const response = await axios.post(authUrl, {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      });
      const data = {
        clientId: clientId,
        clientSecret: clientSecret,
        authurl: authurl,
        state: state,
        baseUrl: baseUrl,
        tokens: response.data,
      };
      const requestbody = {
        name: name,
        type: type,
        data: data,
        userId: userId,
      };
      if (reqBody.id) {
        await this.credentialsController.updateCredentials(reqBody.id, data);
        this.logger.debug(
          'Credentials with ID Update successfully :',
          reqBody.id,
        );
      } else {
        await this.credentialsController.createCredentials(requestbody);
        this.logger.debug('New Credentials Created for :', name);
      }

      this.logger.debug(`${XappName} auth URL:`, response.data);
      return response.data;
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
  //   @Get('callback')
  //   async callback(@Req() req: Request) {
  //     try {
  //       const code = req.query.code as string;
  //       const state = req.query.state as string;
  //       // TODO: Implement token exchange using the provided code.
  //       // NOTE: Save the access token and handle refresh token logic.
  //       if(!code || !state){
  //         throw new HttpException('Authorization faild',HttpStatus.BAD_REQUEST);
  //       }
  //       const connection = await initializeDB();
  //       const credRepository = await connection.getRepository(Credentials);
  //       const credentials = await credRepository.createQueryBuilder('credentials')
  //       .where("credentials.auth_data->>'state' =:state",{state}).getOne();
  //       if(!credentials){
  //         throw new HttpException('Invalid state parameter',HttpStatus.NOT_FOUND)
  //       };
  //       const {clientId ,clientSecret ,}
  //       return res.redirect('https://your.redirect.url');
  //     } catch (error) {
  //       this.logger.error('Error in callback:', error);
  //       throw new HttpException('Callback error', HttpStatus.INTERNAL_SERVER_ERROR);
  //     }
  //   }

  /**
   * [AUTO-GENERATED] Refresh token endpoint.
   * This endpoint should handle token expiry and refresh the access token.
   * Implement the refresh logic based on your authentication provider.
   */
  @Post('refreshToken')
  async refreshToken(@Body() reqBody: any) {
    if (!reqBody.credentialId) {
      throw new HttpException('Missing refresh token', HttpStatus.BAD_REQUEST);
    }
    try {
      // TODO: Implement the refresh token logic here.
      // Example: Request a new access token using the refresh token.
      const connection = await initializeDB();
      const credRepository = connection.getRepository(Credentials);
      const credentialsRepository = await credRepository.findOne({
        where: { id: reqBody.credentialId },
      });

      const { baseUrl, clientId, clientSecret } =
        credentialsRepository.authData;
      const response = await axios.post(`${baseUrl}/auth/token`, {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      });

      credentialsRepository.authData['tokens'] = response.data;
      const data = credentialsRepository.authData.tokens;
      await this.credentialsController.updateCredentials(
        reqBody.credentialId,
        credentialsRepository.authData,
      );
      const newAccessToken = response.data.access_token;
      return {
        message: `${XappName} access token refreshed successfully`,
        accessToken: newAccessToken,
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

  // ---------------------------------------------------------------------------
  // AUTO-GENERATED ENDPOINTS FOR MODULE ACTIONS (as defined in the blueprint JSON)
  // ---------------------------------------------------------------------------

  /**
   * [AUTO-GENERATED] Endpoint for module "usergroup" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *{
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "attributes": {
                "name": "user group 101" 
            }
        }
    }
}
   */

  @Post('usergroup/create')
  async createUsergroup(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data.data.data = {
        ...data.data.data,
        type: 'ppms/user-group',
      };
      const result = await this.performpiwikproAction(
        'api/user-groups/v1',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createUsergroup',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro usergroup create executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in usergroup/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "usergroup" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"f48f7f03-a0c9-4e34-80d8-b23e82e4d3ae"
    }
}
   */

  @Post('usergroup/get')
  async getUsergroup(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performpiwikproAction(
        'api/user-groups/v1',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getUsergroup',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro usergroup get executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in usergroup/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "usergroup" action "update".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to update)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "f48f7f03-a0c9-4e34-80d8-b23e82e4d3ae",
        "data": {            
                "attributes": {
                    "name": "Marketing Team 11"                
            }
        }
    }
}
   */

  @Post('usergroup/update')
  async updateUsergroup(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data.data.data = {
        ...data.data.data,
        id: data.data.Id,
        type: 'ppms/user-group',
      };
      console.log("upadtedData",data.data.data)
      const result = await this.performpiwikproAction(
        'api/user-groups/v1',
        'update',
        'PATCH',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateUsergroup',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro usergroup update executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in usergroup/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "usergroup" action "getmany".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
        "limit":5,
        "sort":"updated_at",
        "offset":0

    }
}
   */

  @Post('usergroup/getmany')
  async getmanyUsergroup(@Body() data: any) {
    if (!data || !data.data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      data.data = {
        ...data.data,
        offset: this.offset,
      };
      const result = await this.performpiwikproAction(
        'api/user-groups/v1',
        'getmany',
        'get',
        data,
      );
      if (result?.response?.data?.length === 0) {
        this.offset = 0;
      } else {
        this.offset += data.data.limit || 0;
      }

      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyUsergroup',
          functionArgs,
          data.credentialId,
        );
        return result;
      }

      return {
        message: `piwikpro usergroup getmany executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in usergroup/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "usergroup" action "delete".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to delete)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "592ffc62-c0f9-4907-906e-a6f03d8d1ebf"
    }
}
   */

  @Post('usergroup/delete')
  async deleteUsergroup(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performpiwikproAction(
        'api/user-groups/v1',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteUsergroup',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro usergroup delete executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in usergroup/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "user" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "attributes": {
                "password": "Selvam@1520000",
                "email": "selvakumar50000@gmail.com "
            }
        }
    }
}
   */

  @Post('user/create')
  async createUser(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data.data.data = {
        ...data.data.data,
        type: 'ppms/user',
      };
      const result = await this.performpiwikproAction(
        'api/users/v2',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createUser',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro user create executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in user/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "user" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data":{
        "Id":"b1f41480-9359-496d-a1cf-3b459da69f1e"
    }
}
   */

  @Post('user/get')
  async getUser(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performpiwikproAction(
        'api/users/v2',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getUser',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro user get executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in user/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "user" action "getmany".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
            "limit": 1,

    }
}

   */

  @Post('user/getmany')
  async getmanyUser(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data.data = {
        ...data.data,
        offset: this.useroffset,
      };

      const result = await this.performpiwikproAction(
        'api/users/v2',
        'getmany',
        'get',
        data,
      );
      if (result?.response?.data?.length === 0) {
        this.useroffset = 0;
      } else {
        this.useroffset += data.data.limit || 0;
      }
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyUser',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro user getmany executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in user/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "user" action "update".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to update)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "6f77cef8-c28f-457c-bca7-b12115165902",
        "data": {
            "attributes": {
                "role": "OWNER"
            }
        }
    }
}
   */

  @Post('user/update')
  async updateUser(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data.data.data = {
        ...data.data.data,
        id: data.data.Id,
        type: 'ppms/user',
      };
      const result = await this.performpiwikproAction(
        'api/users/v2',
        'update',
        'PATCH',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateUser',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro user update executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in user/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "user" action "delete".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to delete)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"b1f41480-9359-496d-a1cf-3b459da69f1e"
    }
}
   */

  @Post('user/delete')
  async deleteUser(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performpiwikproAction(
        'api/users/v2',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteUser',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro user delete executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in user/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "app" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "attributes": {
                "appType": "web",
                "name": "App 11",
                "urls": [
                    "https://productstrial.com"
                ]
            }
        }
    }
}
   */

  @Post('app/create')
  async createApp(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data.data.data = {
        ...data.data.data,
        type: 'ppms/app',
      };
      const result = await this.performpiwikproAction(
        'api/apps/v2',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createApp',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro app create executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in app/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "app" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"5110944c-b544-48f4-969d-ccbade9a1399"
    }
}
   */

  @Post('app/get')
  async getApp(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performpiwikproAction(
        'api/apps/v2',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getApp',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro app get executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in app/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "app" action "getmany".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
        "limit":5,
        "sort":"updatedAt",
        "offset":0

    }
}
   */

  @Post('app/getmany')
  async getmanyApp(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data.data = {
        ...data.data,
        offset: this.appoffset,
      };
      const result = await this.performpiwikproAction(
        'api/apps/v2',
        'getmany',
        'get',
        data,
      );
      if (result?.response?.data?.length === 0) {
        this.appoffset = 0;
      } else {
        this.appoffset += data.data.limit || 0;
      }
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyApp',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro app getmany executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in app/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "app" action "update".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to update)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "5110944c-b544-48f4-969d-ccbade9a1399",
        "data": {
                "attributes": {
                    "name": " App 100",
                    "urls": [
                        "https://productivity.com"
                    ]
                
            }
        }
    }
}
   */

  @Post('app/update')
  async updateApp(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data.data.data = {
        ...data.data.data,
        id: data.data.Id,
        type: 'ppms/app',
      };
      const result = await this.performpiwikproAction(
        'api/apps/v2',
        'update',
        'PATCH',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateApp',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro app update executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in app/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "app" action "delete".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to delete)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"2f8d9019-8044-4cfb-abf7-e19f5ca1f548"
    }
}
   */

  @Post('app/delete')
  async deleteApp(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performpiwikproAction(
        'api/apps/v2',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteApp',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro app delete executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in app/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "metasite" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "attributes": {
                "name": "metasite 11"
            }
        }
    }
}
   */

  @Post('metasite/create')
  async createMetasite(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data.data.data = {
        ...data.data.data,
        id: data.data.Id,
        type: 'ppms/meta-site',
      };
      const result = await this.performpiwikproAction(
        'api/meta-sites/v1',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createMetasite',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro metasite create executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in metasite/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "metasite" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"2bf944e6-23c2-42c2-a96c-b00db30eb84f"
    }
}
   */

  @Post('metasite/get')
  async getMetasite(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performpiwikproAction(
        'api/meta-sites/v1',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getMetasite',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro metasite get executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in metasite/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "metasite" action "getmany".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
        "limit":5,
        "sort":"updated_at",
        "offset":0

    }
}
   */

  @Post('metasite/getmany')
  async getmanyMetasite(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data.data = {
        ...data.data,
        offset: this.metasiteoffset,
      };
      const result = await this.performpiwikproAction(
        'api/meta-sites/v1',
        'getmany',
        'get',
        data,
      );
      if (result?.response?.data?.length === 0) {
        this.metasiteoffset = 0;
      } else {
        this.metasiteoffset += data.data.limit || 0;
      }
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyMetasite',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro metasite getmany executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in metasite/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "metasite" action "update".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to update)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "018918b9-725c-45b7-9f5a-ed658feec695",
        "data": {
            "attributes": {
                "name": "Metasite 101"
            }
        }
    }
}
   */

  @Post('metasite/update')
  async updateMetasite(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data.data.data = {
        ...data.data.data,
        id: data.data.Id,
        type: 'ppms/meta-site',
      };
      const result = await this.performpiwikproAction(
        'api/meta-sites/v1',
        'update',
        'PATCH',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateMetasite',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro metasite update executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in metasite/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "metasite" action "delete".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to delete)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"2bf944e6-23c2-42c2-a96c-b00db30eb84f"
    }
}
   */

  @Post('metasite/delete')
  async deleteMetasite(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performpiwikproAction(
        'api/meta-sites/v1',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteMetasite',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro metasite delete executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in metasite/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "metasiteapp" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "id": "f3643dc1-db61-4a42-a25d-80fae93886de",   // metasite id
        "data": [
            {
                "id": "2f8d9019-8044-4cfb-abf7-e19f5ca1f548" // app id
            }
        ]
    }
}
   */

  @Post('metasiteapp/create')
  async createMetasiteapp(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data.data.data = data.data.data.map((data) => ({
        ...data,
        type: 'ppms/app',
      }));
      console.log(data);
      const result = await this.performpiwikproAction(
        `api/meta-sites/v1/${data.data.id}/relationships/apps`,
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createMetasiteapp',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro metasiteapp create executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in metasiteapp/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "metasiteapp" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
            "id": "f3643dc1-db61-4a42-a25d-80fae93886de"
    }
}
   */

  /**  GET META SITE APP INPROPER DOCUMENTS */

  @Post('metasiteapp/get')
  async getMetasiteapp(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performpiwikproAction(
        `api/meta-sites/v1/${data.data.id}/apps`,
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getMetasiteapp',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro metasiteapp get executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in metasiteapp/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "metasiteapp" action "getmany".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
        "limit":5,
        "sort":"created_at",
        "offset":0

    }
}
   */

  /** getmany META SITE APP INPROPER DOCUMENTS */

  @Post('metasiteapp/getmany')
  async getmanyMetasiteapp(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data.data = {
        ...data.data,
        offset: this.metasiteappoffset,
      };
      const result = await this.performpiwikproAction(
        `api/meta-sites/v1/apps-with-meta-sites`,
        'getmany',
        'get',
        data,
      );
      if (result?.response?.data?.length === 0) {
        this.metasiteappoffset = 0;
      } else {
        this.metasiteappoffset += data.data.limit || 0;
      }
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyMetasiteapp',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro metasiteapp getmany executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in metasiteapp/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "metasiteapp" action "update".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to update)
   * - Calls the integration helper "performpiwikproAction".
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

  /** UPDATE META SITE APP NOT AVALABILE IN DOCUMENTS */

  // @Post('metasiteapp/update')
  // async updateMetasiteapp(@Body() data: any) {
  //   if (!data) {
  //     throw new HttpException('Request body cannot be empty', HttpStatus.BAD_REQUEST);
  //   }
  //   try {
  //     const result = await this.performpiwikproAction(`api/meta-sites/v1/${data.meta_site_id}/relationships/apps`, 'update','PATCH', data);
  //     if(result.status === 401){
  //       const functionArgs = Array.from(arguments).slice(0,2);
  //       const result =await this.AuthError('updateMetasiteapp',functionArgs,data.credentialId)
  //       return result
  //     }
  //     return ({
  //       message: `piwikpro metasiteapp update executed successfully`,
  //       result,
  //     });
  //   } catch (error) {
  //     this.logger.error(`Error in metasiteapp/update:`, error);
  //     throw new HttpException(
  //       error.message || 'Internal server error',
  //       HttpStatus.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }

  /**
   * [AUTO-GENERATED] Endpoint for module "metasiteapp" action "delete".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to delete)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *{
    "credentialId": "{{credentialId}}",
    "data": {
        "id": "018918b9-725c-45b7-9f5a-ed658feec695", // metasite id
        "data": [
            {
                "id": "5110944c-b544-48f4-969d-ccbade9a1399" // app id
            }
        ]
    }
}
   */

  @Post('metasiteapp/delete')
  async deleteMetasiteapp(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data.data.data = data.data.data.map((data) => ({
        ...data,
        type: 'ppms/app',
      }));
      const result = await this.performpiwikproAction(
        `api/meta-sites/v1/${data.data.id}/relationships/apps`,
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteMetasiteapp',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro metasiteapp delete executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in metasiteapp/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "usergrouppermissionforapp" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "id": "16eb1704-d988-4ae9-b217-abb2557ab6b7",    // app id
        "Id": "fe320130-af7a-4092-a8be-8b5cef9c2fec",     // user group id
        "data": {
            "attributes": {
                "permission": "view"
            }
        }
    }
}
   */

  @Post('usergrouppermissionforapp/create')
  async createUsergrouppermissionforapp(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data.data.data = {
        ...data.data.data,
        type: 'app/permission/user-group',
      };
      const result = await this.performpiwikproAction(
        `api/access-control/v2/app/${data.data.id}/permission/user-group`,
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createUsergrouppermissionforapp',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro usergrouppermissionforapp create executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in usergrouppermissionforapp/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "usergrouppermissionforapp" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
            "id":"16eb1704-d988-4ae9-b217-abb2557ab6b7"   //  app Id

}}
   */

  @Post('usergrouppermissionforapp/getmany')
  async getUsergrouppermissionforapp(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performpiwikproAction(
        `api/access-control/v2/app/${data.data.id}/permission/user-group`,
        'getmany',
        'get',
        data,
      );

      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getUsergrouppermissionforapp',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro usergrouppermissionforapp get executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in usergrouppermissionforapp/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "usergrouppermissionformetasite" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "meta_site_id": "f3643dc1-db61-4a42-a25d-80fae93886de", // metasite id
        "Id": "fe320130-af7a-4092-a8be-8b5cef9c2fec", //usergroup id
        "data": {
            "type": "meta-site/permission/user-group",
            "attributes": {
                "permission": "view"
            }
        }
    }
}
   */

  @Post('usergrouppermissionformetasite/create')
  async createUsergrouppermissionformetasite(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data.data.data = {
        ...data.data.data,
        type: 'meta-site/permission/user-group',
      };
      const result = await this.performpiwikproAction(
        `api/access-control/v2/meta-site/${data.data.id}/permission/user-group`,
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createUsergrouppermissionformetasite',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro usergrouppermissionformetasite create executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(
        `Error in usergrouppermissionformetasite/create:`,
        error,
      );
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "usergrouppermissionformetasite" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *{
    "credentialId": "{{credentialId}}",
    "data": {
            "id": "f3643dc1-db61-4a42-a25d-80fae93886de"   // metasite id

    }
}
   */

  @Post('usergrouppermissionformetasite/getmany')
  async getUsergrouppermissionformetasite(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performpiwikproAction(
        `api/access-control/v2/meta-site/${data.data.id}/permission/user-group`,
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getUsergrouppermissionformetasite',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro usergrouppermissionformetasite get executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in usergrouppermissionformetasite/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "globalaction" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {}
}
   */

  @Post('globalaction/getmany')
  async getmanyGlobalaction(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performpiwikproAction(
        'api/access-control/v2/global/actions',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getGlobalaction',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro globalaction get executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in globalaction/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "userwithaction" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performpiwikproAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "action":"delete"
    }
}
   */

  @Post('userwithaction/getmany')
  async getUserwithaction(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performpiwikproAction(
        `api/access-control/v2/entry/ppms/user/action/${data.data.action}`,
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getUserwithaction',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `piwikpro userwithaction get executed successfully`,
        result,
      };
    } catch (error) {
      this.logger.error(`Error in userwithaction/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllUserwithaction(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data.action = 'view';
      const result = await this.performpiwikproAction(
        `api/access-control/v2/entry/ppms/user/action/${data.action}`,
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getAllUserwithaction',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return result;
    } catch (error) {
      this.logger.error(`Error in userwithaction/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllGlobalaction(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performpiwikproAction(
        'api/access-control/v2/global/actions',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getAllGlobalaction',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return result.response;
    } catch (error) {
      this.logger.error(`Error in globalaction/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllUsergrouppermissionformetasite(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const metasiteId = '';

      const result = await this.performpiwikproAction(
        `api/access-control/v2/meta-site/${metasiteId}/permission/user-group`,
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getAllUsergrouppermissionformetasite',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return result;
    } catch (error) {
      this.logger.error(`Error in usergrouppermissionformetasite/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllUsergrouppermissionforapp(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const appId = '';

      const result = await this.performpiwikproAction(
        `api/access-control/v2/app/${appId}/permission/user-group`,
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getAllUsergrouppermissionforapp',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return result;
    } catch (error) {
      this.logger.error(`Error in usergrouppermissionforapp/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllMetasite(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performpiwikproAction(
        'api/meta-sites/v1',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getAllMetasite',
          functionArgs,
          data.credentialId,
        );
      }
      return result.response.data.map((data) => ({
        value: data.id,
        name: data.attributes.name,
      }));
    } catch (error) {
      this.logger.error(`Error in metasite/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllApp(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performpiwikproAction(
        'api/apps/v2',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getAllApp',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return result.response.data.map((data) => ({
        value: data.id,
        name: data.attributes.name,
      }));
    } catch (error) {
      this.logger.error(`Error in app/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllUser(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performpiwikproAction(
        'api/users/v2',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getAllUser',
          functionArgs,
          data.credentialId,
        );
        return result.response;
      }
      return result.response.data.map((data) => ({
        value: data.id,
        email: data.attributes.email,
      }));
    } catch (error) {
      this.logger.error(`Error in user/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllUsergroup(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performpiwikproAction(
        'api/user-groups/v1',
        'getmany',
        'get',
        data,
      );

      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getAllUsergroup',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return result.response.data.map((data) => ({
        value: data.id,
        name: data.attributes.name,
      }));
    } catch (error) {
      this.logger.error(`Error in usergroup/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async generateFields(category: string, name: string) {
    if (!fields || !Array.isArray(fields)) {
      throw new Error('Fields array is not defined or is not an array');
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

  @Post('getfields')
  async getfields(
    @Body() body: { category: string; name: string; credentialId: any },
  ) {
    const { category, name, credentialId } = body;
    try {
      await this.initializeFields(credentialId);
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
      const connection = await initializeDB();
      const credRepository = connection.getRepository('Credentials');
      const credentialsRepository = await credRepository.findOne({
        where: { id: credentialId },
      });

      const { baseUrl } = await credentialsRepository.authData;
      console.log('db', baseUrl);
      const { access_token } = await credentialsRepository.authData.tokens;

      return { access_token: access_token, baseUrl: baseUrl };
    } catch (error) {
      this.logger.error('Error initialization twitter :', error + error.stack);
    }
  }
  public async curl(
    module: string,
    action: string,
    method: string,
    argumentdata: any,
  ) {
    try {
      const { credentialId, data } = argumentdata;
      const initializeData = await this.initialize(credentialId);
      const access_token = initializeData?.access_token;
      const baseUrl = initializeData?.baseUrl;

      let url = `${baseUrl}/${module}`;
      if (data.Id) {
        url += `/${data.Id}`;
      }

      const options: any = {
        method,
        url,
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/vnd.api+json',
          'Accept-Encoding': 'gzip',
        },
      };

      if (action === 'getmany') {
        if (argumentdata) options.params = data;
      } else {
        if (argumentdata) options.data = { data: data.data };
      }

      console.log(options);
      const response = await axios(options);

      return { response: response.data, status: response.status };
    } catch (error) {
      console.log(error.response || error.message);
      console.error('Piwik API Error:', error.response?.data || error.message);

      {
        return {
          response: error.response?.data || error.message,
          status: error.response?.status || 500,
        };
      }
    }
  }
  private async performpiwikproAction(
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
    const result = await this.curl(module, action, method, data);
    return result;
    // return {
    //   module,
    //   action,
    //   data,
    //   simulated: true,
    // };
  }
}

export const piwikProController = new PiwikproController();
