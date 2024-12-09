import { db } from "@/db/drizzle";
import { accounts, categories, transactions } from "@/db/schema";
import { calculatePercentageChange, fillMissingDates } from "@/lib/utils";
import { zValidator } from "@hono/zod-validator";
import { differenceInDays, parse, subDays } from "date-fns";
import { and, desc, eq, gte, lt, lte, sql, sum } from "drizzle-orm";
import { Hono } from "hono";
import { string, z } from "zod";
import jwt from "jsonwebtoken"

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
const app = new Hono().get(
  "/",
  verifyJWT,
  zValidator(
    "query",
    z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      accountId: z.string().optional(),
    })
  ),
  async (c) => {
    // const auth = getAuth(c);
    const user = decoded.userId;
    const { from, to, accountId } = c.req.valid("query");
    // if (!auth?.userId) {
    //   return c.json({ error: "Unauthorized" }, 401);
    // }
    const defaultTo = new Date();
    const defaultFrom = subDays(defaultTo, 30);

    const startDate = from ? parse(from, "yyy-MM-dd", new Date()) : defaultFrom;
    const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

    const periodLength = differenceInDays(endDate, startDate) + 1;
    const lastPeriodStart = subDays(startDate, periodLength);
    const lastPeriodEnd = subDays(endDate, periodLength);

    async function fetchFinancialData(
      userId: string,
      startDate: Date,
      endDate: Date
    ) {
      return await db
        .select({
          income:
            sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount}
                ELSE 0 END)`.mapWith(Number),
          expensed:
            sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount}
                ELSE 0 END)`.mapWith(Number),
          remaining: sum(transactions.amount).mapWith(Number),
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
          and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            eq(accounts.userId, userId),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate)
          )
        );
    }
    const [currentPeriod] = await fetchFinancialData(
      user,
      startDate,
      endDate
    );
    const [lastPeriod] = await fetchFinancialData(
      user,
      lastPeriodStart,
      lastPeriodEnd,
    );

    const incomeChange = calculatePercentageChange(
      currentPeriod.income,
      lastPeriod.income
    );
    const expensesChange = calculatePercentageChange(
      currentPeriod.expensed,
      lastPeriod.expensed
    );
    const remainingChange = calculatePercentageChange(
      currentPeriod.remaining,
      lastPeriod.remaining
    );

    const category = await db
      .select({
        name: categories.name,
        value: sql`SUM(ABS(${transactions.amount}))`.mapWith(Number),
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          accountId ? eq(transactions.accountId, accountId) : undefined,
          eq(accounts.userId, user),
          lt(transactions.amount, 0),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .groupBy(categories.name)
      .orderBy(desc(sql`SUM (ABS(${transactions.amount}))`));

    const topCategories = category.slice(0.3);
    const otherCategories = category.slice(3);

    const otherSum = otherCategories.reduce(
      (sum, current) => sum + current.value,
      0
    );
    const finalCategories = topCategories;
    if (otherCategories.length > 0) {
      finalCategories.push({
        name: "Other",
        value: otherSum,
      });
    }

    const activeDays = await db
      .select({
        date: transactions.date,
        income: sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN 
            ${transactions.amount} ELSE 0 END)`.mapWith(Number),
        expense: sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN 
                ABS(${transactions.amount}) ELSE 0 END)`.mapWith(Number),
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(
        and(
          accountId ? 
            eq(transactions.accountId, accountId) : 
          undefined,
          eq(accounts.userId, user),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .groupBy(transactions.date)
      .orderBy(transactions.date)

      const days = fillMissingDates(
        activeDays,
        startDate,
        endDate, 
      );

    return c.json({
      data:{
        remainingAmount: currentPeriod.remaining,
        remainingChange,
        incomeAmount: currentPeriod.income,
        incomeChange,
        expensesAmount: currentPeriod.expensed,
        expensesChange, 
        categories: finalCategories,
        days,
      },
    });
  }
);
export default app;
