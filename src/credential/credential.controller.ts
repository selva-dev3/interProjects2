import { Controller,Res, Get, Post, Put, Delete, Body, Param, HttpStatus, HttpException } from '@nestjs/common';
import { Credentials } from 'src/entities/Credentials';
import { CustomLogger } from 'src/logger/custom.logger';
import { initializeDB } from 'src/ormconfig';



@Controller('credentials')
export class CredentialController {
  credentialsController: any;
  private readonly logger = new CustomLogger();
  // Create new credential

  @Post('create')
  async createCredentials(@Body() reqBody : {data:any, name:any, type:any, userId:any }): Promise<any> {
    try {
    
      const connection:any = await initializeDB();
      const credentialRepository = connection.getRepository(Credentials);

        const newCredentials = new Credentials(); 
        newCredentials.name = reqBody.name;
        newCredentials.type = reqBody.type;
        newCredentials.authData = reqBody.data;
        newCredentials.userId = reqBody.userId;
        const createdCredentials = await credentialRepository.save(newCredentials);
        this.logger.debug("Credentials saved : ",JSON.stringify(createdCredentials));
        return { message: 'Credentials added successfully', credentials: createdCredentials };
    } catch (error) {
      console.log("err",error)
      this.logger.error("Error credentials :",error.message + error.stack) 
    }
  }


  // Update credential

  @Put('update/:id')
  async updateCredentials(id, data): Promise<any> {
    try {
      const connection:any = await initializeDB();
      const credentialRepository = connection.getRepository(Credentials);
      const credentialToUpdate = await credentialRepository.findOne({ where: { id: id } });

      if (!credentialToUpdate) {
        throw new HttpException({ message: 'Credentials not found' }, HttpStatus.NOT_FOUND);
      }
      // Update the credential fields with the new data
      credentialToUpdate.authData = data;

      // Save the updated credentials
      const updatedCredentials = await credentialRepository.save(credentialToUpdate);

      return updatedCredentials;
    } catch (error) {
      this.logger.error('Error updating credentials:', error.message + error.stack);
    }
  }

  // Delete credential by id

  @Delete('delete/:id')
  async deleteCredential(@Param('id') credentialsId: any): Promise<any> {
    try {
      console.log("hii");
      
      const connection:any = await initializeDB();
      const credentialRepository = connection.getRepository(Credentials);
      const credentialToDelete = await credentialRepository.findOne({ where: { id: credentialsId } });
      if (!credentialToDelete) {
        throw new HttpException({ message: 'Credentials not found' }, HttpStatus.NOT_FOUND);
      }
      await credentialRepository.remove(credentialToDelete);
      return { message: 'Credentials deleted successfully' };
    } catch (error) {
      this.logger.error('Error deleting credentials:', error.message + error.stack);
    }
  }






}
export const credentialsControllerInstance = new CredentialController();
