import {Test ,TestingModule } from '@nestjs/testing';
import { initializeDB } from 'src/ormconfig';
import { Credentials } from 'src/entities/Credentials';
import { ZohoSheetsController } from './zohosheets.controller';

describe('ZohoSheets',() =>{
    let controller: ZohoSheetsController;
    let resource_id: any;
    


    const separatorIndex = process.argv.indexOf('--');
    const customArgs = 
        separatorIndex !== -1 ? process.argv.slice(separatorIndex + 1) : [];

    const [node_name , user_id ,args] = customArgs;

    beforeEach(async()=>{
        const module: TestingModule = await Test.createTestingModule({
            controllers : [ZohoSheetsController]
        }).compile();
        controller = module.get<ZohoSheetsController>(ZohoSheetsController);
    });

    it('should be defined',()=>{
        expect(controller).toBeDefined();
    });

    it('create_shreadsheet',async()=>{
        const data = {
            
        }
    })
})