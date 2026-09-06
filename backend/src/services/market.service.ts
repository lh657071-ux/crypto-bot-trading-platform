import ccxt from 'ccxt';
import axios from 'axios';
import { TradingSignal, TechnicalIndicators } from '../../shared/types/trading';

export interface MarketData {
  symbol: string;
  price: number;
  volume24h: number;
  change24h: number;
  high24h: number;
  low24h: number;
  timestamp: Date;
}

export interface CandleData {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class MarketService {
  private exchanges: Map<string, any> = new Map();

  constructor() {
    this.initializeExchanges();
  }

  /**
   * Initialize CCXT exchanges
   */
  private initializeExchanges() {
    try {
      // Binance
      this.exchanges.set('binance', new ccxt.binance({
        apiKey: process.env.BINANCE_API_KEY,
        secret: process.env.BINANCE_API_SECRET,
        enableRateLimit: true,
        options: {
          defaultType: 'spot',
          fetchBalance: true,
        },
      }));

      // Bybit
      this.exchanges.set('bybit', new ccxt.bybit({
        apiKey: process.env.BYBIT_API_KEY,
        secret: process.env.BYBIT_API_SECRET,
        enableRateLimit: true,
      }));

      // OKX
      this.exchanges.set('okx', new ccxt.okx({
        apiKey: process.env.OKX_API_KEY,
        secret: process.env.OKX_API_SECRET,
        password: process.env.OKX_PASSWORD,
        enableRateLimit: true,
      }));

      console.log('✅ Exchanges initialized');
    } catch (error) {
      console.error('❌ Error initializing exchanges:', error);
    }
  }

