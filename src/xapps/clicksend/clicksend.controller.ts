/**
 * Controller for ClickSend integration endpoints.
 * 
 * This controller provides auto-generated endpoints for managing ClickSend resources,
 * including accounts, lists, contacts, SMS, MMS, and voice campaigns. 
 * 
 * Endpoints:
 * - OAuth authorization and callback
 * - CRUD operations for accounts, lists, contacts, SMS, MMS, and voice campaigns
 * - Utility endpoints for field generation and initialization
 * 
 * Integration logic is handled via the `performClickSendAction` helper.
 * 
 * @remarks
 * - Do not modify auto-generated endpoints.
 * - For custom logic, extend the `performClickSendAction` helper.
 * 
 * @copyright
 * Copyright (c) 2025 Smackcoders. All rights reserved.
 * This file is subject to the Smackcoders Proprietary License.
 * Unauthorized copying or distribution is strictly prohibited.
 */
// clicksend.controller.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONTROLLER FILE.
// DO NOT modify the auto-generated endpoints below.
// For custom integration logic, extend the helper "performClickSendAction".
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
import axios from 'axios';
import * as crypto from 'crypto';
import { initializeDB } from '../../ormconfig';
import { Credentials } from '../../entities/Credentials';
import { CustomLogger } from '../../logger/custom.logger';
import config, {
  XappName,
  fields,
  modules as xappModules,
} from './clicksend.config';
import { CredentialController } from 'src/credential/credential.controller';
import * as fs from 'fs';
import * as FormData from 'form-data';

let listnext, campaignnext, mmsnext;

@Controller('clicksend')
export class ClickSendController {
  private logger = new CustomLogger();
  private credentialsController = new CredentialController();
 
