import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { categories, insertCategorySchema } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { zValidator } from "@hono/zod-validator";
import jwt from "jsonwebtoken";
import { z } from "zod";
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
    // const auth = getAuth(c);
    const user = decoded.userId;
    // if (!auth?.userId) {
    //   return c.json({ error: "Unauthorized" }, 401);
    // }

    const data = await db
      .select({
        id: categories.id,
        name: categories.name,
      })
      .from(categories)
      .where(eq(categories.userId, user));
    return c.json({ data });
  })
  .post(
    "/",
    verifyJWT,
    zValidator("json", insertCategorySchema.pick({ name: true })),
    async (c) => {
      // const auth = getAuth(c);
      const user = decoded.userId;
      const values = c.req.valid("json");
      // if (!auth?.userId) {
      //   return c.json({ error: "Unauthorized" }, 401);
      // }
      const [data] = await db
        .insert(categories)
        .values({
          id: createId(),
          userId: user,
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
          id: categories.id,
          name: categories.name,
        })
        .from(categories)
        .where(and(eq(categories.userId, user), eq(categories.id, id)));
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
      // const auth = getAuth(c);
      const user = decoded.userId;
      const values = c.req.valid("json");
      // if (!auth?.userId) {
      //   return c.json({ error: "Unauthorized" }, 401);
      // }
      const data = await db
        .delete(categories)
        .where(
          and(
            eq(categories.userId, user),
            inArray(categories.id, values.ids)
          )
        )
        .returning({
          id: categories.id,
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
      insertCategorySchema.pick({
        name: true,
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
      const [data] = await db
        .update(categories)
        .set(values)
        .where(and(eq(categories.userId, user), eq(categories.id, id)))
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
      const [data] = await db
        .delete(categories)
        .where(and(eq(categories.userId, user), eq(categories.id, id)))
        .returning({
          id: categories.id,
        });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ data });
    }
  );

export default app;