  /**
   * Get current market data for a symbol
   */
  async getMarketData(exchange: string, symbol: string): Promise<MarketData | null> {
    try {
      const ex = this.exchanges.get(exchange.toLowerCase());
      if (!ex) throw new Error(`Exchange ${exchange} not found`);

      const ticker = await ex.fetchTicker(symbol);

      return {
        symbol,
        price: ticker.last,
        volume24h: ticker.quoteVolume,
        change24h: ticker.percentage || 0,
        high24h: ticker.high,
        low24h: ticker.low,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Error fetching market data for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get OHLCV (candle) data
   */
  async getCandleData(
    exchange: string,
    symbol: string,
    timeframe: string = '1h',
    limit: number = 100
  ): Promise<CandleData[]> {
    try {
      const ex = this.exchanges.get(exchange.toLowerCase());
      if (!ex) throw new Error(`Exchange ${exchange} not found`);

      const ohlcv = await ex.fetchOHLCV(symbol, timeframe, undefined, limit);

      return ohlcv.map((candle: any[]) => ({
        timestamp: new Date(candle[0]),
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: candle[5],
      }));
    } catch (error) {
      console.error(`Error fetching candle data for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get multiple symbols market data
   */
  async getMultipleMarketData(
    exchange: string,
    symbols: string[]
  ): Promise<MarketData[]> {
    const results: MarketData[] = [];

    for (const symbol of symbols) {
      const data = await this.getMarketData(exchange, symbol);
      if (data) results.push(data);
    }

    return results;
  }

  /**
   * Get order book data
   */
  async getOrderBook(
    exchange: string,
    symbol: string,
    limit: number = 20
  ): Promise<{ bids: number[][]; asks: number[][] } | null> {
    try {
      const ex = this.exchanges.get(exchange.toLowerCase());
      if (!ex) throw new Error(`Exchange ${exchange} not found`);

      const orderbook = await ex.fetchOrderBook(symbol, limit);

      return {
        bids: orderbook.bids,
        asks: orderbook.asks,
      };
    } catch (error) {
      console.error(`Error fetching order book for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get recent trades
   */
  async getRecentTrades(
    exchange: string,
    symbol: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      const ex = this.exchanges.get(exchange.toLowerCase());
      if (!ex) throw new Error(`Exchange ${exchange} not found`);

      const trades = await ex.fetchTrades(symbol, undefined, limit);

      return trades.map((trade: any) => ({
        id: trade.id,
        timestamp: new Date(trade.timestamp),
        symbol: trade.symbol,
        price: trade.price,
        amount: trade.amount,
        side: trade.side,
      }));
    } catch (error) {
      console.error(`Error fetching trades for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get available trading pairs
   */
  async getAvailablePairs(exchange: string): Promise<string[]> {
    try {
      const ex = this.exchanges.get(exchange.toLowerCase());
      if (!ex) throw new Error(`Exchange ${exchange} not found`);

      await ex.loadMarkets();
      return ex.symbols;
    } catch (error) {
      console.error(`Error fetching available pairs:`, error);
      return [];
    }
  }

  /**
   * Stream live price updates (using polling)
   * In production, consider using WebSocket
   */
  async streamPriceUpdates(
    exchange: string,
    symbol: string,
    callback: (data: MarketData) => void,
    interval: number = 5000
  ): Promise<NodeJS.Timer> {
    const intervalId = setInterval(async () => {
      const data = await this.getMarketData(exchange, symbol);
      if (data) callback(data);
    }, interval);

    return intervalId;
  }

  /**
   * Calculate technical indicators
   */
  calculateIndicators(candles: CandleData[]): TechnicalIndicators {
    const closes = candles.map(c => c.close);

    return {
      supertrend: this.calculateSupertrend(candles),
      ma20: this.calculateMA(closes, 20),
      ma50: this.calculateMA(closes, 50),
      stochRSI: this.calculateStochRSI(closes),
      kdj: this.calculateKDJ(candles),
      obv: this.calculateOBV(candles),
      macd: this.calculateMACD(closes),
    };
  }

  /**
   * Calculate Moving Average
   */
  private calculateMA(prices: number[], period: number): number {
    if (prices.length < period) return 0;
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  /**
   * Calculate Supertrend
   */
  private calculateSupertrend(candles: CandleData[], period: number = 10, multiplier: number = 3): number {
    if (candles.length < period) return 0;
    
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const closes = candles.map(c => c.close);
    
    const hl2 = highs.map((h, i) => (h + lows[i]) / 2);
    const atr = this.calculateATR(candles, period);
    const basicUpperBand = this.calculateMA(hl2, period) + multiplier * atr;
    const basicLowerBand = this.calculateMA(hl2, period) - multiplier * atr;
    
    const lastClose = closes[closes.length - 1];
    return lastClose > basicUpperBand ? basicUpperBand : basicLowerBand;
  }

  /**
   * Calculate ATR (Average True Range)
   */
  private calculateATR(candles: CandleData[], period: number = 14): number {
    if (candles.length < period) return 0;
    
    const tr: number[] = [];
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;
      
      const tr1 = high - low;
      const tr2 = Math.abs(high - prevClose);
      const tr3 = Math.abs(low - prevClose);
      
      tr.push(Math.max(tr1, tr2, tr3));
    }
    
    return tr.slice(-period).reduce((a, b) => a + b, 0) / period;
  }

  /**
   * Calculate RSI
   */
  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period) return 0;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i < period; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff > 0) gains += diff;
      else losses += Math.abs(diff);
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    return rsi;
  }

  /**
   * Calculate Stochastic RSI
   */
  private calculateStochRSI(prices: number[], period: number = 14, smoothK: number = 3, smoothD: number = 3): number {
    const rsiPeriod = 14;
    const rsiValues: number[] = [];
    
    for (let i = rsiPeriod; i < prices.length; i++) {
      const rsi = this.calculateRSI(prices.slice(0, i + 1), rsiPeriod);
      rsiValues.push(rsi);
    }
    
    if (rsiValues.length < period) return 0;
    
    const lastRsiValues = rsiValues.slice(-period);
    const lowestRsi = Math.min(...lastRsiValues);
    const highestRsi = Math.max(...lastRsiValues);
    
    const stochRsi = (rsiValues[rsiValues.length - 1] - lowestRsi) / (highestRsi - lowestRsi) * 100;
    return isNaN(stochRsi) ? 0 : stochRsi;
  }

  /**
   * Calculate KDJ
   */
  private calculateKDJ(candles: CandleData[], period: number = 9): number {
    if (candles.length < period) return 0;
    
    const lastCandles = candles.slice(-period);
    const high = Math.max(...lastCandles.map(c => c.high));
    const low = Math.min(...lastCandles.map(c => c.low));
    const close = candles[candles.length - 1].close;
    
    const rsv = (close - low) / (high - low) * 100;
    return isNaN(rsv) ? 0 : rsv;
  }

  /**
   * Calculate OBV (On-Balance Volume)
   */
  private calculateOBV(candles: CandleData[]): number {
    let obv = 0;
    
    for (let i = 0; i < candles.length; i++) {
      if (i === 0) {
        obv = candles[i].volume;
      } else {
        if (candles[i].close > candles[i - 1].close) {
          obv += candles[i].volume;
        } else if (candles[i].close < candles[i - 1].close) {
          obv -= candles[i].volume;
        }
      }
    }
    
    return obv;
  }

  /**
   * Calculate MACD
   */
  private calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26): number {
    if (prices.length < slowPeriod) return 0;
    
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    
    return fastEMA - slowEMA;
  }

  /**
   * Calculate EMA (Exponential Moving Average)
   */
  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return 0;
    
    const k = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b) / period;
    
    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
    }
    
    return ema;
  }
}

export default new MarketService();
