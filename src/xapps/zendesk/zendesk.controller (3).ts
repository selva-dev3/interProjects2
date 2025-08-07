// zendesk.controller.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONTROLLER FILE.
// DO NOT modify the auto-generated endpoints below.
// For custom integration logic, extend the helper "performZendeskAction".
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
import { randomBytes } from 'crypto';
import { initializeDB } from '../../ormconfig';
import { Credentials } from '../../entities/Credentials';
import { CustomLogger } from '../../logger/custom.logger';
import * as qs from 'qs';
import { CredentialController } from 'src/credential/credential.controller';
import config, { XappName, modules as xappModules } from './zendesk.config';

let audit_next_cursor: any;
let ticket_metrics_next_cursor: any;
let activities_next_cursor: any;
let sikps_next_cursor: any;
@Controller('zendesk')
export class ZendeskController {
  private logger = new CustomLogger();
  private CredentialController = new CredentialController();
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
      !reqBody.type ||
      !reqBody.subdomain
    ) {
      throw new HttpException(
        'Missing OAuth parameters',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const {  subdomain, id, userId } =
        reqBody;

      const scope = 'tickets:read users:read';
      const state = randomBytes(16).toString('hex');

      // Make sure to URL encode the scope, redirect_uri, and state

      let dataCenter: any;
      let type: string = reqBody.type;
      let authurl: string = reqBody.authurl;
      let tokenurl: string = `https://${subdomain}.zendesk.com/oauth/tokens`;
      let name: string = reqBody.name;
      let baseurl: string = reqBody.baseurl;

      // if (tokenurl) {
      //   const domain = tokenurl.split('/')[2].split('.');
      //   dataCenter = tokenurl.includes('.com.cn')
      //     ? 'com.cn'
      //     : tokenurl.includes('.com.au')
      //       ? 'com.au'
      //       : domain.pop();
      // } else {
      //   const domain = baseurl.split('/')[2].split('.');
      //   dataCenter = baseurl.includes('.com.cn')
      //     ? 'com.cn'
      //     : baseurl.includes('.com.au')
      //       ? 'com.au'
      //       : domain.pop();
      // }

      let clientId: any = reqBody.clientId;
      let clientSecret: any = reqBody.clientSecret;
      let redirectUri: any = reqBody.redirectUri;
      let zapikey: any ;

      if(userId.length !== undefined){
        const connection = await initializeDB();
        const credentialRepository = connection.getRepository(Credentials);

        const zendeskauthdata = await credentialRepository.query(
          `SELECT id,name,type,auth_data
          FROM credentials
          WHERE author_id = $1
          AND name = $2
          ORDER BY created_at ASC
          LIMIT 1`,
          [userId,name]
        );

        if(zendeskauthdata.length > 0){
          const authData = await zendeskauthdata[0].auth_data;
          clientId = authData.clientId;
          clientSecret = authData.clientSecret;
          redirectUri = authData.redirectUri;
        }else{
          clientId = process.env.CLIENT_ID;
          clientSecret = process.env.CLIENT_SECRET;
          redirectUri = process.env.REDIRECT_URI;
        }
      }

      const authUrl = `${authurl}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read%20write&state=${state}`;

      console.log(authUrl);
      const data = {
        clientId: clientId,
        clientSecret: clientSecret,
        redirectUri: redirectUri,
        state: state,
        subdomain: subdomain,
        authurl: authurl,
        tokenurl: tokenurl,
      };
      console.log(data);
      const credentialRequest = {
        name: name,
        data: data,
        type: type,
        userId: userId,
      };
      console.log('crede', credentialRequest);
      if (reqBody.id) {
        await this.CredentialController.updateCredentials(reqBody.id, data);
        this.logger.debug(
          'Credentials with id updated successfully ',
          reqBody.id,
        );
        return res.status(HttpStatus.CREATED).send(authUrl);
      } else {
        await this.CredentialController.createCredentials(
          credentialRequest,
          res,
        );
        console.log('Credentials stored in database');
        return res.status(HttpStatus.CREATED).send(authUrl);
      }
    } catch (error) {
      this.logger.error('Error in authorize:', error);
      console.log('err', error);
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
    console.log("hiiiiii")
    try {
      console.log('hello from call back');
      const code = req.query.code as string;
      const state = req.query.state as string;
      console.log(code, state);

      const connection = await initializeDB();
      const credentialRepository = connection.getRepository(Credentials);
      const credential = await credentialRepository
        .createQueryBuilder('credentials')
        .where("credentials.auth_data->>'state'=:state", { state })
        .getOne();
      console.log('credential from call back', credential);

      if (!credential) {
        return res
          .status(400)
          .json({ message: 'Invalid state:No Credentials found' });
      }

      const { clientId, clientSecret, redirectUri,tokenurl } = credential.authData;
      console.log('clientId', clientId);
      const requestBody = qs.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code,
      });

      console.log('req', requestBody);
      const result = await axios.post(
        tokenurl,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      credential.authData['token'] = result.data;

      await this.CredentialController.updateCredentials(
        credential.id,
        credential.authData,
      );
      return res.send({
        status: 'success',
        message: 'Authentication successful',
        data: result.data,
      });

      // TODO: Implement token exchange using the provided code.
      // NOTE: Save the access token and handle refresh token logic.
    } catch (error) {
      console.log('Error in callback:', error);
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
  async refreshToken(@Body() reqBody: any) {
    if (!reqBody.credentialId) {
      throw new HttpException('Missing refresh token', HttpStatus.BAD_REQUEST);
    }
    try {
      const id = reqBody.credentialId;
      const connection = await initializeDB();
      const credRepository = connection.getRepository(Credentials);
      const credentialRepository: any = await credRepository.findOne({
        where: { id },
      });
      const { clientId, clientSecret, tokenurl, token } = credentialRepository.authData;
      const refresh_token = await token.refresh_token;
      // TODO: Implement the refresh token logic here.
      // Example: Request a new access token using the refresh token.
      const tokenRequestData = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
        client_id: clientId,
        client_secret: clientSecret,
      });

      const tokenResponse = await axios.post(
        tokenurl,
        tokenRequestData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      const tokens = tokenResponse.data;
      credentialRepository.authData['token'] = tokens;
      const data = credentialRepository.authData;
      await this.CredentialController.updateCredentials(
        credentialRepository.id,
        data,
      );

      const updatedcred: any = await credRepository.findOne({ where: { id } });

      return {
        message: `${XappName} access token refreshed successfully`,
        accessToken: updatedcred,
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

      const argsArray = (await Array.isArray(functionArgs))
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
   * [AUTO-GENERATED] Endpoint for module "tickets" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "ticket": {
                "comment": {
                    "body": "New "
                },
                "priority": "urgent",
                "subject": "New tickets 2"
            }
        }
    }
}
   */

  @Post('tickets/create')
  async createTickets(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = `tickets`;
      const result = await this.performZendeskAction(
        url,
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createTickets',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tickets create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tickets/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tickets" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 7
    }
}
   */

  @Post('tickets/get')
  async getTickets(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
        const url = `tickets`;
      const result = await this.performZendeskAction(
        url,
        'get',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tickets get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tickets/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tickets" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {}
}  */

  @Post('tickets/getmany')
  async getmanyTickets(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = 'tickets';
      const result = await this.performZendeskAction(
        url,
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tickets getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tickets/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tickets" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 9,
        "data": {
            "ticket": {
                "comment": {
                    "body": "The smoke is out of form."
                },
                "priority": "urgent",
                "subject": "Updated printer"
            }
        }
    }
}
   */

  @Post('tickets/update')
  async updateTickets(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'tickets',
        'update',
        'PUT',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tickets update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tickets/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tickets" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id":8
    }
}
   */

  @Post('tickets/delete')
  async deleteTickets(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'tickets',
        'delete',
        'DELETE',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tickets delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tickets/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tickets" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id":8
    }
}
   */

  @Post('tickets/count')
  async countTickets(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url ='tickets/count'
      const result = await this.performZendeskAction(
        url,
        'count',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tickets count executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tickets/count:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tickets" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "ids":"7,9"
       
    }
}
   */

  @Post('tickets/multiple')
  async multipleTickets(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url =  `tickets/show_many`
      const result = await this.performZendeskAction(
       url,
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tickets multiple executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tickets/multiple:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tickets" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "tickets": [
                {
                    "comment": {
                        "body": "The smoke is very colorful."
                    },
                    "priority": "urgent",
                    "subject": "My printer is on fire!"
                },
                {
                    "comment": {
                        "body": "This is a comment"
                    },
                    "priority": "normal",
                    "subject": "Help"
                }
            ]
        }
    }
}
   */

  @Post('tickets/createMany')
  async createManyTickets(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = 'tickets/create_many'
      const result = await this.performZendeskAction(
      url ,
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tickets createMany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tickets/createMany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tickets" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "ids": "7,9",
        "data": {
            "ticket": {
                "status": "solved",
                "subject": "UpdateMany"
            }
        }
    }
}
   */

  @Post('tickets/updateMany')
  async updateManyTickets(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url ='tickets/update_many'
      const result = await this.performZendeskAction(
        url,
        'upate',
        'PUT',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateMany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tickets updateMany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tickets/updateMany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tickets" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "ids": "1,3"
    }
}
   */

  @Post('tickets/bulkdelete')
  async bulkdeleteTickets(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url ='tickets/destroy_many'
      const result = await this.performZendeskAction(
        url,
        'bulkdelete',
        'DELETE',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'bulkdeleteTickets',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tickets bulkdelete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tickets/bulkdelete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tickets" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 1
    }
}
   */

  @Post('tickets/deletepermanently')
  async deleteTicketspermanently(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url ='deleted_tickets'
      const result = await this.performZendeskAction(
        url,
        'delete',
        'DELETE',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteTicketspermanently',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tickets deletepermanently executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tickets/deletepermanently:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tickets" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {}
}
   */

  @Post('tickets/getmanydelete')
  async getmanydeleteTickets(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url ='deleted_tickets'
      const result = await this.performZendeskAction(
        url,
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tickets delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tickets/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tickets" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "ids": "13,12"
    }
}
   */

  @Post('tickets/deleteMany')
  async deleteManyTickets(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = 'deleted_tickets/destroy_many'
      const result = await this.performZendeskAction(
        url,
        'bulk',
        'DELETE',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteManyTickets',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tickets deleteMany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tickets/deleteMany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
  * [AUTO-GENERATED] Endpoint for module "comments" action "get".
  *  - Request Parameters (data): 
  * - credentialId: string
  * - data: string (ID of the record to fetch)
  * - Calls the integration helper "performZendeskAction".
  * DO NOT modify the method signature.
  *  Example usage:
  *  {
 "credentialId": "your-credential-id",
 "data": {
     "Id":"record-id"
 }
}
  */

  @Post('comments/update')
  async redactComments(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `chat_redactions`,
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'redactComments',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk comments get executed successfully`,
        result,
status: result.status
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
   * [AUTO-GENERATED] Endpoint for module "comments" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('comments/count')
  async getComments(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `tickets/${data.data.ticket_id}/comments/count`,
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk comments get executed successfully`,
        result,
status: result.status
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
   * [AUTO-GENERATED] Endpoint for module "comments" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
    "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('comments/updatecomments')
  async makecommentsprivate(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `tickets/${data.data.ticket_id}/comments/${data.data.ticket_comment_id}/make_private`,
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk comments update executed successfully`,
        result,
status: result.status
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
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
  }
 
}
   */

  @Post('comments/redactAgent')
  async deleteComments(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `comment_redactions`,
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk comments delete executed successfully`,
        result,
status: result.status
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
   * [AUTO-GENERATED] Endpoint for module "comments" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
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
      const result = await this.performZendeskAction(
        `tickets/${data.data.ticket_id}/comments`,
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk comments getmany executed successfully`,
        result,
status: result.status
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
   * [AUTO-GENERATED] Endpoint for module "attachments" action "add".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('attachments/add')
  async addAttachments(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'attachments',
        'add',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk attachments add executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in attachments/add:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "attachments" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
  }
 
}
   */

  @Post('attachments/delete')
  async deleteAttachments(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'attachments',
        'delete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk attachments delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in attachments/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "attachments" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('attachments/get')
  async getAttachments(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'attachments',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk attachments get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in attachments/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "attachments" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
    "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('attachments/update')
  async updateAttachments(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'attachments',
        'update',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk attachments update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in attachments/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_forms" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
        "data":  {
    "ticket_form": {
      "name": "New Ticktes forms 6",
      "end_user_visible": true,
      "display_name": "Snowboard Damage",
      "position": 9
        
        }
    }
    }
}
   */

  @Post('ticketforms/create')
  async createTicketforms(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const  url ='ticket_forms'
      const result = await this.performZendeskAction(
        url,
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_forms create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_forms/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_forms" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":27109647929234
    }
}
   */

  @Post('ticketforms/get')
  async getTicket_forms(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const  url ='ticket_forms'
      const result = await this.performZendeskAction(
        url,
        'get',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_forms get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_forms/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_forms" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        // "active":false
        // "associated_to_brand":false
        // "end_user_visible":false
        // "fallback_to_default":false
    }
}
   */

  @Post('ticketforms/getmany')
  async getmanyTicket_forms(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const  url ='ticket_forms'
      const result = await this.performZendeskAction(
        url,
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_forms getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_forms/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_forms" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":27109647929234
    }
}
   */

  @Post('ticketforms/delete')
  async deleteTicket_forms(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const  url ='ticket_forms'
      const result = await this.performZendeskAction(
        url,
        'delete',
        'DELETE',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_forms delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_forms/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_forms" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":37449364002193,
        "data":{
            "ticket_form": {
      "name": "Update Ticktes forms 6"
        }
    }
    }
}
   */

  @Post('ticketforms/update')
  async updateTicket_forms(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const  url ='ticket_forms'
      const result = await this.performZendeskAction(
        url,
        'update',
        'PUT',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_forms update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_forms/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_forms" action "clonetiketform".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "ticket_form_id":37414515594129,
        "data":{"prepend_clone_title": true}
    }
}
   */

  @Post('ticketforms/clonetiketform')
  async clonetiketformTicket_forms(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url =`ticket_forms/${data.data.ticket_form_id}/clone`;
      const result = await this.performZendeskAction(
        url,
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_forms clonetiketform executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_forms/clonetiketform:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_forms" action "reorderticket".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */
  // ----------------------------------

  @Post('ticketforms/createstatus')
  async reorderticketTicket_forms(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url =`ticket_forms/${data.data.ticket_form_id}/ticket_form_statuses`;
      const result = await this.performZendeskAction(
        url,
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_forms createstatus executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_forms/createstatus:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_forms" action "updatestatus".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */
// -------------------------------------
  @Post('ticketforms/updatestatus')
  async updatestatusTicket_forms(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url =`ticket_forms/${data.data.ticket_form_id}/ticket_form_statuses`
      const result = await this.performZendeskAction(
        url,
        'update',
        'PUT',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_forms updatestatus executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_forms/updatestatus:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_fields" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
             "ticket_field": {
      "type": "tagger",
      "title": "some",
      "required": false,
      "custom_field_options": [
        { "name": "Option A", "value": "option_a" },
        { "name": "Option B", "value": "option_b" }
      ]
    }
        }
    }
}
   */

  @Post('ticket_fields/create')
  async createTicketFields(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url ='ticket_fields';
      const result = await this.performZendeskAction(
        url,
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createTicketFields',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_fields create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_fields/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_fields" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 37449777908241,
        "data": {
            "ticket_field": {
                "type": "text",
                "title": "updated"
            }
        }
    }
}
   */

  @Post('ticket_fields/update')
  async updateTicketFields(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url ='ticket_fields';
      const result = await this.performZendeskAction(
        url,
        'update',
        'PUT',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateTicketFields',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_fields update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_fields/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_fields" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27110606531218
    }
}
   */

  @Post('ticket_fields/delete')
  async deleteTicketFields(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = 'ticket_fields';
      const result = await this.performZendeskAction(
        url,
        'delete',
        'DELETE',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteTicketFields',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_fields delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_fields/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_fields" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id":37449777908241
        }
    }
   */

  @Post('ticket_fields/get')
  async getTicketFields(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = 'ticket_fields'
      const result = await this.performZendeskAction(
        url,
        'get',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getTicketFields',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_fields get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_fields/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_fields" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *{
    "credentialId": "{{credentialId}}",
    "data": {
        // "creator":true
        // "locale":false
    }
}
   */

  @Post('ticket_fields/getmany')
  async getmanyTicketFields(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'ticket_fields',
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyTicketFields',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_fields getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_fields/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_fields" action "count".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {}
}
   */

  @Post('ticket_fields/count')
  async countTicketFields(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = 'ticket_fields/count'
      const result = await this.performZendeskAction(
        url,
        'get',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'countTicketFields',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_fields count executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_fields/count:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_fields" action "count".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *{
    "credentialId": "{{credentialId}}",
    "data": {
        "ticket_field_id": 27111166177426,
        "data": {
            "custom_field_option": {
                "name": "Harish",
                "position": 2,
                "value": "unlimited"
            }
        }
    }
}
   */

  @Post('ticket_fields/createoptions')
  async createTicketFieldsoptions(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url =`ticket_fields/${data.data.ticket_field_id}/options`
      const result = await this.performZendeskAction(
        url,
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createTicketFieldsoptions',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_fields count executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_fields/getmanyTickets:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_fields" action "count".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "ticket_field_id": 37451247829777
    }
}
   */

  @Post('ticket_fields/getmanyTickets')
  async getmanysTicketFieldsoptions(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url =`ticket_fields/${data.data.ticket_field_id}/options`
      const result = await this.performZendeskAction(
        url,
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanysTicketFieldsoptions',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_fields count executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_fields/getmanyTickets:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_fields" action "count".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "ticket_field_id": 27111166177426,
        "Id": 27111188629266
    }
}
   */

  @Post('ticket_fields/getfieldoptions')
  async getsTicketFields(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = `ticket_fields/${data.data.ticket_field_id}/options`;
      const result = await this.performZendeskAction(
        url,
        'get',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getsTicketFields',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_fields count executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_fields/count:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_fields" action "count".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "ticket_field_id": 27111166177426,
        "Id": 27111188629266
    }
}
   */

  @Post('ticket_fields/deletesfields')
  async deletesTicketFields(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = `ticket_fields/${data.data.ticket_field_id}/options`;
      const result = await this.performZendeskAction(
        url,
        'delete',
        'DELETE',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deletesTicketFields',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_fields count executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_fields/count:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  /**
 * [AUTO-GENERATED] Endpoint for module "ticket_fields" action "count".
 *  - Request Parameters (data): 
 * - credentialId: string
 * - ModuleData: object (action-specific'get', data)
 * - Calls the integration helper "performZendeskAction".
 * DO NOT modify the method signature.
 *  Example usage:
 *{
  "credentialId": "{{credentialId}}",
  "data": {
      "data": {
          "ticket_field_ids": [
              27110579937298
          ]
      }
  }
}
 */

  @Post('ticket_fields/reorder')
  async reorderTicketFields(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = `ticket_fields/reorder`;
      const result = await this.performZendeskAction(
        url,
        'update',
        'PUT',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'reorderTicketFields',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_fields reorder executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_fields/reorder:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "requests" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "request": {
                "subject": "Help!",
                "comment": {
                    "body": "New 5 "
                }
            }
        }
    }
}
   */

  @Post('requests/create')
  async createRequests(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = 'requests'
      const result = await this.performZendeskAction(
        url,
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createRequests',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk requests create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in requests/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "requests" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 15,
        "data": {
            "request": {
                "comment": {
                    "description    ": "Thanks!"
                }
            }
        }
    }
}
   */

  @Post('requests/update')
  async updateRequests(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = 'requests'
      const result = await this.performZendeskAction(
        url,
        'update',
        'PUT',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateRequests',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk requests update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in requests/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "requests" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {

        // "sort_by":"2025-07-23T08:42:57Z"
        "sort_order":"desc"
    }
}
   */

  @Post('requests/getmany')
  async getmanyRequests(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = 'requests';
      const result = await this.performZendeskAction(
        url,
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyRequests',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk requests getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in requests/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "requests" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *{
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 20
    }
}
   */

  @Post('requests/get')
  async getRequests(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url ='requests'
      const result = await this.performZendeskAction(
        url,
        'get',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getRequests',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk requests get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in requests/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "requests" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {}
}
   */

  @Post('requests/search')
  async seachRequests(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url ='requests/search'
      const result = await this.performZendeskAction(
        url,
        'search',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'seachRequests',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk requests search executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in requests/search:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "imports" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data":{
  "ticket": {
    "comments": [
      {
        "value": "New Imports"
    
    }
    ]
  }
        }
    }
}
   */

  @Post('imports/create')
  async createImports(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = 'imports/tickets'
      const result = await this.performZendeskAction(
        url,
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createImports',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk imports create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in imports/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "imports" action "bulkcreate".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data":{
  "tickets":[ {
    "comments": [
      {
        "value": "New Imports"
    
    }
    ]
  }
  ]
        }
    }
}
   */

  @Post('imports/bulkcreate')
  async bulkcreateImports(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = 'imports/tickets/create_many';
      const result = await this.performZendeskAction(
        url,
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'bulkcreateImports',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk imports bulkcreate executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in imports/bulkcreate:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "audits" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
  "page[size]":1
//   "page[after]":"eyJvIjoiY3JlYXRlZF9hdCxpZCIsInYiOiJaSkdnZ0dnQUFBQUFhWkc3WGJnSUlnQUEifQ"
    }
}
   */

  @Post('audits/getmany')
  async getmanyAudits(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = audit_next_cursor ? `ticket_audits?page[after]=${audit_next_cursor}` : 'ticket_audits';
      const result = await this.performZendeskAction(
        url,
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyAudits',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      if(result.response.meta.after_cursor){
        audit_next_cursor = result.response.meta.after_cursor;
      }
      return res.json({
        message: `Zendesk audits getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in audits/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "audits" action "listaudits".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "ticket_id":1

  
    }
}
   */

  @Post('audits/listaudits')
  async listauditsAudits(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = `tickets/${data.data.ticket_id}/audits`
      const result = await this.performZendeskAction(
        url,
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'listauditsAudits',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk audits listaudits executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in audits/listaudits:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "audits" action "countaudits".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "ticket_id":1

  
    }
}
   */

  @Post('audits/countaudits')
  async countauditsAudits(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url =`tickets/${data.data.ticket_id}/audits/count`
      const result = await this.performZendeskAction(
        url,
        'countaudits',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'countauditsAudits',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk audits countaudits executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in audits/countaudits:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "audits" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "ticket_id":1,
        "Id":37414540778769

  
    }
}
   */

  @Post('audits/get')
  async getAudits(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url =`tickets/${data.data.ticket_id}/audits`;
      const result = await this.performZendeskAction(
        url,
        'get',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getAudits',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk audits get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in audits/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "audits" action "changecomments".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
         "ticket_id":1,
        "ticket_audit_id":37414540778769
       


    }
}
   */

  @Post('audits/changecomments')
  async changecommentsAudits(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url =`tickets/${data.data.ticket_id}/audits/${data.data.ticket_audit_id}/make_private`;
      const result = await this.performZendeskAction(
        url,
        'changecomments',
        'PUT',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'changecommentsAudits',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk audits changecomments executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in audits/changecomments:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_metrics" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 37449134974097
    }
}
   */

  @Post('ticket_metrics/get')
  async getTicketMetrics(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = `ticket_metrics`;
      const result = await this.performZendeskAction(
        url,
        'get',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getTicketMetrics',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_metrics get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_metrics/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_metrics" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "page[size]":1
    }
}
   */

  @Post('ticket_metrics/getmany')
  async getmanyTicketMetrics(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = ticket_metrics_next_cursor ? `ticket_metrics?page[after]=${ticket_metrics_next_cursor}` : 'ticket_metrics';
      const result = await this.performZendeskAction(
        url,
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyTicketMetrics',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      if(result.response.meta.after_cursor){
        ticket_metrics_next_cursor = result.response.meta.after_cursor;
      }
      return res.json({
        message: `Zendesk ticket_metrics getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_metrics/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "activities" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27078036078866
    }
}
   */

  @Post('activities/get')
  async getActivities(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url ='activities';
      const result = await this.performZendeskAction(
        url,
        'get',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getActivities',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk activities get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in activities/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "activities" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        // "since":"2025-07-23T04:38:54Z"
        "page[size]":1
    }
}
   */

  @Post('activities/getmany')
  async getmanyActivities(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = activities_next_cursor ? `activities?page[after]=${activities_next_cursor}` : 'activities';
      const result = await this.performZendeskAction(
        url,
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyActivities',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      if(result.response.meta.after_cursor){
        activities_next_cursor = result.response.meta.after_cursor;
      }
      return res.json({
        message: `Zendesk activities getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in activities/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "activities" action "count".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {}
}
   */

  @Post('activities/count')
  async countActivities(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = 'activities/count'
      const result = await this.performZendeskAction(
        url,
        'count',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'countActivities',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk activities count executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in activities/count:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "skips" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *{
    "credentialId": "{{credentialId}}",
    "data": {
        "ticket_id":1,
        "page[size]":1
    }
}
   */

  @Post('skips/getmany')
  async getmanySkips(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = sikps_next_cursor ? `tickets/${data.data.ticket_id}/skips?page[after]=${sikps_next_cursor}` : `tickets/${data.data.ticket_id}/skips`;
      const result = await this.performZendeskAction(
        url,
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanySkips',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      if( result.response.meta.after_cursor) {
        sikps_next_cursor = result.response.meta.after_cursor;
      }
      return res.json({
        message: `Zendesk skips getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in skips/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "skips" action "record".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "skip": {
                "ticket_id": 1,
                "reason": "I have no idea."
            }
        }
    }
}
   */

  @Post('skips/record')
  async recordSkips(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = 'skips'
      const result = await this.performZendeskAction(
        url,
        'record',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'recordSkips',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk skips record executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in skips/record:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  
 

  /**
   * [AUTO-GENERATED] Endpoint for module "email_notifications" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id":"37451995904017"
    }
}
   */

  @Post('email_notifications/get')
  async getEmailNotifications(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = 'email_notifications';
      const result = await this.performZendeskAction(
        url,
        'get',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getEmailNotifications',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk email_notifications get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in email_notifications/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "email_notifications" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "comment_ids":"37451995902481",
        "ids":"37451995904017",
        "ticket_ids":"20"
      
    }
}
   */

  @Post('email_notifications/getmany')
  async getmanyEmailNotifications(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url= 'email_notifications'
      const result = await this.performZendeskAction(
        url,
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyEmailNotifications',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk email_notifications getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in email_notifications/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "email_notifications" action "showMany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *   {
    "credentialId": "{{credentialId}}",
    "data": {
        "comment_ids":"37451995902481",
        "ids":"37451995904017",
        "ticket_ids":"20"
      
    }
}
   */

  @Post('email_notifications/showMany')
  async showmanyEmailNotifications(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = `email_notifications?comment_ids=${data.data.comment_ids}&ids=${data.data.ids}&ticket_ids=${data.data.ticket_ids}`
      const result = await this.performZendeskAction(
        url,
        'showmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'showmanyEmailNotifications',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk email_notifications showMany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in email_notifications/showMany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "customticketstatuses" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('customticketstatuses/create')
  async createcustomticketstatuses(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'custom_statuses',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk customticketstatuses create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in customticketstatuses/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "customticketstatuses" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
    "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('customticketstatuses/update')
  async updatecustomticketstatuses(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'custom_statuses',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk customticketstatuses update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in customticketstatuses/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "customticketstatuses" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('customticketstatuses/get')
  async getcustomticketstatuses(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'custom_statuses',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk customticketstatuses get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in customticketstatuses/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "customticketstatuses" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('customticketstatuses/getmany')
  async getmanycustomticketstatuses(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'custom_statuses',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk customticketstatuses getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in customticketstatuses/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "customticketstatuses" action "bulkupdate".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('customticketstatuses/createfrom')
  async createticketfromstatus(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `custom_statuses/${data.data.custom_status_id}/ticket_form_statuses`,
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk customticketstatuses bulkupdate executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in customticketstatuses/bulkupdate:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sharing_agreements" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "sharing_agreement": {
                "remote_subdomain": "smackcoders4942"
            }
        }
    }
}  */

  @Post('sharing_agreements/create')
  async createSharing_agreements(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'sharing_agreements',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk sharing_agreements create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in sharing_agreements/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sharing_agreements" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27136765253650,
        "data": {
            "sharing_agreement": {
                "status": "accepted"
            }
        }
    }
}
   */

  @Post('sharing_agreements/update')
  async updateSharing_agreements(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'sharing_agreements',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk sharing_agreements update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in sharing_agreements/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sharing_agreements" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27136980527122
    }
}
   */

  @Post('sharing_agreements/delete')
  async deleteSharing_agreements(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'sharing_agreements',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk sharing_agreements delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in sharing_agreements/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sharing_agreements" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27136765253650
    }
}
   */

  @Post('sharing_agreements/get')
  async getSharing_agreements(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'sharing_agreements',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk sharing_agreements get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in sharing_agreements/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sharing_agreements" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
     
    }
}
   */

  @Post('sharing_agreements/getmany')
  async getmanySharing_agreements(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'sharing_agreements',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk sharing_agreements getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in sharing_agreements/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_form_statuses" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {}
}
   */

  @Post('ticket_form_statuses/getmany')
  async getmanyTicket_form_statuses(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'ticket_form_statuses',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_form_statuses getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_form_statuses/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_form_statuses" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
  }
 
}
   */

  @Post('ticket_form_statuses/delete')
  async deleteTicket_form_statuses(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `ticket_forms/${data.data.ticket_form_id}/ticket_form_statuses`,
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_form_statuses delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_form_statuses/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_form_statuses" action "deletestatus".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "ticket_form_id": 27137130880786,
        "Id": "01JWTH4XNBX6BTGQ1QRWMTMWDH"
    }
} */

  @Post('ticket_form_statuses/deletestatus')
  async deletestatusTicket_form_statuses(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `ticket_forms/${data.data.ticket_form_id}/ticket_form_statuses`,
        'deletestatus',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_form_statuses deletestatus executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_form_statuses/deletestatus:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "conversation_log" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "ticket_id":27
    }
}
   */

  @Post('conversation_log/getmany')
  async getmanyConversation_log(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `tickets/${data.data.ticket_id}/conversation_log`,
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk conversation_log getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in conversation_log/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "users" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "user": {
                "name": "Harish",
                "email": "harishnarayananh1786@gmail.com"
            }
        }
    }
}
   */

  @Post('users/create')
  async createUsers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'users',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk users create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in users/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "users" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {}
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
      const result = await this.performZendeskAction(
        'users',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk users getmany executed successfully`,
        result,
status: result.status
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
   * [AUTO-GENERATED] Endpoint for module "users" action "search".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {}
}
   */

  @Post('users/search')
  async searchUsers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'users/search',
        'search',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk users search executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in users/search:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "users" action "autocomplete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('users/autocomplete')
  async autocompleteUsers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'users',
        'autocomplete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk users autocomplete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in users/autocomplete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "users" action "count".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('users/count')
  async countUsers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'users/count',
        'count',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk users count executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in users/count:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "users" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27137847635346
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
      const result = await this.performZendeskAction(
        'users',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk users get executed successfully`,
        result,
status: result.status
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
   * [AUTO-GENERATED] Endpoint for module "users" action "showmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {}
}
   */

  @Post('users/showmany')
  async showmanyUsers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'users/show_many',
        'showmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk users showmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in users/showmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "users" action "getinformation".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "user_id": 27137847635346
    }
}
   */

  @Post('users/getinformation')
  async getinformationUsers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `users/${data.data.user_id}/related`,
        'getinformation',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk users getinformation executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in users/getinformation:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "users" action "getself".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {}
}
   */

  @Post('users/getself')
  async getselfUsers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'users/me',
        'getself',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk users getself executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in users/getself:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "users" action "creatmanyeusers".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('users/creatmanyeusers')
  async creatmanyeusersUsers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'users/create_many',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk users creatmanyeusers executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in users/creatmanyeusers:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "users" action "creatmanyeusers".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('users/request')
  async requestusersUsers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'users/request_create',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'requestusersUsers',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk users requestusersUsers executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in users/creatmanyeusers:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "users" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27139384475922,
        "data": {
            "user": {
                "name": "Roshan"
            }
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
      const result = await this.performZendeskAction(
        'users',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk users update executed successfully`,
        result,
status: result.status
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
   * [AUTO-GENERATED] Endpoint for module "users" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
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
      const result = await this.performZendeskAction(
        'users',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk users delete executed successfully`,
        result,
status: result.status
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
   * [AUTO-GENERATED] Endpoint for module "users" action "bulkdelete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('users/bulkdelete')
  async bulkdeleteUsers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'users/destroy_many',
        'bulkdelete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk users bulkdelete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in users/bulkdelete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "users" action "bulkdelete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('users/getdeleteuser')
  async getdeleteUsers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'deleted_users',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk users bulkdelete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in users/bulkdelete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "users" action "permanentldelete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('users/permanentldelete')
  async permanentldeleteUsers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'deleted_users',
        'permanentldelete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk users permanentldelete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in users/permanentldelete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "users" action "getdeleteusers".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('users/getdeleteusers')
  async getdeleteusersUsers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'users',
        'getdeleteusers',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk users getdeleteusers executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in users/getdeleteusers:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
 * [AUTO-GENERATED] Endpoint for module "users" action "getdeleteusers".
 *  - Request Parameters (data): 
 * - credentialId: string
 * - ModuleData: object (action-specific'get', data)
 * - Calls the integration helper "performZendeskAction".
 * DO NOT modify the method signature.
 *  Example usage:
 *  {
"credentialId": "your-credential-id",
"ModuleData": {
  "key": "value"
}
}
 */

  @Post('users/getmanydeleteusers')
  async getmanydeleteusersUsers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'deleted_users',
        'getmanydeleteusers',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanydeleteusersUsers',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk users getmanydeleteusersUsers executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in users/getmanydeleteusersUsers:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "identities" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "user_id": 27141584312978,
        "data": {
            "identity": {
                "type": "email",
                "value": "yousuf@gmail.com"
            }
        }
    }
}
   */

  @Post('identities/create')
  async createIdentities(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `users/${data.data.user_id}/identities`,
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk identities create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in identities/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "identities" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "user_id": 27141584312978,
        "Id": 27141662466322
    }
}
   */

  @Post('identities/get')
  async getIdentities(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `users/${data.data.user_id}/identities`,
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk identities get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in identities/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "identities" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "user_id": 27141584312978,
        "Id": 27141662466322,
        "data": {
            "identity": {
                "type": "email",
                "value": "sanjaykumar910@gmail.com"
            }
        }
    }
}
   */

  @Post('identities/update')
  async updateIdentities(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `users/${data.data.user_id}/identities`,
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk identities update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in identities/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "identities" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "user_id": 27141584312978,
        "Id": 27141904137874
    }
}
   */

  @Post('identities/delete')
  async deleteIdentities(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `users/${data.data.user_id}/identities`,
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk identities delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in identities/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "identities" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "user_id": 27141584312978
    }
}  */

  @Post('identities/getmany')
  async getmanyIdentities(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `users/${data.data.user_id}/identities`,
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk identities getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in identities/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "identities" action "verify".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "user_id": 27141584312978,
        "user_identity_id": 27141662466322,
        "data": {}
    }
}
}
   */

  @Post('identities/verify')
  async verifyIdentities(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `users/${data.data.user_id}/identities/${data.data.user_identity_id}/verify`,
        'verify',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk identities verify executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in identities/verify:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "identities" action "make".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "user_id": 27141584312978,
        "user_identity_id": 27141662466322,
        "data": {}
    }
}
   */

  @Post('identities/make')
  async makeIdentities(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `users/${data.data.user_id}/identities/${data.data.user_identity_id}/make_primary`,
        'make',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk identities make executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in identities/make:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "profiles" action "getprofilesbyuserid".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('profiles/getprofilesbyuserid')
  async getprofilesbyuseridProfiles(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `users/${data.data.user_id}/profiles`,
        'getprofilesbyuserid',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk profiles getprofilesbyuserid executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in profiles/getprofilesbyuserid:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "profiles" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('profiles/get')
  async getProfiles(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'profiles',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk profiles get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in profiles/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "profiles" action "getidentifier".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('profiles/getidentifier')
  async getidentifierProfiles(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'profiles',
        'getidentifier',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk profiles getidentifier executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in profiles/getidentifier:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "profiles" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('profiles/create')
  async createProfiles(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'profiles',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk profiles create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in profiles/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "profiles" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
    "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('profiles/update')
  async updateProfiles(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'profiles',
        'update',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk profiles update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in profiles/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "profiles" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
  }
 
}
   */

  @Post('profiles/delete')
  async deleteProfiles(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'profiles',
        'delete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk profiles delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in profiles/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "user_events" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('user_events/get')
  async getUser_events(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'user_events',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk user_events get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in user_events/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "user_events" action "geteventsbysunshineprofile".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('user_events/geteventsbysunshineprofile')
  async geteventsbysunshineprofileUser_events(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'user_events',
        'geteventsbysunshineprofile',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk user_events geteventsbysunshineprofile executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(
        `Error in user_events/geteventsbysunshineprofile:`,
        error,
      );
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "user_events" action "geteventsbysunshineprofileid".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('user_events/geteventsbysunshineprofileid')
  async geteventsbysunshineprofileidUser_events(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'user_events',
        'geteventsbysunshineprofileid',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk user_events geteventsbysunshineprofileid executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(
        `Error in user_events/geteventsbysunshineprofileid:`,
        error,
      );
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "user_events" action "trackeventzendesk".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('user_events/trackeventzendesk')
  async trackeventzendeskUser_events(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'user_events',
        'trackeventzendesk',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk user_events trackeventzendesk executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in user_events/trackeventzendesk:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "user_events" action "trackeventsunshine".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('user_events/trackeventsunshine')
  async trackeventsunshineUser_events(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'user_events',
        'trackeventsunshine',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk user_events trackeventsunshine executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in user_events/trackeventsunshine:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "user_events" action "trackeventbyid".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('user_events/trackeventbyid')
  async trackeventbyidUser_events(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'user_events',
        'trackeventbyid',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk user_events trackeventbyid executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in user_events/trackeventbyid:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "user_fields" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "user_field": {
                "type": "text",
                "title": "User fields Title ",
                "active": true,
                "key": "new_description"
            }
        }
    }
}
   */

  @Post('user_fields/create')
  async createUser_fields(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'user_fields',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk user_fields create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in user_fields/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "user_fields" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27142647128338,
        "data": {
            "user_field": {
                "type": "text",
                "title": "Updated title ",
                "active": true,
                "key": "new_description"
            }
        }
    }
}
   */

  @Post('user_fields/update')
  async updateUser_fields(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'user_fields',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk user_fields update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in user_fields/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "user_fields" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27142588268562
    }
}
   */

  @Post('user_fields/delete')
  async deleteUser_fields(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'user_fields',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk user_fields delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in user_fields/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "user_fields" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27142647128338
    }
}
   */

  @Post('user_fields/get')
  async getUser_fields(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'user_fields',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk user_fields get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in user_fields/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "user_fields" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {}
}
   */

  @Post('user_fields/getmany')
  async getmanyUser_fields(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'user_fields',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk user_fields getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in user_fields/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "password" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('password/getmany')
  async getmanyPassword(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'password',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk password getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in password/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "password" action "change".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('password/change')
  async changePassword(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `users/${data.data.user_id}/password`,
        'change',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk password change executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in password/change:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "password" action "set".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('password/set')
  async setPassword(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `users/${data.data.user_id}/password`,
        'set',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk password set executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in password/set:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organizations" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "organization": {
                "name": "My Organization 5"
            }
        }
    }
} */

  @Post('organizations/create')
  async createOrganizations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'organizations',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organizations create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organizations/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organizations" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27159225440530,
        "data": {
            "organization": {
                "name": "Update Organization"
            }
        }
    }
}
   */

  @Post('organizations/update')
  async updateOrganizations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'organizations',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organizations update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organizations/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organizations" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27159225440530
    }
}
   */

  @Post('organizations/get')
  async getOrganizations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'organizations',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organizations get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organizations/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organizations" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {}
}
   */

  @Post('organizations/getmany')
  async getmanyOrganizations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'organizations',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organizations getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organizations/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organizations" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27159544662930
    }
}
   */

  @Post('organizations/delete')
  async deleteOrganizations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'organizations',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organizations delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organizations/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organizations" action "count".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {}
}
   */

  @Post('organizations/count')
  async countOrganizations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'organizations/count',
        'count',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organizations count executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organizations/count:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organizations" action "autocomplete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "name": "My Organization 4"
    }
}
   */

  @Post('organizations/autocomplete')
  async autocompleteOrganizations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `organizations/autocomplete?name=${data.data.name}`,
        'autocomplete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organizations autocomplete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organizations/autocomplete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organizations" action "search".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "name": "My Organization 4"
    }
}
   */

  @Post('organizations/search')
  async searchOrganizations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `organizations/search?name=${data.data.name}`,
        'search',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organizations search executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organizations/search:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organizations" action "bulkdelete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "ids": "27159521085458,27159521156882"
    }
}
   */

  @Post('organizations/bulkdelete')
  async bulkdeleteOrganizations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'organizations/destroy_many',
        'bulkdelete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organizations bulkdelete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organizations/bulkdelete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organizations" action "createmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "organizations": [
                {
                    "name": "Organization 1"
                },
                {
                    "name": "Organization 2"
                }
            ]
        }
    }
}  */

  @Post('organizations/createmany')
  async createmanyOrganizations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'organizations/create_many',
        'createmany',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organizations createmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organizations/createmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organizations" action "updatemany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('organizations/updatemany')
  async updatemanyOrganizations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'organizations/update_many',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organizations updatemany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organizations/updatemany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organization_memberships" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "organization_membership": {
                "user_id": 27141584312978,
                "organization_id": 27161447198994
            }
        }
    }
}
   */

  @Post('organization_memberships/create')
  async createOrganization_memberships(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'organization_memberships',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organization_memberships create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organization_memberships/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organization_memberships" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27163933604370
    }
}
   */

  @Post('organization_memberships/get')
  async getOrganization_memberships(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'organization_memberships',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organization_memberships get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organization_memberships/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organization_memberships" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {}
}
   */

  @Post('organization_memberships/getmany')
  async getmanyOrganization_memberships(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `organization_memberships`,
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organization_memberships getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organization_memberships/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organization_memberships" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27077993217938
    }
}
   */

  @Post('organization_memberships/delete')
  async deleteOrganization_memberships(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'organization_memberships',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organization_memberships delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organization_memberships/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organization_memberships" action "setmembership".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "user_id":27141584312978,
        "organization_membership_id":27164577394194,
        "data":{}
    }
}
   */

  @Post('organization_memberships/setmembership')
  async setmembershipOrganization_memberships(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `users/${data.data.user_id}/organization_memberships/${data.data.organization_membership_id}/make_default`,
        'setmembership',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organization_memberships setmembership executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(
        `Error in organization_memberships/setmembership:`,
        error,
      );
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organization_memberships" action "set".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "user_id":27141584312978,
        "organization_id":27159225440530,
        "data":{}
    }
}
   */

  @Post('organization_memberships/set')
  async setOrganization_memberships(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `users/${data.data.user_id}/organizations/${data.data.organization_id}/make_default`,
        'set',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organization_memberships set executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organization_memberships/set:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organization_memberships" action "unassign".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "user_id":27141584312978,
        "Id":27159225440530

    }
}
   */

  @Post('organization_memberships/unassign')
  async unassignOrganization_memberships(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `users/${data.data.user_id}/organizations`,
        'unassign',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organization_memberships unassign executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organization_memberships/unassign:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organization_fields" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "organization_field": {
                "type": "text",
                "title": "New title 1",
                "key": "supports_description"
            }
        }
    }
}  */

  @Post('organization_fields/create')
  async createOrganization_fields(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'organization_fields',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organization_fields create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organization_fields/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organization_fields" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27167198172818,
        "data": {
            "organization_field": {
                "type": "text",
                "title": "update discription "
            }
        }
    }
}
   */

  @Post('organization_fields/update')
  async updateOrganization_fields(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'organization_fields',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organization_fields update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organization_fields/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organization_fields" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27167889450642
    }
}
   */

  @Post('organization_fields/delete')
  async deleteOrganization_fields(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'organization_fields',
        'delete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organization_fields delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organization_fields/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organization_fields" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27167889450642
    }
}
   */

  @Post('organization_fields/get')
  async getOrganization_fields(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'organization_fields',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organization_fields get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organization_fields/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "organization_fields" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
       
}
   */

  @Post('organization_fields/getmany')
  async getmanyOrganization_fields(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'organization_fields',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk organization_fields getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in organization_fields/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "lookup_relationship_fields" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('lookup_relationship_fields/create')
  async createLookup_relationship_fields(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'lookup_relationship_fields',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk lookup_relationship_fields create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in lookup_relationship_fields/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "lookup_relationship_fields" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('lookup_relationship_fields/get')
  async getLookup_relationship_fields(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'lookup_relationship_fields',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk lookup_relationship_fields get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in lookup_relationship_fields/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "lookup_relationship_fields" action "filetr".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('lookup_relationship_fields/filetr')
  async filetrLookup_relationship_fields(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'lookup_relationship_fields',
        'filetr',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk lookup_relationship_fields filetr executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in lookup_relationship_fields/filetr:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "groups" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "group": {
                "name": "New Groups 5"
            }
        }
    }
}
   */

  @Post('groups/create')
  async createGroups(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'groups',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk groups create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in groups/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "groups" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27170531054098
    }
}
   */

  @Post('groups/get')
  async getGroups(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'groups',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk groups get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in groups/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "groups" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27170531054098,
        "data": {
            "group": {
                "name": "update Groups"
            }
        }
    }
}
   */

  @Post('groups/update')
  async updateGroups(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'groups',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk groups update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in groups/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "groups" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
       
     
    }
}
   */

  @Post('groups/getmany')
  async getmanyGroups(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'groups',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk groups getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in groups/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "groups" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id":27170531054098
     
    }
}
   */

  @Post('groups/delete')
  async deleteGroups(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'groups',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk groups delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in groups/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "groups" action "count".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {}
}
   */

  @Post('groups/count')
  async countGroups(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'groups/count',
        'count',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk groups count executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in groups/count:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  /**
   * [AUTO-GENERATED] Endpoint for module "incremental_exports" action "ticketcursor".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "start_time": 1
    }
}
   */

  @Post('incremental_exports/ticketcursor')
  async ticketcursorIncremental_exports(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `incremental/tickets/cursor?start_time=${data.data.start_time}`,
        'ticketcursor',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk incremental_exports ticketcursor executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in incremental_exports/ticketcursor:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "incremental_exports" action "tickettime".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "start_time": 1
    }
}  */

  @Post('incremental_exports/tickettime')
  async tickettimeIncremental_exports(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `incremental/tickets?start_time=${data.data.start_time}`,
        'tickettime',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk incremental_exports tickettime executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in incremental_exports/tickettime:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "incremental_exports" action "usercursor".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "start_time": 1
    }
}
   */

  @Post('incremental_exports/usercursor')
  async usercursorIncremental_exports(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `incremental/users/cursor?start_time=${data.data.start_time}`,
        'usercursor',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk incremental_exports usercursor executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in incremental_exports/usercursor:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tags" action "add".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "ticket_id": 29,
        "data": {
            "tags": [
                "customer"
            ]
        }
    }
}
   */

  @Post('tags/add')
  async addTags(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `tickets/${data.data.ticket_id}/tags`,
        'add',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tags add executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tags/add:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tags" action "remove".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "ticket_id": 29,
        "data": {
            "tags": [
                "customer"
            ]
        }
    }
}
   */

  @Post('tags/remove')
  async removeTags(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `tickets/${data.data.ticket_id}/tags`,
        'remove',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tags remove executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tags/remove:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tags" action "set".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "ticket_id": 29,
        "data": {
            "tags": [
                "attempt"
            ]
        }
    }
}
   */

  @Post('tags/set')
  async setTags(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `tickets/${data.data.ticket_id}/tags`,
        'set',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tags set executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tags/set:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tags" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
       
    }
}
   */

  @Post('tags/getmany')
  async getmanyTags(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'tags',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tags getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tags/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tags" action "count".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {}
}
   */

  @Post('tags/count')
  async countTags(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'tags/count',
        'count',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tags count executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tags/count:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tags" action "search".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "name": "im"
    }
}
   */

  @Post('tags/search')
  async searchTags(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `autocomplete/tags.json?name=${data.data.name}`,
        'search',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tags search executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tags/search:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "job_statuses" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"V3-bba4e0e057ea7917f408b23aa0fcfb18"
    }
}
   */

  @Post('job_statuses/get')
  async getJob_statuses(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'job_statuses',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk job_statuses get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in job_statuses/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "job_statuses" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId":"{{credentialId}}",
    "data":{
       
    }
}
   */

  @Post('job_statuses/getmany')
  async getmanyJob_statuses(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'job_statuses',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk job_statuses getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in job_statuses/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "job_statuses" action "showmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('job_statuses/showmany')
  async showmanyJob_statuses(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `job_statuses/show_many?ids=${data.data.ids}`,
        'showmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk job_statuses showmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in job_statuses/showmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "items" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('items/create')
  async createItems(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'dynamic_content/items',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk items create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in items/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "items" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *{
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27194935352338,
        "data": {
            "item": {
                "name": "Updated Items",
                "default_locale_id": 16,
                "variants": [
                    {
                        "locale_id": 16,
                        "default": true,
                        "content": "Voici mon contenu dynamique en français"
                    },
                    {
                        "locale_id": 2,
                        "default": false,
                        "content": "Este es mi contenido dinámico en español"
                    }
                ]
            }
        }
    }
}
   */

  @Post('items/update')
  async updateItems(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'dynamic_content/items',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk items update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in items/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "items" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27194935352338
    }
}
   */

  @Post('items/get')
  async getItems(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `dynamic_content/items`,
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk items get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in items/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "items" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {}
}
   */

  @Post('items/getmany')
  async getmanyItems(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'dynamic_content/items',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk items getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in items/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "items" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27194935352338
    }
}
   */

  @Post('items/delete')
  async deleteItems(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'dynamic_content/items',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk items delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in items/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "variants" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "{{credentialId}}",
  "data": {
    "dynamic_content_item_id": 27194989054482,
    "data": {
      "variant": {
        "locale_id": 2,
        "active": true,
        "default": false,
        "content": "New variants"
      }
    }
  }
}

   */

  @Post('variants/create')
  async createVariants(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `dynamic_content/items/${data.data.dynamic_content_item_id}/variants`,
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk variants create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in variants/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "variants" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "dynamic_content_item_id": 27194989054482,
        "Id": 27196039072018
    }
}
   */

  @Post('variants/get')
  async getVariants(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `dynamic_content/items/${data.data.dynamic_content_item_id}/variants`,
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk variants get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in variants/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "variants" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "dynamic_content_item_id": 27194989054482
    }
}
   */

  @Post('variants/getmany')
  async getmanyVariants(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `dynamic_content/items/${data.data.dynamic_content_item_id}/variants`,
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk variants getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in variants/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "variants" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "dynamic_content_item_id": 27194989054482,
        "Id": 27196039072018,
        "data": {
            "variant": {
                "content": "New variants"
            }
        }
    }
}
   */

  @Post('variants/update')
  async updateVariants(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `dynamic_content/items/${data.data.dynamic_content_item_id}/variants`,
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk variants update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in variants/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "variants" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "dynamic_content_item_id": 27194989054482,
        "Id": 27194989054866
    }
}
   */

  @Post('variants/delete')
  async deleteVariants(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `dynamic_content/items/${data.data.dynamic_content_item_id}/variants`,
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk variants delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in variants/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "schedules" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "schedule": {
                "name": "East Coast"
            }
        }
    }
}
   */

  @Post('schedules/create')
  async createSchedules(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'business_hours/schedules',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk schedules create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in schedules/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "schedules" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id":27198398306834,
        "data": {
            "schedule": {
                "name": "update schedules"
            }
    }}
}
   */

  @Post('schedules/update')
  async updateSchedules(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'business_hours/schedules',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk schedules update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in schedules/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "schedules" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27198398306834
    }
}
   */

  @Post('schedules/delete')
  async deleteSchedules(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'business_hours/schedules',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk schedules delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in schedules/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "schedules" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id":27198398306834
    }
}
   */

  @Post('schedules/get')
  async getSchedules(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'business_hours/schedules',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk schedules get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in schedules/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "schedules" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        
    }
}
   */

  @Post('schedules/getmany')
  async getmanySchedules(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'business_hours/schedules',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk schedules getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in schedules/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "schedules_holiday" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "schedule_id": 27198953936530,
        "data": {
            "holiday": {
                "name": "New Year 5",
                "start_date": "2025-05-30",
                "end_date": "2025-06-02"
            }
        }
    }
}
   */

  @Post('schedules_holiday/create')
  async createSchedules_holiday(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `business_hours/schedules/${data.data.schedule_id}/holidays`,
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk schedules_holiday create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in schedules_holiday/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "schedules_holiday" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
         "schedule_id": 27198953936530,
        "Id":27199028366994,
        
        "data": {
            "holiday": {
                "name": "Update New Year"
            }
        }
    }
}
   */

  @Post('schedules_holiday/update')
  async updateSchedules_holiday(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `business_hours/schedules/${data.data.schedule_id}/holidays`,
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk schedules_holiday update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in schedules_holiday/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "schedules_holiday" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "schedule_id": 27198953936530,
        "Id": 27199028366994
    }
}
   */

  @Post('schedules_holiday/delete')
  async deleteSchedules_holiday(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `business_hours/schedules/${data.data.schedule_id}/holidays`,
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk schedules_holiday delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in schedules_holiday/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "schedules_holiday" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "schedule_id": 27198953936530,
        "Id": 27199028366994
    }
}
   */

  @Post('schedules_holiday/get')
  async getSchedules_holiday(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `business_hours/schedules/${data.data.schedule_id}/holidays`,
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk schedules_holiday get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in schedules_holiday/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "schedules_holiday" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "schedule_id": 27198953936530
    }
}
   */

  @Post('schedules_holiday/getmany')
  async getmanySchedules_holiday(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `business_hours/schedules/${data.data.schedule_id}/holidays`,
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk schedules_holiday getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in schedules_holiday/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "skill-based_routing" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
      
    }
}
   */

  @Post('skill-based_routing/getmany')
  async getmanySkillbased_routing(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'routing/attributes',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk skill-based_routing getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in skill-based_routing/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "skill-based_routing" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
       "Id":"eff7a67a-41eb-11f0-ac2f-1b1022c812df"
    }
}
   */

  @Post('skill-based_routing/get')
  async getSkillbased_routing(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'routing/attributes',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk skill-based_routing get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in skill-based_routing/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "skill-based_routing" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "attribute": {
                "name": "Language 6"
            }
        }
    }
} */

  @Post('skill-based_routing/create')
  async createSkillbased_routing(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `routing/attributes`,
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk skill-based_routing create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in skill-based_routing/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "skill-based_routing" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "eff7a67a-41eb-11f0-ac2f-1b1022c812df",
        "data": {
            "attribute": {
                "name": "Update Language"
            }
        }
    }
}  */

  @Post('skill-based_routing/update')
  async updateSkillbased_routing(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'routing/attributes',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk skill-based_routing update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in skill-based_routing/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "skill-based_routing" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
       "Id":"eff7a67a-41eb-11f0-ac2f-1b1022c812df"
    }
}
   */

  @Post('skill-based_routing/delete')
  async deleteSkillbased_routing(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'routing/attributes',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk skill-based_routing delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in skill-based_routing/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "attribute_value" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "attribute_id": "5668c79a-41ec-11f0-856c-effd203b0f88"
    }
}
   */

  @Post('attribute_value/getmany')
  async getmanyAttribute_value(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `routing/attributes/${data.data.attribute_id}/values`,
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk attribute_value getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in attribute_value/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "attribute_value" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "attribute_id": "5668c79a-41ec-11f0-856c-effd203b0f88",
        "Id":"4546b432-5321-448b-8605-c91c6cee437a"
    }
}
   */

  @Post('attribute_value/get')
  async getAttribute_value(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `routing/attributes/${data.data.attribute_id}/values`,
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk attribute_value get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in attribute_value/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "attribute_value" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "attribute_id": "5668c79a-41ec-11f0-856c-effd203b0f88",
        "data": {
            "attribute_value": {
                "name": "Japanese"
            }
        }
    }
}
   */

  @Post('attribute_value/create')
  async createAttribute_value(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `routing/attributes/${data.data.attribute_id}/values`,
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk attribute_value create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in attribute_value/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "attribute_value" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "attribute_id": "5668c79a-41ec-11f0-856c-effd203b0f88",
        "Id": "4546b432-5321-448b-8605-c91c6cee437a",
        "data": {
            "attribute_value": {
                "name": "Update New One"
            }
        }
    }
}
   */

  @Post('attribute_value/update')
  async updateAttribute_value(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `routing/attributes/${data.data.attribute_id}/values`,
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk attribute_value update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in attribute_value/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "attribute_value" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "attribute_id": "5668c79a-41ec-11f0-856c-effd203b0f88",
        "Id":"d0dfe594-86b3-4c2f-9550-065c18ceb075"
    }
}
   */

  @Post('attribute_value/delete')
  async deleteAttribute_value(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        `routing/attributes/${data.data.attribute_id}/values`,
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk attribute_value delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in attribute_value/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "resource_collections" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "payload": {
                "ticket_fields": {
                    "support_description": {
                        "type": "text",
                        "title": "Support description"
                    }
                },
                "triggers": {
                    "email_on_ticket_solved": {
                        "title": "Email on ticket solved Trigger",
                        "all": [
                            {
                                "field": "status",
                                "operator": "is",
                                "value": "solved"
                            }
                        ],
                        "actions": [
                            {
                                "field": "notification_user"
                            }
                        ]
                    }
                }
            }
        }
    }
}
   */

  @Post('resource_collections/create')
  async createResource_collections(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'resource_collections',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk resource_collections create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in resource_collections/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "resource_collections" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27201031512594,
        "data": {
            "payload": {
                "ticket_fields": {
                    "support_description": {
                        "type": "text",
                        "title": " description"
                    }
                },
                "triggers": {
                    "email_on_ticket_solved": {
                        "title": "Email on ticket solved Trigger",
                        "all": [
                            {
                                "field": "status",
                                "operator": "is",
                                "value": "solved"
                            }
                        ],
                        "actions": [
                            {
                                "field": "notification_user"
                            }
                        ]
                    }
                }
            }
        }
    }
}
   */

  @Post('resource_collections/update')
  async updateResource_collections(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'resource_collections',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk resource_collections update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in resource_collections/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "resource_collections" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27201031512594
    }
}
   */

  @Post('resource_collections/delete')
  async deleteResource_collections(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'resource_collections',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk resource_collections delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in resource_collections/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "resource_collections" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27201031512594
    }
}
   */

  @Post('resource_collections/get')
  async getResource_collections(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'resource_collections',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk resource_collections get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in resource_collections/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "resource_collections" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
    
}  */

  @Post('resource_collections/getmany')
  async getmanyResource_collections(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'resource_collections',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk resource_collections getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in resource_collections/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "bookmarks" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "bookmark": {
                "ticket_id": 28
            }
        }
    }
}
   */

  @Post('bookmarks/create')
  async createBookmarks(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'bookmarks',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk bookmarks create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in bookmarks/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "bookmarks" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27202303256338
    }
}
   */

  @Post('bookmarks/delete')
  async deleteBookmarks(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'bookmarks',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk bookmarks delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in bookmarks/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "bookmarks" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
      
    }
}  */

  @Post('bookmarks/getmany')
  async getmanyBookmarks(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'bookmarks',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk bookmarks getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in bookmarks/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "views" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "data":{
  "view": {
    "title": "Kelly's tickets",
    "raw_title": "{{dc.tickets_assigned_to_kelly}}",
    "description": "Tickets that are assigned to Kelly",
    "active": true,
    "position": 3,
    "restriction": {
      "type": "User",
      "id": "27141584312978"
    },
    "all": [
     
      {
        "field": "group_id",
        "operator": "is",
        "value": "27202548688146"
      }
     
    ]
  }
}
    }
}
   */

  @Post('views/create')
  async createViews(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'views',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk views create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in views/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "views" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id":27205205968530
        
}
    }

   */

  @Post('views/get')
  async getViews(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'views',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk views get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in views/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "views" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
      
        
}
    }

   */

  @Post('views/getmany')
  async getmanyViews(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'views',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk views getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in views/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "views" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id":27205205968530
        
}
    }

   */

  @Post('views/delete')
  async deleteViews(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'views',
        'delete',
        'delete',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk views delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in views/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "views" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": 27205205968530,
        "data": {
            "view": {
                "title": "Update tickets"
            }
        }
    }
}
   */

  @Post('views/update')
  async updateViews(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'views',
        'update',
        'put',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk views update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in views/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_triggers" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('ticket_triggers/create')
  async createTicket_triggers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'ticket_triggers',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_triggers create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_triggers/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_triggers" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('ticket_triggers/get')
  async getTicket_triggers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'ticket_triggers',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_triggers get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_triggers/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_triggers" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('ticket_triggers/getmany')
  async getmanyTicket_triggers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'ticket_triggers',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_triggers getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_triggers/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_triggers" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
    "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('ticket_triggers/update')
  async updateTicket_triggers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'ticket_triggers',
        'update',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_triggers update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_triggers/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_triggers" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
  }
 
}
   */

  @Post('ticket_triggers/delete')
  async deleteTicket_triggers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'ticket_triggers',
        'delete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_triggers delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_triggers/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_triggers" action "bulkdelete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('ticket_triggers/bulkdelete')
  async bulkdeleteTicket_triggers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'ticket_triggers',
        'bulkdelete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_triggers bulkdelete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_triggers/bulkdelete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_triggers" action "reorder".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('ticket_triggers/reorder')
  async reorderTicket_triggers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'ticket_triggers',
        'reorder',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_triggers reorder executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_triggers/reorder:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_triggers" action "search".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('ticket_triggers/search')
  async searchTicket_triggers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'ticket_triggers',
        'search',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_triggers search executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_triggers/search:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_triggers" action "updatemany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('ticket_triggers/updatemany')
  async updatemanyTicket_triggers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'ticket_triggers',
        'updatemany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_triggers updatemany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_triggers/updatemany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_trigger_categories" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('ticket_trigger_categories/getmany')
  async getmanyTicket_trigger_categories(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'ticket_trigger_categories',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_trigger_categories getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_trigger_categories/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_trigger_categories" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('ticket_trigger_categories/create')
  async createTicket_trigger_categories(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'ticket_trigger_categories',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_trigger_categories create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_trigger_categories/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_trigger_categories" action "createbatch".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('ticket_trigger_categories/createbatch')
  async createbatchTicket_trigger_categories(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'ticket_trigger_categories',
        'createbatch',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_trigger_categories createbatch executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(
        `Error in ticket_trigger_categories/createbatch:`,
        error,
      );
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_trigger_categories" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('ticket_trigger_categories/get')
  async getTicket_trigger_categories(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'ticket_trigger_categories',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_trigger_categories get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_trigger_categories/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_trigger_categories" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
    "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('ticket_trigger_categories/update')
  async updateTicket_trigger_categories(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'ticket_trigger_categories',
        'update',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_trigger_categories update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_trigger_categories/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_trigger_categories" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
  }
 
}
   */

  @Post('ticket_trigger_categories/delete')
  async deleteTicket_trigger_categories(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'ticket_trigger_categories',
        'delete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_trigger_categories delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_trigger_categories/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "macros" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('macros/getmany')
  async getmanyMacros(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'macros',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk macros getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in macros/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "macros" action "getmanyactive".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('macros/getmanyactive')
  async getmanyactiveMacros(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'macros',
        'getmanyactive',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk macros getmanyactive executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in macros/getmanyactive:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "macros" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('macros/get')
  async getMacros(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'macros',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk macros get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in macros/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "macros" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('macros/create')
  async createMacros(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'macros',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk macros create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in macros/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "macros" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
    "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('macros/update')
  async updateMacros(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'macros',
        'update',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk macros update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in macros/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "macros" action "updatemany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('macros/updatemany')
  async updatemanyMacros(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'macros',
        'updatemany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk macros updatemany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in macros/updatemany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "macros" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
  }
 
}
   */

  @Post('macros/delete')
  async deleteMacros(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'macros',
        'delete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk macros delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in macros/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "macros" action "bulkdelete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('macros/bulkdelete')
  async bulkdeleteMacros(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'macros',
        'bulkdelete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk macros bulkdelete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in macros/bulkdelete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "macros" action "search".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('macros/search')
  async searchMacros(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'macros',
        'search',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk macros search executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in macros/search:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "macros" action "getmanymacrocategories".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('macros/getmanymacrocategories')
  async getmanymacrocategoriesMacros(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'macros',
        'getmanymacrocategories',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk macros getmanymacrocategories executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in macros/getmanymacrocategories:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "macros" action "getmanysupportedactions".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('macros/getmanysupportedactions')
  async getmanysupportedactionsMacros(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'macros',
        'getmanysupportedactions',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk macros getmanysupportedactions executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in macros/getmanysupportedactions:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "macros" action "getmanyactiondefinitions".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('macros/getmanyactiondefinitions')
  async getmanyactiondefinitionsMacros(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'macros',
        'getmanyactiondefinitions',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk macros getmanyactiondefinitions executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in macros/getmanyactiondefinitions:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "macros" action "getreplica".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('macros/getreplica')
  async getreplicaMacros(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'macros',
        'getreplica',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk macros getreplica executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in macros/getreplica:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "macros" action "getmanyattachments".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('macros/getmanyattachments')
  async getmanyattachmentsMacros(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'macros',
        'getmanyattachments',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk macros getmanyattachments executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in macros/getmanyattachments:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "macros" action "getattachment".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('macros/getattachment')
  async getattachmentMacros(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'macros',
        'getattachment',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk macros getattachment executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in macros/getattachment:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "macros" action "createattchment".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('macros/createattchment')
  async createattchmentMacros(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'macros',
        'createattchment',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk macros createattchment executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in macros/createattchment:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "macros" action "createunassociated".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('macros/createunassociated')
  async createunassociatedMacros(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'macros',
        'createunassociated',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk macros createunassociated executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in macros/createunassociated:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "macros" action "getchangesticket".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('macros/getchangesticket')
  async getchangesticketMacros(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'macros',
        'getchangesticket',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk macros getchangesticket executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in macros/getchangesticket:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "macros" action "getafterchanges".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('macros/getafterchanges')
  async getafterchangesMacros(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'macros',
        'getafterchanges',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk macros getafterchanges executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in macros/getafterchanges:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "automations" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('automations/getmany')
  async getmanyAutomations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'automations',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk automations getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in automations/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "automations" action "getanyactive".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('automations/getanyactive')
  async getanyactiveAutomations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'automations',
        'getanyactive',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk automations getanyactive executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in automations/getanyactive:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "automations" action "search".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('automations/search')
  async searchAutomations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'automations',
        'search',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk automations search executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in automations/search:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "automations" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('automations/get')
  async getAutomations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'automations',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk automations get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in automations/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "automations" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('automations/create')
  async createAutomations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'automations',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk automations create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in automations/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "automations" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
    "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('automations/update')
  async updateAutomations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'automations',
        'update',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk automations update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in automations/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "automations" action "updatemany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('automations/updatemany')
  async updatemanyAutomations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'automations',
        'updatemany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk automations updatemany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in automations/updatemany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "automations" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
  }
 
}
   */

  @Post('automations/delete')
  async deleteAutomations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'automations',
        'delete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk automations delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in automations/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "automations" action "bulkdelete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('automations/bulkdelete')
  async bulkdeleteAutomations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'automations',
        'bulkdelete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk automations bulkdelete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in automations/bulkdelete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sla_policies" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('sla_policies/getmany')
  async getmanySla_policies(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'sla_policies',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk sla_policies getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in sla_policies/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sla_policies" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('sla_policies/get')
  async getSla_policies(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'sla_policies',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk sla_policies get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in sla_policies/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sla_policies" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('sla_policies/create')
  async createSla_policies(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'sla_policies',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk sla_policies create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in sla_policies/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sla_policies" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
    "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('sla_policies/update')
  async updateSla_policies(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'sla_policies',
        'update',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk sla_policies update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in sla_policies/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sla_policies" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
  }
 
}
   */

  @Post('sla_policies/delete')
  async deleteSla_policies(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'sla_policies',
        'delete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk sla_policies delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in sla_policies/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sla_policies" action "reorder".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('sla_policies/reorder')
  async reorderSla_policies(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'sla_policies',
        'reorder',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk sla_policies reorder executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in sla_policies/reorder:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sla_policies" action "getsupportedfilterdefinitionitems".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('sla_policies/getsupportedfilterdefinitionitems')
  async getsupportedfilterdefinitionitemsSla_policies(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'sla_policies',
        'getsupportedfilterdefinitionitems',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk sla_policies getsupportedfilterdefinitionitems executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(
        `Error in sla_policies/getsupportedfilterdefinitionitems:`,
        error,
      );
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "group_sla_policies" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('group_sla_policies/getmany')
  async getmanyGroup_sla_policies(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'group_sla_policies',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk group_sla_policies getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in group_sla_policies/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "group_sla_policies" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('group_sla_policies/get')
  async getGroup_sla_policies(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'group_sla_policies',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk group_sla_policies get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in group_sla_policies/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "group_sla_policies" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('group_sla_policies/create')
  async createGroup_sla_policies(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'group_sla_policies',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk group_sla_policies create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in group_sla_policies/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "group_sla_policies" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
    "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('group_sla_policies/update')
  async updateGroup_sla_policies(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'group_sla_policies',
        'update',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk group_sla_policies update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in group_sla_policies/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "group_sla_policies" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
  }
 
}
   */

  @Post('group_sla_policies/delete')
  async deleteGroup_sla_policies(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'group_sla_policies',
        'delete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk group_sla_policies delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in group_sla_policies/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "group_sla_policies" action "reorder".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('group_sla_policies/reorder')
  async reorderGroup_sla_policies(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'group_sla_policies',
        'reorder',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk group_sla_policies reorder executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in group_sla_policies/reorder:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "group_sla_policies" action "getsupportedfilter".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('group_sla_policies/getsupportedfilter')
  async getsupportedfilterGroup_sla_policies(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'group_sla_policies',
        'getsupportedfilter',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk group_sla_policies getsupportedfilter executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(
        `Error in group_sla_policies/getsupportedfilter:`,
        error,
      );
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "deletion_schedules" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('deletion_schedules/getmany')
  async getmanyDeletion_schedules(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'deletion_schedules',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk deletion_schedules getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in deletion_schedules/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "deletion_schedules" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('deletion_schedules/create')
  async createDeletion_schedules(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'deletion_schedules',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk deletion_schedules create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in deletion_schedules/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "deletion_schedules" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('deletion_schedules/get')
  async getDeletion_schedules(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'deletion_schedules',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk deletion_schedules get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in deletion_schedules/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "deletion_schedules" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
    "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('deletion_schedules/update')
  async updateDeletion_schedules(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'deletion_schedules',
        'update',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk deletion_schedules update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in deletion_schedules/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "deletion_schedules" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
  }
 
}
   */

  @Post('deletion_schedules/delete')
  async deleteDeletion_schedules(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'deletion_schedules',
        'delete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk deletion_schedules delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in deletion_schedules/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "custom_roles" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('custom_roles/getmany')
  async getmanyCustom_roles(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'custom_roles',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk custom_roles getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in custom_roles/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "custom_roles" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('custom_roles/get')
  async getCustom_roles(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'custom_roles',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk custom_roles get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in custom_roles/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "custom_roles" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('custom_roles/create')
  async createCustom_roles(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'custom_roles',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk custom_roles create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in custom_roles/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "custom_roles" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
    "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('custom_roles/update')
  async updateCustom_roles(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'custom_roles',
        'update',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk custom_roles update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in custom_roles/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "custom_roles" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
  }
 
}
   */

  @Post('custom_roles/delete')
  async deleteCustom_roles(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'custom_roles',
        'delete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk custom_roles delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in custom_roles/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "account_settings" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('account_settings/get')
  async getAccount_settings(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'account_settings',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk account_settings get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in account_settings/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "account_settings" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
    "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('account_settings/update')
  async updateAccount_settings(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'account_settings',
        'update',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk account_settings update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in account_settings/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "support_addresses" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('support_addresses/getmany')
  async getmanySupport_addresses(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'support_addresses',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk support_addresses getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in support_addresses/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "support_addresses" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('support_addresses/get')
  async getSupport_addresses(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'support_addresses',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk support_addresses get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in support_addresses/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "support_addresses" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('support_addresses/create')
  async createSupport_addresses(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'support_addresses',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk support_addresses create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in support_addresses/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "support_addresses" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
    "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('support_addresses/update')
  async updateSupport_addresses(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'support_addresses',
        'update',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk support_addresses update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in support_addresses/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "support_addresses" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
  }
 
}
   */

  @Post('support_addresses/delete')
  async deleteSupport_addresses(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'support_addresses',
        'delete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk support_addresses delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in support_addresses/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "support_addresses" action "verify".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('support_addresses/verify')
  async verifySupport_addresses(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'support_addresses',
        'verify',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk support_addresses verify executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in support_addresses/verify:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sessions" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('sessions/getmany')
  async getmanySessions(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'sessions',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk sessions getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in sessions/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sessions" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('sessions/get')
  async getSessions(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'sessions',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk sessions get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in sessions/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sessions" action "getcurrentauthenticated".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('sessions/getcurrentauthenticated')
  async getcurrentauthenticatedSessions(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'sessions',
        'getcurrentauthenticated',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk sessions getcurrentauthenticated executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in sessions/getcurrentauthenticated:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sessions" action "renewcurrent".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('sessions/renewcurrent')
  async renewcurrentSessions(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'sessions',
        'renewcurrent',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk sessions renewcurrent executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in sessions/renewcurrent:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sessions" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
  }
 
}
   */

  @Post('sessions/delete')
  async deleteSessions(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'sessions',
        'delete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk sessions delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in sessions/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sessions" action "deleteauthenticated".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('sessions/deleteauthenticated')
  async deleteauthenticatedSessions(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'sessions',
        'deleteauthenticated',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk sessions deleteauthenticated executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in sessions/deleteauthenticated:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sessions" action "bulkdelete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('sessions/bulkdelete')
  async bulkdeleteSessions(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'sessions',
        'bulkdelete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk sessions bulkdelete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in sessions/bulkdelete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "brand_agent" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('brand_agent/getmany')
  async getmanyBrand_agent(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'brand_agent',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk brand_agent getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in brand_agent/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "brand_agent" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('brand_agent/get')
  async getBrand_agent(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'brand_agent',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk brand_agent get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in brand_agent/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "brands" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('brands/getmany')
  async getmanyBrands(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'brands',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk brands getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in brands/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "brands" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('brands/get')
  async getBrands(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'brands',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk brands get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in brands/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "brands" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('brands/create')
  async createBrands(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'brands',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk brands create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in brands/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "brands" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
    "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('brands/update')
  async updateBrands(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'brands',
        'update',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk brands update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in brands/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "brands" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
  }
 
}
   */

  @Post('brands/delete')
  async deleteBrands(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'brands',
        'delete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk brands delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in brands/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "brands" action "checkhost".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('brands/checkhost')
  async checkhostBrands(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'brands',
        'checkhost',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk brands checkhost executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in brands/checkhost:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "brands" action "checkexisting".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('brands/checkexisting')
  async checkexistingBrands(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'brands',
        'checkexisting',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk brands checkexisting executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in brands/checkexisting:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "locales" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('locales/getmany')
  async getmanyLocales(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'locales',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk locales getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in locales/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "locales" action "getmanylocalesagent".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('locales/getmanylocalesagent')
  async getmanylocalesagentLocales(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'locales',
        'getmanylocalesagent',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk locales getmanylocalesagent executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in locales/getmanylocalesagent:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "locales" action "getmanypublic".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('locales/getmanypublic')
  async getmanypublicLocales(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'locales',
        'getmanypublic',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk locales getmanypublic executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in locales/getmanypublic:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "locales" action "getcurrent".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('locales/getcurrent')
  async getcurrentLocales(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'locales',
        'getcurrent',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk locales getcurrent executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in locales/getcurrent:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "locales" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('locales/get')
  async getLocales(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'locales',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk locales get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in locales/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "locales" action "detectbestlanguageforuser".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('locales/detectbestlanguageforuser')
  async detectbestlanguageforuserLocales(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'locales',
        'detectbestlanguageforuser',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk locales detectbestlanguageforuser executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in locales/detectbestlanguageforuser:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "audit_logs" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('audit_logs/getmany')
  async getmanyAudit_logs(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'audit_logs',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk audit_logs getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in audit_logs/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "audit_logs" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('audit_logs/get')
  async getAudit_logs(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'audit_logs',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk audit_logs get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in audit_logs/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "audit_logs" action "export".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('audit_logs/export')
  async exportAudit_logs(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'audit_logs',
        'export',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk audit_logs export executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in audit_logs/export:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "access_logs" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('access_logs/getmany')
  async getmanyAccess_logs(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'access_logs',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk access_logs getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in access_logs/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "push_notifications" action "bulkunregister".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('push_notifications/bulkunregister')
  async bulkunregisterPush_notifications(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'push_notifications',
        'bulkunregister',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk push_notifications bulkunregister executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in push_notifications/bulkunregister:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "ticket_statuses" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('ticket_statuses/getmany')
  async getmanyTicket_statuses(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'ticket_statuses',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk ticket_statuses getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in ticket_statuses/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "zendesk_ips" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('zendesk_ips/getmany')
  async getmanyZendesk_ips(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'zendesk_ips',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk zendesk_ips getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in zendesk_ips/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tokens" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('tokens/getmany')
  async getmanyTokens(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'tokens',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tokens getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tokens/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tokens" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('tokens/get')
  async getTokens(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'tokens',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tokens get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tokens/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tokens" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('tokens/create')
  async createTokens(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'tokens',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tokens create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tokens/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "tokens" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
  }
 
}
   */

  @Post('tokens/delete')
  async deleteTokens(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'tokens',
        'delete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk tokens delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in tokens/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "clients" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('clients/getmany')
  async getmanyClients(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'clients',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk clients getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in clients/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "clients" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('clients/get')
  async getClients(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'clients',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk clients get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in clients/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "clients" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('clients/create')
  async createClients(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'clients',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk clients create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in clients/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "clients" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
    "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('clients/update')
  async updateClients(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'clients',
        'update',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk clients update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in clients/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "clients" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
  }
 
}
   */

  @Post('clients/delete')
  async deleteClients(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'clients',
        'delete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk clients delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in clients/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "clients" action "generatesecret".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('clients/generatesecret')
  async generatesecretClients(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'clients',
        'generatesecret',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk clients generatesecret executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in clients/generatesecret:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "global_oauth_clients" action "list_global_oauth_clients".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('global_oauth_clients/list_global_oauth_clients')
  async list_global_oauth_clientsGlobal_oauth_clients(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'global_oauth_clients',
        'list_global_oauth_clients',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk global_oauth_clients list_global_oauth_clients executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(
        `Error in global_oauth_clients/list_global_oauth_clients:`,
        error,
      );
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "apps" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('apps/getmany')
  async getmanyApps(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'apps',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk apps getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in apps/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "apps" action "getmanyowned".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('apps/getmanyowned')
  async getmanyownedApps(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'apps',
        'getmanyowned',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk apps getmanyowned executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in apps/getmanyowned:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "apps" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('apps/get')
  async getApps(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'apps',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk apps get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in apps/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "apps" action "getapppublickey".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('apps/getapppublickey')
  async getapppublickeyApps(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'apps',
        'getapppublickey',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk apps getapppublickey executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in apps/getapppublickey:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "apps" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('apps/create')
  async createApps(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'apps',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk apps create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in apps/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "apps" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
    "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('apps/update')
  async updateApps(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'apps',
        'update',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk apps update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in apps/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "apps" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
  }
 
}
   */

  @Post('apps/delete')
  async deleteApps(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'apps',
        'delete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk apps delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in apps/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "apps" action "getjob".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('apps/getjob')
  async getjobApps(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'apps',
        'getjob',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk apps getjob executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in apps/getjob:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "apps" action "upload".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('apps/upload')
  async uploadApps(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'apps',
        'upload',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk apps upload executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in apps/upload:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "apps" action "sendnotification".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('apps/sendnotification')
  async sendnotificationApps(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'apps',
        'sendnotification',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk apps sendnotification executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in apps/sendnotification:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "apps" action "install".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('apps/install')
  async installApps(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'apps',
        'install',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk apps install executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in apps/install:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "apps" action "listappinstallations".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('apps/listappinstallations')
  async listappinstallationsApps(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'apps',
        'listappinstallations',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk apps listappinstallations executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in apps/listappinstallations:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "apps" action "getappinstallation".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('apps/getappinstallation')
  async getappinstallationApps(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'apps',
        'getappinstallation',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk apps getappinstallation executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in apps/getappinstallation:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "apps" action "updateappinstallation".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('apps/updateappinstallation')
  async updateappinstallationApps(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'apps',
        'updateappinstallation',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk apps updateappinstallation executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in apps/updateappinstallation:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "apps" action "remove".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('apps/remove')
  async removeApps(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'apps',
        'remove',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk apps remove executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in apps/remove:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "app_installations" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('app_installations/getmany')
  async getmanyApp_installations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'app_installations',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk app_installations getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in app_installations/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "app_installations" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('app_installations/get')
  async getApp_installations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'app_installations',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk app_installations get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in app_installations/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "app_installations" action "getmanylocation".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('app_installations/getmanylocation')
  async getmanylocationApp_installations(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'app_installations',
        'getmanylocation',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk app_installations getmanylocation executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in app_installations/getmanylocation:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "app_installations" action "reorder".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('app_installations/reorder')
  async reorderApp_installations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'app_installations',
        'reorder',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk app_installations reorder executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in app_installations/reorder:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "locations" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('locations/getmany')
  async getmanyLocations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'locations',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk locations getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in locations/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "locations" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('locations/get')
  async getLocations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'locations',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk locations get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in locations/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "targets" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('targets/getmany')
  async getmanyTargets(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'targets',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk targets getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in targets/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "targets" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('targets/get')
  async getTargets(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'targets',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk targets get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in targets/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "targets" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('targets/create')
  async createTargets(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'targets',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk targets create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in targets/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "targets" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
    "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('targets/update')
  async updateTargets(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'targets',
        'update',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk targets update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in targets/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "targets" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
  }
 
}
   */

  @Post('targets/delete')
  async deleteTargets(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'targets',
        'delete',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk targets delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in targets/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "targets" action "getmanytargetfailures".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('targets/getmanytargetfailures')
  async getmanytargetfailuresTargets(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'targets',
        'getmanytargetfailures',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk targets getmanytargetfailures executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in targets/getmanytargetfailures:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "targets" action "gettargetfailure".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('targets/gettargetfailure')
  async gettargetfailureTargets(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'targets',
        'gettargetfailure',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk targets gettargetfailure executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in targets/gettargetfailure:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "side_conversations" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('side_conversations/create')
  async createSide_conversations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'side_conversations',
        'create',
        'post',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk side_conversations create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in side_conversations/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "side_conversations" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
    "data":{
        "field1": "value1",
        "field2": "value2"
      }
  }
}
   */

  @Post('side_conversations/update')
  async updateSide_conversations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'side_conversations',
        'update',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk side_conversations update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in side_conversations/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "side_conversations" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('side_conversations/get')
  async getSide_conversations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'side_conversations',
        'get',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk side_conversations get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in side_conversations/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "side_conversations" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data: {
    "status": "active",
    "dateFrom": "2024-01-01"
  }
}
   */

  @Post('side_conversations/getmany')
  async getmanySide_conversations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'side_conversations',
        'getmany',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk side_conversations getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in side_conversations/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "side_conversations" action "import".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('side_conversations/import')
  async importSide_conversations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'side_conversations',
        'import',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk side_conversations import executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in side_conversations/import:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "side_conversations" action "importevents".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('side_conversations/importevents')
  async importeventsSide_conversations(
    @Body() data: any,
    @Res() res: Response,
  ) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'side_conversations',
        'importevents',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk side_conversations importevents executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in side_conversations/importevents:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "side_conversations" action "reply".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific'get', data)
   * - Calls the integration helper "performZendeskAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "ModuleData": {
    "key": "value"
  }
}
   */

  @Post('side_conversations/reply')
  async replySide_conversations(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performZendeskAction(
        'side_conversations',
        'reply',
        'get',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCompany',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: `Zendesk side_conversations reply executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in side_conversations/reply:`, error);
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

      const access_token = credentialRepository.authData.token.access_token;

      console.log('acc', access_token);

      const subdomain = credentialRepository.authData.subdomain;

      console.log('sub', subdomain);

      return { access_token, subdomain };
    } catch (error) {
      this.logger.error('Error initializing Node:', error + error.stack);
    }
  }

  /**
   * [AUTO-GENERATED] Helper method to perform a Zendesk action.
   * This method is a stub—extend it to integrate with the actual API for your xapp.
   *
   * Validations:
   * - Ensure that the provided module and action are supported.
   * - Validate the "data" structure as needed.
   *
   * DO NOT change the method signature.
   */
  private async performZendeskAction(
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
      const initializeData: any = await this.initialize(credentialId);

      const { access_token, subdomain } = initializeData;

      const baseUrl = `https://${subdomain}.zendesk.com/api/v2/`;

      let url = `${baseUrl}${module}`;

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

      console.log('options', options);
      if (action === 'getmany') {
        if (argumentdata) options.params = data;
      } else if (action.includes('bulk')) {
        console.log('wnfn');
        const ids = data.ids;

        options.params = { ids: ids };
      } else if (module === 'tickets/update_many') {
        if (argumentdata) {
          const ids = data.ids;
          options.params = { ids: ids };
          options.data = data.data;
        }
      } else {
        if (argumentdata) options.data = data.data;
      }
      console.log(options);
      const response = await axios(options);
      return { response: response.data, status: response.status };
    } catch (error) {
      console.log(error.response || error.message)
      return {
        response: [error.response?.data || error.message],
        status: error.status || 500,
      };
    }
  }
}
