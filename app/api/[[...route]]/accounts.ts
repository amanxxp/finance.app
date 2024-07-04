import { z } from "Zod";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { accounts, insertAccountSchema } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { error } from "console";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
const app = new Hono()
  .get("/", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: "unauthorized" }, 401);
    }
    const data = await db
      .select({ id: accounts.id, name: accounts.name })
      .from(accounts)
      .where(eq(accounts.userId, auth.userId));
    return c.json({ data });
  })
  .post(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      insertAccountSchema.pick({
        name: true,
      }) // i  want that only name field is passed through this json object 
    ),// zod validation that what kind of json can this post request accept
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");
      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const [data] = await db
        .insert(accounts)
        .values({
          id: createId(),
          userId: auth.userId,
          ...values,
        })
        .returning();
      return c.json({ data });
    }
  )
  .post(
    "/bulk-delete",
    clerkMiddleware(),
    zValidator(
      "json",
      z.object({
        ids: z.array(z.string()),
      }), // in last request we added the schema in zod for validation this time we deifne our own z object
     ),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");
      if (!auth?.userId) {
        return c.json({ error: "unauthorized" }, 401);
      }
      const data = await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.userId, auth.userId),
            inArray(accounts.id, values.ids)
          )
        )
        .returning({
          id: accounts.id,
        });
      return c.json({ data });
    }
  );

export default app;
