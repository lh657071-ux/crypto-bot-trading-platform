import MarketService, { CandleData } from './market.service';
import { TechnicalIndicators } from '../../shared/types/trading';

export interface SignalStrength {
  strength: number; // 0-100
  confidence: number; // 0-100
  reasoning: string[];
}

export interface DetailedSignal {
  symbol: string;
  timeframe: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  strength: SignalStrength;
  indicators: TechnicalIndicators;
  price: number;
  levels: {
    support: number;
    resistance: number;
    entry: number;
    takeProfit: number;
    stopLoss: number;
  };
  timestamp: Date;
}

export class SignalService {
  /**
   * Generate comprehensive trading signal with strength analysis
   */
  async generateSignal(
    exchange: string,
    symbol: string,
    timeframe: string = '1h'
  ): Promise<DetailedSignal | null> {
    try {
      // Get candle data
      const candles = await MarketService.getCandleData(
        exchange,
        symbol,
        timeframe,
        100
      );

      if (candles.length === 0) return null;

      // Calculate indicators
      const indicators = MarketService.calculateIndicators(candles);

      // Generate signal with reasoning
      const { signal, strength } = this.analyzeIndicators(indicators, candles);

      // Calculate support/resistance levels
      const levels = this.calculateLevels(candles, signal);

      return {
        symbol,
        timeframe,
        signal,
        strength,
        indicators,
        price: candles[candles.length - 1].close,
        levels,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Error generating signal for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Analyze multiple timeframes for confirmation
   */
  async generateMultiTimeframeSignal(
    exchange: string,
    symbol: string,
    timeframes: string[] = ['1h', '4h', '1d']
  ): Promise<{ signals: DetailedSignal[]; consensus: 'BUY' | 'SELL' | 'HOLD' }> {
    const signals: DetailedSignal[] = [];
    const signalCounts = { BUY: 0, SELL: 0, HOLD: 0 };

    for (const timeframe of timeframes) {
      const signal = await this.generateSignal(exchange, symbol, timeframe);
      if (signal) {
        signals.push(signal);
        signalCounts[signal.signal]++;
      }
    }

    // Determine consensus
    const consensus = this.determineConsensus(signalCounts);

    return { signals, consensus };
  }

  /**
   * Analyze indicators and generate signal with strength
   */
  private analyzeIndicators(
    indicators: TechnicalIndicators,
    candles: CandleData[]
  ): { signal: 'BUY' | 'SELL' | 'HOLD'; strength: SignalStrength } {
    const reasoning: string[] = [];
    let buyScore = 0;
    let sellScore = 0;

    // 1. Trend Analysis (30% weight)
    if (indicators.ma20 > indicators.ma50) {
      buyScore += 3;
      reasoning.push('MA20 > MA50: Uptrend confirmed');
    } else {
      sellScore += 3;
      reasoning.push('MA20 < MA50: Downtrend confirmed');
    }

    // 2. Momentum (25% weight)
    if (indicators.stochRSI > 70) {
      sellScore += 2.5;
      reasoning.push('StochRSI > 70: Overbought signal');
    } else if (indicators.stochRSI < 30) {
      buyScore += 2.5;
      reasoning.push('StochRSI < 30: Oversold signal');
    } else if (indicators.stochRSI > 50) {
      buyScore += 1.5;
      reasoning.push('StochRSI > 50: Bullish momentum');
    } else {
      sellScore += 1.5;
      reasoning.push('StochRSI < 50: Bearish momentum');
    }

    // 3. MACD (20% weight)
    if (indicators.macd > 0) {
      buyScore += 2;
      reasoning.push('MACD > 0: Bullish crossover');
    } else {
      sellScore += 2;
      reasoning.push('MACD < 0: Bearish crossover');
    }

    // 4. Volume Trend (15% weight)
    if (indicators.obv > 0) {
      buyScore += 1.5;
      reasoning.push('OBV > 0: Volume supporting uptrend');
    } else {
      sellScore += 1.5;
      reasoning.push('OBV < 0: Volume supporting downtrend');
    }

    // 5. KDJ (10% weight)
    if (indicators.kdj > 80) {
      sellScore += 1;
      reasoning.push('KDJ > 80: Strong overbought');
    } else if (indicators.kdj < 20) {
      buyScore += 1;
      reasoning.push('KDJ < 20: Strong oversold');
    }

    // 6. Supertrend (Confirmation)
    if (indicators.supertrend > 0) {
      buyScore += 0.5;
      reasoning.push('Supertrend: Uptrend active');
    } else {
      sellScore += 0.5;
      reasoning.push('Supertrend: Downtrend active');
    }

    // Determine signal
    const totalScore = buyScore + sellScore;
    const buyPercentage = (buyScore / totalScore) * 100;
    const sellPercentage = (sellScore / totalScore) * 100;

    let signal: 'BUY' | 'SELL' | 'HOLD';
    let confidence: number;

    if (buyScore > sellScore * 1.2) {
      signal = 'BUY';
      confidence = Math.min(buyPercentage, 100);
    } else if (sellScore > buyScore * 1.2) {
      signal = 'SELL';
      confidence = Math.min(sellPercentage, 100);
    } else {
      signal = 'HOLD';
      confidence = 50;
    }

    const strength: number = Math.abs(buyScore - sellScore) * 10;

    return {
      signal,
      strength: {
        strength: Math.min(strength, 100),
        confidence,
        reasoning,
      },
    };
  }

  /**
   * Calculate support/resistance levels and trade entry/exit points
   */
  private calculateLevels(
    candles: CandleData[],
    signal: 'BUY' | 'SELL' | 'HOLD'
  ): {
    support: number;
    resistance: number;
    entry: number;
    takeProfit: number;
    stopLoss: number;
  } {
    const lastCandle = candles[candles.length - 1];
    const lastPrice = lastCandle.close;

    // Calculate pivot points
    const high = Math.max(...candles.slice(-20).map(c => c.high));
    const low = Math.min(...candles.slice(-20).map(c => c.low));
    const pivot = (high + low + lastPrice) / 3;

    const support = low + (pivot - high) * 0.5;
    const resistance = high - (low - pivot) * 0.5;

    let entry: number;
    let takeProfit: number;
    let stopLoss: number;

    if (signal === 'BUY') {
      // For buy signal: enter on support, TP at resistance, SL below support
      entry = support + (lastPrice - support) * 0.5; // Mid-point
      takeProfit = resistance + (resistance - lastPrice) * 0.5;
      stopLoss = support - (lastPrice - support) * 0.3;
    } else if (signal === 'SELL') {
      // For sell signal: enter on resistance, TP at support, SL above resistance
      entry = resistance - (resistance - lastPrice) * 0.5; // Mid-point
      takeProfit = support - (lastPrice - support) * 0.5;
      stopLoss = resistance + (resistance - lastPrice) * 0.3;
    } else {
      // HOLD: use current price as reference
      entry = lastPrice;
      takeProfit = lastPrice + (lastPrice * 0.05); // 5% TP
      stopLoss = lastPrice - (lastPrice * 0.05); // 5% SL
    }

    return {
      support,
      resistance,
      entry,
      takeProfit,
      stopLoss,
    };
  }

  /**
   * Determine consensus from multiple timeframes
   */
  private determineConsensus(signalCounts: {
    BUY: number;
    SELL: number;
    HOLD: number;
  }): 'BUY' | 'SELL' | 'HOLD' {
    const total = signalCounts.BUY + signalCounts.SELL + signalCounts.HOLD;

    if (signalCounts.BUY > total * 0.5) return 'BUY';
    if (signalCounts.SELL > total * 0.5) return 'SELL';
    return 'HOLD';
  }

  /**
   * Scan multiple symbols and identify trading opportunities
   */
  async scanMarket(
    exchange: string,
    symbols: string[],
    timeframe: string = '1h',
    minStrength: number = 70
  ): Promise<DetailedSignal[]> {
    const opportunities: DetailedSignal[] = [];

    for (const symbol of symbols) {
      try {
        const signal = await this.generateSignal(exchange, symbol, timeframe);
        if (signal && signal.strength.strength >= minStrength) {
          opportunities.push(signal);
        }
      } catch (error) {
        console.error(`Error scanning ${symbol}:`, error);
      }
    }

    // Sort by strength descending
    return opportunities.sort((a, b) => b.strength.strength - a.strength.strength);
  }

  /**
   * Generate alerts for price levels
   */
  generatePriceAlerts(
    signal: DetailedSignal,
    currentPrice: number
  ): string[] {
    const alerts: string[] = [];

    if (signal.signal === 'BUY') {
      if (currentPrice <= signal.levels.entry) {
        alerts.push('✅ BUY signal confirmed - Entry price reached');
      }
      if (currentPrice >= signal.levels.takeProfit) {
        alerts.push('🎯 TAKE PROFIT - Target reached');
      }
      if (currentPrice <= signal.levels.stopLoss) {
        alerts.push('⚠️ STOP LOSS - Exit trade');
      }
    } else if (signal.signal === 'SELL') {
      if (currentPrice >= signal.levels.entry) {
        alerts.push('✅ SELL signal confirmed - Entry price reached');
      }
      if (currentPrice <= signal.levels.takeProfit) {
        alerts.push('🎯 TAKE PROFIT - Target reached');
      }
      if (currentPrice >= signal.levels.stopLoss) {
        alerts.push('⚠️ STOP LOSS - Exit trade');
      }
    }

    return alerts;
  }

  /**
   * Calculate risk/reward ratio
   */
  calculateRiskReward(signal: DetailedSignal): number {
    const risk = Math.abs(
      signal.levels.entry - signal.levels.stopLoss
    );
    const reward = Math.abs(
      signal.levels.takeProfit - signal.levels.entry
    );

    return reward / risk;
  }
}

export default new SignalService();
