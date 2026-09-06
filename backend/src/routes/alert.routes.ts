import express, { Router, Request, Response } from 'express';
import AlertService, { PriceAlert } from '../services/alert.service';
import SignalService from '../services/signal.service';

const router: Router = express.Router();

/**
 * POST /api/alerts/create/:exchange/:symbol
 * Create alerts from signal
 */
router.post('/create/:exchange/:symbol', async (req: Request, res: Response) => {
  try {
    const { exchange, symbol } = req.params;
    const { timeframe = '1h' } = req.body;

    const signal = await SignalService.generateSignal(exchange, symbol, timeframe);

    if (!signal) {
      return res.status(404).json({ error: 'Unable to generate signal' });
    }

    const alerts = AlertService.createAlertsFromSignal(signal);

    res.json({
      success: true,
      data: {
        signal,
        alerts,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * POST /api/alerts/check/:symbol
 * Check if alerts are triggered
 */
router.post('/check/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { currentPrice } = req.body;

    if (!currentPrice || typeof currentPrice !== 'number') {
      return res.status(400).json({ error: 'Valid currentPrice is required' });
    }

    const triggeredAlerts = AlertService.checkAlerts(symbol, currentPrice);

    res.json({
      success: true,
      data: {
        symbol,
        currentPrice,
        triggered: triggeredAlerts,
        count: triggeredAlerts.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * GET /api/alerts/active/:symbol?
 * Get all active alerts
 */
router.get('/active/:symbol?', (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const alerts = AlertService.getActiveAlerts(symbol);

    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * GET /api/alerts/triggered/:symbol?
 * Get all triggered alerts
 */
router.get('/triggered/:symbol?', (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const alerts = AlertService.getTriggeredAlerts(symbol);

    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * DELETE /api/alerts/triggered/:symbol?
 * Clear triggered alerts
 */
router.delete('/triggered/:symbol?', (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const count = AlertService.clearTriggeredAlerts(symbol);

    res.json({
      success: true,
      message: `Cleared ${count} triggered alerts`,
      count,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * DELETE /api/alerts/all/:symbol?
 * Clear all alerts
 */
router.delete('/all/:symbol?', (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const count = AlertService.clearAllAlerts(symbol);

    res.json({
      success: true,
      message: `Cleared ${count} total alerts`,
      count,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * GET /api/alerts/stats
 * Get alert statistics
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = AlertService.getAlertStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

export default router;
