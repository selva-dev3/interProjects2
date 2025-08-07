// teamwork.controller.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONTROLLER FILE.
// DO NOT modify the auto-generated endpoints below.
// For custom integration logic, extend the helper "performteamworkAction".
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
} from './teamwork.config';
import { CredentialController } from 'src/credential/credential.controller';
import { prototype } from 'events';
let notebookDateUpdated, companyDateUpdated, taskDateUpdated;

@Controller('teamwork')
export class teamworkController {
  private logger = new CustomLogger();
  private credentialController = new CredentialController();

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
      !reqBody.clientSecret ||
      !reqBody.name ||
      !reqBody.type
    ) {
      throw new HttpException(
        'Missing OAuth parameters',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const { userId, node } = reqBody;
      const state = crypto.randomBytes(16).toString('hex');

      let dataCenter: string;
      let type: string = reqBody.type;
      let authUrl: string = reqBody.authurl;
      let tokenUrl: string = reqBody.tokenUrl;
      let name: string = reqBody.name;
      let site_name: string = reqBody.site_name;

      // if (tokenUrl) {
      //   const site_name = tokenUrl.split('/')[2].split('.');
      //   dataCenter = tokenUrl.includes('.com.cn')
      //     ? 'com.cn'
      //     : tokenUrl.includes('.com.au')
      //       ? 'com.au'
      //       : site_name.pop();
      // } else {
      //   const site_name = baseurl.split('/')[2].split('.');
      //   dataCenter = baseurl.includes('.com.cn')
      //     ? 'com.cn'
      //     : baseurl.includes('.com.au')
      //       ? 'com.au'
      //       : site_name.pop();
      // }

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
          clientSecret = authData.clientSecret;
          redirectUri = authData.redirectUri;
        } else {
          clientId = process.env.TEAMWORK_CLIENT_ID;
          clientSecret = process.env.TEAMWORK_CLIENT_SECRET;
          redirectUri = process.env.TEAMWORK_REDIRECT_URI;
        }
      }
      // Construct the OAuth URL.
      // NOTE: Update the URL if your xapp uses a different authentication endpoint.
      authUrl = `https://${site_name}.teamwork.com/launchpad/login?redirect_uri=${redirectUri}&client_id=${clientId}&state=${state}`;
      const data = {
        site_name: site_name,
        tokenUrl: tokenUrl,
        authUrl: authUrl,
        clientId: clientId,
        clientSecret: clientSecret,
        redirectUri: redirectUri,
        state: state,
        zapikey: zapikey || null,
      };

      const credentials = {
        data,
        name,
        type,
        userId,
      };
      if (reqBody.id) {
        await this.credentialController.updateCredentials(reqBody.id, data);
        this.logger.debug(
          'Credentials with ID updated sucessfully',
          reqBody.id,
        );
      } else {
        await this.credentialController.createCredentials(credentials);
        this.logger.debug('New Credentials created for :', name);
      }
      this.logger.debug(`${XappName} auth URL:`, authUrl);
      return res.json(authUrl);
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

      // TODO: Implement token exchange using the provided code.
      // NOTE: Save the access token and handle refresh token logic.
      const connection = await initializeDB();
      const credRepository = await connection.getRepository(Credentials);
      const credential = await credRepository
        .createQueryBuilder('credentials')
        .where("credentials.auth_data->>'state'=:state", { state })
        .getOne();
      console.log(credential);

      const { clientId, clientSecret, redirectUri, tokenUrl } =
        credential.authData;
      const data = {
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code,
      };
      console.log(data);
      const result = await axios.post(tokenUrl, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      credential.authData['token'] = result.data;
      await this.credentialController.updateCredentials(
        credential.id,
        credential.authData,
      );
      return res.json(result.data);
    } catch (error) {
      console.log(error.response.data);
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
  // @Post('refreshToken')
  // async refreshToken(@Body() reqBody: any, @Res() res: Response) {
  //   if (!reqBody.refreshToken) {
  //     throw new HttpException('Missing refresh token', HttpStatus.BAD_REQUEST);
  //   }
  //   try {
  //     // TODO: Implement the refresh token logic here.
  //     // Example: Request a new access token using the refresh token.
  //     const newAccessToken = 'new-access-token-placeholder';
  //     return res.json({
  //       message: `${XappName} access token refreshed successfully`,
  //       accessToken: newAccessToken,
  //     });
  //   } catch (error) {
  //     this.logger.error('Error in refreshToken:', error);
  //     throw new HttpException('Refresh token error', HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  // async AuthError(functionName: string, functionArgs: any[], credentialsId: string,) {
  //   try {
  //     // await this.refreshToken(credentialsId);
  //     const result = await this[functionName](...functionArgs);
  //     return result;
  //   } catch (error) {
  //     this.logger.error('Error refreshing token:', error + error.stack);
  //     return error;
  //   }
  // }

  // ---------------------------------------------------------------------------
  // AUTO-GENERATED ENDPOINTS FOR MODULE ACTIONS (as defined in the blueprint JSON)
  // ---------------------------------------------------------------------------

  /**
   * [AUTO-GENERATED] Endpoint for module "link" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "id":"1195910",
        "data":{
            "link":{
                "name":"link 11",
                "code":"hello"
            }
        }
        
    }
}
   */

  @Post('link/create')
  async createLink(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        `projects/${data.data.id}/links.json`,
        'create',
        'POST',
        data,
      );
      return res.json({
        message: `teamwork link create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in link/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "link" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":135026
        
    }
}
   */

  @Post('link/get')
  async getLink(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'links',
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `teamwork link get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in link/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  /**
  * [AUTO-GENERATED] Endpoint for module "link" action "get".
  *  - Request Parameters (data): 
  * - CredentialId: string
  * - RecordId: string (ID of the record to fetch)
  * - Calls the integration helper "performteamworkAction".
  * DO NOT modify the method signature.
  *  Example usage:
  * {
    "credentialId":"{{credentialId}}",
    "data":{
        
    }
}
  */

  @Post('link/getmany')
  async getmanyLink(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'links.json',
        'getmany',
        'GET',
        data,
      );
      return res.json({
        message: `teamwork link getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in link/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "link" action "update".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to update)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
        
        "Id":"135026",
        "data":{
            "link":{
                "name":"LINK !!!"
            }
        }
    }
}
   */

  @Post('link/update')
  async updateLink(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'links',
        'update',
        'PUT',
        data,
      );
      return res.json({
        message: `teamwork link update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in link/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "link" action "delete".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to delete)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"135027"
    }
}
   */

  @Post('link/delete')
  async deleteLink(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'links',
        'delete',
        'DELETE',
        data,
      );
      return res.json({
        message: `teamwork link delete executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in link/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "company" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "data":{
            "company":{
            "name":"comapany 6"
        }}
    }
}
   */

  @Post('company/create')
  async createCompany(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'projects/api/v3/companies.json',
        'create',
        'POST',
        data,
      );
      return res.json({
        message: `teamwork company create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in company/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "company" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"1406113"
        
    }
}
   */

  @Post('company/get')
  async getCompany(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'companies',
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `teamwork company get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in company/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "company" action "getmany".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
        "data":{
        "pageSize":1,
        "page":3
        }}}
   */

  @Post('company/getmany')
  async getmanyCompany(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data.data = {
        ...data.data,
        updatedAfter: companyDateUpdated
          ? companyDateUpdated
          : data.exe_lastupdatedtime,
      };
      const result = await this.performteamworkAction(
        'projects/api/v3/companies',
        'getmany',
        'GET',
        data,
      );
      const last = result.response.companies.at(-1);
      companyDateUpdated = last?.dateUpdated;
      return res.json({
        message: `teamwork company getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in company/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "company" action "update".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to update)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
    
    "Id":"1407798",
    "data":{
        "company":{
            "name":"COMPANY 5"
        }
    }
    }
}
   */

  @Post('company/update')
  async updateCompany(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'companies',
        'update',
        'PUT',
        data,
      );
      return res.json({
        message: `teamwork company update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in company/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "company" action "delete".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to delete)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"1407799"
    }
}
   */

  @Post('company/delete')
  async deleteCompany(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'companies',
        'delete',
        'DELETE',
        data,
      );
      return res.json({
        message: `teamwork company delete executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in company/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "categories" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performteamworkAction".
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

  @Post('categories/create')
  async createCategories(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'spaces/api/v1/spaces/categories.json',
        'create',
        'POST',
        data,
      );
      return res.json({
        message: `teamwork categories create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in categories/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "categories" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "CredentialId": "your-credential-id",
  "RecordId": "record-id"
}
   */

  @Post('categories/get')
  async getCategories(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'projects/api/v3/projectcategories',
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `teamwork categories get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in categories/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "categories" action "getmany".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "CredentialId": "your-credential-id",
  "Filters": {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('categories/getmany')
  async getmanyCategories(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'projects/api/v3/projectcategories.json',
        'getmany',
        'GET',
        data,
      );
      return res.json({
        message: `teamwork categories getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in categories/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "categories" action "update".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to update)
   * - Calls the integration helper "performteamworkAction".
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

  @Post('categories/update')
  async updateCategories(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'categories',
        'update',
        'PUT',
        data,
      );
      return res.json({
        message: `teamwork categories update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in categories/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "categories" action "delete".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to delete)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "CredentialId": "your-credential-id",
  "RecordId": "record-id"
}
   */

  @Post('categories/delete')
  async deleteCategories(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'categories',
        'delete',
        'DELETE',
        data,
      );
      return res.json({
        message: `teamwork categories delete executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in categories/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "milestone" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
        "id":"1195426",
        "data":{
            "milestone":{
                "title":"milestone 10",
                "deadline":"20250115",
                "responsible-party-ids":"685116"
            }
        }
    }
}
   */

  @Post('milestone/create')
  async createMilestone(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        `projects/${data.data.id}/milestones.json`,
        'create',
        'POST',
        data,
      );
      return res.json({
        message: `teamwork milestone create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in milestone/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "milestone" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
    "Id":"789791"
    }
}
   */

  @Post('milestone/get')
  async getMilestone(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'projects/api/v3/milestones',
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `teamwork milestone get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in milestone/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "milestone" action "getmany".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        
    }
}
   */

  @Post('milestone/getmany')
  async getmanyMilestone(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'projects/api/v3/milestones.json',
        'getmany',
        'GET',
        data,
      );
      return res.json({
        message: `teamwork milestone getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in milestone/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "milestone" action "update".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to update)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"792856"
    }
}
   */

  @Post('milestone/update')
  async updateMilestone(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'milestones',
        'update',
        'PUT',
        data,
      );
      return res.json({
        message: `teamwork milestone update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in milestone/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "milestone" action "delete".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to delete)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "CredentialId": "your-credential-id",
  "RecordId": "record-id"
}
   */

  @Post('milestone/delete')
  async deleteMilestone(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'milestones',
        'delete',
        'DELETE',
        data,
      );
      return res.json({
        message: `teamwork milestone delete executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in milestone/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "comments" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "resource":"tasks",
        "resourceId":"44098058",
        "data":{
            "comment":{
                "body":"comment 11"
            }
        }
    }
}
   */

  @Post('comments/create')
  async createComments(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        `${data.data.resource}/${data.data.resourceId}/comments.json`,
        'create',
        'POST',
        data,
      );
      return res.json({
        message: `teamwork comments create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in comments/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "comments" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"26056486"
    }
}
   */

  @Post('comments/get')
  async getComments(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'comments',
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `teamwork comments get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in comments/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "comments" action "getmany".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "argument": {
            "updatedAfterDate": "2025-07-30"      
        },                                               // OR
        // "exe_lastupdatedtime":"2025-03-05T16:02:49Z",
        "data": {
            "pageSize": 2
            // "orderBy":"dateUpdated"
        }
    }
}
   */

  @Post('comments/getmany')
  async getmanyComments(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {


 
      let fromDate = data?.data?.argument?.updatedAfterDate;

      if (!fromDate) {
        const exeLastUpdatedTime = data?.data?.exe_lastupdatedtime;
        if (!exeLastUpdatedTime) {
          throw new HttpException(
            'exe_lastupdatedtime is required when fromdate/todate are missing',
            HttpStatus.BAD_REQUEST,
          );
        }

        const parsedExeTime = new Date(exeLastUpdatedTime);
        fromDate = parsedExeTime.toISOString().split('T')[0]; // "YYYY-MM-DD"
      }
      fromDate = fromDate.replace(/-/g, ''); 20250804000000
      let params = {
        updatedAfterDate: `${fromDate} 00:00:00`,
        ...data.data.data,
      };

      const paginatedData = {
        ...data,

        data: params,
      };
      const result = await this.performteamworkAction(
        'comments.json',
        'getmany',
        'GET',
        paginatedData,
      );
      return res.json({
        message: `teamwork comments getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in comments/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "comments" action "update".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to update)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"26141201",
        "data":{
            "comment":{
                "body":"Hello"
            }
        }
    }
}
   */

  @Post('comments/update')
  async updateComments(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'comments',
        'update',
        'PUT',
        data,
      );
      return res.json({
        message: `teamwork comments update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in comments/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "comments" action "delete".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to delete)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"26141200"
    }
}
   */

  @Post('comments/delete')
  async deleteComments(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'comments',
        'delete',
        'DELETE',
        data,
      );
      return res.json({
        message: `teamwork comments delete executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in comments/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "notebook" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
                    "projectId":1195910,

        "data":{
            "notebook":{
                "name":"notebook 10",
                "contents":"hello"
            }
        }
    }
}
   */

  @Post('notebook/create')
  async createNotebook(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        `projects/api/v3/projects/${data.data.projectId}/notebooks.json`,
        'create',
        'POST',
        data,
      );
      return res.json({
        message: `teamwork notebook create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in notebook/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "notebook" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"383267"
    }
}
   */

  @Post('notebook/get')
  async getNotebook(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'notebooks',
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `teamwork notebook get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in notebook/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "notebook" action "getmany".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        
    }
}
   */

  @Post('notebook/getmany')
  async getmanyNotebook(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data.data = {
        ...data.data,
        updatedAfter: notebookDateUpdated
          ? notebookDateUpdated
          : data.exe_lastupdatedtime,
      };
      const result = await this.performteamworkAction(
        'projects/api/v3/notebooks.json',
        'getmany',
        'GET',
        data,
      );
      const last = result.response.notebooks.at(-1);
      notebookDateUpdated = last?.dateUpdated;
      console.log(notebookDateUpdated);
      return res.json({
        message: `teamwork notebook getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in notebook/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "notebook" action "update".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to update)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
    "Id":"383991",
    "data":{
        
    }
    }
}
   */

  @Post('notebook/update')
  async updateNotebook(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'projects/api/v3/notebooks',
        'update',
        'PATCH',
        data,
      );
      return res.json({
        message: `teamwork notebook update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in notebook/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "notebook" action "delete".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to delete)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"383991"
    }
}
   */

  @Post('notebook/delete')
  async deleteNotebook(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'notebooks',
        'delete',
        'DELETE',
        data,
      );
      return res.json({
        message: `teamwork notebook delete executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in notebook/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "notebookcategories" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
        "id":"1195426",
        "data":{
            "category":{
                "name":"notebook category 2"
            }
        }
    }
}
   */

  @Post('notebookcategories/create')
  async createNotebookcategories(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        `projects/${data.data.id}/notebookCategories.json`,
        'create',
        'POST',
        data,
      );
      return res.json({
        message: `teamwork notebookcategories create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in notebookcategories/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "notebookcategories" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"1040627"
    }
}
   */

  @Post('notebookcategories/get')
  async getNotebookcategories(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'notebookCategories',
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `teamwork notebookcategories get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in notebookcategories/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "notebookcategories" action "getmany".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "id":"1195426"
    }
}
   */

  @Post('notebookcategories/getmany')
  async getmanyNotebookcategories(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        `projects/${data.data.id}/notebookCategories.json`,
        'getmany',
        'GET',
        data,
      );
      return res.json({
        message: `teamwork notebookcategories getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in notebookcategories/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "notebookcategories" action "update".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to update)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"1040627",
        "data":{
            "category":{
                "name":"NOTEBOOK CATEGORY 1"
            }
        }
    }
}
   */

  @Post('notebookcategories/update')
  async updateNotebookcategories(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'notebookCategories',
        'update',
        'PUT',
        data,
      );
      return res.json({
        message: `teamwork notebookcategories update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in notebookcategories/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "notebookcategories" action "delete".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to delete)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"1040626"
    }
}
   */

  @Post('notebookcategories/delete')
  async deleteNotebookcategories(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'notebookCategories',
        'delete',
        'DELETE',
        data,
      );
      return res.json({
        message: `teamwork notebookcategories delete executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in notebookcategories/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  /**
   * [AUTO-GENERATED] Endpoint for module "person" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "data":{
            "person":{
                "first-name":"Harish",
                "last-name":"R",
                "email-address":"harish1@gmail.com"
            }
        }
    }
}
   */

  @Post('person/create')
  async createPerson(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'people.json',
        'create',
        'POST',
        data,
      );
      return res.json({
        message: `teamwork person create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in person/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "person" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"1202500"
    }
}
   */

  @Post('person/get')
  async getPerson(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'people',
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `teamwork person get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in person/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "person" action "getmany".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
   
        "data": {
        "argument": {
            "updatedAfterDate": "2025-06-29"
        },                                              // OR
        // "exe_lastupdatedtime":"2025-03-05T16:02:49Z",
        "data":{
            // "sort":"smack"
            // "getCounts":true
            // "countOnly":true
            // "includeTags":true
            // "getProjectRoles":true
            // "onlyids":true
            // "fullprofile":true
            // "sortOrder":"desc"
            // "groupByCompany":true
            // "includeObservers":false
            // "pageSize":2
        }
    
}}
   */

  @Post('person/getmany')
  async getmanyPerson(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      let fromDate = data?.data?.argument?.updatedAfterDate;

      if (!fromDate) {
        const exeLastUpdatedTime = data?.data?.exe_lastupdatedtime;
        if (!exeLastUpdatedTime) {
          throw new HttpException(
            'exe_lastupdatedtime is required when fromdate/todate are missing',
            HttpStatus.BAD_REQUEST,
          );
        }

        const parsedExeTime = new Date(exeLastUpdatedTime);
        fromDate = parsedExeTime.toISOString().split('T')[0]; // "YYYY-MM-DD"
      }
      fromDate = fromDate.replace(/-/g, '');
      let params = {
        updatedAfterDate: `${fromDate}000000`,
        ...data.data.data,
      };

      const paginatedData = {
        ...data,

        data: params,
      };
      const result = await this.performteamworkAction(
        'people.json',
        'getmany',
        'GET',
        paginatedData,
      );
      return res.json({
        message: `teamwork person getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in person/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "person" action "update".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to update)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"688187",
        "data":{
            "person":{
                "first-name":"HARISH"
            }
        }
    }
}
   */

  @Post('person/update')
  async updatePerson(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'people',
        'update',
        'PUT',
        data,
      );
      return res.json({
        message: `teamwork person update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in person/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "person" action "delete".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to delete)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"688187"
    }
}
   */

  @Post('person/delete')
  async deletePerson(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'people',
        'delete',
        'DELETE',
        data,
      );
      return res.json({
        message: `teamwork person delete executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in person/delete:`, error);
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
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "data":{
            "project":{
                "name":"project 11"
            }
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
      const result = await this.performteamworkAction(
        'projects.json',
        'create',
        'POST',
        data,
      );
      return res.json({
        message: `teamwork project create executed successfully`,
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
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"1202500"
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
      const result = await this.performteamworkAction(
        'projects',
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `teamwork project get executed successfully`,
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
   * [AUTO-GENERATED] Endpoint for module "project" action "getmany".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data": {
       
     
        "argument": {
            // "createdAfterDate": "2025-07-11"    
            // "updatedAfterDate":"2025-07-11"
        },                                                              //  ( OR )
        // // "exe_lastupdatedtime":"2025-03-05T16:02:49Z",
        "data":{

        //     //  "status": "current"
        //     // "getDeleted":true
        //     // "updatedAfterDate":"20240621"
        //     // "orderby":"lastActivityDate"
        //     // "createdAfterDate":"2025-07-15"
        //         // "createdAfterTime":"06:36:03"
                "pageSize":1
        //         // "page":2
        //         // "orderMode":"desc"
        //         // "onlyStarredProjects":true
        //         // "companyId":"208357"
        //         // "projectOwnerIds":"1"

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
      let fromDate =
        data?.data?.argument?.createdAfterDate ||
        data?.data?.argument?.updatedAfterDate;

      if (!fromDate) {
        const exeLastUpdatedTime = data?.data?.exe_lastupdatedtime;
        if (!exeLastUpdatedTime) {
          throw new HttpException(
            'exe_lastupdatedtime is required when fromdate/todate are missing',
            HttpStatus.BAD_REQUEST,
          );
        }

        const parsedExeTime = new Date(exeLastUpdatedTime);
        fromDate = parsedExeTime.toISOString().split('T')[0]; // "YYYY-MM-DD"
      }
      fromDate = fromDate.replace(/-/g, '');
      let params;
      if (data?.data?.argument?.createdAfterDate) {
        params = {
          createdAfterDate: `${fromDate}000000`,
          ...data.data.data,
        };
      }
      if (data?.data?.argument?.updatedAfterDate) {
        params = {
          updatedAfterDate: `${fromDate}000000`,
          ...data.data.data,
        };
      }
      const paginatedData = {
        ...data,

        data: params,
      };
      const result = await this.performteamworkAction(
        'projects.json',
        'getmany',
        'GET',
        paginatedData,
      );
      return res.json({
        message: `teamwork project getmany executed successfully`,
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
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"1202500",
        "data":{
            "project":{
                "name":"PROJECT 11"
            }
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
      const result = await this.performteamworkAction(
        'projects',
        'update',
        'PUT',
        data,
      );
      return res.json({
        message: `teamwork project update executed successfully`,
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
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"1202500"
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
      const result = await this.performteamworkAction(
        'projects',
        'delete',
        'DELETE',
        data,
      );
      return res.json({
        message: `teamwork project delete executed successfully`,
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
   * [AUTO-GENERATED] Endpoint for module "status" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
        "id":"685116", // if the ig given status create for user else it sreate for current user
        "data":{
            "userStatus":{
                "status":"hello user"  
            }
        }

    }
}
   */

  @Post('status/create')
  async createStatus(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        data.data.id ? `people/${data.data.id}/status.json` : `me/status.json`,
        'create',
        'POST',
        data,
      );
      return res.json({
        message: `teamwork status create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in status/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "status" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "id":"685116" //if the id give it returns user status else it returns current user status
    }
}
   */

  @Post('status/get')
  async getStatus(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        data.data.id ? `people/${data.data.id}/status.json` : `me/status.json`,
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `teamwork status get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in status/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "status" action "getmany".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{

    }
}
   */

  @Post('status/getmany')
  async getmanyStatus(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'statuses.json',
        'getmany',
        'GET',
        data,
      );

      return res.json({
        message: `teamwork status getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in status/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "status" action "update".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to update)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
