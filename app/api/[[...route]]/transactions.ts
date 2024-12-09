import { Hono } from "hono";
import { db } from "@/db/drizzle";
import {
  transactions,
  insertTransactionSchema,
  categories,
  accounts,
} from "@/db/schema";
import { and, eq, gte, inArray, lte, desc, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { parse, subDays } from "date-fns";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "secret";

interface decoded {
  userId: string;
}
let decoded: any;
// Middleware to verify JWT and extract user ID
const verifyJWT = async (c: any, next: Function) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return c.json({ error: "Unauthorized - No token provided" }, 401);
  }

  const token = authHeader.split(" ")[1];
  console.log(token);
  try {
    decoded = jwt.verify(token, JWT_SECRET) as decoded;
    c.set("userId", decoded.userId); // Attach user ID to the context
    console.log(decoded.userId);
    await next();
  } catch (error) {
    return c.json({ error: "Unauthorized - Invalid token" }, 401);
  }
};

const app = new Hono()

  .get(
    "/",
    zValidator(
      "query",
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
      })
    ),
    verifyJWT,
    async (c) => {
      // const auth = getAuth(c);
      const user = decoded.userId;
      const { from, to, accountId } = c.req.valid("query");
      // if (!auth?.userId) {
      //   return c.json({ error: "Unauthorized" }, 401);
      // }
      const defaultTo = new Date();
      const defaultFrom = subDays(defaultTo, 30);
      const startDate = from
        ? parse(from, "yyyy-MM-dd", new Date())
        : defaultFrom;
      const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

      const data = await db
        .select({
          id: transactions.id,
          date: transactions.date,
          category: categories.name,
          categoryId: transactions.categoryId,
          payee: transactions.payee,
          amount: transactions.amount,
          notes: transactions.notes,
          account: accounts.name,
          accountId: transactions.accountId,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            eq(accounts.userId, user),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate)
          )
        )
        .orderBy(desc(transactions.date));

      return c.json({ data });
    }
  )
  .post(
    "/",
    verifyJWT,
    zValidator(
      "json",
      insertTransactionSchema.omit({
        id: true,
      })
    ),
    async (c) => {
      // const auth = getAuth(c);
      // const user = decoded.userId;
      const values = c.req.valid("json");
      // if (!auth?.userId) {
      //   return c.json({ error: "Unauthorized" }, 401);
      // }

      const [data] = await db
        .insert(transactions)
        .values({
          id: createId(),
          ...values,
        })
        .returning();

      return c.json({ data });
    }
  )
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    verifyJWT,
    async (c) => {
      // const auth = getAuth(c);
      const user = decoded.userId;
      const { id } = c.req.valid("param");
      if (!id) {
        return c.json({ error: "missing id" }, 400);
      }
      // if (!auth?.userId) {
      //   return c.json({ error: "Unauthorized" }, 401);
      // }
      const [data] = await db
        .select({
          id: transactions.id,
          date: transactions.date,
          categoryId: transactions.categoryId,
          payee: transactions.payee,
          amount: transactions.amount,
          notes: transactions.notes,
          accountId: transactions.accountId,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(and(eq(transactions.id, user), eq(accounts.userId, id)));
      if (!data) {
        return c.json({ error: "Not found" }, 401);
      }
      return c.json({ data });
    }
  )
  .post(
    "/bulk-create",
    verifyJWT,
    zValidator(
      "json",
      z.array(
        insertTransactionSchema.omit({
          id: true,
        })
      )
    ),
    async (c) => {
      // const auth = getAuth(c);
      const user = decoded.userId;
      const values = c.req.valid("json");

      // if (!auth?.userId) {
      //   return c.json({ error: "Unauthorized" }, 401);
      // }
      const data = await db
        .insert(transactions)
        .values(
          values.map((value) => ({
            id: createId(),
            ...value,
          }))
        )
        .returning();
      return c.json({ data });
    }
  )
  .post(
    "/bulk-delete",
    verifyJWT,
    zValidator(
      "json",
      z.object({
        ids: z.array(z.string()),
      })
    ),

    async (c) => {
      // const auth = getAuth(c);
      const user = decoded.userId;
      const values = c.req.valid("json");
      // if (!auth?.userId) {
      //   return c.json({ error: "Unauthorized" }, 401);
      // }

      const transactionToDelete = db.$with("transaction_to_delete").as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(
              inArray(transactions.id, values.ids),
              eq(accounts.userId, user)
            )
          )
      );

      const data = await db
        .with(transactionToDelete)
        .delete(transactions)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionToDelete} )`
          )
        )
        .returning({
          id: transactions.id,
        });

      return c.json({ data });
    }
  )
  .patch(
    "/:id",
    verifyJWT,
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    zValidator(
      "json",
      insertTransactionSchema.omit({
        id: true,
      })
    ),
    async (c) => {
      // const auth = getAuth(c);
      const user = decoded.userId;
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");
      if (!id) {
        return c.json({ error: "Missing id" }, 401);
      }
      // if (!auth?.userId) {
      //   return c.json({ error: "Unauthorized" }, 401);
      // }

      const transactionToUpdate = db.$with("transaction_to_update").as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(and(eq(transactions.id, id), eq(accounts.userId, user)))
      );

      const [data] = await db
        .with(transactionToUpdate)
        .update(transactions)
        .set(values)
        .where(
          inArray(transactions.id, sql`(select id from${transactionToUpdate})`)
        )
        .returning();

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ data });
    }
  )
  .delete(
    "/:id",
    verifyJWT,
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    async (c) => {
      // const auth = getAuth(c);
      const user = decoded.userId;
      const { id } = c.req.valid("param");
      if (!id) {
        return c.json({ error: "Missing id" }, 401);
      }
      // if (!auth?.userId) {
      //   return c.json({ error: "Unauthorized" }, 401);
      // }

      const transactionToDelete = db.$with("transaction_to_update").as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(and(eq(transactions.id, id), eq(accounts.userId, user)))
      );

      const [data] = await db
        .with(transactionToDelete)
        .delete(transactions)
        .where(
          inArray(transactions.id, sql`(select id from ${transactionToDelete})`)
        )
        .returning({
          id: transactions.id,
        });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ data });
    }
  );

export default app;
