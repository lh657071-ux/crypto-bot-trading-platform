export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export type TradingMode =
  | 'AUTO_GRID'
  | 'AUTO_GRID_FUTURES'
  | 'FUTURES_GRID'
  | 'DCA_FUTURES'
  | 'MARTINGALE'
  | 'MARTINGALE_FUTURES'
  | 'SNOWBALL_GRID'
  | 'SNOWBALL_FUTURES';

export type BotStatus = 'active' | 'paused' | 'stopped' | 'error';

export interface TradingBot {
  id: string;
  user_id: string;
  exchange_api_key_id: string;
  name: string;
  description?: string;
  symbol: string;
  trading_mode: TradingMode;
  status: BotStatus;
  is_paper_trading: boolean;
  initial_capital: number;
  position_size?: number;
  leverage: number;
  timeframe: string;
  use_indicators: boolean;
  min_signal_strength: number;
  settings: Record<string, any>;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_profit: number;
  started_at?: string;
  last_trade_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ExchangeApiKey {
  id: string;
  user_id: string;
  exchange_name: string;
  api_key: string;
  is_active: boolean;
  last_tested_at?: string;
  test_status?: string;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'open' | 'closed' | 'canceled' | 'pending';

export interface Order {
  id: string;
  bot_id?: string;
  user_id: string;
  exchange_order_id?: string;
  symbol: string;
  order_type: 'limit' | 'market';
  order_side: 'buy' | 'sell';
  status: OrderStatus;
  price?: number;
  amount: number;
  filled: number;
  remaining?: number;
  total_cost?: number;
  fee?: number;
  signal_id?: string;
  created_at: string;
  updated_at: string;
  filled_at?: string;
  canceled_at?: string;
}

export interface DetailedSignal {
  symbol: string;
  timeframe: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  strength: {
    strength: number;
    confidence: number;
    reasoning: string[];
  };
  price: number;
  levels: {
    support: number;
    resistance: number;
    entry: number;
    takeProfit: number;
    stopLoss: number;
  };
  timestamp: string;
}

export const TRADING_MODES: TradingMode[] = [
  'AUTO_GRID',
  'AUTO_GRID_FUTURES',
  'FUTURES_GRID',
  'DCA_FUTURES',
  'MARTINGALE',
  'MARTINGALE_FUTURES',
  'SNOWBALL_GRID',
  'SNOWBALL_FUTURES',
];
