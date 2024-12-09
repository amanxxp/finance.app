import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { accounts, insertAccountSchema } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { zValidator } from "@hono/zod-validator";
import jwt from "jsonwebtoken";
import { array, z } from "zod";
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

  .get("/", verifyJWT, async (c) => {
    const user = decoded.userId;
    // if (!user?.userId) {
    //   return c.json({ error: "Unauthorized" }, 401);
    // }

    const data = await db
      .select({
        id: accounts.id,
        name: accounts.name,
      })
      .from(accounts)
      .where(eq(accounts.userId, user));
    return c.json({ data });
  })
  .post(
    "/",
    verifyJWT,
    zValidator("json", insertAccountSchema.pick({ name: true })),
    async (c) => {
      const userid = decoded.userId;
      const values = c.req.valid("json");

      const [data] = await db
        .insert(accounts)
        .values({
          id: createId(),
          userId: userid,
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
      const userid = decoded.userId;
      const { id } = c.req.valid("param");
      if (!id) {
        return c.json({ error: "missing id" }, 400);
      }
      const [data] = await db
        .select({
          id: accounts.id,
          name: accounts.name,
        })
        .from(accounts)
        .where(and(eq(accounts.userId, userid), eq(accounts.id, id)));
      if (!data) {
        return c.json({ error: "Not found" }, 401);
      }
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
      const userid = decoded.userId;
      const values = c.req.valid("json");
      const data = await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.userId, userid),
            inArray(accounts.id, values.ids)
          )
        )
        .returning({
          id: accounts.id,
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
      insertAccountSchema.pick({
        name: true,
      })
    ),
    async (c) => {
      const userid = decoded.userId;
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");
      if (!id) {
        return c.json({ error: "Missing id" }, 401);
      }
      
      const [data] = await db
        .update(accounts)
        .set(values)
        .where(and(eq(accounts.userId, userid), eq(accounts.id, id)))
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
      const userid = decoded.userId;
      const { id } = c.req.valid("param");
      if (!id) {
        return c.json({ error: "Missing id" }, 401);
      }
     
      const [data] = await db
        .delete(accounts)
        .where(and(eq(accounts.userId,userid), eq(accounts.id, id)))
        .returning({
          id: accounts.id,
        });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ data });
    }
  );

export default app;
