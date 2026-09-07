import express, { Router, Response } from 'express';
import TradingBotRepository from '../repositories/trading-bot.repository';
import ExchangeApiKeyRepository from '../repositories/exchange-api-key.repository';
import OrderRepository from '../repositories/order.repository';
import ExchangeService from '../services/exchange.service';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware';

const router: Router = express.Router();

const VALID_MODES = [
  'AUTO_GRID',
  'AUTO_GRID_FUTURES',
  'FUTURES_GRID',
  'DCA_FUTURES',
  'MARTINGALE',
  'MARTINGALE_FUTURES',
  'SNOWBALL_GRID',
  'SNOWBALL_FUTURES',
];

const VALID_STATUSES = ['active', 'paused', 'stopped', 'error'];

router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const bots = await TradingBotRepository.findByUser(req.userId!);
    res.json({ success: true, data: bots });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const bot = await TradingBotRepository.findById(req.params.id);
    if (!bot || bot.user_id !== req.userId) {
      return res.status(404).json({ success: false, error: 'Bot not found' });
    }
    res.json({ success: true, data: bot });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      exchangeApiKeyId,
      name,
      description,
      symbol,
      tradingMode,
      isPaperTrading,
      initialCapital,
      timeframe,
      useIndicators,
      minSignalStrength,
      settings,
    } = req.body;

    if (!exchangeApiKeyId || !name || !symbol || !tradingMode || initialCapital === undefined) {
      return res.status(400).json({
        success: false,
        error: 'exchangeApiKeyId, name, symbol, tradingMode and initialCapital are required',
      });
    }

    if (!VALID_MODES.includes(tradingMode)) {
      return res.status(400).json({ success: false, error: `tradingMode must be one of: ${VALID_MODES.join(', ')}` });
    }

    const apiKey = await ExchangeApiKeyRepository.findById(exchangeApiKeyId);
    if (!apiKey || apiKey.user_id !== req.userId) {
      return res.status(404).json({ success: false, error: 'Exchange API key not found' });
    }

    const bot = await TradingBotRepository.create(req.userId!, exchangeApiKeyId, {
      name,
      description,
      symbol,
      trading_mode: tradingMode,
      is_paper_trading: isPaperTrading,
      initial_capital: initialCapital,
      timeframe,
      use_indicators: useIndicators,
      min_signal_strength: minSignalStrength,
      settings,
    });

    if (!bot) {
      return res.status(500).json({ success: false, error: 'Failed to create bot' });
    }

    res.status(201).json({ success: true, data: bot });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await TradingBotRepository.findById(req.params.id);
    if (!existing || existing.user_id !== req.userId) {
      return res.status(404).json({ success: false, error: 'Bot not found' });
    }

    const allowedFields = [
      'name',
      'description',
      'symbol',
      'trading_mode',
      'is_paper_trading',
      'initial_capital',
      'position_size',
      'leverage',
      'timeframe',
      'use_indicators',
      'min_signal_strength',
      'settings',
    ];

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = field === 'settings' ? JSON.stringify(req.body[field]) : req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }

    const bot = await TradingBotRepository.update(req.params.id, updates);
    res.json({ success: true, data: bot });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const existing = await TradingBotRepository.findById(req.params.id);
    if (!existing || existing.user_id !== req.userId) {
      return res.status(404).json({ success: false, error: 'Bot not found' });
    }

    const success = await TradingBotRepository.updateStatus(req.params.id, status);
    if (!success) {
      return res.status(500).json({ success: false, error: 'Failed to update bot status' });
    }

    res.json({ success: true, message: `Bot status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await TradingBotRepository.findById(req.params.id);
    if (!existing || existing.user_id !== req.userId) {
      return res.status(404).json({ success: false, error: 'Bot not found' });
    }

    const success = await TradingBotRepository.delete(req.params.id);
    if (!success) {
      return res.status(500).json({ success: false, error: 'Failed to delete bot' });
    }

    res.json({ success: true, message: 'Bot deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

router.post('/:id/orders', async (req: AuthRequest, res: Response) => {
  try {
    const { side, amount } = req.body;

    if (!side || !['buy', 'sell'].includes(side)) {
      return res.status(400).json({ success: false, error: "side must be 'buy' or 'sell'" });
    }

    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({ success: false, error: 'amount must be a positive number' });
    }

    const bot = await TradingBotRepository.findById(req.params.id);
    if (!bot || bot.user_id !== req.userId) {
      return res.status(404).json({ success: false, error: 'Bot not found' });
    }

    const apiKey = await ExchangeApiKeyRepository.findById(bot.exchange_api_key_id);
    if (!apiKey || apiKey.user_id !== req.userId) {
      return res.status(404).json({ success: false, error: 'Exchange API key not found for this bot' });
    }

    const exchangeService = new ExchangeService(apiKey.exchange_name, {
      apiKey: apiKey.api_key,
      secret: apiKey.api_secret,
      passphrase: apiKey.passphrase,
      sandbox: bot.is_paper_trading,
    });

    let exchangeOrder;
    try {
      exchangeOrder = await exchangeService.createMarketOrder(bot.symbol, side, amountNum);
    } catch (err) {
      return res.status(502).json({
        success: false,
        error: err instanceof Error ? err.message : 'Exchange rejected the order',
      });
    }

    if (!exchangeOrder) {
      return res.status(502).json({ success: false, error: 'Exchange did not return an order' });
    }

    const savedOrder = await OrderRepository.create(req.userId!, {
      bot_id: bot.id,
      symbol: exchangeOrder.symbol,
      order_type: 'market',
      order_side: side,
      status: exchangeOrder.status === 'closed' ? 'closed' : 'open',
      price: exchangeOrder.price || undefined,
      amount: exchangeOrder.amount,
      filled: exchangeOrder.filled,
      remaining: exchangeOrder.remaining,
      exchange_order_id: exchangeOrder.id,
    } as any);

    res.status(201).json({ success: true, data: savedOrder || exchangeOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

export default router;
