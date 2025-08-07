import { Module } from '@nestjs/common';
import { CredentialController } from './credential/credential.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credentials } from './entities/Credentials';
import { dbConfig } from './ormconfig';
import { ClickSendController } from './xapps/clicksend/clicksend.controller';
import { AsanaController } from './xapps/asana/asana.controller';
import { teamworkController } from './xapps/teamwork/teamwork.controller';
import { ZohoSheetsController } from './xapps/zohosheets/zohosheets.controller';
import { PineconeController } from './xapps/pinecone/pinecone.controller';
import { PiwikproController } from './xapps/PiwikPro/piwikpro.controller';
import { RedboothController } from './xapps/redbooth/redbooth.controller';
import { CoppercrmController } from './xapps/coppercrm/coppercrm.controller';
import { aworkController } from './xapps/awork/awork.controller';
import { SquareController } from './xapps/square/square.controller';
@Module({
  imports: [
    TypeOrmModule.forRoot(dbConfig),
    TypeOrmModule.forFeature([Credentials]) 
  ],
  controllers: [CredentialController,SquareController,aworkController,CoppercrmController,ZohoSheetsController,ClickSendController,AsanaController,teamworkController,PineconeController,PiwikproController,RedboothController],
  providers: [],
})

export class AppModule {}
