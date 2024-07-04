import { pgTable, text } from "drizzle-orm/pg-core";
import {createInsertSchema} from "drizzle-zod";
export const accounts = pgTable("accounts",{
    id: text("id").primaryKey(),
    plaidId:text("plaid_id"),
    name: text("name").notNull(),
    userId: text("user_id").notNull(), 
});

export const insertAccountSchema = createInsertSchema(accounts);
// 1. The createInsertSchema function, imported from drizzle-zod, takes the accounts table definition and generates a schema specifically for inserting data into the accounts table.
// 2. This schema defines what data can be inserted into the accounts table, ensuring type safety and validation based on the column definitions (id, plaidId, name, userId).
// 3. on account.ts on post request whe we insert the new account on line number 25 we are using zod validation 