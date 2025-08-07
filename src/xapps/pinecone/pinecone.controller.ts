// pinecone.controller.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONTROLLER FILE.
// DO NOT modify the auto-generated endpoints below.
// For custom integration logic, extend the helper "performPineconeAction".
//
// Copyright (c) 2025 Smackcoders. All rights reserved.
// This file is subject to the Smackcoders Proprietary License.
// Unauthorized copying or distribution is strictly prohibited.
// -----------------------------------------------------------------------------

import {
  Controller,
  Post,
  Body,
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
} from './pinecone.config';
import { CredentialController } from 'src/credential/credential.controller';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
@Controller('pinecone')
export class PineconeController {
  private logger = new CustomLogger();
  private credentialsController = new CredentialController();

  /**
   * [AUTO-GENERATED] OAuth authorize endpoint.
   * This endpoint initiates the authentication flow.
   * Implement the actual token request and error handling as needed.
   */
  @Post('authorize')
  async authorize(@Body() reqBody: any, @Res() res: Response) {
    if (!reqBody.apiKey || 
      !reqBody.userId) {
      throw new HttpException(
        'Missing OAuth parameters',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      let result;
      const {
        apiKey,
        name,
        type,
        dataBaseBaseUrl,
        assistantBaseUrl,
        id,
        pineconeApiVersion,
        userId,
      } = reqBody;

      if (userId.length > 0) {
        const connection = await initializeDB();
        const credentialRepository = connection.getRepository(Credentials);
        let pineconeauthdata = await credentialRepository.query(
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
          Array.isArray(pineconeauthdata) &&
          pineconeauthdata.length > 0 &&
          pineconeauthdata[0]?.id
        ) {
          await this.credentialsController.updateCredentials(
            pineconeauthdata[0].id,
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
          dataBaseBaseUrl: dataBaseBaseUrl,
          assistantBaseUrl: assistantBaseUrl,
          token: {
            apiKey: apiKey,
            pineconeApiVersion: pineconeApiVersion,
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
          pineconeApiVersion: pineconeApiVersion,
          dataBaseBaseUrl: dataBaseBaseUrl,
         
        });
        if (response.status === 200) {
          if (id) {
            const updatedata =
              await this.credentialsController.updateCredentials(id, data);
          } else {
            const createdata =
              await this.credentialsController.createCredentials(reqbody);
          }
          const { redirect } = await import('./pinecone.config');
          return res.redirect(redirect);
        } else {
          return res.send(response);
        }
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server Error' });
    }
  }

  @Post('pinecornauthorize')
  async callback(
    @Body()
    reqBody: {
      data: { apiKey: any; pineconeApiVersion: any; dataBaseBaseUrl: any; assistantBaseUrl: any };
      state;
    },
    @Res() res: Response,
  ) {
    if (
      !reqBody.data.apiKey ||
      !reqBody.data.dataBaseBaseUrl ||
      !reqBody.data.pineconeApiVersion || 
      !reqBody.data.assistantBaseUrl
    ) {
      throw new HttpException('Missing  Required', HttpStatus.BAD_REQUEST);
    }
    const returnedState = reqBody.state;
    try {
      const {apiKey ,dataBaseBaseUrl,pineconeApiVersion,assistantBaseUrl} = reqBody.data;
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
          apiKey: reqBody.data.apiKey,
          pineconeApiVersion: reqBody.data.pineconeApiVersion,
        };

        credential.authData['dataBaseBaseUrl'] = dataBaseBaseUrl;
        credential.authData['assistantBaseUrl'] = assistantBaseUrl;
        credential.authData['token'] = accessToken;

        const response: any = await this.verify({
          apiKey: apiKey,
          pineconeApiVersion: pineconeApiVersion,
          dataBaseBaseUrl: dataBaseBaseUrl,
         
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
      const pineconeApiVersion = verfifydata.pineconeApiVersion;
      
      const dataBaseBaseUrl = verfifydata.dataBaseBaseUrl;
    
      let url = `${dataBaseBaseUrl}/indexes`;
      const method = 'GET';

      const options: any = {
        method,
        url,
        headers: {
                    'X-Pinecone-API-Version': pineconeApiVersion,
          'Api-Key': apiKey,
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
   * [AUTO-GENERATED] Endpoint for module "indexes" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
        "data":{
            "name": "new",
  "dimension": 5,
  "metric": "cosine",
  "spec": {
    "serverless": {
      "cloud": "aws",
      "region": "us-east-1"
    }
   
  }
        
        }
    }
}
   */

  @Post('indexes/create')
  async createIndexes(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'indexes',
        'create',
        'POST',
        data,
      );
      return ({
        message: `Pinecone indexes create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in indexes/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "indexes" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
        "Id":"new",
        "data":{
        "deletion_protection": "enabled"
        }
    }
}
   */

  @Post('indexes/update')
  async updateIndexes(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'indexes',
        'update',
        'PATCH',
        data,
      );
      return ({
        message: `Pinecone indexes update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in indexes/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "indexes" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
        "Id":"new",
    }
}
   */

  @Post('indexes/get')
  async getIndexes(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'indexes',
        'get',
        'GET',
        data,
      );
      return ({
        message: `Pinecone indexes get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in indexes/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "indexes" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
        "data":{
          
        }
    }
}
   */

  @Post('indexes/getmany')
  async getmanyIndexes(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'indexes',
        'getmany',
        'GET',
        data,
      );
      return ({
        message: `Pinecone indexes getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in indexes/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "indexes" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
        "Id":"new"
    }
}
   */

  @Post('indexes/delete')
  async deleteIndexes(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'indexes',
        'delete',
        'DELETE',
        data,
      );
      return ({
        message: `Pinecone indexes delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in indexes/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "namespaces" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
    "indexHost":"new-1ri5v4k.svc.aped-4627-b74a.pinecone.io",
        "Id":"updatenamespace"
      
    }
}
   */

  @Post('namespaces/get')
  async getNamespaces(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'namespaces',
        'get',
        'GET',
        data,
      );
      return ({
        message: `Pinecone namespaces get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in namespaces/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "namespaces" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performPineconeAction".
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

  @Post('namespaces/getmany')
  async getmanyNamespaces(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'namespaces',
        'getmany',
        'GET',
        data,
      );
      return ({
        message: `Pinecone namespaces getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in namespaces/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "namespaces" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
    "indexHost":"new-1ri5v4k.svc.aped-4627-b74a.pinecone.io",
        "Id":"updatenamespace"
    }
}
   */

  @Post('namespaces/delete')
  async deleteNamespaces(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'namespaces',
        'delete',
        'DELETE',
        data,
      );
      return ({
        message: `Pinecone namespaces delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in namespaces/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "vectors" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
    "indexHost":"new-1ri5v4k.svc.aped-4627-b74a.pinecone.io",
        "data":{
   "vectors": [
      {
        "id": "2",
        "values": [0.1, 0.1, 0.1, 0.1, 0.1]
        // "metadata": {"genre": "comedy", "year": 2020}
      }

    ],
    
    "namespace": "updatenamespace"
          
        }
    }
}
   */

  @Post('vectors/create')
  async createVectors(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      if (!data.data.indexHost) {
        throw new HttpException(
          'Index Host is Missing ',
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = await this.performPineconeAction(
        `vectors/upsert`,
        'create',
        'POST',
        data,
      );
      return ({
        message: `Pinecone vectors create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in vectors/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "vectors" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",   
    "data":{
    "indexHost":"new-1ri5v4k.svc.aped-4627-b74a.pinecone.io",
        "data":{
            "id": "id-1",
        // "values": [4.0, 2.0,4.0, 2.0,5.3],
        // "setMetadata": {"type": "comedy"},
        "namespace": "updatenamespace"
          
        }
    }
}
   */

  @Post('vectors/update')
  async updateVectors(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'vectors/update',
        'update',
        'POST',
        data,
      );
      return ({
        message: `Pinecone vectors update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in vectors/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "vectors" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
    "indexHost":"new-1ri5v4k.svc.aped-4627-b74a.pinecone.io",
        "data":{
            "ids":"id-1",
            "namespace": "updatenamespace"
          
        }
    }
}
   */

  @Post('vectors/delete')
  async deleteVectors(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'vectors/delete',
        'delete',
        'post',
        data,
      );
      return ({
        message: `Pinecone vectors delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in vectors/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "vectors" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
    "indexHost":"new-1ri5v4k.svc.aped-4627-b74a.pinecone.io",
        "data":{
            "ids":"id-1",
            "namespace": "updatenamespace"
          
        }
    }
}
   */

  @Post('vectors/get')
  async getVectors(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'vectors/fetch',
        'getmany',
        'GET',
        data,
      );
      return ({
        message: `Pinecone vectors get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in vectors/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "vectors" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
    "indexHost":"new-1ri5v4k.svc.aped-4627-b74a.pinecone.io",
    "data":{
          "namespace":"updatenamespace"
        }
    }
}
   */

  @Post('vectors/getmany')
  async getmanyVectors(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'vectors/list',
        'getmany',
        'GET',
        data,
      );
      return ({
        message: `Pinecone vectors getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in vectors/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "backups" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
    "indexName":"new",
        "data":{
     "name": "create-backup", 
      "description": "Monthly backup of production index"
          
        }
    }
}
   */

  @Post('backups/create')
  async createBackups(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        `indexes/${data.data.indexName}/backups`,
        'create',
        'POST',
        data,
      );
      return ({
        message: `Pinecone backups create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in backups/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "backups" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
        "Id":"27dd5a21-f099-46f4-8be9-c4c3095a8022"
    }
}
   */

  @Post('backups/get')
  async getBackups(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'backups',
        'get',
        'GET',
        data,
      );
      return ({
        message: `Pinecone backups get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in backups/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "backups" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
    "indexName":"new"
    }
}
   */

  @Post('backups/getmany')
  async getmanyBackups(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        `indexes/${data.data.indexName}/backups`,
        'getmany',
        'GET',
        data,
      );
      return ({
        message: `Pinecone backups getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in backups/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "backups" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
        "Id":"27dd5a21-f099-46f4-8be9-c4c3095a8022"
    }
}
   */

  @Post('backups/delete')
  async deleteBackups(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'backups',
        'delete',
        'DELETE',
        data,
      );
      return ({
        message: `Pinecone backups delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in backups/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "search" action "searchVectors".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
    "indexHost":"new-1ri5v4k.svc.aped-4627-b74a.pinecone.io",
        "data":{
    
    "namespace": "updatenamespace",
    "topK": 3,
        "vector":[0.1, 0.1, 0.1, 0.1, 0.1]
          
        }
    }
}
   */

  @Post('search/searchVectors')
  async searchvectorsSearch(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'query',
        'searchVectors',
        'POST',
        data,
      );
      return ({
        message: `Pinecone search searchVectors executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in search/searchVectors:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "assistant" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
        "data":{
    "name": "MyAssistant1",
  "instructions": "Use American English for spelling and grammar.",
  "region":"us"
          
        }
    }
}
   */

  @Post('assistant/create')
  async createAssistant(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'assistant/assistants',
        'create',
        'POST',
        data,
      );
      return ({
        message: `Pinecone assistant create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in assistant/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "assistant" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
        "Id":"MyAssistant1"
    }
}
   */

  @Post('assistant/get')
  async getAssistant(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'assistant/assistants',
        'get',
        'GET',
        data,
      );
      return ({
        message: `Pinecone assistant get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in assistant/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "assistant" action "update".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to update)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    // "assistant":true,
    "data":{
        "Id":"MyAssistant1",
        "data":{
  "instructions": "Use  English for spelling and grammar.",
  "region":"en"
          
        }
    }
}
   */

  @Post('assistant/update')
  async updateAssistant(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'assistant/assistants',
        'update',
        'patch',
        data,
      );
      return ({
        message: `Pinecone assistant update executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in assistant/update:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "assistant" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
        "data":{
        }
    }
}
   */

  @Post('assistant/getmany')
  async getmanyAssistant(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'assistant/assistants',
        'getmany',
        'GET',
        data,
      );
      return ({
        message: `Pinecone assistant getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in assistant/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "assistant" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
        "Id":"MyAssistant1"
    }
}
   */

  @Post('assistant/delete')
  async deleteAssistant(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'assistant/assistants',
        'delete',
        'DELETE',
        data,
      );
      return ({
        message: `Pinecone assistant delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in assistant/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "file" action "create".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: object (data to create)
   * - Calls the integration helper "performPineconeAction".
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

  @Post('file/create')
  async createFile(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const ENCODED_METADATA = encodeURIComponent(
        JSON.stringify(data.data.metadata),
      );
      const localFilePath = path.join(
        os.homedir(),
        data.data.folderName,
        data.data.fileName,
      );
      console.log('localFilePath:', localFilePath);
      if (!fs.existsSync(localFilePath)) {
        throw new Error('File not found: ' + localFilePath);
      }
      const form = new FormData();
      form.append('file', fs.createReadStream(localFilePath));
      data.data.data = { form: form };
      const result = await this.performPineconeAction(
        `files/${data.data.assistantName}?metadata=${ENCODED_METADATA}`,
        'upload',
        'post',
        data,
      );
      return ({
        message: `Pinecone file create executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      console.log('Pattttt:', error);
      this.logger.error(`Error in file/create:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "file" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('file/get')
  async getFile(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        `files/${data.data.assistantName}`,
        'get',
        'GET',
        data,
      );
      return ({
        message: `Pinecone file get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in file/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "file" action "getmany".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - Filters: object (optional filters for querying records)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
    "assistant": true,
    "assistantName": "MyAssistant1",
        "data":{
           
    }}
}
   */

  @Post('file/getmany')
  async getmanyFile(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        `files/${data.data.assistantName}`,
        'getmany',
        'GET',
        data,
      );
      return ({
        message: `Pinecone file getmany executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in file/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "file" action "delete".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to delete)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data":{
   "Id": "record-id"
  }
 
}
   */

  @Post('file/delete')
  async deleteFile(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        `files/${data.assistantName}`,
        'delete',
        'DELETE',
        data,
      );
      return ({
        message: `Pinecone file delete executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in file/delete:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "context-snippets" action "get".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - data: string (ID of the record to fetch)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
  "credentialId": "your-credential-id",
  "data": {
      "Id":"record-id"
  }
}
   */

  @Post('context-snippets/get')
  async getContextSnippets(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        `chat/${data.data.assistantName}/context`,
        'get',
        'POST',
        data,
      );
      return ({
        message: `Pinecone context-snippets get executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in context-snippets/get:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "chat" action "chatwithAssistant".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   *  {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
            "assistant":true,
    "assistantName": "MyAssistant1",
        "data":{
            "messages": [
    {
      "role": "user",
      "content": "what is 19 + 30 ?"

    //   "content": "what is  8 + 8?"
    }
  ]

    }}
}
   */

  @Post('chat/chatwithAssistant')
  async chatwithassistantChat(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        `chat/${data.data.assistantName}`,
        'chatwithAssistant',
        'post',
        data,
      );
      return ({
        message: `Pinecone chat chatwithAssistant executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in chat/chatwithAssistant:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [AUTO-GENERATED] Endpoint for module "chat" action "chatwithOpenAI".
   *  - Request Parameters (data): 
   * - credentialId: string
   * - ModuleData: object (action-specific data)
   * - Calls the integration helper "performPineconeAction".
   * DO NOT modify the method signature.
   *  Example usage:
   * {
    "credentialsId":"6299a15a-42d3-46e0-a512-19c37ee1417a",
    "data":{
          "assistant":true,
    "assistantName": "newAssistant",
        "data":{
            "messages": [
    {
      "role": "user",
      "content": "What is 8-8 ?"
    }
  ]
    }}
}
   */

  @Post('chat/chatwithOpenAI')
  async chatwithopenaiChat(@Body() data: any,) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        `chat/${data.data.assistantName}/chat/completions`,
        'chatwithOpenAI',
        'POST',
        data,
      );
      return ({
        message: `Pinecone chat chatwithOpenAI executed successfully`,
        result,
status: result.status
      });
    } catch (error) {
      this.logger.error(`Error in chat/chatwithOpenAI:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllIndexes(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'indexes',
        'getmany',
        'GET',
        data,
      );
      return result.response.indexes.map((data) => ({
        name: data.name,
        value: data.host,
      }));
    } catch (error) {
      this.logger.error(`Error in indexes/getmany:`, error);
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllAssistant(data: any) {
    if (!data) {
      throw new HttpException(
        'Request body cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.performPineconeAction(
        'assistant/assistants',
        'getmany',
        'GET',
        data,
      );
      return result.response.assistants.map((data) => ({
        name: data.name,
        value: data.name,
      }));
    } catch (error) {
      this.logger.error(`Error in assistant/getmany:`, error);
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
      console
      const connection = await initializeDB();
      const credRepository = connection.getRepository(Credentials);
      const credentialsRepository = await credRepository.findOne({
        where: { id: credentialsId },
      });
      const {pineconeApiVersion,apiKey} = credentialsRepository.authData.token
      const dataBaseBaseUrl = credentialsRepository.authData.dataBaseBaseUrl;
      const assistantBaseUrl = credentialsRepository.authData.assistantBaseUrl;
      return { assistantBaseUrl, dataBaseBaseUrl, apiKey ,pineconeApiVersion};
    } catch (error) {
      console.log(error)
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
      const initializeData: any = await this.initialize(credentialsId);
      const { apiKey, dataBaseBaseUrl, assistantBaseUrl ,pineconeApiVersion} = initializeData;
      let url;
       console.log('fdsfsd',argumentdata);
      if (data.assistant) {
        url = `${assistantBaseUrl}/${module}`;
      } else if (data.indexHost) {
        url = `https://${data.indexHost}/${module}`;
      } else {
        url = `${dataBaseBaseUrl}/${module}`;
      }

      if (data.Id) {
        url += `/${data.Id}`;
      }

      const options: any = {
        url,
        method,
      };
      if (action === 'getmany') {
        if (argumentdata.data.data) {
          options.params = argumentdata.data.data;
        }
        options.headers = {
          'X-Pinecone-API-Version': pineconeApiVersion,
          'Api-Key': apiKey,
        };
      } else if (action === 'upload') {
        if (argumentdata.data.data.form) {
          const form = argumentdata.data.data.form;

          options.headers = {
            'X-Pinecone-API-Version': pineconeApiVersion,
            'Api-Key': apiKey,
            ...form.getHeaders(),
        
          };

          options.maxBodyLength = Infinity;
          options.maxContentLength = Infinity;
          options.data = form;
          options.method = method;
          options.url = url;
        }
      } else {
        if (argumentdata.data.data) options.data = argumentdata.data.data;
        options.headers = {
          'X-Pinecone-API-Version': pineconeApiVersion,
          'Api-Key': apiKey,
        };
      }
      console.log('options',options)
      const response = await axios(options);
      return {
        response: response.data,
        status: response.status,
      };
    } catch (error) {
      return { response: [error.response.data], status: error.status };
    }
  }

  /**
   * [AUTO-GENERATED] Helper method to perform a Pinecone action.
   * This method is a stub—extend it to integrate with the actual API for your xapp.
   *
   * Validations:
   * - Ensure that the provided module and action are supported.
   * - Validate the "data" structure as needed.
   *
   * DO NOT change the method signature.
   */
  private async performPineconeAction(
    module: string,
    action: string,
    method: string,
    data: any,
  ): Promise<any> {
    const result = await this.curl(module, action, method, data);
    return result;
  }
}

export const pineconeController = new PineconeController();
