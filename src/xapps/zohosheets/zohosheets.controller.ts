// zohoSheets.controller.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONTROLLER FILE.
// DO NOT modify the auto-generated endpoints below.
// For custom integration logic, extend the helper "performZohoSheetsAction".
//
// Copyright (c) 2025 Smackcoders. All rights reserved.
// This file is subject to the Smackcoders Proprietary License.
// Unauthorized copying or distribution is strictly prohibited.
// -----------------------------------------------------------------------------

import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  Res,
  HttpStatus,
  HttpException,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import axios from 'axios';
import * as crypto from 'crypto';
import { initializeDB } from '../../ormconfig';
import { Credentials } from '../../entities/Credentials';
import { CustomLogger } from '../../logger/custom.logger';
import { CredentialController } from '../../credential/credential.controller';
import { JsonContains, Repository } from 'typeorm';
import { fields, XappName } from './zohosheets.config';
import qs from 'qs';

@Controller('zohosheets')
export class 


ZohoSheetsController {
  private logger = new CustomLogger();
  public credentialsController: CredentialController =
    new CredentialController();

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
      !reqBody.tokenurl
    ) {
      throw new HttpException(
        'Missing OAuth parameters',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const { node, userId } = reqBody;
      const state = crypto.randomBytes(16).toString('hex');
      const scopes = encodeURIComponent(
        'ZohoSheet.dataAPI.READ,ZohoSheet.dataAPI.UPDATE',
      );

      let dataCenter: any;
      let type: string = reqBody.type;
      let authurl: string = reqBody.authurl;
      let tokenurl: string = reqBody.tokenurl;
      let name: string = reqBody.name;
      // const domain = tokenurl.split('/')[2].split('.');
      //  dataCenter= tokenurl.includes('.com.cn') ? 'com.cn' : tokenurl.includes('.com.au') ? 'com.au' : domain.pop();

      // if (tokenUrl) {
      //   const domain = tokenUrl.split('/')[2].split('.');
      //   dataCenter = tokenUrl.includes('.com.cn')
      //     ? 'com.cn'
      //     : tokenUrl.includes('.com.au')
      //       ? 'com.au'
      //       : domain.pop();
      // } else {
      //   const domain = baseUrl.split('/')[2].split('.');
      //   dataCenter = baseUrl.includes('.com.cn')
      //     ? 'com.cn'
      //     : baseUrl.includes('.com.au')
      //       ? 'com.au'
      //       : domain.pop();
      // }

      let clientId: any = reqBody.clientId;
      let clientSecret: any = reqBody.clientSecret;
      let redirectUri: any = reqBody.redirectUri;
      let zapikey: any = reqBody.zapikey;

      if (userId.length !== undefined) {
        const connection = await initializeDB();
        const credentialsRepository = connection.getRepository(Credentials);

        const zohoauthdata = await credentialsRepository.query(
          `SELECT id,name,type,auth_data
          FROM credentials
          WHERE author_id = $1
          AND name = $2
          ORDER BY created_at ASC
          LIMIT 1`,
          [userId, name],
        );

        if (zohoauthdata > 0) {
          const authData = zohoauthdata[0].auth_data;
          clientId = authData.clientId;
          clientSecret = authData.clientSecret;
          redirectUri = authData.redirectUri;
        } else {
          clientId = process.env.ZOHO_CLIENT_ID;
          clientSecret = process.env.ZOHO_CLIENT_SECRET;
          redirectUri = process.env.ZOHO_REDIRECT_URI;
        }
      }

      const data: any = {
        clientId: clientId,
        clientSecret: clientSecret,
        redirectUri: redirectUri,
        tokenurl: tokenurl,
        authurl: authurl,
        scope: scopes,
        state: state,
        dataCenter: dataCenter,
      };
      const reqbody: any = {
        name: name,
        type: type,
        data: data,
        userId: userId,
      };
      if (reqBody.id) {
        // Update existing credentials
        await this.credentialsController.updateCredentials(reqBody.id, data);
        this.logger.debug(
          `Credentials with ID updated successfully :`,
          reqBody.id,
        );
      } else {
        // Create new credentials
        await this.credentialsController.createCredentials(reqbody);
        this.logger.debug(`New credentials created for :`, name);
      }

      const authUrl = `${authurl}?scope=${scopes}&client_id=${clientId}&response_type=code&access_type=offline&redirect_uri=${redirectUri}&state=${state}&prompt=consent`;

      this.logger.debug(`${XappName} auth URL:`, authUrl);

      return res.send(authUrl);
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
  async callback(@Req() req: any, @Res() res: Response) {
    try {
      const code = req.query.code as string;
      const state: any = req.query.state as string;
      console.log('code:', code, state);
      if (!code || !state) {
        throw new HttpException(
          'Missing code or state',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Fetch stored credentials using state
      const connection = await initializeDB();
      const credRepository = connection.getRepository(Credentials);
      const credential = await credRepository
        .createQueryBuilder('credentials')
        .where("credentials.auth_data->>'state' = :state", { state })
        .getOne();

      if (!credential) {
        throw new HttpException(
          'Invalid state parameter',
          HttpStatus.NOT_FOUND,
        );
      }

      const { clientId, clientSecret, redirectUri, tokenurl } =
        credential.authData;
      console.log('Authdata', credential.authData);
      const tokenRequestData = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }).toString();

      const tokenResponse = await axios.post(`${tokenurl}`, tokenRequestData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      // Save the token data in credentials
      credential.authData['token'] = tokenResponse.data;
      await this.credentialsController.updateCredentials(
        credential.id,
        credential.authData,
      );

      // Import redirect URL from config
      const { redirect } = await import('./zohosheets.config');

      // Redirect user to frontend
      return res.redirect(redirect);
    } catch (error) {
      console.log(error.response || error.message);
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
      const credentialRepository = await credRepository.findOne({
        where: { id },
      });
      const { clientId, clientSecret, tokenurl, token } =
        credentialRepository.authData;
      const refreshToken = token.refresh_token;
      const tokenRequestData = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        access_type: 'offline',
        prompt: 'consent',
      }).toString();

      const response = await axios.post(tokenurl, tokenRequestData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const tokens = response.data;
      credentialRepository.authData['token'] = tokens;
      credentialRepository.authData.token['refresh_token'] = refreshToken;
      const data = credentialRepository.authData;
      await this.credentialsController.updateCredentials(
        credentialRepository.id,
        data,
      );
      return {
        message: `${XappName} access token refreshed successfully`,
        Token: tokens,
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

  private async curl(
    module: string,
    action: string,
    method: string,
    argumentdata: any,
  ): Promise<any> {
    try {
      const { credentialId, data, isForm } = argumentdata;
      if (!credentialId) {
        throw new HttpException(
          'Missing CredentialId in the request body',
          HttpStatus.BAD_REQUEST,
        );
      }
      const initializeData: any = await this.initialize(credentialId);
      const { token } = initializeData?.credential;
      const { access_token } = token;

      // const {dataCenter} =  initializeData?.credential
      // const url = `https://sheet.zoho.${dataCenter}/api/v2/${module}`
      const url = `https://sheet.zoho.in/api/v2/${module}`;
      let headers: any = {
        Authorization: `Bearer ${access_token}`,
        // Authorization: `Zoho-oauthtoken ${access_token}`,
      };
      let bodyData: any;
      if (method !== 'GET') {
        if (isForm) {
          bodyData = data;
          headers['Content-Type'] = 'application/x-www-form-urlencoded';
        } else {
          bodyData = {
            credentialId,
            json_data: data.json_data || data.updatedRecords,
          };
          headers['Content-Type'] = 'application/json';
        }
      }

      const options: any = {
        method,
        url,
        headers,
        data: bodyData,
      };
      if (method === 'POST') {
        if ((argumentdata.data, data)) options.params = argumentdata.data.data;
      }

      console.log('options:', JSON.stringify(options, null, 2));

      const response = await axios(options);
      console.log('response:', response.data);
      return { response: response.data, status: response.status };
    } catch (error) {
      console.log('Error:', error);
      return {
        response: [error.response?.data || error.message],
        status: error.response?.status || 500,
      };
    }
  }
  /**
   * [AUTO-GENERATED] Helper method to perform a zohosheet action.
   * This method is a stub—extend it to integrate with the actual API for your xapp.
   *
   * Validations:
   * - Ensure that the provided module and action are supported.
   * - Validate the "data" structure as needed.
   *
   * DO NOT change the method signature.
   */

  private async performZohoSheetsAction(
    module: string,
    action: string,
    method: string,
    data: any,
  ): Promise<any> {
    try {
      const resultData = await this.curl(module, action, method, data);
      return resultData;
    } catch (error) {
      console.error(`Error in performNodeAction: ${error.message}`);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async initialize(credentialId) {
    try {
      if (!credentialId) {
        throw new HttpException(
          'Request body cannot be empty - credentialId',
          HttpStatus.BAD_REQUEST,
        );
      }
      const id: any = credentialId;
      const connection = await initializeDB();
      const credRepository = connection.getRepository(Credentials);
      const credentialRepository = await credRepository.findOne({
        where: { id },
      });
      const credential = await credentialRepository.authData;

      return { credential: credential };
    } catch (error) {
      this.logger.error('Error initializing Zoho CRM :', error + error.stack);
    }
  }

   /**
     * [AUTO-GENERATED] Endpoint for module "spreadsheets" action "create".
     *  - Request Parameters (data):
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performzohosheetAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *{
  "credentialId": "{{credentialId}}",
  "data":
  {
    "data":{
       "workbook_name": "newSheet",
    "method":"workbook.create"
    }
    
  }
}


     */

  @Post('spreadsheet/create')
  async createSpreadSheet(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = `create`;
      const result = await this.performZohoSheetsAction(
        url,
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createSpreadSheet',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: 'Spreadsheet created successfully',
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error('Error in createSpreadsheet:', error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('spreadsheet/getall')
  async getAllSpreadSheet(@Body() data: any) {
    try {
      const queryParams = new URLSearchParams({
        method: 'workbook.list',
        start_index: '1',
        count: '100',
        sort_option: 'recently_modified',
      });

      const result = await this.performZohoSheetsAction(
        `workbooks?${queryParams}`,
        'GET',
        'GET',
        data,
      );
      if (result.status === 401 && data.simulator !== true) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getAllSpreadSheet',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      let options = [];
      if (result.status === 200) {
        options = result.response.workbooks.map((work: any) => ({
          name: work.workbook_name,
          value: work.resource_id,
        }));
      }
      return options;
    } catch (error) {
      this.logger.error('Error in createSpreadsheet:', error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllworksheet(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      // TODO resourceId based on the fetch the Worksheets.
      const resourceId = data.data.resourceId;
      const result = await this.performZohoSheetsAction(
        `${resourceId}?method=worksheet.insert`,
        'create',
        'POST',
        data,
      );
      if (result.status === 401 && data.simulator !== true) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyworksheet',
          functionArgs,
          data.credentialId,
        );
        return result;
      }

      let options = [];
      if (result.status === 200) {
        options = result.response.worksheet_names.map((work: any) => ({
          name: work.worksheet_name,
          value: work.worksheet_name,
        }));
      }
      return options;
    } catch (error) {
      this.logger.error('Error in createWorksheet:', error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "worksheet" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performzohosheetAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "{{credentialId}}",
  
  "data": {
    "resourceId": "q3p6nbe4d7f13f8f04c19bec54a8ad77b8226",
  "data":{
    "method":"worksheet.insert",
    "worksheet_name": "New Worksheet",
    "headerRow": 3
  }
  }
}

   */
  @Post('worksheet/create')
  async createWorksheet(@Body() data: any, @Res() res: Response) {
    if (
      !data ||
      !data.credentialId ||
      !data.data.resourceId ||
      data.data.workbook_name
    ) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const resourceId = data.data.resourceId;
      const result = await this.performZohoSheetsAction(
        `${resourceId}`,
        'create',
        'POST',
        data,
      );
      if (result.status === 401 && data.simulator !== true) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createWorksheet',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: 'Worksheetsheet created successfully',
        result,
        status: result.status
      });
    } catch (error) {
      this.logger.error('Error in createWorksheet:', error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  /**
   * [AUTO-GENERATED] Endpoint for module "worksheet" action "getmany".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performzohosheetAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "{{credentialId}}",
  "data":{
  "resourceId": "q3p6nbe4d7f13f8f04c19bec54a8ad77b8226",
  "data":{
    "method":"worksheet.list"
  }
  }
}
   */
  @Post('worksheet/getmany')
  async getmanyworksheet(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const resourceId = data.data.resourceId;
      const result = await this.performZohoSheetsAction(
        `${resourceId}`,
        'create',
        'POST',
        data,
      );
      if (result.status === 401 && data.simulator !== true) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyworksheet',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: 'Worksheetsheet getmany successfully',
        result,
        status: result.status
      });
    } catch (error) {
      this.logger.error('Error in gatmany:', error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  /**
   * [AUTO-GENERATED] Endpoint for module "row" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performzohosheetAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "{{credentialId}}",
  "data":{
  "resourceId": "q3p6nbe4d7f13f8f04c19bec54a8ad77b8226",
 "data":
  {
    
    "method":"row.insert",
    "worksheet_name":"Sheet1",
    "row":2,
    "json_data":[{"name":"Joe","Region":"South","Units":284}]
     
}
  }
}
*/

  @Post('row/create')
  async createrow(@Body() data: any, @Res() res: Response) {

    if (
      !data ||
      !data.data.data.method ||
      !data.data.data.worksheet_name ||
      !data.data.data.json_data ||
      !data.data.data.row
    ) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const body = new URLSearchParams({
        method: data.data.data.method,
        worksheet_name: data.data.data.worksheet_name,
        row: data.data.data.row,
        json_data: JSON.stringify(data.data.data.json_data),
      });
      data.data.data = body;
      const url = `${data.data.resourceId}`;
      const result = await this.performZohoSheetsAction(
        url,
        'insertcolums',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'insertColumns',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: 'records insertcolums successfully',
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error('Error in createrow:', error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "row" action "delete".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - RecordId: string (ID of the record to delete)
   * - Calls the integration helper "performzohosheetAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *{
 "credentialId": "{{credentialId}}",
 "data":{
  "resourceId": "q3p6nbe4d7f13f8f04c19bec54a8ad77b8226",
  "data":{
    "method":"row.delete",
  "worksheet_name": "Sheet1",
  "row": 2
 }
}
}

   */
  @Post('row/delete')
  async deleteRow(@Body() data: any, @Res() res: Response) {
    if (!data?.credentialId) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const resourceId = data.data.resourceId;

      const result = await this.performZohoSheetsAction(
        `${resourceId}`,
        'deleteRow',
        'POST',

        data,
      );
      if (result.status === 401 && data.simulator !== true) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteRow',
          functionArgs,
          data.credentialId,
        );
        return result;
      }

      return res.json({
        message: `Row ${data.data.row} deleted successfully`,
        result,
        status: result.status
      });
    } catch (error) {
      this.logger.error('Error in deleteRow:', error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "records" action "insertcolums".
     *  - Request Parameters (data):
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performzohosheetAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
  "credentialId": "{{credentialId}}",
  "data":
  {

  "resourceId":"q3p6nbe4d7f13f8f04c19bec54a8ad77b8226",
    "data":{    
    "method":"records.columns.insert",
    "worksheet_name":"Sheet2",
    "column_names":["Name", "Region","Units"]
     
}
  
}}
     */

  @Post('records/insertcolums')
  async insertColumns(@Body() data: any, @Res() res: Response) {
    if (
      !data ||
      !data.data.data.method ||
      !data.data.data.worksheet_name ||
      !data.data.data.column_names
    ) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const body = new URLSearchParams({
        method: data.data.data.method,
        worksheet_name: data.data.data.worksheet_name,
        column_names: JSON.stringify(data.data.data.column_names),
      });
      data.data.data = body;
      const url = `${data.data.resourceId}`;
      const result = await this.performZohoSheetsAction(
        url,
        'insertcolums',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'insertColumns',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: 'records insertcolums successfully',
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error('Error in insertcolums:', error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "records" action "create".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (data to create)
   * - Calls the integration helper "performzohosheetAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "{{credentialId}}",
  "data":{
  "resourceId": "q3p6nbe4d7f13f8f04c19bec54a8ad77b8226",
  "data":{

  "json_data": [
    { "Name": "Sakthi", "Region": "East", "Units": 150 },
    { "Name": "Sssss", "Region": "West", "Units": 200 }
  ],
  "method":"worksheet.records.add",
    "worksheet_name":"Sheet2",
    "header_row":1
     
  
  }
  }
}

   */
  @Post('records/create')
  async addRecordsToWorksheet(@Body() data: any, @Res() res: Response) {
    if (
      !data ||
      !data.data.data.method ||
      !data.data.data.worksheet_name ||
      !data.data.data.header_row ||
      !data.data.data.json_data
    ) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const body = new URLSearchParams({
        method: data.data.data.method,
        worksheet_name: data.data.data.worksheet_name,
        header_row: data.data.data.header_row,
        json_data: JSON.stringify(data.data.data.json_data),
      });
      data.data.data = body;
      const url = `${data.data.resourceId}`;
      const result = await this.performZohoSheetsAction(
        url,
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'addRecordsToWorksheet',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: 'records added successfully',
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error('Error in addRecordsToWorksheet:', error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  /**
     * [AUTO-GENERATED] Endpoint for module "records" action "delete".
     *  - Request Parameters (data):
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performzohosheetAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
  "credentialId": "{{credentialId}}",
  "data":{
  "resourceId": "q3p6nbe4d7f13f8f04c19bec54a8ad77b8226",


  "data":{
    "method":"worksheet.records.delete",
  "worksheet_name": "Sheet2",
  "criteria": "\"Name\"=\"wedqwed\"",
//  "row_array":[1,2],
  "delete_rows": true
  }
  }
}
     */

  @Post('records/delete')
  async deleteRecords(@Body() data: any, @Res() res: Response) {
    if (
      !data ||
      !data.data.data.method ||
      !data.data.data.worksheet_name ||
      !data.data.data.delete_rows
    ) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      let body;
      if (data.data.data.row_array) {
        body = new URLSearchParams({
          method: data.data.data.method,
          worksheet_name: data.data.data.worksheet_name || null,
          // criteria: data.data.data.criteria || null,
          row_array: JSON.stringify(data.data.data.row_array || null),
        });
      } else {
        body = new URLSearchParams(data.data.data);
      }

      data.data.data = body;

      const url = data.data.data.criteria
        ? `${data.data.resourceId}?criteria=${data.data.data.criteria}`
        : data.data.resourceId;
      const result = await this.performZohoSheetsAction(
        url,
        'delete',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteRecords',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: 'records deleted successfully',
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error('Error in deleted:', error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "records" action "getmany".
     *  - Request Parameters (data):
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performzohosheetAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
  "credentialId": "{{credentialId}}",
  "data":{
  "resourceId": "q3p6nbe4d7f13f8f04c19bec54a8ad77b8226",
  
  "data":{
        "method":"worksheet.records.fetch",
    "worksheet_name":"Sheet1",
    "count":1
}
  }
}

     */

  @Post('records/getmany')
  async getmanyRecords(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const url = `${data.data.resourceId}`;
      const result = await this.performZohoSheetsAction(
        url,
        'getmany',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyRecords',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: 'records getmany successfully',
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error('Error in getmany:', error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "records" action "update".
     *  - Request Parameters (data):
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performzohosheetAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
  "credentialId": "{{credentialId}}", 
  "data":{

  "resourceId": "q3p6nbe4d7f13f8f04c19bec54a8ad77b8226",
  "data":{
      "method":"worksheet.records.update",
    "worksheet_name":"Sheet1",
    "data":{"name":"muthu","Region":"South","Units":284}
  }
  }
}

     */

  @Post('records/update')
  async updateRecords(@Body() data: any, @Res() res: Response) {
    if (
      !data ||
      !data.data.data.method ||
      !data.data.data.worksheet_name ||
      !data.data.data.data
    ) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const body = new URLSearchParams({
        method: data.data.data.method,
        worksheet_name: data.data.data.worksheet_name,
        data: JSON.stringify(data.data.data.data),
      });
      data.data.data = body;
      const url = `${data.data.resourceId}`;
      const result = await this.performZohoSheetsAction(
        url,
        'update',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateRecords',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.json({
        message: 'records updated successfully',
        result,
        status: result.status,
      });
    } catch (error) {
      this.logger.error('Error in updated:', error);
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
  public async initializeFields(credentialId) {
    for (const field of fields) {
      if (typeof field.init === 'function') {
        const data = {
          credentialId,
          data: {},
        };
        await field.init(data);
      }
    }
  }
  @Post('getfields')
  async getfields(
    @Body() body: { category: string; name: string; credentialId?: string },
  ) {
    const { category, name, credentialId } = body;
    if (!category || !name) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Resource and operation are required in the request body',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      await this.initializeFields(credentialId);
      const relevantFields = this.generateFields(category, name);
      return relevantFields;
    } catch (error) {
      this.logger.error('Error:', error + error.stack);
    }
  }
}

export const zohosheets = new ZohoSheetsController();
