// coppercrm.controller.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONTROLLER FILE.
// DO NOT modify the auto-generated endpoints below.
// For custom integration logic, extend the helper "performcoppercrmAction".
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
import config, { XappName, modules as xappModules } from './coppercrm.config';
import { CredentialController } from 'src/credential/credential.controller';
import { fields } from './coppercrm.config';
import { access } from 'fs';

@Controller('coppercrm')
export class CoppercrmController {
  private logger = new CustomLogger();
  public credentialsController: CredentialController =
    new CredentialController();

    @Post('initialize')
  public async initialize(@Body() credentialId) {
    try {
      const id: any = credentialId.credentialId;;
      const connection = await initializeDB();
      if (!connection) {
        console.error('Database connection failed in initialize.');
        return undefined;
      }
      const credRepository = connection.getRepository(Credentials);
      const credentialRepository = await credRepository.findOne({
        where: { id },
      }); // Find credential
      if (!credentialRepository) {
        console.error(`Credential not found for ID: ${credentialId}`);
        return undefined;
      }

      const apikey = credentialRepository.authData?.token.access_token;
      const useremail = credentialRepository.authData?.token.useremail;
      const baseurl =  credentialRepository.authData?.baseUrl;

      if (!apikey || !useremail) {
        console.error(
          'Error: Could not retrieve apikey, baseUrl, or userEmail from authData',
        );
        return undefined;
      }

      return { apikey, useremail };
    } catch (error) {
      console.error('Initialize error:', error);
      this.logger.error('Error initializing Node:', error + error.stack);
      return undefined;
    }
  }
  /**
   * [AUTO-GENERATED] OAuth authorize endpoint.
   * This endpoint initiates the authentication flow.
   * Implement the actual token request and error handling as needed.
   */

