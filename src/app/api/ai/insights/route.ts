import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

export interface InsightRequest {
  portfolio: {
    totalValue:   number;
    totalCost:    number;
    totalPnL:     number;
    totalPnLPct:  number;
    change24h:    number;
    change24hPct: number;
  };
  holdings: Array<{
    symbol:            string;
    name:              string;
    quantity:          number;
    currentPrice:      number;
    currentValue:      number;
    pnl:               number;
    pnlPct:            number;
    priceChangePct24h: number;
    allocationPct:     number;
  }>;
  globalMarket?: {
    btcDominance:          number;
    totalMarketCapUsd:     number;
    marketCapChangePct24h: number;
  };
}

function buildPrompt(data: InsightRequest): string {
  const { portfolio, holdings, globalMarket } = data;
  const holdingLines = holdings
    .sort((a, b) => b.currentValue - a.currentValue)
    .map(h =>
      `• ${h.symbol} (${h.name}): ${h.allocationPct.toFixed(1)}% of portfolio | Value: $${h.currentValue.toFixed(2)} | P&L: ${h.pnl >= 0 ? "+" : ""}$${h.pnl.toFixed(2)} (${h.pnlPct >= 0 ? "+" : ""}${h.pnlPct.toFixed(2)}%) | 24h: ${h.priceChangePct24h >= 0 ? "+" : ""}${h.priceChangePct24h.toFixed(2)}%`
    ).join("\n");

  return `You are a concise, sharp crypto portfolio analyst. Analyse the following portfolio and respond in exactly this format with no extra commentary:

## Portfolio Snapshot
[One sentence summarising the portfolio's overall health and performance in plain English.]

## Key Observations
[3–4 bullet points. Each under 20 words. Focus on concentration risk, best/worst performers, and 24h momentum.]

## Rebalancing Suggestions
[2–3 concrete, actionable suggestions. Be specific about percentages and which assets to trim or grow. No generic advice.]

## Risk Assessment
[One sentence risk verdict: Low / Moderate / High — and why in 15 words or fewer.]

---
PORTFOLIO DATA:
Total Value: $${portfolio.totalValue.toFixed(2)}
Total P&L: ${portfolio.totalPnL >= 0 ? "+" : ""}$${portfolio.totalPnL.toFixed(2)} (${portfolio.totalPnLPct >= 0 ? "+" : ""}${portfolio.totalPnLPct.toFixed(2)}%)
24h Change: ${portfolio.change24h >= 0 ? "+" : ""}$${portfolio.change24h.toFixed(2)} (${portfolio.change24hPct >= 0 ? "+" : ""}${portfolio.change24hPct.toFixed(2)}%)
${globalMarket ? `BTC Dominance: ${globalMarket.btcDominance.toFixed(1)}% | Market 24h: ${globalMarket.marketCapChangePct24h >= 0 ? "+" : ""}${globalMarket.marketCapChangePct24h.toFixed(2)}%` : ""}

HOLDINGS:
${holdingLines}`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY)
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });

  let body: InsightRequest;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }

  if (!body.holdings?.length)
    return NextResponse.json({ error: "No holdings data provided" }, { status: 400 });

  const prompt = buildPrompt(body);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = client.messages.stream({
          model: "claude-sonnet-4-20250514",
          max_tokens: 600,
          messages: [{ role: "user", content: prompt }],
          system: "You are a sharp, senior crypto analyst. Be direct, specific, and data-driven. Never use filler phrases. Respond only with the requested format.",
        });
        for await (const event of claudeStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "AI stream failed";
        controller.enqueue(encoder.encode(`\n\n_Error: ${msg}_`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
