
// square.controller.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONTROLLER FILE.
// DO NOT modify the auto-generated endpoints below.
// For custom integration logic, extend the helper "performSquareAction".
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
  Query,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import axios, { Method } from 'axios';
import * as crypto from 'crypto';
import { initializeDB } from '../../ormconfig';
import { Credentials } from '../../entities/Credentials';
import { CustomLogger } from '../../logger/custom.logger';
import config, { XappName, modules as xappModules } from './square.config';
import { CredentialController } from 'src/credential/credential.controller';
import { fields } from './square.config';
import { error } from 'console';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';

let customergetmany;
let cataloggetmany;
let ordergetmany;
let invoicegetmany;
let paymentgetmany;
let taxgetmany;

@Controller('square')
export class SquareController {
  private readonly credentialsController: CredentialController =
    new CredentialController();
  private logger = new CustomLogger();

  public async initialize(credentialId: string) {
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

      if (!credentialRepository) {
        throw new HttpException(
          'Credentials not found in the database',
          HttpStatus.NOT_FOUND,
        );
      }

      let authData = credentialRepository.authData;

      // Parse if stored as string
      if (typeof authData === 'string') {
        authData = JSON.parse(authData);
      }

      const access_token = authData?.token?.access_token;
      const baseUrl = authData?.baseUrl;

      if (!access_token || !baseUrl) {
        throw new HttpException(
          'Missing access_token or baseUrl in authData',
          HttpStatus.BAD_REQUEST,
        );
      }

      return { access_token, baseUrl };
    } catch (error) {
      this.logger.error(
        'Error initializing credentials:',
        error?.message || error,
      );
      throw new HttpException(
        'Failed to initialize credentials',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('authorize')
  async authorize(@Body() reqBody: any, @Res() res: Response) {
    if (
      !reqBody.clientId ||
      !reqBody.redirectUri ||
      !reqBody.clientSecret ||
      !reqBody.environment
    ) {
      throw new HttpException(
        'Missing OAuth parameters',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const { node, environment, id, userId } = reqBody;
      const state = crypto.randomBytes(16).toString('hex');

      // Set base URL based on environment
      const authurl =
        environment === 'sandbox'
          ? 'https://app.squareupsandbox.com/oauth2/authorize'
          : 'https://app.squareup.com/oauth2/authorize';

      const baseUrl = `https://connect.squareupsandbox.com/v2`;
      const tokenurl = `https://connect.squareupsandbox.com/oauth2/token`;

      const scope = encodeURIComponent(
        'CUSTOMERS_READ CUSTOMERS_WRITE MERCHANT_PROFILE_READ ITEMS_READ ITEMS_WRITE INVENTORY_READ INVENTORY_WRITE ORDERS_WRITE ORDERS_READ INVOICES_WRITE INVOICES_READ PAYMENTS_WRITE PAYMENTS_READ',
      );

      let type: string = reqBody.type;
      let name: string = reqBody.name;

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
          [userId, `zohocrm_${node}`],
        );
        console.log('zohoauthdata:', zohoauthdata);
        if (zohoauthdata.length > 0) {
          const authData = zohoauthdata[0].auth_data;
          clientId = authData.clientId;
          clientSecret = authData.clientSecret;
          redirectUri = authData.redirectUri;
        } else {
          clientId = process.env.SQUARE_CLIENT_ID;
          clientSecret = process.env.SQUARE_CLIENT_SECRET;
          redirectUri = process.env.SQUARE_REDIRECT_URI;
        }
      }
      const data = {
        clientId,
        clientSecret,
        redirectUri,
        authurl,
        tokenurl,
        scope,
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
        result = await this.credentialsController.createCredentials(
          reqbody,
        );
        this.logger.debug(`New credentials created for:`, name);
      }
      if (!result) {
        throw new HttpException(
          'Credentials strore faild',
          HttpStatus.BAD_REQUEST,
        );
      }
      const authUrl = `${authurl}?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;

      this.logger.debug(`${XappName} auth URL:`, authUrl);
      console.log(authUrl);
      return res.json({
        authUrl: authUrl,
      });
    } catch (error) {
      console.log(error);
      this.logger.error('Error in authorize:', error);
      throw new HttpException(
        'Authorization error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    console.log('hiii');
    try {
      console.log('Full callback query:', req.query);

      const code = req.query.code as string;
      const state = req.query.state as string;

      console.log('code:', code, 'state:', state);

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

      const { clientId, clientSecret, redirectUri } = credential.authData;

      const baseUrl = credential.authData.baseUrl;
      const tokenurl = credential.authData.tokenurl;

      const tokenRequestData = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }).toString();

      const tokenResponse = await axios.post(tokenurl, tokenRequestData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      credential.authData['token'] = tokenResponse.data;
      await this.credentialsController.updateCredentials(
        credential.id,
        credential.authData,
      );
      const { redirect } = await import('./square.config');

      // Redirect user to frontend
      return res.redirect(redirect);
    } catch (error) {
      console.log(error);
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
      throw new HttpException('Missing credential ID', HttpStatus.BAD_REQUEST);
    }

    try {
      const id = reqBody.credentialId;
      const connection = await initializeDB();
      const credRepository = connection.getRepository(Credentials);
      const credentialRepository = await credRepository.findOne({
        where: { id },
      });

      if (!credentialRepository) {
        throw new HttpException('Credentials not found', HttpStatus.NOT_FOUND);
      }

      const authData = credentialRepository.authData;
      const { clientId, clientSecret, tokenurl, token } = authData;

      if (!token || !token.refresh_token) {
        throw new HttpException(
          'Refresh token not found',
          HttpStatus.BAD_REQUEST,
        );
      }

      const refreshToken = token.refresh_token;

      const tokenRequestData = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }).toString();

      const response = await axios.post(tokenurl, tokenRequestData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const tokens = response.data;

      // Update token and reassign refresh_token
      authData.token = tokens;
      authData.token.refresh_token = refreshToken;

      await this.credentialsController.updateCredentials(
        credentialRepository.id,
        authData,
      );

      return {
        message: 'square app access token refreshed successfully',
        token: tokens,
      };
    } catch (error) {
      console.log(
        'Refresh Token Error:',
        error?.response?.data || error.message || error,
      );
      this.logger.error('Error in refreshToken:', error);
      throw new HttpException(
        'Refresh token error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // /**
  //  * [AUTO-GENERATED] OAuth callback endpoint.
  //  * Implement token exchange, credential update, and refreshToken handling here.
  //  */

  // /**
  //  * [AUTO-GENERATED] Refresh token endpoint.
  //  * This endpoint should handle token expiry and refresh the access token.
  //  * Implement the refresh logic based on your authentication provider.
  //  */

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
   * [AUTO-GENERATED] Endpoint for module "Customers" action "create_customer".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "given_name": "keerthi",
            "family_name": "priya",
            "email_address": "anupriya@gmail.com",
            "phone_number": "+1-212-555-4240",
            "address": {
                "address_line_1": "123 Main St",
                "address_line_2": "Apt 4B",
                "locality": "City",
                "administrative_district_level_1": "State",
                "postal_code": "12345",
                "country": "US"
            }
        }
    }
}
   */

  @Post('customers/create')
  async createCustomers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performSquareAction(
        'customers',
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCustomers',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.status(HttpStatus.OK).json({
        message: `Square create_customer executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in create_customer:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Customers" action "update_customer".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *{
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "KDB4WSETNFECCV96N2P9RKHAD4",
        "data": {
            "given_name": "preethi",
            "family_name": "lakshmi",
            "email_address": "preethi@gmail.com",
            "phone_number": "+1-212-555-4240",
            "address": {
                "address_line_1": "123 New St",
                "address_line_2": "Apt 5C",
                "locality": "New City",
                "administrative_district_level_1": "New State",
                "postal_code": "54321",
                "country": "US"
            }
        }
    }
}
   */

  @Post('customers/update')
  async updateCustomers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performSquareAction(
        'customers',
        'update',
        'PUT',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateCustomers',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.status(HttpStatus.OK).json({
        message: `Square  update_customer executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in update_customer:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Customers" action "delete_customer".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *   {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "KDB4WSETNFECCV96N2P9RKHAD4"
    }
}
   */

  @Post('customers/delete')
  async deleteCustomers(@Body() data: any, @Res() res: Response) {
    const Id = data?.data?.Id;

    if (!Id) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Missing customer_id in request body',
      });
    }

    const url = `customers/${encodeURIComponent(Id)}`;

    try {
      const result = await this.performSquareAction(
        url,
        'delete_customer',
        'DELETE',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteCustomers',
          functionArgs,
          data.credentialId,
        );
        return result;
      }

      return res.status(HttpStatus.OK).json({
        message: `Square  delete_customer executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in delete_customer:`, error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Customers" action "get_customer".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "KDB4WSETNFECCV96N2P9RKHAD4"
    }
}
   */

  @Post('customers/get')
  async getCustomers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performSquareAction(
        'customers',
        'get',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getCustomers',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.status(HttpStatus.OK).json({
        message: `Square  get_customer executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in get_customer:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Customers" action "get_many_customers".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "limit": "1"
    }
}
   */