  @Post('authorize')
  async authorize(
    @Body()
    reqBody: {
      userId?: any;
      id?: any;
      name?: string;
      type?: string;
      useremail?: any;
      accessToken?: any;
      node?: string;
      baseUrl?: string;
    },
    @Res() res: any,
  ) {
    try {
      const { id, name, type, accessToken, userId, node, baseUrl, useremail } =
        reqBody;
      if (userId.length > 0) {
        const connection = await initializeDB();
        const credentialRepository = connection.getRepository(Credentials);
        let coppercrmauthdata = await credentialRepository.query(
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
        // const  name = `shopify_${node}`;
        const type = 'shopify_oauth1';
        const reqbody = {
          data: data,
          name: name,
          type: type,
          userId: userId,
        };
        if (
          Array.isArray(coppercrmauthdata) &&
          coppercrmauthdata.length > 0 &&
          coppercrmauthdata[0]?.id
        ) {
          await this.credentialsController.updateCredentials(
            coppercrmauthdata[0].id,
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
          shopurl: baseUrl,
          token: {
            access_token: accessToken,
            useremail: useremail,
          },
        };
        const reqbody = {
          name: name,
          type: type,
          data: data,
          userId: userId,
        };
        const response: any = await this.verify({
          access_token: accessToken,
          useremail: useremail,
          baseurl: baseUrl,
        });
        if (response.status === 200) {
          if (id) {
            const updatedata =
              await this.credentialsController.updateCredentials(id, data);
          } else {
            const createdata =
              await this.credentialsController.createCredentials(reqbody);
          }
          const { redirect } = await import('./coppercrm.config');
          return res.redirect(redirect);
        } else {
          return res.send(response);
        }
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server Error' });
    }
  }

  @Post('coppercrmauthorize')
  async callback(
    @Body()
    reqBody: {
      data: { accessToken: any; baseUrl: any; useremail: any };
      state;
    },
    @Res() res: Response,
  ) {

      if (!reqBody.data.accessToken || !reqBody.data.useremail  || !reqBody.data.baseUrl) {
      throw new HttpException('Missing  Required', HttpStatus.BAD_REQUEST);
    }
    const returnedState = reqBody.state;
    try {
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
          access_token: reqBody.data.accessToken,
          useremail: reqBody.data.useremail,
        };

            credential.authData["baseUrl"] = reqBody.data.baseUrl;
        credential.authData["token"] = accessToken
  
        const response: any = await this.verify({
          access_token: reqBody.data.accessToken,
          useremail: reqBody.data.useremail,
          baseurl: reqBody.data.baseUrl,
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
      const accessToken = verfifydata.access_token;
      const useremail = verfifydata.useremail;
      const baseurl =
        verfifydata?.baseurl ;
      let url = `${baseurl}/tags`;
      const method = 'GET';

      const options: any = {
        method,
        url,
        headers: {
          'Content-Type': 'application/json',
          'X-PW-Application': 'developer_api',
          'X-PW-AccessToken': accessToken,
          'X-PW-UserEmail': useremail,
        },
      };
      const response = await axios(options);
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
  /**
   * [AUTO-GENERATED] OAuth callback endpoint.
   * Implement token exchange, credential update, and refreshToken handling here.
   */

  /**
   * [AUTO-GENERATED] Refresh token endpoint.
   * This endpoint should handle token expiry and refresh the access token.
   * Implement the refresh logic based on your authentication provider.
   */

  // ---------------------------------------------------------------------------
  // AUTO-GENERATED ENDPOINTS FOR MODULE ACTIONS (as defined in the blueprint JSON)
  // ---------------------------------------------------------------------------

//   /**
//      * [AUTO-GENERATED] Endpoint for module "lead" action "create".
//      *  - Request Parameters (data): 
//      * - CredentialId: string
//      * - ModuleData: object (data to create)
//      * - Calls the integration helper "performcoppercrmAction".
//      * DO NOT modify the method signature.
//      *  Example usage:
//      *  {
//     "credentialId":"4b5a60d7-3070-41f3-a1fe-acbe7224ebb0",
//     "data":{
//         "data":{
//   "name":"My Lead",
//   "email": {
//     "email":"mylead@noemail.com",
//     "category":"work"
//   },
//   "phone_numbers": [
//     {
//       "number":"415-123-45678",
//       "category":"mobile"

//     }
//   ],
//   "address": {
//     "street": "123 Main Street",
//     "city": "Savannah",
//     "state": "Georgia",
//     "postal_code": "31410",
//     "country": "United States"
//   }
//     }
// }
// }
//      */


// payment required

//   @Post('lead/create')
//   async createLead(@Body() data: any, @Res() res: Response) {
//     if (!data) {
//       throw new HttpException(
//         'Request body cannot be empty',
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//     try {
//       const result = await this.performcoppercrmAction(
//         'leads',
//         'create',
//         'POST',
//         data,
//       );
//       return res.json({
//         message: `coppercrm lead create executed successfully`,
//       result,
// status: result.status,
//       });
//     } catch (error) {
//       this.logger.error(`Error in lead/create:`, error);
//       throw new HttpException(
//         error.message || 'Internal server error',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }

//   /**
//      * [AUTO-GENERATED] Endpoint for module "lead" action "get".
//      *  - Request Parameters (data): 
//      * - CredentialId: string
//      * - RecordId: string (ID of the record to fetch)
//      * - Calls the integration helper "performcoppercrmAction".
//      * DO NOT modify the method signature.
//      *  Example usage:
//      *  {
//     "credentialId":"4b5a60d7-3070-41f3-a1fe-acbe7224ebb0",
//     "data":{
//         "Id":"90772755"
//     }
// }
//      */

//   @Post('lead/get')
//   async getLead(@Body() data: any, @Res() res: Response) {
//     if (!data) {
//       throw new HttpException(
//         'Request body cannot be empty',
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//     try {
//       const result = await this.performcoppercrmAction(
//         'leads',
//         'get',
//         'GET',
//         data,
//       );
//       return res.json({
//         message: `coppercrm lead get executed successfully`,
//       result,
// status: result.status,
//       });
//     } catch (error) {
//       this.logger.error(`Error in lead/get:`, error);
//       throw new HttpException(
//         error.message || 'Internal server error',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }

//   /**
//      * [AUTO-GENERATED] Endpoint for module "lead" action "getmany".
//      *  - Request Parameters (data): 
//      * - CredentialId: string
//      * - Filters: object (optional filters for querying records)
//      * - Calls the integration helper "performcoppercrmAction".
//      * DO NOT modify the method signature.
//      *  Example usage:
//      *  {
//     "credentialId":"4b5a60d7-3070-41f3-a1fe-acbe7224ebb0",
//     "data": {
//         "data":{
//     "page_size": 15,
//     "page_number": 1
//   }
// }
// }
//      */

//   @Post('lead/getmany')
//   async getmanyLead(@Body() data: any, @Res() res: Response) {
//     if (!data) {
//       throw new HttpException(
//         'Request body cannot be empty',
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//     try {
//       const result = await this.performcoppercrmAction(
//         'leads',
//         'getmany',
//         'POST',
//         data,
//       );
//       return res.json({
//         message: `coppercrm lead getmany executed successfully`,
//         result,
//          status: result.status,
//       });
//     } catch (error) {
//       this.logger.error(`Error in lead/getmany:`, error);
//       throw new HttpException(
//         error.message || 'Internal server error',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }

//   /**
//      * [AUTO-GENERATED] Endpoint for module "lead" action "update".
//      *  - Request Parameters (data): 
//      * - CredentialId: string
//      * - ModuleData: object (data to update)
//      * - Calls the integration helper "performcoppercrmAction".
//      * DO NOT modify the method signature.
//      *  Example usage:
//      *  {
//     "credentialId":"4b5a60d7-3070-41f3-a1fe-acbe7224ebb0",
//     "data":{
//         "Id":"90772755",
//         "data":{
//             "middle_name": "New"
//         }
//     }
// }
//      */

//   @Post('lead/update')
//   async updateLead(@Body() data: any, @Res() res: Response) {
//     if (!data) {
//       throw new HttpException(
//         'Request body cannot be empty',
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//     try {
//       const result = await this.performcoppercrmAction(
//         'leads',
//         'update',
//         'PUT',
//         data,
//       );
//       return res.json({
//         message: `coppercrm lead update executed successfully`,
//         result,
//          status: result.status,
//       });
//     } catch (error) {
//       this.logger.error(`Error in lead/update:`, error);
//       throw new HttpException(
//         error.message || 'Internal server error',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }

//   /**
//      * [AUTO-GENERATED] Endpoint for module "lead" action "delete".
//      *  - Request Parameters (data): 
//      * - CredentialId: string
//      * - RecordId: string (ID of the record to delete)
//      * - Calls the integration helper "performcoppercrmAction".
//      * DO NOT modify the method signature.
//      *  Example usage:
//      * {
//     "credentialId":"4b5a60d7-3070-41f3-a1fe-acbe7224ebb0",
//     "data":{
//         "Id":"90772755"
//     }
// }
//      */

//   @Post('lead/delete')
//   async deleteLead(@Body() data: any, @Res() res: Response) {
//     if (!data) {
//       throw new HttpException(
//         'Request body cannot be empty',
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//     try {
//       const result = await this.performcoppercrmAction(
//         'leads',
//         'delete',
//         'DELETE',
//         data,
//       );
//       return res.json({
//         message: `coppercrm lead delete executed successfully`,
//         result,
//          status: result.status,
//       });
//     } catch (error) {
//       this.logger.error(`Error in lead/delete:`, error);
//       throw new HttpException(
//         error.message || 'Internal server error',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }

  /**
     * [AUTO-GENERATED] Endpoint for module "opportunity" action "create".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "data":{
  "name": "New Demo Opportunity",
  "primary_contact_id": 175057532
 
    }
}
}
     */

  @Post('opportunity/create')
  async createOpportunity(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performcoppercrmAction(
        'opportunities',
        'create',
        'POST',
        data,
      );
      return res.json({
        message: `coppercrm opportunity create executed successfully`,
        result,
         status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in opportunity/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "opportunity" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"34938223"
    }
}
     */

  @Post('opportunity/get')
  async getOpportunity(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performcoppercrmAction(
        'opportunities',
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `coppercrm opportunity get executed successfully`,
        result,
         status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in opportunity/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "opportunity" action "getmany".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - Filters: object (optional filters for querying records)
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data": {
        "data":{
    "page_size": 15,
    "page_number": 1
  }
}
}
     */

  @Post('opportunity/getmany')
  async getmanyOpportunity(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performcoppercrmAction(
        'opportunities',
        'getmany',
        'POST',
        data,
      );
      return res.json({
        message: `coppercrm opportunity getmany executed successfully`,
        result,
         status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in opportunity/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "opportunity" action "update".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to update)
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"34938223",
        "data":{
  "details":"This is an update"
}
    }
}
     */

  @Post('opportunity/update')
  async updateOpportunity(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performcoppercrmAction(
        'opportunities',
        'update',
        'PUT',
        data,
      );
      return res.json({
        message: `coppercrm opportunity update executed successfully`,
        result,
         status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in opportunity/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "opportunity" action "delete".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to delete)
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"34938223"
       
    }
}
     */

  @Post('opportunity/delete')
  async deleteOpportunity(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performcoppercrmAction(
        'opportunities',
        'delete',
        'DELETE',
        data,
      );
      return res.json({
        message: `coppercrm opportunity delete executed successfully`,
        result,
         status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in opportunity/delete:`, error);
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
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
  "credentialId":"{{credentialId}}",
  "data": {
    "data": {
  "name":"ABC",
  "emails": [
    {
    "email":"selva12@noemail.com",
    "category":"work"
    }
  ],
  "address": {
    "street": "123 Main Street",
    "city": "Savannah",
    "state": "Georgia",
    "postal_code": "31410",
    "country": "United States"
  },
  "phone_numbers": [
    {
    "number":"415-123-456799",
    "category":"mobile"
    }
  ]
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
      const result = await this.performcoppercrmAction(
        'people',
        'create',
        'POST',
        data,
      );
      return res.json({
        message: `coppercrm person create executed successfully`,
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
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"175057620"
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
      const result = await this.performcoppercrmAction(
        'people',
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `coppercrm person get executed successfully`,
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
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data": {
        "data":{
    "page_size": 1,
    "page_number": 2
  }
}
}
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
      const result = await this.performcoppercrmAction(
        'people',
        'getmany',
        'POST',
        data,
      );
      return res.json({
        message: `coppercrm person getmany executed successfully`,
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
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"175057620",
        "data":{
            "name":"abc"
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
      const result = await this.performcoppercrmAction(
        'people',
        'update',
        'PUT',
        data,
      );
      return res.json({
        message: `coppercrm person update executed successfully`,
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
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"175057620"
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
      const result = await this.performcoppercrmAction(
        'people',
        'delete',
        'DELETE',
        data,
      );
      return res.json({
        message: `coppercrm person delete executed successfully`,
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
     * [AUTO-GENERATED] Endpoint for module "companies" action "create".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "data":{
  "name": "Demo Company",
  "email_domain": "democompany.com",
  "details": "This is a demo company",
  "address": {
    "street": "123 Main Street",
    "city": "Savannah",
    "state": "Georgia",
    "postal_code": "31410",
    "country": "United States"
  },
  "phone_numbers": [
    {
      "number": "415-123-45678",
      "category": "work"
    }
  ]
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
      const result = await this.performcoppercrmAction(
        'companies',
        'create',
        'POST',
        data,
      );
      return res.json({
        message: `coppercrm companies create executed successfully`,
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
     * [AUTO-GENERATED] Endpoint for module "companies" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"73460744"
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
      const result = await this.performcoppercrmAction(
        'companies',
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `coppercrm companies get executed successfully`,
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
     * [AUTO-GENERATED] Endpoint for module "companies" action "getmany".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - Filters: object (optional filters for querying records)
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data": {
        "data":{
    "page_size": 15,
    "page_number": 1
  }
}
}
     */

  @Post('companies/getmany')
  async getmanyCompanies(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performcoppercrmAction(
        'companies',
        'getmany',
        'POST',
        data,
      );
      return res.json({
        message: `coppercrm companies getmany executed successfully`,
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
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"73460744",
        "data":{
  "details":"This is an update"
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
      const result = await this.performcoppercrmAction(
        'companies',
        'update',
        'PUT',
        data,
      );
      return res.json({
        message: `coppercrm companies update executed successfully`,
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
     * - RecordId: string (ID of the record to delete)
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"73460744"
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
      const result = await this.performcoppercrmAction(
        'companies',
        'delete',
        'DELETE',
        data,
      );
      return res.json({
        message: `coppercrm companies delete executed successfully`,
      result,
status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in companies/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "activity" action "create".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "data":{
  "parent": {
    "type": "person",
    "id": 175057532
  },
  "type": {
    "category": "user",
    "id":0
  },
  "details": "This is the description of this note"

}
    }
}
     */

  @Post('activity/create')
  async createActivity(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performcoppercrmAction(
        'activities',
        'create',
        'POST',
        data,
      );
      return res.json({
        message: `coppercrm activity create executed successfully`,
      result,
status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in activity/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "activity" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"12507827874"
    }
}
     */

  @Post('activity/get')
  async getActivity(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performcoppercrmAction(
        'activities',
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `coppercrm activity get executed successfully`,
      result,
status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in activity/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "activity" action "getmany".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - Filters: object (optional filters for querying records)
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data": {
        "data":{
    "page_size": 15,
    "page_number": 1
  }
}
}
     */

  @Post('activity/getmany')
  async getmanyActivity(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performcoppercrmAction(
        'activities',
        'getmany',
        'POST',
        data,
      );
      return res.json({
        message: `coppercrm activity getmany executed successfully`,
      result,
status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in activity/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "activity" action "update".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to update)
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"12507827874",
        "data":{
            "details": "This is the description of the new note"
        }
    }
}
     */

  @Post('activity/update')
  async updateActivity(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performcoppercrmAction(
        'activities',
        'update',
        'PUT',
        data,
      );
      return res.json({
        message: `coppercrm activity update executed successfully`,
      result,
status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in activity/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "activity" action "delete".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to delete)
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"12507827874"
        
    }
}
     */

  @Post('activity/delete')
  async deleteActivity(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performcoppercrmAction(
        'activities',
        'delete',
        'DELETE',
        data,
      );
      return res.json({
        message: `coppercrm activity delete executed successfully`,
      result,
status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in activity/delete:`, error);
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
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "data":{
  "name": "Demo task",
  "related_resource": {
    "id": 175057532,
    "type": "person"
  },
  "due_date": 1496799000,
  "reminder_date": null,
  "priority": "None",
  "status": "Open",
  "details": "This needs to be done!",
  "tags": [],
  "custom_fields": []
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
      const result = await this.performcoppercrmAction(
        'tasks',
        'create',
        'POST',
        data,
      );
      return res.json({
        message: `coppercrm task create executed successfully`,
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
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"54791719"
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
      const result = await this.performcoppercrmAction(
        'tasks',
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `coppercrm task get executed successfully`,
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
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"4b5a60d7-3070-41f3-a1fe-acbe7224ebb0",
    "data": {
        "data":{
    "page_size": 15,
    "page_number": 1
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
      const result = await this.performcoppercrmAction(
        'tasks',
        'getmany',
        'POST',
        data,
      );
      return res.json({
        message: `coppercrm task getmany executed successfully`,
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
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"54791719",
        "data":{
           "name": "New Demo task"
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
      const result = await this.performcoppercrmAction(
        'tasks',
        'update',
        'PUT',
        data,
      );
      return res.json({
        message: `coppercrm task update executed successfully`,
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
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"54791719"
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
      const result = await this.performcoppercrmAction(
        'tasks',
        'delete',
        'DELETE',
        data,
      );
      return res.json({
        message: `coppercrm task delete executed successfully`,
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
     * [AUTO-GENERATED] Endpoint for module "user" action "get".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - RecordId: string (ID of the record to fetch)
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"1203002"
    }
}
     */

  @Post('users/get')
  async getUser(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performcoppercrmAction(
        'users',
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `coppercrm user get executed successfully`,
      result,
status: result.status,
      });
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
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data": {
        "data":{
    "page_size": 20,
    "page_number": 1
    
  }
}
}
     */

  @Post('users/getmany')
  async getmanyUser(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performcoppercrmAction(
        'users',
        'getmany',
        'POST',
        data,
      );
      return res.json({
        message: `coppercrm user getmany executed successfully`,
      result,
status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in user/getmany:`, error);
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
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "data":{
            
  "name":"New Demo Project"

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
      const result = await this.performcoppercrmAction(
        'projects',
        'create',
        'POST',
        data,
      );
      return res.json({
        message: `coppercrm project create executed successfully`,
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
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *{
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"1619763"
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
      const result = await this.performcoppercrmAction(
        'projects',
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `coppercrm project get executed successfully`,
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
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data": {
        "data":{
    "page_size": 15,
    "page_number": 1
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
      const result = await this.performcoppercrmAction(
        'projects',
        'getmany',
        'POST',
        data,
      );
      return res.json({
        message: `coppercrm project getmany executed successfully`,
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
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"1619763",
        "data":{
            "details": "This is a new project"
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
      const result = await this.performcoppercrmAction(
        'projects',
        'update',
        'PUT',
        data,
      );
      return res.json({
        message: `coppercrm project update executed successfully`,
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
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"1619763"
    
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
      const result = await this.performcoppercrmAction(
        'projects',
        'delete',
        'DELETE',
        data,
      );
      return res.json({
        message: `coppercrm project delete executed successfully`,
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
     * [AUTO-GENERATED] Endpoint for module "webhooks" action "create".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - ModuleData: object (data to create)
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data":{
        "data":{
  "target": "https://hooks.zapier.com/hooks/catch/21662157/2wkmqp6/",
  "type": "lead",
  "event": "new",
  "secret": {
    "secret": "hook_source",
    "key": "copper_notifications"
  },
  "headers": {
    "Authentication": "Bearer token"
  },
  "custom_field_computed_values": true
}
    }
}
     */

  @Post('webhooks/create')
  async createWebhooks(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performcoppercrmAction(
        'webhooks',
        'create',
        'POST',
        data,
      );
      return res.json({
        message: `coppercrm webhooks create executed successfully`,
      result,
status: result.status,
      });
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
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"465351"
}
}
     */

  @Post('webhooks/get')
  async getWebhooks(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performcoppercrmAction(
        'webhooks',
        'get',
        'GET',
        data,
      );
      return res.json({
        message: `coppercrm webhooks get executed successfully`,
      result,
status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in webhooks/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * [AUTO-GENERATED] Endpoint for module "webhooks" action "getmany".
     *  - Request Parameters (data): 
     * - CredentialId: string
     * - Filters: object (optional filters for querying records)
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     *  {
    "credentialId":"{{credentialId}}",
    "data": {
        "data":{
    "page_size": 15,
    "page_number": 1
  }
}
}
     */

  @Post('webhooks/getmany')
  async getmanyWebhooks(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performcoppercrmAction(
        'webhooks',
        'getmany',
        'GET',
        data,
      );
      return res.json({
        message: `coppercrm webhooks getmany executed successfully`,
      result,
status: result.status,
      });
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
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"465351",
        "data":{
  "type":"lead",
  "event":"update"
}
}
}
     */

  @Post('webhooks/update')
  async updateWebhooks(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performcoppercrmAction(
        'webhooks',
        'update',
        'PUT',
        data,
      );
      return res.json({
        message: `coppercrm webhooks update executed successfully`,
      result,
status: result.status,
      });
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
     * - Calls the integration helper "performcoppercrmAction".
     * DO NOT modify the method signature.
     *  Example usage:
     * {
    "credentialId":"{{credentialId}}",
    "data":{
        "Id":"465351"
}
}
     */

  @Post('webhooks/delete')
  async deleteWebhooks(@Body() data: any, @Res() res: Response) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performcoppercrmAction(
        'webhooks',
        'delete',
        'DELETE',
        data,
      );
      return res.json({
        message: `coppercrm webhooks delete executed successfully`,
      result,
status: result.status,
      });
    } catch (error) {
      this.logger.error(`Error in webhooks/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('contacts')
  public async getAllContacts(credentialsId) {
    try {
      const initializeData: any = await this.initialize(credentialsId);
      const { useremail, apikey } = initializeData;
      console.log(useremail , apikey)
      const method = 'get';
      let url = `https://api.copper.com/developer_api/v1/people`;
      const headers: any = {
        'Content-Type': 'application/json',
        'X-PW-Application': 'developer_api',
      };

      if (apikey) {
        headers['X-PW-AccessToken'] = apikey;
      }
      if (useremail) {
        headers['X-PW-UserEmail'] = useremail;
      }
      const options: any = {
        method,
        url,
        headers: headers,
      };
      console.log('options:', options);
      const response = await axios(options);
      console.log(response.data)
      if (!response || !Array.isArray(response.data)) {
        return [];
      }

      return response.data.map((item) => ({
        name: item.name,
        value: item.id,
      }));
    } catch (error) {
      console.log('Error:', error.response);
      return [];
    }
  }

  public async curl(
    module: string,
    action: string,
    method: string,
    argumentdata: any,
  ): Promise<any> {
    let baseUrl = 'https://api.copper.com/developer_api/v1';
    let api_key, userEmail;
    try {
      const { credentialId, data, simulator, useremail, apikey } = argumentdata;

      if (simulator === true) {
        api_key = apikey;
        userEmail = useremail;
      } else {
        const initializeData = await this.initialize(credentialId);
        if (!initializeData) {
          return { response: ['Initialization failed'], status: 500 };
        }

        const { useremail, apikey } = initializeData;
        api_key = apikey;
        userEmail = useremail;
      }

      let url = `${baseUrl}/${module}`;

      if (action === 'getmany') {
        if (module === 'webhooks') {
          url = `${baseUrl}/webhooks`;
        } else {
          url += '/search';
        }
      } else if (data?.Id) {
        url += `/${data.Id}`;
      }
      const headers: any = {
        'Content-Type': 'application/json',
        'X-PW-Application': 'developer_api',
      };

      if (api_key) {
        headers['X-PW-AccessToken'] = api_key;
      }
      if (userEmail) {
        headers['X-PW-UserEmail'] = userEmail;
      }

      const options: any = {
        method,
        url,
        headers: headers,
      };
      if (action === 'getmany') {
        if (argumentdata) options.params = data.data;
      } else {
        options.data = data.data;
      }

      const response: any = await axios(options);
      return { response: response.data, status: response.status };
    } catch (error) {
      console.log(error);
      return {
        response: [error.response?.data || error.message],
        status: error.response?.status || 500,
      };
    }
  }
  private async performcoppercrmAction(
    module: string,
    action: string,
    method: string,
    data: any,
  ): Promise<any> {
    const resultData = await this.curl(module, action, method, data);
    return resultData;
  }

  /**
   * [AUTO-GENERATED] Helper method to perform a coppercrm action.
   * This method is a stub—extend it to integrate with the actual API for your xapp.
   *
   * Validations:
   * - Ensure that the provided module and action are supported.
   * - Validate the "data" structure as needed.
   *
   * DO NOT change the method signature.
   */
  // private async performcoppercrmAction(module: string, action: string, data: any): Promise<any> {
  //   // TODO: Implement the actual integration logic.
  //   // For example:
  //   // 1. Initialize your API client using a refresh token or saved credentials.
  //   // 2. Validate that 'data' contains required fields (CredentialId, ModuleId, ModuleData).
  //   // 3. Use the correct HTTP method based on the action (GET, POST, PATCH, DELETE, etc.).
  //   // 4. Handle errors and return the API response.
  //   // 5. If the access token is expired, call the refreshToken endpoint.
  //   return {
  //     module,
  //     action,
  //     data,
  //     simulated: true,
  //   };
  // }
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

  // Function to initialize fields

  public async initializeFields(credentialsId) {
    for (const field of fields) {
      if (typeof field.init === 'function') {
        await field.init(credentialsId);
      }
    }
  }

  @Post('getfields')
  async getcoppercrmfields(
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

export const coppercrm = new CoppercrmController();
