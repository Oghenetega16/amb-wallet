import { NextRequest, NextResponse } from "next/server";
import { TRACKED_COINS } from "@/lib/api/coingecko";

const CG_BASE = "https://api.coingecko.com/api/v3";
const API_KEY = process.env.COINGECKO_API_KEY ?? "";

/** GET /api/coins/simple?ids=bitcoin,ethereum */
export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids") ?? TRACKED_COINS.join(",");

  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (API_KEY) headers["x-cg-demo-api-key"] = API_KEY;

    const params = new URLSearchParams({
      ids,
      vs_currencies:       "usd",
      include_24hr_change: "true",
      include_24hr_vol:    "true",
      include_market_cap:  "true",
      include_last_updated_at: "true",
    });

    const res = await fetch(`${CG_BASE}/simple/price?${params}`, {
      headers,
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `CoinGecko ${res.status}` }, { status: res.status });
    }

    return NextResponse.json(await res.json(), {
      headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("[/api/coins/simple]", err);
    return NextResponse.json({ error: "Simple price fetch failed" }, { status: 502 });
  }
}
