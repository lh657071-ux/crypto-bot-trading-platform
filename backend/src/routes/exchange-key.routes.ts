import express, { Router, Response } from 'express';
import ExchangeApiKeyRepository from '../repositories/exchange-api-key.repository';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware';

const router: Router = express.Router();

router.use(requireAuth);

function sanitize(key: any) {
  if (!key) return key;
  const { api_secret, passphrase, ...safe } = key;
  return safe;
}

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const keys = await ExchangeApiKeyRepository.findByUser(req.userId!);
    res.json({ success: true, data: keys.map(sanitize) });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { exchangeName, apiKey, apiSecret, passphrase } = req.body;

    if (!exchangeName || !apiKey || !apiSecret) {
      return res.status(400).json({ success: false, error: 'exchangeName, apiKey and apiSecret are required' });
    }

    const existing = await ExchangeApiKeyRepository.findByUserAndExchange(req.userId!, exchangeName);
    if (existing) {
      return res.status(409).json({ success: false, error: 'API key for this exchange already exists' });
    }

    const created = await ExchangeApiKeyRepository.create(req.userId!, exchangeName, apiKey, apiSecret, passphrase);
    if (!created) {
      return res.status(500).json({ success: false, error: 'Failed to save API key' });
    }

    res.status(201).json({ success: true, data: sanitize(created) });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await ExchangeApiKeyRepository.findById(req.params.id);
    if (!existing || existing.user_id !== req.userId) {
      return res.status(404).json({ success: false, error: 'API key not found' });
    }

    const success = await ExchangeApiKeyRepository.delete(req.params.id);
    if (!success) {
      return res.status(500).json({ success: false, error: 'Failed to delete API key' });
    }

    res.json({ success: true, message: 'API key deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

export default router;
