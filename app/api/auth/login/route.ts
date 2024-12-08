import { db } from "@/db/drizzle";
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cors } from "hono/cors";
import { users, insertUserSchema } from "@/db/schema";
import { sign } from "jsonwebtoken";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

const secret = process.env.JWT_SECRET || 'secret';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // Find user by email using Drizzle ORM
  const [user] = await db.select().from(users).where(eq(users.email, email))
  .limit(1);

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 400 });
  }

  // Compare the password
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
  }

  // Create JWT token
  const token = jwt.sign({ userId: user.id}, secret, { expiresIn: '1h' });

  return NextResponse.json({ token, user: { id: user.id, name: user.name}, });
}