  /**
   * [AUTO-GENERATED] OAuth authorize endpoint.
   * This endpoint initiates the authentication flow.
   * Implement the actual token request and error handling as needed.
   */
  @Post('authorize')
  async authorize(@Body() reqBody: any, @Res() res: Response) {
    if (!reqBody.apiKey) {
      throw new HttpException(
        'Missing APIKEY parameters',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      
      const { apiKey, baseurl, name, type, userName, userId,id } = reqBody;
      if (userId.length > 0) {
        const connection = await initializeDB();
        const credentialRepository = connection.getRepository(Credentials);
        let clicksendauthdata = await credentialRepository.query(
          `SELECT id,name,type,auth_data
                FROM credentials
                WHERE author_id = $1
                AND name = $2
                ORDER BY created_at ASC
                LIMIT 1`,
          [userId, name],
        );

        const states = crypto.randomBytes(8).toString('hex');
        const data = {
          states: states,
        };

        const reqbody = {
          data: data,
          name: name,
          type: type,
          userId: userId,
        };
        if (
          Array.isArray(clicksendauthdata) &&
          clicksendauthdata.length > 0 &&
          clicksendauthdata[0]?.id
        ) {
          await this.credentialsController.updateCredentials(
            clicksendauthdata[0].id,
            data,
          );
        } else {
          await this.credentialsController.createCredentials(reqbody);
        }
        res.json({
          fields: [
            { name: 'accesstoken', value: '', type: 'text' },
            { name: 'shopName', value: '', type: 'text' },
          ],
          states: states,
        });
      } else {
        const data = {
          baseurl: baseurl,
          token: {
            apiKey: apiKey,
            userName: userName,
          },
        };
        const reqbody = {
          name: name,
          type: type,
          data: data,
          userId: userId,
        };
        const response: any = await this.verify({
          apiKey: apiKey,
          baseurl: baseurl,
          userName: userName,
        });
        if (response.status === 200) {
          if (id) {
            const updatedata =
              await this.credentialsController.updateCredentials(id, data);
          } else {
            const createdata =
              await this.credentialsController.createCredentials(reqbody);
          }
          const { redirect } = await import('./clicksend.config');
          return res.redirect(redirect);
        } else {
          return res.send(response);
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal server Error' });
    }
  }



  @Post('clicksendauthorize')
  async callback(
    @Body()
    reqBody: {
      data: { apiKey: any; pineconeApiVersion: any; baseurl: any; userName: any };
      state;
    },
    @Res() res: Response,
  ) {
    if (
      !reqBody.data.apiKey ||
      !reqBody.data.userName ||
      !reqBody.data.baseurl 
    ) {
      throw new HttpException('Missing  Required', HttpStatus.BAD_REQUEST);
    }
    const returnedState = reqBody.state;
    try {
      const {apiKey ,userName,baseurl} = reqBody.data;
      console.log(reqBody);
      // Use QueryBuilder to find the credential by the nested state field
      const connection = await initializeDB();
      const credRepository = connection.getRepository(Credentials);
      const credential: any = await credRepository
        .createQueryBuilder('credentials')
        .where("credentials.auth_data->>'states' = :state", {
          state: returnedState,
        }) // Fixing the key from 'state' to 'states'
        .getOne();

      console.log(credential);
      let data: any;
      if (credential) {
        data = {
          state: returnedState,
        };
        
        const accessToken: any = {
          apiKey: apiKey,
          userName: userName,
        };

        credential.authData['baseurl'] = baseurl;
        credential.authData['token'] = accessToken;

        const response: any = await this.verify({
          apiKey: apiKey,
          baseurl: baseurl,
          userName: userName,
         
        });
        if (response.status === 200) {
          const credentialsId = credential.id;
          await this.credentialsController.updateCredentials(
            credentialsId,
            credential.authData,
          );
          return res.json({
            success: true,
            message: 'Authorization successful.',
          });
        } else {
          return res.json({
            success: false,
            message:
              'Authorization failed. Please check the token and shop name',
          });
        }
      }
    } catch (error) {
      console.log(error.response || error.message);
      //lthis.ogger..error('Error during callback handling:', error.message);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Error occurred during callback handling');
    }
  }

  @Post('verify/tags')
  async verify(@Body() verfifydata: any) {
    try {
      const apiKey = verfifydata.apiKey;
      const baseurl = verfifydata.baseurl;
      
      const userName = verfifydata.userName;
    
      let url = `${baseurl}/sms-campaigns`;
      const method = 'GET';
      const base64Auth = Buffer.from(`${userName}:${apiKey}`).toString(
        'base64',
      );
      const options: any = {
        method,
        url,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${base64Auth}`,
        },
      };
      const response = await axios(options);
      console.log(response.data)
      return {
        response: response.data,
        status: response.status,
      };
    } catch (error) {
      console.log('error', error.response || error.message);
      this.logger.error('Error :', error + error.stack);
      return {
        response: [
          {
            message: error.message,
          },
        ],
        status: error.response?.statusCode,
      };
    }
  }
  // ---------------------------------------------------------------------------
  // AUTO-GENERATED ENDPOINTS FOR MODULE ACTIONS (as defined in the blueprint JSON)
  // ---------------------------------------------------------------------------

  /**
   * [AUTO-GENERATED] Endpoint for module "accounts" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId": "{{credentialId}}",
    "data": {}
}
   */

  @Post('accounts/get')
  async getAccounts(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        'account',
        'get',
        'GET',
        data,
      );
      return ({
        message: `ClickSend accounts get executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in accounts/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "lists" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId": "{{credentialId}}",
    "data": {
        "data": {
            "list_name": "list 3"
        }
    }
}
   */

  @Post('lists/create')
  async createLists(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        'lists',
        'create',
        'POST',
        data,
      );
      return ({
        message: `ClickSend lists create executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in lists/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "lists" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId": "{{credentialId}}",
    "data": {
        "Id": "3172352",
        "data": {
            "list_name": "Updated List"
        }
    }
}
   */

  @Post('lists/update')
  async updateLists(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {

      const result = await this.performClickSendAction(
       'lists',
        'update',
        'PUT',
        data,
      );
      return ({
        message: `ClickSend lists update executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in lists/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "lists" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId": "{{credentialId}}",
    "data": {
        "Id": "3172352"
    }
}
   */

  @Post('lists/get')
  async getLists(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        'lists',
        'get',
        'GET',
        data,
      );
      return ({
        message: `ClickSend lists get executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in lists/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "lists" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId": "{{credentialId}}",
    "data": {
    }
}
   */

  @Post('lists/getmany')
  async getmanyLists(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      
      const result = await this.performClickSendAction(
        listnext ? listnext : 'lists',
        'getmany',
        'GET',
        data,
      );
      const url = result.response?.data?.next_page_url;
      listnext = url?.replace('https://rest.clicksend.com/v3/', '');
      console.log(listnext);
      console.log(url);
      return ({
        message: `ClickSend lists getmany executed successfully`,
        result,
      });
    
    } catch (error) {
      this.logger.error(`Error in lists/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "lists" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId": "{{credentialId}}",
    "data": {
        "Id": "3172351",
    }
}
   */

  @Post('lists/delete')
  async deleteLists(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        'lists',
        'delete',
        'DELETE',
        data,
      );
      return ({
        message: `ClickSend lists delete executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in lists/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "contacts" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId": "{{credentialId}}",
    "data": {
        "listId": "3172352",
        "data": {
            "phone_number": "+917448746858",
            "first_name": "muthu",
            "last_name": "kumar"
        }
    }
}
   */

  @Post('contacts/create')
  async createContacts(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        `lists/${data.data.listId}/contacts`,
        'create',
        'POST',
        data,
      );
      return ({
        message: `ClickSend contacts create executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in contacts/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "contacts" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *{
    "credentialsId": "{{credentialId}}",
    "data": {
        "listId": "3172352",
        "Id": "1359945997",
        "data": {
            "first_name": "Ellen145",
            "last_name": "Diaz",
            "email": "selvam@gmail.com"
        }
    }
}
   */

  @Post('contacts/update')
  async updateContacts(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        `lists/${data.data.listId}/contacts`,
        'update',
        'PUT',
        data,
      );
      return ({
        message: `ClickSend contacts update executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in contacts/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "contacts" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId": "{{credentialId}}",
    "data": {
        "listId": "3172352",
        "Id": "1359970663"
    }
}
   */

  @Post('contacts/get')
  async getContacts(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        `lists/${data.data.listId}/contacts`,
        'get',
        'GET',
        data,
      );
      return ({
        message: `ClickSend contacts get executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in contacts/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "contacts" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId": "{{credentialId}}",
    "data": {
        "listId": "3172352",
        "Id": "1359970663"
    }
}
   */

  @Post('contacts/delete')
  async deleteContacts(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        `lists/${data.listId}/contacts`,
        'delete',
        'DELETE',
        data,
      );
      return ({
        message: `ClickSend contacts delete executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in contacts/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sms" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId": "{{credentialId}}",
    "data": {
        "data": {
            "schedule": "2025-05-31T10:00:00",
            "messages": [
                {
                    "source": "php",
                    "body": "Chocolate bar icing icing oat cake carrot cake jelly cotton MWEvciEPIr.",
                    "to": "+918825608776"
                }
            ]
        }
    }
}
   */

  @Post('sms/create')
  async createSms(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      console.log(data);

      const dateObj = new Date(data.data.data.schedule);
      const unixTimestamp = Math.floor(dateObj.getTime() / 1000);
      const msg = data.data.data.messages;
      data.data.data.messages = msg.map((message, index) => ({
        ...message,
        schedule: unixTimestamp,
      }));
      const result = await this.performClickSendAction(
        'sms/send',
        'create',
        'POST',
        data,
      );
      return ({
        message: `ClickSend sms create executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in sms/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sms" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId": "{{credentialId}}",
    "data": {}
}
   */

  @Post('sms/cancelAll')
  async cancelAllSms(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        `sms/cancel-all`,
        'cancelAll',
        'PUT',
        data,
      );
      return ({
        message: `ClickSend sms cancelAll executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in sms/cancelAll:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sms" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId": "{{credentialId}}",
    "data": {
        "data": {}
    }
}
   */

  @Post('sms/getmany')
  async getmanySms(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        'sms/history?limit=1',
        'getmany',
        'GET',
        data,
      );
      return ({
        message: `ClickSend sms getmany executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in sms/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sms-campaign" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId": "{{credentialId}}",
    "data": {
        "data": {
            "list_id": 3158837,
            "name": "My Scheduled Campaign",
            "body": "Hey mapla! This SMS is scheduled with custom sender overrides "
        }
    }
}
   */

  @Post('sms-campaign/create')
  async createSmsCampaign(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        'sms-campaigns/send',
        'create',
        'POST',
        data,
      );
      return ({
        message: `ClickSend sms-campaign created executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in sms-campaign/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sms-campaign" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *{
    "credentialsId": "{{credentialId}}",
    "data": {
        "Id": "2503632"
    }
}
   */

  @Post('sms-campaign/get')
  async getSmsCampaign(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        'sms-campaigns',
        'get',
        'GET',
        data,
      );
      return ({
        message: `ClickSend sms-campaign get executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in sms-campaign/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "sms-campaign" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId": "{{credentialId}}",
    "data": {
        // "exe_lastupdatedtime":"2025-07-29",
        "argument":{
        "date_from":"2010-04-31",
        "date_to":"2010-08-31"
        },
        "data":{
            "limit":16
        }
    }
}
   */

//   fromdate and todate not working 
  @Post('sms-campaign/getmany')
  async getmanySmsCampaign(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {

      let fromDate = data?.data?.argument?.date_from;
    let toDate = data?.data?.argument?.date_to;

    if (!fromDate || !toDate) {
      const exeLastUpdatedTime = data?.data?.exe_lastupdatedtime;
      if (!exeLastUpdatedTime) {
        throw new HttpException('exe_lastupdatedtime is required when fromdate/todate are missing', HttpStatus.BAD_REQUEST);
      }

      const parsedExeTime = new Date(exeLastUpdatedTime);
      fromDate = parsedExeTime.toISOString().split('T')[0]; // "YYYY-MM-DD"
      const now = new Date();
      toDate = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
    }
    fromDate = Math.floor(new Date(fromDate).getTime() / 1000);
    console.log('fromdate',fromDate)
    toDate = Math.floor(new Date(toDate).getTime() / 1000);
       let params = {
          date_from: `${parseInt(fromDate)}`,
          date_to: `${parseInt(toDate)}`,
          ...data.data.data
        };

const paginatedData = {
        ...data,
        data: params,
      };
      const result = await this.performClickSendAction(
        campaignnext ? campaignnext : 'sms-campaigns',
        'getmany',
        'GET',
        paginatedData
      );
      const url = result.response?.data?.next_page_url;
      campaignnext = url?.replace('https://rest.clicksend.com/v3/', '');
   
      
      return ({
        message: `ClickSend sms-campaign getmany executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in sms-campaign/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "mms-campaign" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId": "{{credentialId}}",
    "data": {
        "data": {
            "media_file": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaW8ycGhiemRxZzJhbHYzZ2pucTZkYml4dHJseWFjcnhnYzMzZzFwNSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7WTAkv7Ze17SWMOQ/giphy.gif",
            "list_id": 3158837,
            "name": "My Campaign 3",
            "from": "+918825608776",
            "body": "This is my new campaign message.",
            "schedule": 1444821615,
            "subject": "test"
        }
    }
}
   */

  @Post('mms-campaign/create')
  async createMmsCampaign(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        'mms-campaigns/send',
        'create',
        'POST',
        data,
      );
      return ({
        message: `ClickSend mms-campaign create executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in mms-campaign/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "mms-campaign" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId": "{{credentialId}}",
    "data": {
        "Id": "127993",
    }
}
   */

  @Post('mms-campaign/get')
  async getMmsCampaign(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        'mms-campaigns',
        'get',
        'GET',
        data,
      );
      return ({
        message: `ClickSend mms-campaign get executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in mms-campaign/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "mms-campaign" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId": "{{credentialId}}",
    "data": {}
}
   */

  @Post('mms-campaign/getmany')
  async getmanyMmsCampaign(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        mmsnext ? mmsnext : 'mms-campaigns',
        'getmany',
        'GET',
        data,
      );
      const url = result.response?.data?.next_page_url;
      mmsnext = url?.replace('https://rest.clicksend.com/v3/', '');
      // console.log(listnext);
      // console.log(url);
      return ({
        message: `ClickSend mms-campaign getmany executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in mms-campaign/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "voice" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId": "{{credentialId}}",
    "data": {
        "data": {
            "schedule": "2025-05-31T10:00:00",
            "messages": [
                {
                    "voice": "male"
                }
            ]
        }
    }
}
   */

  @Post('voice/create')
  async createVoice(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const dateObj = new Date(data.data.data.schedule);
      const unixTimestamp = Math.floor(dateObj.getTime() / 1000);
      const msg = data.data.data.messages;
      data.data.data.messages = msg.map((message, index) => ({
        ...message,
        schedule: unixTimestamp,
      }));
      console.log(data.data.data);
      const result = await this.performClickSendAction(
        'voice/send',
        'create',
        'POST',
        data,
      );
      return ({
        message: `ClickSend voice create executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in voice/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "voice" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId": "{{credentialId}}",
    "data": {
        // "exe_lastupdatedtime":"2025-07-29",
        "argument":{
        "date_from":"2025-07-31T10:08:29+00:00",
        "date_to":"2025-08-01T05:08:29+00:00"
        },
        "data":{
            "limit":1
        }
    }
}
   */

// Timestamp Not working     // Documentationlink https://developers.clicksend.com/docs/messaging/voice-messaging/other/get-voice-history
  @Post('voice/getmany')
  async getVoice(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
       let fromDate = data?.data?.argument?.date_from;
    let toDate = data?.data?.argument?.date_to;

    if (!fromDate || !toDate) {
      const exeLastUpdatedTime = data?.data?.exe_lastupdatedtime;
      if (!exeLastUpdatedTime) {
        throw new HttpException('exe_lastupdatedtime is required when fromdate/todate are missing', HttpStatus.BAD_REQUEST);
      }

      const parsedExeTime = new Date(exeLastUpdatedTime);
      fromDate = parsedExeTime.toISOString().split('T')[0]; // "YYYY-MM-DD"
      const now = new Date();
      toDate = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
    }
    fromDate = Math.floor(new Date(fromDate).getTime() / 1000);
    console.log('fromdate',fromDate)
    toDate = Math.floor(new Date(toDate).getTime() / 1000);
       let params = {
          date_from: `${fromDate}`,
          date_to: `${toDate}`,
          ...data.data.data
        };

const paginatedData = {
        ...data,
        data: params,
      };
      const result = await this.performClickSendAction(
        'voice/history',
        'getmany',
        'GET',
        data //paginatedData,
      );
      return ({
        message: `ClickSend voice get executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in voice/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "voice" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performClickSendAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId": "{{credentialId}}",
    "data": {
    }
}
   */

  @Post('voice/cancelAll')
  async cancelAllyVoice(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        'voice/cancel-all',
        'cancelAll',
        'PUT',
        data,
      );
      return ({
        message: `ClickSend voice cancelAll executed successfully`,
        result,
      });
    } catch (error) {
      this.logger.error(`Error in voice/cancelAll:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllVoice(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        'voice/history',
        'getmany',
        'GET',
        data,
      );
      return result.response.data.data;
    } catch (error) {
      this.logger.error(`Error in voice/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllMmsCampaign(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        'mms-campaigns',
        'getmany',
        'GET',
        data,
      );
      return result.response.data.map((data) => ({
        name: data.name,
        id: data.mms_campaign_id,
      }));
    } catch (error) {
      this.logger.error(`Error in mms-campaign/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllSmsCampaign(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        'sms-campaigns',
        'getmany',
        'GET',
        data,
      );
      return result.response.data.data.map((data) => ({
        name: data.name,
        id: data.sms_campaign_id,
      }));
    } catch (error) {
      this.logger.error(`Error in sms-campaign/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getAllLists(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        'lists',
        'getmany',
        'GET',
        data,
      );
      return result.response.data.data.map((data) => ({
        name: data.list_name,
        value: data.list_id,
      }));
    } catch (error) {
      this.logger.error(`Error in lists/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllSms(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performClickSendAction(
        'sms/history',
        'getmany',
        'GET',
        data,
      );
      return result.response.data.data;
    } catch (error) {
      this.logger.error(`Error in sms/getmany:`, error);
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
    @Body() body: { category: string; name: string; credentialsId: any },
  ) {
    const { category, name, credentialsId } = body;
    try {
      await this.initializeFields(credentialsId);
      const relevantFields = await this.generateFields(category, name);
      return relevantFields;
    } catch (error) {
      return [];
    }
  }

  async initializeFields(data: any) {
    for (const field of fields) {
      if (typeof field.init === 'function') {
        const datas = { credentialsId: data, data: {} };
        await field.init(datas);
      }
    }
  }

  public async initialize(credentialsId: string) {
    try {
      const connection = await initializeDB();
      const credRepository = connection.getRepository(Credentials);
      const credentialsRepository = await credRepository.findOne({
        where: { id: credentialsId },
      });
      const credentials = credentialsRepository.authData;
      console.log('crede', credentials);
      return { credentials: credentials };
    } catch (error) {
      throw new HttpException(
        'DB initialize faild:',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async curl(
    module: string,
    action: string,
    method: string,
    argumentdata: any,
  ) {
    try {
      const { credentialsId, data } = argumentdata;
      const initializeData = await this.initialize(credentialsId);
      const { token, baseurl } = initializeData?.credentials;
      const { userName ,apiKey} = token
      const base64Auth = Buffer.from(`${userName}:${apiKey}`).toString(
        'base64',
      );
      let url = `${baseurl}/${module}`;
      if (data.Id) {
        url += `/${data.Id}`;
      }
      const options: any = {
        url,
        method,
        
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${base64Auth}`,
        },
      };
      console.log('options', options);
      if (action === 'getmany') {
        if (argumentdata) options.params = data;
      } else {
        if (argumentdata) options.data = data.data;
      }
      console.log(options);
      const response = await axios(options);
      return {
        response: response.data,
        status: response.status,
      };
    } catch (error) {
      console.log(error);
      return {
        error: error.response || error.message,
        status: error.status,
      };
    }
  }

  private async performClickSendAction(
    module: string,
    action: string,
    method: string,
    data: any,
  ): Promise<any> {
    const result = await this.curl(module, action, method, data);
    return result;
  }
}

export const clickSendController = new ClickSendController();
