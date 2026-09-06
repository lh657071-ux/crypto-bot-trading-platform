import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import marketRoutes from './routes/market.routes';
import exchangeRoutes from './routes/exchange.routes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Crypto Trading Bot API v1.0.0' });
});

// Market API
app.use('/api/market', marketRoutes);

// Exchange API
app.use('/api/exchange', exchangeRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Market API: GET /api/market/data/:exchange/:symbol`);
  console.log(`💰 Exchange API: GET /api/exchange/balance/:exchange`);
});

export default app;