  @Post('customers/getmany')
  async getmanyCustomers(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performSquareAction(
        `customers`,
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyCustomers',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.status(HttpStatus.OK).json({
        message: `Square  get_many_customers executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in get_many_customers:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllCustomers(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performSquareAction(
        `customers`,
        'getmany',
        'GET',
        data,
      );

      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getAllCustomers',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return result.response.customers.map((data) => ({
        name: data.given_name,
        value: data.id,
      }));
    } catch (error) {
      this.logger.error(`Error in get_many_customers:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Orders" action "create_order".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "idempotency_key": "UNIQUE_KEY123345",
            "order": {
                "location_id": "L8ABRMW4KVWQH",
                "line_items": [
                    {
                        "name": "fruits",
                        "quantity": "10",
                        "base_price_money": {
                            "amount": 500,
                            "currency": "USD"
                        }
                    }
                ]
            }
        }
    }
}
   */

  @Post('orders/create')
  async createOrders(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performSquareAction(
        'orders',
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createOrders',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.status(HttpStatus.OK).json({
        message: `Square  create_order executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in create_order:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getLineTax(data: any): Promise<void> {
    try {
      const lineitems = data.data.data.Lineitems;
      const result = await this.performSquareAction(
        'catalog/list?types=TAX',
        'getmany',
        'GET',
        data,
      );

      const matchedTax: any[] = [];
      let applied_taxes: any = [];

      for (const lineitem of lineitems) {
        const names = lineitem.TaxName || [];
        const rates = lineitem.TaxRate || [];

        for (let i = 0; i < names.length; i++) {
          const name = names[i];
          const rate = parseFloat(rates[i]).toFixed(1);

          const matchedData = result.response.objects.find(
            (tax) =>
              tax?.tax_data?.name === name &&
              tax?.tax_data?.percentage?.toString() === rate,
          );

          if (matchedData) {
            const tax_uid = matchedData.tax_data.name.replace(/\s+/g, '_');

            matchedTax.push({
              uid: tax_uid,
              catalog_object_id: matchedData.id,
              scope: 'LINE_ITEM',
            });

            if (!applied_taxes) applied_taxes = [];
            applied_taxes.push({ tax_uid });
          }
        }

        lineitem['applied_taxes'] = applied_taxes;
      }

      data.data.data.order['taxes'] = matchedTax.length ? matchedTax : [];
      console.log('Applied tax mappings for:', data.data.data.Lineitems);
    } catch (error) {
      console.log('Error:', error);
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Orders" action "get_order".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *{
  "credentialId": "{{credentialId}}",
  "data": {
     "Id": "9HeVfXzF5Tl8vGvMjw9zOfrZLh4F"
    }
  }

   */

  @Post('orders/get')
  async getOrders(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performSquareAction(
        'orders',
        'get',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getOrders',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.status(HttpStatus.OK).json({
        message: `Square  get_order executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in get_order:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Orders" action "get_many_orders".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "limit": 3,
            "location_ids": [
                "L8ABRMW4KVWQH"
            ],
            "query": {
                "filter": {
                    "state_filter": {
                        "states": [
                            "OPEN"
                        ]
                    },
                    "date_time_filter": {
                        "updated_at": {
                            "start_at": "2025-04-03T20:00:00+00:00"
                        }
                    },
                    "sort": {
                        "sort_field": "UPDATED_AT",
                        "sort_order": "DESC"
                    }
                },
                "limit": 10
            }
        }
    }
}


   */

  @Post('orders/getmany')
  async getmanyOrders(@Body() data: any) {
    try {
      console.log(data.data.location_ids)

          let fromDate = data?.data?.argument?.fromdate;
          let toDate = data?.data?.argument?.todate;

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

                    let paginatedData:any={...data,
                      data:{
                        "location_ids": [
                          `${data.data.location_ids}`
                      ],
                      query :{
                          "filter": {
                            "date_time_filter": {
                              "updated_at": {
                                start_at:`${fromDate}T00:00:00Z`,
                                end_at:`${toDate}T23:59:59Z`
                              }
                            }
                          },
                          "sort": {
                              "sort_field": "UPDATED_AT",
                              "sort_order": "DESC"
                          }
                  }}}

                  console.log("dtatat",paginatedData)

      const result = await this.performSquareAction(
        'orders/search',
        'getmany',
        'POST',
        paginatedData,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyOrders',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return {
        message: `Square  get_many_orders executed successfully`,
        result,
        status: result.status
      };
    } catch (error) {
      this.logger.error(`Error in get_many_orders:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('orders/getAll')
  async getAllOrders(@Body() data: any) {
    try {
      data = {
        credentialId: data.credentialId,
        data: {
          data: {
            location_ids: ['L8ABRMW4KVWQH'],
            query: {
              filter: {
                state_filter: {
                  states: ['OPEN'],
                },
              },
            },
          },
        },
      };
      const result = await this.performSquareAction(
        'orders/search',
        'getAll',
        'POST',
        data,
      );

      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getAllOrders',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return result.response.orders.map((data) => ({
        name: data.line_items.map((data) => data.name),
        value: data.id,
      }));
      // return arrayofdata.line_items.map(d=>({name:d.name,value:arrayofdata.id}))
    } catch (error) {
      this.logger.error(`Error in get_many_orders:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Catalog" action "create_catalog_item".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "78a3c65d-0001-4073-82be-1d1e267cdfd4",
    "data": {
        "data": {
            "idempotency_key": "unique-id-21445",
            /////////////////////////////////////////////////////  TAX
            // "object": {
            //     "type": "TAX",
            //     "id": "#vat_tax_10",
            //     "tax_data": {
            //         "name": "new tax",
            //         "calculation_phase": "TAX_TOTAL_PHASE",
            //         "inclusion_type": "ADDITIVE",
            //         "percentage": "10.0",
            //         "applies_to_custom_amounts": true,
            //         "enabled": true
            // }
            // }
            /////////////////////////////////////////////////////  ITEM 
            "object": {
                "type": "ITEM",
                "id": "#Item_20",
                "item_data": {
                    "name": "NEw Item 4 Tax test",
                    "variations": [
                        {
                            "type": "ITEM_VARIATION",
                            "id": "#item_variation_01",
                            "item_variation_data": {
                                "name": "New Item Tax test Variation",
                                "price_money": {
                                    "amount": 1000,
                                    "currency": "USD"
                                }
                            }
                        }
                    ],
                    "tax_ids": [
                        "CL62ML4T5P6Z3MWV4XNRC4G5"
                    ]
                }
            }
        }
    }
}
   */

  @Post('catlogitem/create')
  async createCatlogItem(@Body() data: any, @Res() res: Response) {
    try {
      const result = await this.performSquareAction(
        // Use your service
        'catalog/object', // Fixed endpoint from documentation
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCatlogItem',
          functionArgs,
          data.credentialId,
        );
        return result;
      }

      return res.status(HttpStatus.OK).json({
        message: `Square create_catalog_item executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in create_catalog_item:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Catalog" action "delete_catalog_item".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "DZQ4HZ7DTMAJXHHSGQ76LIH5"
    }
}
   */
  @Post('catalogitem/delete')
  async deleteCatlogItems(@Body() data: any, @Res() res: Response) {
    const Id = data?.data?.Id;

    if (!Id) {
      throw new HttpException(
        'Missing object_id in request body',
        HttpStatus.BAD_REQUEST,
      );
    }

    const url = `catalog/object/${Id}`;

    try {
      const result = await this.performSquareAction(
        url,
        'delete_catalog_item',
        'DELETE',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteCatlogItems',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.status(HttpStatus.OK).json({
        message: `Square  delete_catalog_item executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in delete_catalog_item:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Catalog" action "get_catalog_item".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "DZQ4HZ7DTMAJXHHSGQ76LIH5"
    }
}
   */

  @Post('catalogitem/get')
  async getCatlogItems(@Body() data: any, @Res() res: Response) {
    if (!data?.data?.Id) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Missing catalog object ID in request body',
      });
    }

    try {
      const result = await this.performSquareAction(
        'catalog/object', // Correct endpoint
        'get_catalog_item',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getCatlogItems',
          functionArgs,
          data.credentialId,
        );
        return result;
      }

      return res.status(HttpStatus.OK).json({
        message: `Square  get_catalog_item executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in get_catalog_item:`, error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Catalog" action "get_many_catalog_items".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "limit": 1
    }
}

   */

  @Post('catlogitem/getmany')
  async getmanyCatlogItems(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performSquareAction(
        'catalog/list?types=ITEM,ITEM_VARIATION,MODIFIER,MODIFIER_LIST,CATEGORY,DISCOUNT,IMAGE',
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyCatlogItems',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.status(HttpStatus.OK).json({
        message: `Square Catalog get_many_catalog_items executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in get_many_catalog_items:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllCatlogItems(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performSquareAction(
        'catalog/list?types=ITEM,ITEM_VARIATION,MODIFIER,MODIFIER_LIST,CATEGORY,DISCOUNT,IMAGE',
        'getmany',
        'GET',
        data,
      );

      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getAllCatlogItems',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return result.response.objects.map((data) => ({
        name: data.item_data.name,
        value: data.id,
      }));
    } catch (error) {
      this.logger.error(`Error in get_many_catalog_items:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
 * [AUTO-GENERATED] Endpoint for module "Catalog" action "create_catalog_item".
 *  - Request Parameters (data): 
 * - CredentialId: string
 * - ModuleData: object (action-specific data)
 * - Calls the integration helper "performSquareAction".
 * DO NOT modify the method signature.
 *  Example usage:
 *   {
  "credentialId": "{{credentialId}}",
  "data": {
      "data": {
          "idempotency_key": "unique-id-2d445",
          "object": {
              "type": "TAX",
              "id": "#vat_tax_10",
              "tax_data": {
                  "name": "new tax",
                  "calculation_phase": "TAX_TOTAL_PHASE",
                  "inclusion_type": "ADDITIVE",
                  "percentage": "10.0",
                  "applies_to_custom_amounts": true,
                  "enabled": true
              }
          }
      }
  }
}
 */

  @Post('tax/create')
  async createCatlogTax(@Body() data: any, @Res() res: Response) {
    try {
      const result = await this.performSquareAction(
        'catalog/object',
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createCatlogItem',
          functionArgs,
          data.credentialId,
        );
        return result;
      }

      return res.status(HttpStatus.OK).json({
        message: `Square create_catalog_item executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in create_catalog_item:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Catalog" action "delete_catalog_item".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "V2SNTUDTX6DRSC3VVDA7MQYR"
    }
}
   */
  @Post('tax/delete')
  async deleteCatlogTax(@Body() data: any, @Res() res: Response) {
    const Id = data?.data?.Id;

    if (!Id) {
      throw new HttpException(
        'Missing object_id in request body',
        HttpStatus.BAD_REQUEST,
      );
    }

    const url = `catalog/object/${Id}`;

    try {
      const result = await this.performSquareAction(
        url,
        'delete_catalog_item',
        'DELETE',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'deleteCatlogItems',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.status(HttpStatus.OK).json({
        message: `Square  delete_catalog_item executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in delete_catalog_item:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Catalog" action "get_catalog_item".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "V2SNTUDTX6DRSC3VVDA7MQYR"
    }
}
   */

  @Post('tax/get')
  async getCatlogTax(@Body() data: any, @Res() res: Response) {
    if (!data?.data?.Id) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Missing catalog object ID in request body',
      });
    }

    try {
      const result = await this.performSquareAction(
        'catalog/object',
        'get_catalog_item',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getCatlogItems',
          functionArgs,
          data.credentialId,
        );
        return result;
      }

      return res.status(HttpStatus.OK).json({
        message: `Square  get_catalog_item executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in get_catalog_item:`, error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Catalog" action "get_many_catalog_items".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "limit": 1
    }
}

   */

  @Post('tax/getmany')
  async getmanyCatlogTax(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performSquareAction(
        'catalog/list?types=TAX',
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyCatlogItems',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.status(HttpStatus.OK).json({
        message: `Square Catalog get_many_catalog_items executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in get_many_catalog_items:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllCatlogTax(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performSquareAction(
        'catalog/list?types=TAX',
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getAllCatlogTax',
          functionArgs,
          data.credentialId,
        );
        return result;
      }

      return result.response.objects.map((data) => ({
        name: data.tax_data.name,
        value: data.id,
      }));
    } catch (error) {
      this.logger.error(`Error in get_many_catalog_items:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Payments" action "create_payment".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "idempotency_key": "unique-payment-id-1334",
            "amount_money": {
                "amount": 2000,
                "currency": "USD"
            },
            "source_id": "cnon:card-nonce-ok",
            "location_id": "L8ABRMW4KVWQH",
            "note": "Payment for T-Shirt",
            "reference_id": "T-shirt-order-12345",
            "customer_id": "21EEJM05DYTJ80QXA2Z7H76TG8",
            "billing_address": {
                "address_line_1": "1234 Main St",
                "address_line_2": "Apt 101",
                "locality": "Chicago",
                "administrative_district_level_1": "IL",
                "postal_code": "60606",
                "country": "US"
            }
        }
    }
}
   */

  @Post('payments/create')
  async createPayments(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performSquareAction(
        'payments',
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createPayments',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.status(HttpStatus.OK).json({
        message: `Square create_payment executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in create_payment:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Payments" action "get_payment".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "rdqvWOSfuWWP0acgKSCg1ateh1UZY"
    }
}
   */

  @Post('payments/get')
  async getPayments(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performSquareAction(
        'payments',
        'get',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getPayments',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.status(HttpStatus.OK).json({
        message: `Square get_payment executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in get_payment:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Payments" action "get_many_payments".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "{{credentialId}}",
    "data": {
      "updated_at_begin_time": "2025-01-01T00:00:00Z",
      "limit": 1
    }
  }



   */

  @Post('payments/getmany')
  async getmanyPayments(@Body() data: any, @Res() res: Response) {
    try {

      let fromDate = data?.data?.argument?.fromdate;
    let toDate = data?.data?.argument?.todate;

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

        let params = {
          updated_at_begin_time: `${fromDate}T00:00:00Z`,
          updated_at_end_time: `${toDate}T23:59:59Z`,
        };

      const paginatedData = {
        ...data,
        data: params,
      };
      const result = await this.performSquareAction(
        'payments',
        'getmany',
        'GET',
        paginatedData,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyPayments',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.status(HttpStatus.OK).json({
        message: `Square get_many_payments executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in get_many_payments:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllPayments(@Body() data: any) {
    try {
      const result = await this.performSquareAction(
        'payments',
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getAllPayments',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return result.response.payments.map((data) => ({
        name: data.note.name,
        value: data.id,
      }));
    } catch (error) {
      this.logger.error(`Error in get_many_payments:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Payments" action "refund_payment".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "rdqvWOSfuWWP0acgKSCg1ateh1UZY",
        "data": {
            "idempotency_key": "12345",
            "amount_money": {
                "amount": 1000,
                "currency": "USD"
            },
            "reason": "Example refund"
        }
    }
}
   */

  @Post('paymentsrefund/create')
  async refundPayments(@Body() data: any, @Res() res: Response) {
    if (!data) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Missing payment_id ',
      });
    }

    try {
      const result = await this.performSquareAction(
        'refunds',
        'refunds',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'refundPayments',
          functionArgs,
          data.credentialId,
        );
        return result;
      }

      return res.status(HttpStatus.OK).json({
        message: `Square refund_payment executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in refund_payment:`, error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Invoices" action "create_invoice".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "data": {
            "idempotency_key": "UNIQUE_KEY1233453",
            "invoice": {
                "location_id": "L8ABRMW4KVWQH",
                "order_id": "9HeVfXzF5Tl8vGvMjw9zOfrZLh4F",
                "primary_recipient": {
                    "customer_id": "21EEJM05DYTJ80QXA2Z7H76TG8"
                },
                "delivery_method": "EMAIL",
                "payment_requests": [
                    {
                        "request_type": "BALANCE",
                        "due_date": "2025-07-29",
                        "tipping_enabled": false,
                        "automatic_payment_source": "NONE",
                        "reminders": []
                    }
                ],
                "invoice_number": "INV-10",
                "title": "Invoice for Order #12345",
                "description": "Payment for T-Shirt order",
                "accepted_payment_methods": {
                    "card": true,
                    "square_gift_card": false,
                    "bank_account": false,
                    "buy_now_pay_later": false,
                    "cash_app_pay": false
                }
            }
        }
    }
}
   */

  @Post('invoices/create')
  async createInvoices(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performSquareAction(
        'invoices',
        'create',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'createInvoices',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.status(HttpStatus.OK).json({
        message: `Square create_invoice executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in create_invoice:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Invoices" action "update_invoice".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "inv:0-ChC1veexF5D1eYn2OvNDd4HBEN4N",
        "data": {
            "idempotency_key": "4es82188-0910-499e-ab4c-5d0071dad1be",
            "invoice": {
                "version":3,
                "location_id": "L8ABRMW4KVWQH",
                "delivery_method": "EMAIL"
            }
        }
    }
}
   */

  @Post('invoices/update')
  async updateInvoices(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performSquareAction(
        'invoices',
        'update',
        'PUT',
        data,
      );

      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'updateInvoices',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.status(HttpStatus.OK).json({
        message: `Square update_invoice executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in update_invoice:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Invoices" action "get_many_invoices".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
        "limit": 1,
        "data": {
            "location_id": "L8ABRMW4KVWQH"
        }
    }
}
   */

  @Post('invoices/getmany')
  async getmanyInvoices(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performSquareAction(
        'invoices',
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyInvoices',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.status(HttpStatus.OK).json({
        message: `Square get_many_invoices executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in get_many_invoices:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllInvoices(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      // TODO location_id based on the fetch the Data -> Invoices
      data.data.data = { location_id: 'L8ABRMW4KVWQH' };
      const result = await this.performSquareAction(
        'invoices',
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getAllInvoices',
          functionArgs,
          data.credentialId,
        );
        return result;
      }

      return result.response.invoices.map((data) => ({
        name: data.title.name,
        value: data.id,
      }));
    } catch (error) {
      this.logger.error(`Error in get_many_invoices:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Invoices" action "publish_invoice".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialId": "{{credentialId}}",
    "data": {
        "Id": "inv:0-ChC1veexF5D1eYn2OvNDd4HBEN4N",
        "data": {
            "version": "4"
        }
    }
}
   */

  @Post('invoicespublish/create')
  async publishInvoices(@Body() data: any, @Res() res: Response) {
    const invoiceId = data?.data?.Id;

    if (!invoiceId) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Missing invoice_id or version in request body',
      });
    }

    const url = `invoices/${decodeURIComponent(invoiceId)}/publish`;

    try {
      const result = await this.performSquareAction(
        url,
        'publish',
        'POST',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'publishInvoices',
          functionArgs,
          data.credentialId,
        );
        return result;
      }

      return res.status(HttpStatus.OK).json({
        message: `Square publish_invoice executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in publish_invoice:`, error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal server error',
      });
    }
  }

  /* 
   * [AUTO-GENERATED] Endpoint for module "location" action "get".
    *  - Request Parameters (data): 
    * - CredentialId: string
    * - ModuleData: object (action-specific data)
    * - Calls the integration helper "performSquareAction".
    * DO NOT modify the method signature.
    *  Example usage:
 {
    "credentialId": "{{credentialId}}",
    "data": {
        " Id": "L8ABRMW4KVWQH"
    }
}
   */

  @Post('locations/get')
  async getLocation(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performSquareAction(
        'locations',
        'get',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getLocation',
          functionArgs,
          data.credentialId,
        );
        return result;
      }
      return res.status(HttpStatus.OK).json({
        message: `Square  get_location executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in get_location:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "Locations" action "get_many_locations".
   *  - Request Parameters (data): 
   * - CredentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performSquareAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialId": "{{credentialId}}",
    "data": {
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
      const result = await this.performSquareAction(
        'locations',
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getmanyLocations',
          functionArgs,
          data.credentialId,
        );
        return result;
      }

      return res.status(HttpStatus.OK).json({
        message: `Square  get_many_locations executed successfully`,
        result,
     status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in get_many_locations:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllLocations(@Body() data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performSquareAction(
        'locations',
        'getmany',
        'GET',
        data,
      );
      if (result.status === 401) {
        const functionArgs = Array.from(arguments).slice(0, 2);
        const result = await this.AuthError(
          'getAllLocations',
          functionArgs,
          data.credentialId,
        );
        return result;
      }

      return result.response.locations.map((data) => ({
        name: data.name,
        value: data.id,
      }));
    } catch (error) {
      this.logger.error(`Error in get_many_locations:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async curlSquare(
    module: string,
    action: string,
    method: string,
    argumentData: any,
  ): Promise<any> {
    try {
      const { credentialId, data } = argumentData;
      const { Id } = data;

      const initializeData = await this.initialize(credentialId);
      if (!initializeData) {
        throw new Error('Failed to initialize Square credentials');
      }

      const { access_token, baseUrl } = initializeData;
      if (!access_token || !baseUrl) {
        throw new Error('Invalid Square credentials');
      }

      let url = `${baseUrl}/${module}`;

      // const encodedId = encodeURIComponent(Id);

      // Use encodedId instead of Id
      if (method === 'GET' && Id) {
        url += `/${Id}`;
      }
      if (module === 'refunds' && method === 'POST' && Id) {
        data.data.payment_id = Id;
      }

      const shouldAppendId =
        Id &&
        (method === 'PUT' || method === 'POST') &&
        !['refunds', 'publish'].some((path) => url.includes(path));
      if (shouldAppendId) {
        url += `/${Id}`;
      }

      const options: any = {
        method,
        url,
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      };

      if (module.includes('orders/search')) {
        if (argumentData) options.data = data;
      } else if (action === 'getmany') {
        if (argumentData) options.params = data;
      } else {
        if (argumentData) options.data = data.data;
      }

      console.log(options)
      const response = await axios(options);
      return { response: response.data, status: response.status };
    } catch (error) {
      console.log(error)
      console.error('Square API Error:', error.response?.data || error.message);

      {
        return {
          response: error.response?.data || error.message,
          status: error.response?.status || 500,
        };
      }
    }
  }

  private async performSquareAction(
    module: string,
    action: string,
    method: string,
    data: any,
  ): Promise<any> {
    return await this.curlSquare(module, action, method, data);
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

  /*  Example usage:
  *  {
"category":"users",
"name":"getmany",
"data":{
  "credentialId":"b0beb80b-acc4-41a6-a548-fe59061219c8"
}
}
}
*/

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

  public async initializefields(credentialId) {
    try {
      const id: any = credentialId;
      const connection = await initializeDB();
      const credRepository = connection.getRepository(Credentials);
      const credentialRepository = await credRepository.findOne({
        where: { id },
      });
      const access_token =
        await credentialRepository.authData.token.access_token;
      return { access_token: access_token };
    } catch (error) {
      this.logger.error('Error initializing square :', error + error.stack);
    }
  }
}

export const square = new SquareController();
