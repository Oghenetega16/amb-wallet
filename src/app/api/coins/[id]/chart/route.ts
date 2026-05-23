import { NextRequest, NextResponse } from "next/server";
import type { CGMarketChart } from "@/lib/api/types";
import type { ChartPoint } from "@/lib/api/types";
import { format } from "date-fns";

const CG_BASE = "https://api.coingecko.com/api/v3";
const API_KEY = process.env.COINGECKO_API_KEY ?? "";

/** Format a CoinGecko timestamp into a human-readable label */
function formatLabel(ts: number, days: string): string {
  const d = new Date(ts);
  if (days === "1")   return format(d, "HH:mm");
  if (days === "7")   return format(d, "EEE");
  if (days === "30")  return format(d, "MMM d");
  if (days === "90")  return format(d, "MMM d");
  return format(d, "MMM yyyy");
}

/** Downsample an array to at most `max` evenly-spaced items */
function downsample<T>(arr: T[], max: number): T[] {
  if (arr.length <= max) return arr;
  const step = arr.length / max;
  return Array.from({ length: max }, (_, i) => arr[Math.floor(i * step)]);
}

/** GET /api/coins/[id]/chart?days=365 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const days   = _req.nextUrl.searchParams.get("days") ?? "365";

  // Cap days to valid CoinGecko values
  const validDays = ["1", "7", "30", "90", "365", "max"];
  const safeDays  = validDays.includes(days) ? days : "365";

  // Cache longer for longer timeframes (they change less often)
  const cacheTTL = safeDays === "1" ? 60 : safeDays === "7" ? 300 : 1800;

  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (API_KEY) headers["x-cg-demo-api-key"] = API_KEY;

    const res = await fetch(
      `${CG_BASE}/coins/${id}/market_chart?vs_currency=usd&days=${safeDays}`,
      { headers, next: { revalidate: cacheTTL } }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `CoinGecko ${res.status}` },
        { status: res.status }
      );
    }

    const raw: CGMarketChart = await res.json();

    // Downsample to reasonable chart points
    const maxPoints = safeDays === "1" ? 48 : safeDays === "7" ? 56 : safeDays === "max" ? 120 : 90;
    const sampled   = downsample(raw.prices, maxPoints);

    const points: ChartPoint[] = sampled.map(([ts, price]) => ({
      time:  formatLabel(ts, safeDays),
      value: price,
    }));

    return NextResponse.json(points, {
      headers: { "Cache-Control": `s-maxage=${cacheTTL}, stale-while-revalidate=${cacheTTL * 2}` },
    });
  } catch (err) {
    console.error(`[/api/coins/${id}/chart]`, err);
    return NextResponse.json({ error: "Chart fetch failed" }, { status: 502 });
  }
}
