import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Demo user ────────────────────────────────────────────────────────────
  const hashed = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "john@ambwallet.com" },
    update: {},
    create: {
      name:     "Oghenetega Sukuru",
      email:    "oghenetegasukuru@ambwallet.com",
      password: hashed,
      plan:     "premium",
    },
  });
  console.log(`✅ User: ${user.email}`);

  // ── Default portfolio ────────────────────────────────────────────────────
  const portfolio = await prisma.portfolio.upsert({
    where: { id: "portfolio_demo_001" },
    update: {},
    create: {
      id:          "portfolio_demo_001",
      userId:      user.id,
      name:        "Main Portfolio",
      description: "My primary crypto holdings",
      isDefault:   true,
    },
  });
  console.log(`✅ Portfolio: ${portfolio.name}`);

  // ── Holdings ─────────────────────────────────────────────────────────────
  const holdings = [
    { coinId: "bitcoin",   symbol: "BTC", name: "Bitcoin",   quantity: 0.038, avgBuyPrice: 54000 },
    { coinId: "ethereum",  symbol: "ETH", name: "Ethereum",  quantity: 0.612, avgBuyPrice: 2800  },
    { coinId: "litecoin",  symbol: "LTC", name: "Litecoin",  quantity: 5.2,   avgBuyPrice: 90    },
    { coinId: "solana",    symbol: "SOL", name: "Solana",    quantity: 1.65,  avgBuyPrice: 120   },
    { coinId: "ripple",    symbol: "XRP", name: "Ripple",    quantity: 1500,  avgBuyPrice: 0.52  },
    { coinId: "polkadot",  symbol: "DOT", name: "Polkadot",  quantity: 25,    avgBuyPrice: 10    },
  ];

  for (const h of holdings) {
    await prisma.holding.upsert({
      where:  { portfolioId_coinId: { portfolioId: portfolio.id, coinId: h.coinId } },
      update: { quantity: h.quantity, avgBuyPrice: h.avgBuyPrice },
      create: { portfolioId: portfolio.id, ...h },
    });
  }
  console.log(`✅ ${holdings.length} holdings seeded`);

  // ── Transactions ──────────────────────────────────────────────────────────
  const transactions = [
    { coinId: "ethereum",  symbol: "ETH", type: "send",    quantity: 0.56,  price: 3591, usdValue: 2011.10, fee: 2.01,  cardLast4: "3919", status: "completed", date: new Date("2026-01-26T09:42:00Z") },
    { coinId: "bitcoin",   symbol: "BTC", type: "receive", quantity: 0.015, price: 68204, usdValue: 1023.06, fee: 0,    cardLast4: "3919", status: "completed", date: new Date("2026-01-26T08:15:00Z") },
    { coinId: "litecoin",  symbol: "LTC", type: "send",    quantity: 12,    price: 84,   usdValue: 1008.00, fee: 1.01,  cardLast4: "3919", status: "completed", date: new Date("2026-01-25T14:30:00Z") },
    { coinId: "solana",    symbol: "SOL", type: "buy",     quantity: 2.9,   price: 172,  usdValue: 498.80,  fee: 0.50,  cardLast4: "5541", status: "completed", date: new Date("2026-01-24T11:00:00Z") },
    { coinId: "ethereum",  symbol: "ETH", type: "receive", quantity: 0.89,  price: 3591, usdValue: 3196.00, fee: 0,    cardLast4: "3919", status: "completed", date: new Date("2026-01-23T16:22:00Z") },
    { coinId: "bitcoin",   symbol: "BTC", type: "swap",    quantity: 0.022, price: 68204, usdValue: 1500.49, fee: 1.50, cardLast4: "5541", status: "completed", date: new Date("2026-01-22T10:05:00Z") },
  ];

  for (const tx of transactions) {
    await prisma.transaction.create({
      data: { portfolioId: portfolio.id, ...tx },
    }).catch(() => {}); // skip if already exists
  }
  console.log(`✅ ${transactions.length} transactions seeded`);

  // ── Watchlist ─────────────────────────────────────────────────────────────
  const watchCoins = [
    { coinId: "cardano",   symbol: "ADA" },
    { coinId: "chainlink", symbol: "LINK" },
    { coinId: "avalanche-2", symbol: "AVAX" },
  ];
  for (const w of watchCoins) {
    await prisma.watchlist.upsert({
      where:  { userId_coinId: { userId: user.id, coinId: w.coinId } },
      update: {},
      create: { userId: user.id, ...w },
    });
  }
  console.log(`✅ ${watchCoins.length} watchlist items seeded`);

  console.log("\n🎉 Seed complete!");
  console.log("   Email:    oghenetegasukuru@ambwallet.com");
  console.log("   Password: password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
