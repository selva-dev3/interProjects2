import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';
dotenv.config();

const dbType: any = process.env.DB_TYPE;
const dbConfig = {
  type: dbType,    
  host: process.env.DB_HOST ,
  port: parseInt(process.env.DB_PORT as any, 10),   
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,   
  database: process.env.DB_DATABASE,      
  entities: ["dist/src/entities/*.js"],     
  migrations: ["dist/migration/*.js"],   
  logging: false,
  synchronize: false,
  // extra: {     
  //   ssl: {   
  //     rejectUnauthorized: false,     
  //   },   
  // },         
};

const connectDB = new DataSource(dbConfig);

let isDBInitialized = false;
async function initializeDB():Promise<any> {
  try {
    if (!isDBInitialized) {
      await connectDB.initialize();

      console.log(`Data Source has been initialized`);
      isDBInitialized = true;
    }
    return connectDB;
  } catch (err) {

    console.log(`Data Source initialization error: ${err}`);
    // throw new Error(`Error connecting to the database: ${err}`);
  }
}

export { initializeDB, dbConfig };
