import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Basic validation
    if (!name?.trim()) return NextResponse.json({ error: "Name is required." }, { status: 400 });
    if (!email?.trim()) return NextResponse.json({ error: "Email is required." }, { status: 400 });
    if (!password || password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    // Check for duplicate
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

    // Hash + create user
    const hashed = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: { name: name.trim(), email: email.toLowerCase().trim(), password: hashed, plan: "free" },
    });

    // Auto-create default portfolio
    await db.portfolio.create({
      data: { userId: user.id, name: "My Portfolio", isDefault: true },
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
