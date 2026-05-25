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

// ─── Demo response (used when no API key or insufficient credits) ───────────
function buildDemoResponse(data: InsightRequest): string {
  const { portfolio, holdings } = data;
  const topHolding  = [...holdings].sort((a, b) => b.currentValue - a.currentValue)[0];
  const bestGainer  = [...holdings].sort((a, b) => b.priceChangePct24h - a.priceChangePct24h)[0];
  const worstLoser  = [...holdings].sort((a, b) => a.priceChangePct24h - b.priceChangePct24h)[0];
  const isProfit    = portfolio.totalPnL >= 0;
  const is24hUp     = portfolio.change24h >= 0;

  return `## Portfolio Snapshot
Your portfolio of $${portfolio.totalValue.toFixed(2)} is ${isProfit ? "up" : "down"} ${Math.abs(portfolio.totalPnLPct).toFixed(1)}% overall, with a ${is24hUp ? "positive" : "negative"} 24h move of ${is24hUp ? "+" : ""}${portfolio.change24hPct.toFixed(2)}%.

## Key Observations
• ${topHolding?.symbol ?? "BTC"} is your largest position at ${topHolding?.allocationPct.toFixed(1) ?? "0"}% — monitor concentration risk closely
• ${bestGainer?.symbol ?? "ETH"} is the top performer today at ${bestGainer?.priceChangePct24h >= 0 ? "+" : ""}${bestGainer?.priceChangePct24h.toFixed(2) ?? "0"}%
• ${worstLoser?.symbol ?? "LTC"} is the weakest at ${worstLoser?.priceChangePct24h.toFixed(2) ?? "0"}% — consider whether to hold or trim
• Unrealised P&L of ${isProfit ? "+" : ""}$${portfolio.totalPnL.toFixed(2)} suggests ${isProfit ? "a strong entry strategy" : "potential rebalancing opportunity"}

## Rebalancing Suggestions
• If ${topHolding?.symbol ?? "BTC"} exceeds 40% allocation, consider trimming 5–10% into stablecoins or ETH to reduce single-asset risk
• Rotate a portion of any underperforming assets (${worstLoser?.symbol ?? "LTC"}) into higher-momentum positions on the next dip

## Risk Assessment
Moderate — diversification across ${holdings.length} assets reduces volatility, but top-heavy concentration warrants attention.`;
}

// ─── Prompt builder ─────────────────────────────────────────────────────────
function buildPrompt(data: InsightRequest): string {
  const { portfolio, holdings, globalMarket } = data;
  const holdingLines = holdings
    .sort((a, b) => b.currentValue - a.currentValue)
    .map(h =>
      `• ${h.symbol} (${h.name}): ${h.allocationPct.toFixed(1)}% of portfolio | Value: $${h.currentValue.toFixed(2)} | P&L: ${h.pnl >= 0 ? "+" : ""}$${h.pnl.toFixed(2)} (${h.pnlPct >= 0 ? "+" : ""}${h.pnlPct.toFixed(2)}%) | 24h: ${h.priceChangePct24h >= 0 ? "+" : ""}${h.priceChangePct24h.toFixed(2)}%`
    ).join("\n");

  return `You are a concise, sharp crypto portfolio analyst. Respond ONLY in the exact format below — no preamble, no extra text, no deviations. Use ## headings exactly as shown.

## Portfolio Snapshot
One sentence about overall portfolio health and performance.

## Key Observations
• Bullet one (under 20 words)
• Bullet two (under 20 words)
• Bullet three (under 20 words)

## Rebalancing Suggestions
• Specific action one with percentages
• Specific action two with percentages

## Risk Assessment
One sentence: Low / Moderate / High and why in 15 words or fewer.

---
PORTFOLIO DATA:
Total Value: $${portfolio.totalValue.toFixed(2)}
Total P&L: ${portfolio.totalPnL >= 0 ? "+" : ""}$${portfolio.totalPnL.toFixed(2)} (${portfolio.totalPnLPct >= 0 ? "+" : ""}${portfolio.totalPnLPct.toFixed(2)}%)
24h Change: ${portfolio.change24h >= 0 ? "+" : ""}$${portfolio.change24h.toFixed(2)} (${portfolio.change24hPct >= 0 ? "+" : ""}${portfolio.change24hPct.toFixed(2)}%)
${globalMarket ? `BTC Dominance: ${globalMarket.btcDominance.toFixed(1)}% | Market 24h: ${globalMarket.marketCapChangePct24h >= 0 ? "+" : ""}${globalMarket.marketCapChangePct24h.toFixed(2)}%` : ""}

HOLDINGS:
${holdingLines}`;
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let body: InsightRequest;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }

  if (!body.holdings?.length)
    return NextResponse.json({ error: "No holdings data provided" }, { status: 400 });

  // ── Demo mode: no API key configured ────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    const demo = buildDemoResponse(body);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Simulate streaming token by token for realism
        for (const char of demo) {
          controller.enqueue(encoder.encode(char));
          // Small delay every ~10 chars to simulate streaming
          if (Math.random() < 0.1) {
            await new Promise(r => setTimeout(r, 8));
          }
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  // ── Live mode: call Anthropic API ───────────────────────────────────────
  const prompt = buildPrompt(body);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = client.messages.stream({
          model:      "claude-sonnet-4-20250514",
          max_tokens: 800,
          system:     "You are a crypto portfolio analyst. CRITICAL RULE: Begin your response immediately with '## Portfolio Snapshot' — no intro sentences, no preamble whatsoever. Use ## markdown headings for all four sections exactly as shown in the prompt. Never add extra sections or deviate from the format.",
          messages:   [{ role: "user", content: prompt }],
        });

        for await (const event of claudeStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err: any) {
        // ── Billing / quota error → fall back to demo silently ────────────
        const isBillingError =
          err?.status === 400 &&
          (err?.message?.includes("credit") ||
           err?.message?.includes("balance") ||
           err?.error?.error?.type === "invalid_request_error");

        if (isBillingError) {
          // Stream demo response instead of crashing
          const demo = buildDemoResponse(body);
          for (const char of demo) {
            controller.enqueue(encoder.encode(char));
          }
        } else {
          const msg = err instanceof Error ? err.message : "AI stream failed";
          controller.enqueue(encoder.encode(`\n\n_Error: ${msg}_`));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
