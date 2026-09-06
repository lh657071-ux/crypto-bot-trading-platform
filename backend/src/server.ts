import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import marketRoutes from './routes/market.routes';
import exchangeRoutes from './routes/exchange.routes';
import signalRoutes from './routes/signal.routes';
import alertRoutes from './routes/alert.routes';
import { authMiddleware } from './middleware/auth.middleware';

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

// Auth Routes (public)
app.use('/api/auth', authRoutes);

// Protected Routes (require authentication)
app.use('/api/market', authMiddleware, marketRoutes);
app.use('/api/exchange', authMiddleware, exchangeRoutes);
app.use('/api/signals', authMiddleware, signalRoutes);
app.use('/api/alerts', authMiddleware, alertRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔐 Authentication: POST /api/auth/register | POST /api/auth/login`);
  console.log(`📊 Market API: GET /api/market/data/:exchange/:symbol`);
  console.log(`💰 Exchange API: GET /api/exchange/balance/:exchange`);
  console.log(`📈 Signal API: POST /api/signals/generate/:exchange/:symbol`);
  console.log(`🔔 Alert API: POST /api/alerts/create/:exchange/:symbol`);
});

export default app;
