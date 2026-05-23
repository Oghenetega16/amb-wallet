import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

// GET /api/portfolio — fetch authenticated user's default portfolio + holdings
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const userId = (session.user as any).id as string;

  const portfolio = await db.portfolio.findFirst({
    where:   { userId, isDefault: true },
    include: { holdings: true, transactions: { orderBy: { date: "desc" }, take: 50 } },
  });

  if (!portfolio) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  return NextResponse.json(portfolio);
}

// POST /api/portfolio/holdings — upsert a holding
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const { coinId, symbol, name, quantity, avgBuyPrice } = await req.json();

  if (!coinId || !symbol || quantity == null) {
    return NextResponse.json({ error: "coinId, symbol, and quantity are required." }, { status: 400 });
  }

  const portfolio = await db.portfolio.findFirst({ where: { userId, isDefault: true } });
  if (!portfolio) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });

  const holding = await db.holding.upsert({
    where:  { portfolioId_coinId: { portfolioId: portfolio.id, coinId } },
    update: { quantity, avgBuyPrice: avgBuyPrice ?? 0, name, symbol },
    create: { portfolioId: portfolio.id, coinId, symbol, name: name ?? symbol, quantity, avgBuyPrice: avgBuyPrice ?? 0 },
  });

  return NextResponse.json(holding, { status: 201 });
}
