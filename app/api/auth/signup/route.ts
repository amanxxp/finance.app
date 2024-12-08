import { db } from "@/db/drizzle";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { users } from "@/db/schema"; // Ensure you have the correct schema
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2"; // Import createId

const secret = process.env.JWT_SECRET || "secret";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  // Check if a user already exists with the same email
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    return NextResponse.json(
      { message: "Email already in use" },
      { status: 400 }
    );
  }

  // Generate a unique ID for the user
  const userId = createId();

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert new user into the database with a generated ID
  const [newUser] = await db
    .insert(users)
    .values({
      id: userId, // Assign the generated ID here
      name: name,
      email: email,
      password: hashedPassword,
    })
    .returning();

  // Create JWT token for the newly registered user
  const token = jwt.sign({ userId: newUser.id }, secret, { expiresIn: "1h" });

  // Return the response with token and user data
  return NextResponse.json({
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
  });
}
