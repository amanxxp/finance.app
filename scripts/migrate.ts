import { neon } from "@neondatabase/serverless";
import {config} from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import {migrate} from "drizzle-orm/neon-http/migrator";

config({path:".env.local"});

const sql = neon(process.env.DATABASE_URL!);
console.log(sql);
const db = drizzle(sql);

const main = async () =>{
    try{
        await migrate(db,{ migrationsFolder:"drizzle"});
    } catch(error){
        console.error("Error during migration:", error);
        process.exit(1);
    }
};

main();
// this script will not be run by the nextjs this will be run by us so that we can migrate the schemas