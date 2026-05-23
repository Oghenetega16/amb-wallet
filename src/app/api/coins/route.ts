import { NextResponse } from "next/server";
import type { CGMarketCoin } from "@/lib/api/types";
import { TRACKED_COINS } from "@/lib/api/coingecko";

const CG_BASE   = "https://api.coingecko.com/api/v3";
const API_KEY   = process.env.COINGECKO_API_KEY ?? "";   // Optional — demo key works without
const CACHE_TTL = 30;                                     // seconds

/** GET /api/coins — market data for all tracked coins */
export async function GET() {
  try {
    const params = new URLSearchParams({
      vs_currency:          "usd",
      ids:                  TRACKED_COINS.join(","),
      order:                "market_cap_desc",
      per_page:             "20",
      page:                 "1",
      sparkline:            "true",
      price_change_percentage: "24h",
    });

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (API_KEY) headers["x-cg-demo-api-key"] = API_KEY;

    const res = await fetch(
      `${CG_BASE}/coins/markets?${params.toString()}`,
      {
        headers,
        next: { revalidate: CACHE_TTL },
      }
    );

    if (!res.ok) {
      // CoinGecko rate-limited (429) or down → return error so client falls back to mock
      return NextResponse.json(
        { error: `CoinGecko responded with ${res.status}` },
        {
          status: res.status,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const data: CGMarketCoin[] = await res.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": `s-maxage=${CACHE_TTL}, stale-while-revalidate=60`,
      },
    });
  } catch (err) {
    console.error("[/api/coins]", err);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 502 }
    );
  }
}
