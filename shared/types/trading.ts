// Shared trading types used across frontend, backend, and mobile

export type TradingSignal = 'BUY' | 'SELL' | 'HOLD';

export type TradingMode = 
  | 'AUTO_GRID'
  | 'AUTO_GRID_FUTURES'
  | 'FUTURES_GRID'
  | 'DCA_FUTURES'
  | 'MARTINGALE'
  | 'MARTINGALE_FUTURES'
  | 'SNOWBALL_GRID'
  | 'SNOWBALL_FUTURES';

export interface TechnicalIndicators {
  supertrend: number;
  ma20: number;
  ma50: number;
  stochRSI: number;
  kdj: number;
  obv: number;
  macd: number;
}

export interface SignalData {
  id: string;
  symbol: string;
  signal: TradingSignal;
  indicators: TechnicalIndicators;
  timestamp: Date;
  confidence: number;
}

export interface BotConfiguration {
  id: string;
  userId: string;
  symbol: string;
  mode: TradingMode;
  isActive: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  settings: Record<string, any>;
}