"Id":"70176",
"data":{
    "userStatus":{
        "status": "hello" 
    }
}
    }
}
   */

  @Post('status/update')
  async updateStatus(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'people/status',
        'update',
        'PUT',
        data,
      );
      return res.json({
        message: `teamwork status update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in status/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "status" action "delete".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to delete)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"70176"
    }
}
   */

  @Post('status/delete')
  async deleteStatus(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'people/status',
        'delete',
        'DELETE',
        data,
      );
      return res.json({
        message: `teamwork status delete executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in status/delete:`, error);
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
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"52276200-1503-4c34-9b2d-134214da17b3",
    "data":{
        "tasklistId":"3570950",
        "data":{
            "task":{
            "name":"project 11"
        }}
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
      const result = await this.performteamworkAction(
        `tasklists/${data.data.tasklistId}/tasks.json`,
        'create',
        'POST',
        data,
      );
      return res.json({
        message: `teamwork task create executed successfully`,
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
   * [AUTO-GENERATED] Endpoint for module "task" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"52276200-1503-4c34-9b2d-134214da17b3",
    "data":{
    "Id":"44098058"
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
      const result = await this.performteamworkAction(
        'tasks',
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `teamwork task get executed successfully`,
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
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
   
    "data":{
        //  "exe_lastupdatedtime":"2025-03-05T16:02:49Z",   // OR
         "argument":{
            // "startDate":"2025-07-29",
            // "endDate":"2025-08-30"     // (startDate &&endDate) || createdAfter
            // "createdAfter":"2025-07-15"
         },
        "data":{
        "pageSize":5
        // "orderBy":"dateUpdated"
        //  "startDate": "2025-08-30"
        // "completedAfterDate":"20250128000000"
        // "includeCompletedTasks":true
        // "includeCompletedSubtasks":true
        // "responsible-party-ids":"551371"
        // "sort":"2025-07-18T00:00:00Z"
        // "getFiles":true
        // "includeToday":true
        // "ignore-start-dates":true
        // "includeTasksWithoutDueDates":true
        // "includeTasksFromDeletedLists":true
        // "projectIds":"612180"
        // "includeCompletedPredecessors":true
        // "includeLoggedTime":true
        // "includeReminders":true
        // "includeTaskId":true
        // "includeUntaggedTasks":true

             
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

      let fromDate = data?.data?.argument?.startDate;
      let toDate = data?.data?.argument?.endDate;
      let createAfter = data?.data?.argument?.createdAfter;

      if (!(fromDate || toDate) && !createAfter) {
        const exeLastUpdatedTime = data?.data?.exe_lastupdatedtime;
        if (!exeLastUpdatedTime) {
          throw new HttpException(
            'exe_lastupdatedtime is required when fromdate/todate are missing',
            HttpStatus.BAD_REQUEST,
          );
        }

        const parsedExeTime = new Date(exeLastUpdatedTime);
        fromDate = parsedExeTime.toISOString().split('T')[0]; // "YYYY-MM-DD"
        const now = new Date();
        toDate = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
      }
      let params;
      if (createAfter) {
        params = {
          createdAfter: createAfter,
          ...data.data.data,
        };
      }
      if (fromDate && toDate) {
        params = {
          startDate: `${fromDate}`,
          endDate: `${toDate}`,
          ...data.data.data,
        };
      }

      if (fromDate && toDate && createAfter) {
        params = {
          startDate: `${fromDate}`,
          endDate: `${toDate}`,
          createdAfter: createAfter,
          ...data.data.data,
        };
      }

      const paginatedData = {
        ...data,
        data: params,
      };
      const result = await this.performteamworkAction(
        'projects/api/v3/tasks.json',
        'getmany',
        'GET',
        paginatedData,
      );
      const last = result.response.tasks.at(-1);
      taskDateUpdated = last?.dateUpdated;
      return res.json({
        message: `teamwork task getmany executed successfully`,
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
   * [AUTO-GENERATED] Endpoint for module "task" action "update".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to update)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"52276200-1503-4c34-9b2d-134214da17b3",
    "data":{
        "Id":"44407652",
        "data":{
            "task":{
                "name":"PROJECT 10"
            }
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
      const result = await this.performteamworkAction(
        'projects/api/v3/tasks',
        'update',
        'PATCH',
        data,
      );
      return res.json({
        message: `teamwork task update executed successfully`,
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
   * [AUTO-GENERATED] Endpoint for module "task" action "delete".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to delete)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"52276200-1503-4c34-9b2d-134214da17b3",
    "data":{
        "Id":"44407653"
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
      const result = await this.performteamworkAction(
        'projects/api/v3/tasks',
        'delete',
        'DELETE',
        data,
      );
      return res.json({
        message: `teamwork task delete executed successfully`,
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
   * [AUTO-GENERATED] Endpoint for module "invoice" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
        "id":"1195426",
        "data":{
            "invoice":{
                "display-date":"20250410",
                "number":8825608776
            }
        }
    }
}
   */

  @Post('invoice/create')
  async createInvoice(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        `projects/${data.data.id}/invoices.json`,
        'create',
        'POST',
        data,
      );
      return res.json({
        message: `teamwork invoice create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in invoice/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "invoice" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *{
    "credentialId":"{{credentialId}}",
    "data":{
        "data":{
            // "type":"completed"
        }
        
    }
}
   */

  @Post('invoice/get')
  async getInvoice(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'invoices',
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `teamwork invoice get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in invoice/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "invoice" action "getmany".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        
    }
}
   */

  @Post('invoice/getmany')
  async getmanyInvoice(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'invoices.json',
        'getmany',
        'GET',
        data,
      );
      return res.json({
        message: `teamwork invoice getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in invoice/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "invoice" action "update".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to update)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"131175",
        "data":{
            "invoice":{
                
            }
        }
    }
}
   */

  @Post('invoice/update')
  async updateInvoice(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'invoices',
        'update',
        'PUT',
        data,
      );
      return res.json({
        message: `teamwork invoice update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in invoice/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "invoice" action "delete".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to delete)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"129904"
    }
}
   */

  @Post('invoice/delete')
  async deleteInvoice(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'invoices',
        'delete',
        'DELETE',
        data,
      );
      return res.json({
        message: `teamwork invoice delete executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in invoice/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "filecategories" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "id":"1195426",
        "data":{
            "category":{
                "name":"fileCategories 2"
            }
        }
    }
}
   */

  @Post('filecategories/create')
  async createFilecategories(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        `projects/${data.data.id}/fileCategories.json`,
        'create',
        'POST',
        data,
      );
      return res.json({
        message: `teamwork filecategories create executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in filecategories/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "filecategories" action "get".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to fetch)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"1644030"
    }
}
   */

  @Post('filecategories/get')
  async getFilecategories(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'fileCategories',
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `teamwork filecategories get executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in filecategories/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "filecategories" action "getmany".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *{
    "credentialId":"{{credentialId}}",
    "data":{
        "id":"1195426"

    }
}
   */

  @Post('filecategories/getmany')
  async getmanyFilecategories(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        `projects/${data.data.id}/fileCategories.json`,
        'getmany',
        'GET',
        data,
      );
      return res.json({
        message: `teamwork filecategories getmany executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in filecategories/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "filecategories" action "update".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to update)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"1644030",
        "data":{
            "category":{
                "name":"FILE CATEGORY 1"
            }
        }
    }
}
   */

  @Post('filecategories/update')
  async updateFilecategories(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'fileCategories',
        'update',
        'PUT',
        data,
      );
      return res.json({
        message: `teamwork filecategories update executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in filecategories/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "filecategories" action "delete".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to delete)
   * - Calls the integration helper "performteamworkAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"1644030"
    }
}
   */

  @Post('filecategories/delete')
  async deleteFilecategories(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'fileCategories',
        'delete',
        'DELETE',
        data,
      );
      return res.json({
        message: `teamwork filecategories delete executed successfully`,
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in filecategories/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // fields

  /*example usage
  {
      "category":"link",
      "name":"create",
      "data":"52276200-1503-4c34-9b2d-134214da17b3"
  }
  **/

  @Post('project/getmany')
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
      const result = await this.performteamworkAction(
        'projects.json',
        'getmany',
        'GET',
        data,
      );
      return result.response.projects.map((data) => ({
        value: data.id,
        name: data.name,
      }));
    } catch (error) {
      this.logger.error(`Error in project/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('task/getAll')
  async getallTask(@Body() data: any) {
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
      console.log(data);
      const result = await this.performteamworkAction(
        'projects/api/v3/tasks.json',
        'getmany',
        'GET',
        data,
      );
      return result.response.tasks.map((data) => ({
        value: data.id,
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

  @Post('link/getAll')
  async getallLink(@Body() data: any) {
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
      const result = await this.performteamworkAction(
        'links.json',
        'getmany',
        'GET',
        data,
      );
      const projectLinks = result.response.projects[0].links;

      return projectLinks.map((link) => ({ value: link.id, name: link.name }));
    } catch (error) {
      this.logger.error(`Error in link/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('company/getAll')
  async getallCompany(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performteamworkAction(
        'projects/api/v3/companies',
        'getmany',
        'GET',
        data,
      );

      return result.response.companies.map((data) => ({
        value: data.id,
        name: data.name,
      }));
    } catch (error) {
      this.logger.error(`Error in company/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('comments/getAll')
  async getallComments(@Body() data: any) {
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
      const result = await this.performteamworkAction(
        'comments.json',
        'getmany',
        'GET',
        data,
      );
      return result.response.comments.map((data) => ({
        value: data.id,
        body: data.body,
      }));
    } catch (error) {
      this.logger.error(`Error in comments/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('notebook/getAll')
  async getallNotebook(@Body() data: any) {
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
      const result = await this.performteamworkAction(
        '/projects/api/v3/notebooks.json',
        'getmany',
        'GET',
        data,
      );
      return result.response.notebooks.map((data) => ({
        value: data.id,
        name: data.name,
      }));
    } catch (error) {
      this.logger.error(`Error in notebook/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('notebookcategories/getAll')
  async getAllNotebookcategories(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data = {
        credentialId: data,
        exe_lastupdatedtime: '2025-03-05T16:02:49Z',
        data: {
          pageSize: 5,
          orderBy: 'dateUpdated',
        },
      };
      const result = await this.performteamworkAction(
        `projects/${data.data.id}/notebookCategories.json`,
        'getmany',
        'GET',
        data,
      );
      return result.response.categories.map((data) => ({
        value: data.id,
        name: data.name,
      }));
    } catch (error) {
      this.logger.error(`Error in notebookcategories/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('filecategories/getAll')
  async getallFilecategories(@Body() data: any) {
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
          id: '1287005',
        },
      };
      const result = await this.performteamworkAction(
        `projects/${data.data.id}/fileCategories.json`,
        'getmany',
        'GET',
        data,
      );
      return result.response.categories.map((data) => ({
        value: data.id,
        name: data.name,
      }));
    } catch (error) {
      this.logger.error(`Error in filecategories/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('invoice/getAll')
  async getallInvoice(@Body() data: any) {
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
      const result = await this.performteamworkAction(
        'invoices.json',
        'getmany',
        'GET',
        data,
      );
      return result.response.invoices.map((data) => ({
        value: data.id,
        number: data.number,
      }));
    } catch (error) {
      this.logger.error(`Error in invoice/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('status/getAll')
  async getallStatus(@Body() data: any) {
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
      const result = await this.performteamworkAction(
        'statuses.json',
        'getmany',
        'GET',
        data,
      );
      return result.response.userStatuses.map((data) => ({
        value: data.id,
        status: data.status,
      }));
    } catch (error) {
      this.logger.error(`Error in status/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('person/getAll')
  async getallPerson(@Body() data: any) {
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
      const result = await this.performteamworkAction(
        'people.json',
        'getmany',
        'GET',
        data,
      );
      return result.response.people.map((data) => ({
        value: data.id,
        name: data['full-name'],
      }));
    } catch (error) {
      this.logger.error(`Error in person/getmany:`, error);
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
      const credRepository = connection.getRepository(Credentials);
      const credentialRepository = await credRepository.findOne({
        where: { id },
      });
      const credentials = credentialRepository.authData.token;
      return { credentials: credentials };
    } catch (error) {
      this.logger.error('Error initializing Node:', error + error.stack);
    }
  }

  /**
   * [AUTO-GENERATED] Helper method to perform a teamwork action.
   * This method is a stub—extend it to integrate with the actual API for your xapp.
   *
   * Validations:
   * - Ensure that the provided module and action are supported.
   * - Validate the "data" structure as needed.
   *
   * DO NOT change the method signature.
   */
  private async performteamworkAction(
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
    // return {
    //   module,
    //   action,
    //   data,
    //   simulated: true,
    // };
  }
  public async curl(
    module: string,
    action: string,
    method: string,
    argumentdata: any,
  ) {
    try {
      console.log(argumentdata);
      const { credentialId } = argumentdata;
      console.log(credentialId);

      const initializeData: any = await this.initialize(credentialId);

      const { installation, access_token } = initializeData.credentials;
      const baseUrl = installation.url;
      let url = `${baseUrl}${module}`;
      if (argumentdata.data.Id) url += `/${argumentdata.data.Id}.json`;

      console.log(url);
      const options: any = {
        method,
        url,
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      };
      if (action === 'getmany') {
        if (argumentdata) options.params = argumentdata.data;
      } else {
        if (argumentdata) options.data = argumentdata.data.data;
      }
      console.log(options);
      const response = await axios(options);
      // console.log(response)
      return { response: response.data, status: response.status };
    } catch (error) {
      console.log(error.response || error.message);
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
      console.log(data);
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
export const teamwork = new teamworkController();
