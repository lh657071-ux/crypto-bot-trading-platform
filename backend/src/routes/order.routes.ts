import express, { Router, Response } from 'express';
import OrderRepository from '../repositories/order.repository';
import TradingBotRepository from '../repositories/trading-bot.repository';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware';

const router: Router = express.Router();

router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || '50');
    const orders = await OrderRepository.findByUser(req.userId!, limit);
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const order = await OrderRepository.findById(req.params.id);
    if (!order || order.user_id !== req.userId) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

router.get('/bot/:botId', async (req: AuthRequest, res: Response) => {
  try {
    const bot = await TradingBotRepository.findById(req.params.botId);
    if (!bot || bot.user_id !== req.userId) {
      return res.status(404).json({ success: false, error: 'Bot not found' });
    }

    const orders = await OrderRepository.findByBot(req.params.botId);
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

export default router;
