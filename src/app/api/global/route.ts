import { NextResponse } from "next/server";

const CG_BASE = "https://api.coingecko.com/api/v3";
const API_KEY = process.env.COINGECKO_API_KEY ?? "";

export interface GlobalMarketData {
  total_market_cap_usd:    number;
  total_volume_usd:        number;
  btc_dominance:           number;
  eth_dominance:           number;
  market_cap_change_pct:   number;
  active_cryptocurrencies: number;
}

/** GET /api/global */
export async function GET() {
  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (API_KEY) headers["x-cg-demo-api-key"] = API_KEY;

    const res = await fetch(`${CG_BASE}/global`, {
      headers,
      next: { revalidate: 120 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `CoinGecko ${res.status}` }, { status: res.status });
    }

    const json = await res.json();
    const d    = json.data;

    const out: GlobalMarketData = {
      total_market_cap_usd:    d.total_market_cap?.usd              ?? 0,
      total_volume_usd:        d.total_volume?.usd                  ?? 0,
      btc_dominance:           d.market_cap_percentage?.btc         ?? 0,
      eth_dominance:           d.market_cap_percentage?.eth         ?? 0,
      market_cap_change_pct:   d.market_cap_change_percentage_24h_usd ?? 0,
      active_cryptocurrencies: d.active_cryptocurrencies            ?? 0,
    };

    return NextResponse.json(out, {
      headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=240" },
    });
  } catch (err) {
    console.error("[/api/global]", err);
    return NextResponse.json({ error: "Global fetch failed" }, { status: 502 });
  }
}
