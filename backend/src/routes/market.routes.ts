import express, { Router, Request, Response } from 'express';
import MarketService from '../services/market.service';

const router: Router = express.Router();

/**
 * GET /api/market/data/:exchange/:symbol
 * Get current market data
 */
router.get('/data/:exchange/:symbol', async (req: Request, res: Response) => {
  try {
    const { exchange, symbol } = req.params;
    const data = await MarketService.getMarketData(exchange, symbol);
    
    if (!data) {
      return res.status(404).json({ error: 'Market data not found' });
    }
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * GET /api/market/candles/:exchange/:symbol
 * Get candle data
 */
router.get('/candles/:exchange/:symbol', async (req: Request, res: Response) => {
  try {
    const { exchange, symbol } = req.params;
    const { timeframe = '1h', limit = '100' } = req.query;
    
    const candles = await MarketService.getCandleData(
      exchange,
      symbol,
      String(timeframe),
      parseInt(String(limit))
    );
    
    res.json({ success: true, data: candles });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * GET /api/market/orderbook/:exchange/:symbol
 * Get order book data
 */
router.get('/orderbook/:exchange/:symbol', async (req: Request, res: Response) => {
  try {
    const { exchange, symbol } = req.params;
    const { limit = '20' } = req.query;
    
    const orderbook = await MarketService.getOrderBook(
      exchange,
      symbol,
      parseInt(String(limit))
    );
    
    if (!orderbook) {
      return res.status(404).json({ error: 'Order book not found' });
    }
    
    res.json({ success: true, data: orderbook });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * GET /api/market/trades/:exchange/:symbol
 * Get recent trades
 */
router.get('/trades/:exchange/:symbol', async (req: Request, res: Response) => {
  try {
    const { exchange, symbol } = req.params;
    const { limit = '50' } = req.query;
    
    const trades = await MarketService.getRecentTrades(
      exchange,
      symbol,
      parseInt(String(limit))
    );
    
    res.json({ success: true, data: trades });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * GET /api/market/pairs/:exchange
 * Get available trading pairs
 */
router.get('/pairs/:exchange', async (req: Request, res: Response) => {
  try {
    const { exchange } = req.params;
    const pairs = await MarketService.getAvailablePairs(exchange);
    
    res.json({ success: true, data: pairs });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * POST /api/market/signals/:exchange/:symbol
 * Get trading signals based on technical analysis
 */
router.post('/signals/:exchange/:symbol', async (req: Request, res: Response) => {
  try {
    const { exchange, symbol } = req.params;
    const { timeframe = '1h', limit = '100' } = req.query;
    
    // Get candle data
    const candles = await MarketService.getCandleData(
      exchange,
      symbol,
      String(timeframe),
      parseInt(String(limit))
    );
    
    if (candles.length === 0) {
      return res.status(404).json({ error: 'No candle data found' });
    }
    
    // Calculate indicators
    const indicators = MarketService.calculateIndicators(candles);
    
    // Generate signal based on indicators
    const signal = generateSignal(indicators);
    
    res.json({
      success: true,
      data: {
        symbol,
        timeframe,
        signal,
        indicators,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * GET /api/market/multi/:exchange
 * Get data for multiple symbols
 */
router.post('/multi/:exchange', async (req: Request, res: Response) => {
  try {
    const { exchange } = req.params;
    const { symbols } = req.body as { symbols: string[] };
    
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: 'Invalid symbols array' });
    }
    
    const data = await MarketService.getMultipleMarketData(exchange, symbols);
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * Generate trading signal based on indicators
 */
function generateSignal(indicators: any): string {
  let buySignals = 0;
  let sellSignals = 0;
  
  // Supertrend signal
  if (indicators.supertrend > 0) buySignals++;
  else sellSignals++;
  
  // Moving averages crossover
  if (indicators.ma20 > indicators.ma50) buySignals++;
  else sellSignals++;
  
  // RSI signal (from StochRSI)
  if (indicators.stochRSI > 50) buySignals++;
  else sellSignals++;
  
  // MACD signal
  if (indicators.macd > 0) buySignals++;
  else sellSignals++;
  
  // KDJ signal
  if (indicators.kdj > 50) buySignals++;
  else sellSignals++;
  
  // OBV trend
  if (indicators.obv > 0) buySignals++;
  else sellSignals++;
  
  // Determine final signal
  if (buySignals > sellSignals) return 'BUY';
  if (sellSignals > buySignals) return 'SELL';
  return 'HOLD';
}

export default router;
