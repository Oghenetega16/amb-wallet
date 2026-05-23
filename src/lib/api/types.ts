// ─── CoinGecko API Response Types ──────────────────────────────────────────

export interface CGMarketCoin {
  id:                             string;
  symbol:                         string;
  name:                           string;
  image:                          string;
  current_price:                  number;
  market_cap:                     number;
  market_cap_rank:                number;
  fully_diluted_valuation:        number | null;
  total_volume:                   number;
  high_24h:                       number;
  low_24h:                        number;
  price_change_24h:               number;
  price_change_percentage_24h:    number;
  market_cap_change_24h:          number;
  market_cap_change_percentage_24h: number;
  circulating_supply:             number;
  total_supply:                   number | null;
  max_supply:                     number | null;
  ath:                            number;
  ath_change_percentage:          number;
  ath_date:                       string;
  atl:                            number;
  atl_change_percentage:          number;
  atl_date:                       string;
  last_updated:                   string;
  sparkline_in_7d?:               { price: number[] };
}

export interface CGMarketChart {
  prices:        [number, number][];   // [timestamp, price]
  market_caps:   [number, number][];
  total_volumes: [number, number][];
}

export interface CGSimplePrice {
  [coinId: string]: {
    usd:                 number;
    usd_24h_change:      number;
    usd_24h_vol:         number;
    usd_market_cap:      number;
    last_updated_at:     number;
  };
}

// ─── Binance WebSocket Types ────────────────────────────────────────────────

export interface BinanceTickerMsg {
  stream: string;
  data: {
    e:  string;     // Event type: "24hrTicker"
    E:  number;     // Event time
    s:  string;     // Symbol e.g. "BTCUSDT"
    p:  string;     // Price change
    P:  string;     // Price change percent
    c:  string;     // Last price
    Q:  string;     // Last quantity
    b:  string;     // Best bid price
    a:  string;     // Best ask price
    o:  string;     // Open price
    h:  string;     // High price
    l:  string;     // Low price
    v:  string;     // Total traded base asset volume
    q:  string;     // Total traded quote asset volume
    x:  string;     // First trade(s) before the 24hr rolling window
    n:  number;     // Total number of trades
  };
}

// ─── Normalised types used in our app ──────────────────────────────────────

export interface LivePrice {
  symbol:     string;   // "BTC"
  price:      number;
  change24h:  number;
  changePct:  number;
  high24h:    number;
  low24h:     number;
  volume24h:  number;
  updatedAt:  number;   // ms timestamp
}

export interface ChartPoint {
  time:  string;
  value: number;
}
