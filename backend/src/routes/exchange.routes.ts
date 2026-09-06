import express, { Router, Request, Response } from 'express';
import ExchangeService from '../services/exchange.service';

const router: Router = express.Router();

/**
 * GET /api/exchange/balance/:exchange
 * Get wallet balance
 */
router.get('/balance/:exchange', async (req: Request, res: Response) => {
  try {
    const { exchange } = req.params;
    const service = new ExchangeService(exchange);
    const balance = await service.getBalance();
    
    res.json({ success: true, data: balance });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * GET /api/exchange/balance/:exchange/:currency
 * Get specific currency balance
 */
router.get('/balance/:exchange/:currency', async (req: Request, res: Response) => {
  try {
    const { exchange, currency } = req.params;
    const service = new ExchangeService(exchange);
    const balance = await service.getCurrencyBalance(currency);
    
    if (!balance) {
      return res.status(404).json({ error: 'Currency not found' });
    }
    
    res.json({ success: true, data: balance });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * POST /api/exchange/order/limit
 * Create limit order
 */
router.post('/order/limit', async (req: Request, res: Response) => {
  try {
    const { exchange, symbol, side, amount, price } = req.body;
    
    if (!exchange || !symbol || !side || !amount || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const service = new ExchangeService(exchange);
    const order = await service.createLimitOrder(symbol, side, amount, price);
    
    if (!order) {
      return res.status(400).json({ error: 'Failed to create order' });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * POST /api/exchange/order/market
 * Create market order
 */
router.post('/order/market', async (req: Request, res: Response) => {
  try {
    const { exchange, symbol, side, amount } = req.body;
    
    if (!exchange || !symbol || !side || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const service = new ExchangeService(exchange);
    const order = await service.createMarketOrder(symbol, side, amount);
    
    if (!order) {
      return res.status(400).json({ error: 'Failed to create order' });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * DELETE /api/exchange/order/:exchange/:orderId
 * Cancel order
 */
router.delete('/order/:exchange/:orderId', async (req: Request, res: Response) => {
  try {
    const { exchange, orderId } = req.params;
    const { symbol } = req.query as { symbol: string };
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    const service = new ExchangeService(exchange);
    const success = await service.cancelOrder(orderId, symbol);
    
    if (!success) {
      return res.status(400).json({ error: 'Failed to cancel order' });
    }
    
    res.json({ success: true, message: 'Order canceled' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * GET /api/exchange/order/:exchange/:orderId
 * Get order status
 */
router.get('/order/:exchange/:orderId', async (req: Request, res: Response) => {
  try {
    const { exchange, orderId } = req.params;
    const { symbol } = req.query as { symbol: string };
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    const service = new ExchangeService(exchange);
    const order = await service.getOrderStatus(orderId, symbol);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * GET /api/exchange/orders/open/:exchange
 * Get open orders
 */
router.get('/orders/open/:exchange', async (req: Request, res: Response) => {
  try {
    const { exchange } = req.params;
    const { symbol } = req.query as { symbol?: string };
    
    const service = new ExchangeService(exchange);
    const orders = await service.getOpenOrders(symbol);
    
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * GET /api/exchange/orders/closed/:exchange
 * Get closed orders
 */
router.get('/orders/closed/:exchange', async (req: Request, res: Response) => {
  try {
    const { exchange } = req.params;
    const { symbol, limit = '50' } = req.query as { symbol?: string; limit?: string };
    
    const service = new ExchangeService(exchange);
    const orders = await service.getClosedOrders(symbol, parseInt(limit));
    
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * GET /api/exchange/supported
 * Get supported exchanges
 */
router.get('/supported', (req: Request, res: Response) => {
  try {
    const exchanges = ExchangeService.getSupportedExchanges();
    res.json({ success: true, data: exchanges });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

export default router;
