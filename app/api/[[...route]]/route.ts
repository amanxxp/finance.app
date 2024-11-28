import { z } from "zod";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import accounts from "./accounts";
import { HTTPException } from "hono/http-exception";
import categories from "./categories";
import transactions from "./transactions";
import summary from "./summary";

export const runtime = "edge";

const app = new Hono().basePath("/api");

app.use(
    "/*",
    cors({
      origin: "https://finance-lnp17q3ri-amanxxps-projects.vercel.app", // Allow your frontend origin
      allowMethods: ["GET", "POST", "PATCH", "DELETE"], // Specify allowed HTTP methods
      allowHeaders: ["Content-Type", "Authorization"], // Include any custom headers
      credentials: true, // If you're sending cookies or credentials
    })
  );

// Global error handler
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  return c.json({ error: "Internal error" }, 500);
});

// Mount routes
const routes = app
  .route("/accounts", accounts)
  .route("/categories", categories)
  .route("/transactions", transactions)
  .route("/summary", summary);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
