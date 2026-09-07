export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TradingSignal = 'BUY' | 'SELL' | 'HOLD';

export interface TechnicalIndicators {
  supertrend: number;
  ma20: number;
  ma50: number;
  stochRSI: number;
  kdj: number;
  obv: number;
  macd: number;
}

export interface Signal {
  id: string;
  symbol: string;
  signal: TradingSignal;
  timestamp: Date;
  indicators: TechnicalIndicators;
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

export interface BotConfig {
  id: string;
  userId: string;
  symbol: string;
  mode: TradingMode;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
