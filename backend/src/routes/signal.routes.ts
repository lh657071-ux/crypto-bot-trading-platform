import express, { Router, Request, Response } from 'express';
import SignalService from '../services/signal.service';

const router: Router = express.Router();

/**
 * POST /api/signals/generate/:exchange/:symbol
 * Generate trading signal for a symbol
 */
router.post('/generate/:exchange/:symbol', async (req: Request, res: Response) => {
  try {
    const { exchange, symbol } = req.params;
    const { timeframe = '1h' } = req.body;

    const signal = await SignalService.generateSignal(exchange, symbol, timeframe);

    if (!signal) {
      return res.status(404).json({ error: 'Unable to generate signal' });
    }

    res.json({ success: true, data: signal });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * POST /api/signals/multitimeframe/:exchange/:symbol
 * Generate signals across multiple timeframes
 */
router.post('/multitimeframe/:exchange/:symbol', async (req: Request, res: Response) => {
  try {
    const { exchange, symbol } = req.params;
    const { timeframes = ['1h', '4h', '1d'] } = req.body;

    const result = await SignalService.generateMultiTimeframeSignal(
      exchange,
      symbol,
      timeframes
    );

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * POST /api/signals/scan/:exchange
 * Scan market for trading opportunities
 */
router.post('/scan/:exchange', async (req: Request, res: Response) => {
  try {
    const { exchange } = req.params;
    const { symbols, timeframe = '1h', minStrength = 70 } = req.body;

    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: 'Invalid symbols array' });
    }

    const opportunities = await SignalService.scanMarket(
      exchange,
      symbols,
      timeframe,
      minStrength
    );

    res.json({ success: true, data: opportunities, count: opportunities.length });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * POST /api/signals/alerts/:exchange/:symbol
 * Generate price alerts for entry/exit points
 */
router.post('/alerts/:exchange/:symbol', async (req: Request, res: Response) => {
  try {
    const { exchange, symbol } = req.params;
    const { timeframe = '1h', currentPrice } = req.body;

    if (!currentPrice) {
      return res.status(400).json({ error: 'Current price is required' });
    }

    const signal = await SignalService.generateSignal(exchange, symbol, timeframe);

    if (!signal) {
      return res.status(404).json({ error: 'Unable to generate signal' });
    }

    const alerts = SignalService.generatePriceAlerts(signal, currentPrice);
    const riskReward = SignalService.calculateRiskReward(signal);

    res.json({
      success: true,
      data: {
        signal,
        alerts,
        riskReward,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * GET /api/signals/riskReward/:exchange/:symbol
 * Calculate risk/reward ratio
 */
router.get('/riskReward/:exchange/:symbol', async (req: Request, res: Response) => {
  try {
    const { exchange, symbol } = req.params;
    const { timeframe = '1h' } = req.query;

    const signal = await SignalService.generateSignal(
      exchange,
      symbol,
      String(timeframe)
    );

    if (!signal) {
      return res.status(404).json({ error: 'Unable to generate signal' });
    }

    const riskReward = SignalService.calculateRiskReward(signal);

    res.json({
      success: true,
      data: {
        symbol,
        riskReward,
        levels: signal.levels,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

export default router;
