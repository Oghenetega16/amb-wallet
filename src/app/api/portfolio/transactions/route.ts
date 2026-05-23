import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

// GET /api/portfolio/transactions?limit=20
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const limit  = Number(req.nextUrl.searchParams.get("limit") ?? 20);

  const portfolio = await db.portfolio.findFirst({ where: { userId, isDefault: true } });
  if (!portfolio) return NextResponse.json([], { status: 200 });

  const txs = await db.transaction.findMany({
    where:   { portfolioId: portfolio.id },
    orderBy: { date: "desc" },
    take:    limit,
  });

  return NextResponse.json(txs);
}

// POST /api/portfolio/transactions — record a new transaction
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const body   = await req.json();

  const { coinId, symbol, type, quantity, price, usdValue, fee, note, txHash, cardLast4 } = body;
  if (!coinId || !symbol || !type || quantity == null || price == null) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const portfolio = await db.portfolio.findFirst({ where: { userId, isDefault: true } });
  if (!portfolio) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });

  const tx = await db.transaction.create({
    data: {
      portfolioId: portfolio.id,
      coinId, symbol, type,
      quantity: Number(quantity),
      price:    Number(price),
      usdValue: Number(usdValue ?? quantity * price),
      fee:      Number(fee ?? 0),
      note, txHash, cardLast4,
      status: "completed",
    },
  });

  // Update holding quantity
  const direction = ["buy", "receive"].includes(type) ? 1 : -1;
  await db.holding.upsert({
    where:  { portfolioId_coinId: { portfolioId: portfolio.id, coinId } },
    update: { quantity: { increment: direction * Number(quantity) } },
    create: {
      portfolioId: portfolio.id,
      coinId, symbol,
      name:        body.name ?? symbol,
      quantity:    direction * Number(quantity),
      avgBuyPrice: Number(price),
    },
  });

  return NextResponse.json(tx, { status: 201 });
}
