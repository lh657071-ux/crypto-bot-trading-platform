# 🚀 Backend Setup - Port 5000 & Public Visibility

## Overview

Backend API berjalan di **port 5000** dengan **akses publik terbuka** (CORS enabled untuk semua origin).

---

## 📋 Quick Start

### Option 1: Local Development

```bash
# Install dependencies
cd backend
npm install

# Copy environment file
cp ../.env.example .env

# Run development server
npm run dev
```

✅ Server akan berjalan di: `http://localhost:5000`

### Option 2: Docker Compose (Recommended)

```bash
# Build dan jalankan semua services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

✅ Services yang berjalan:
- **Backend API**: http://localhost:5000 (Public Access)
- **PostgreSQL**: localhost:5432
- **Healthcheck**: http://localhost:5000/health

### Option 3: Docker Build Individual

```bash
# Build image
npm run docker:build

# Run container
npm run docker:run
```

---

## 📡 API Endpoints

### 1. Health Check
```bash
curl http://localhost:5000/health
```
Response:
```json
{
  "status": "OK",
  "timestamp": "2026-09-07T10:00:00.000Z",
  "port": 5000,
  "environment": "production"
}
```

### 2. Get Trading Signals
```bash
curl http://localhost:5000/api/signals
```
Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "signal-1",
      "symbol": "BTC/USDT",
      "action": "BUY",
      "confidence": 0.85,
      "price": 45000,
      "strength": "STRONG",
      "timestamp": "2026-09-07T10:00:00.000Z"
    }
  ]
}
```

### 3. Bot Status
```bash
curl http://localhost:5000/api/bot/status
```
Response:
```json
{
  "success": true,
  "data": {
    "status": "RUNNING",
    "uptime": 3600,
    "activePositions": 3,
    "totalProfit": 1250.50,
    "winRate": 0.72,
    "lastUpdate": "2026-09-07T10:00:00.000Z"
  }
}
```

### 4. Get Bot Configuration
```bash
curl http://localhost:5000/api/bot/config
```

### 5. Update Bot Configuration
```bash
curl -X PUT http://localhost:5000/api/bot/config \
  -H "Content-Type: application/json" \
  -d '{
    "maxPositions": 15,
    "riskLimit": 0.03,
    "autoTrade": true,
    "signalThreshold": 0.7
  }'
```

### 6. Execute Trade
```bash
curl -X POST http://localhost:5000/api/bot/trade \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTC/USDT",
    "action": "BUY",
    "amount": 0.01
  }'
```

### 7. Get Trade History
```bash
curl "http://localhost:5000/api/bot/trades?limit=10"
```

---

## 🔒 CORS Configuration

Backend dikonfigurasi dengan **CORS publik**:
```typescript
app.use(cors({
  origin: '*',  // Public visibility
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
```

✅ Memungkinkan koneksi dari:
- Web app (any domain)
- Mobile app (iOS/Android)
- External tools & services

---

## 📊 Database Connection

**PostgreSQL** berjalan di `localhost:5432`

Credentials:
```
Host: postgres (atau localhost:5432)
User: crypto_user
Password: crypto_password
Database: crypto_bot
```

Connection String:
```
postgresql://crypto_user:crypto_password@postgres:5432/crypto_bot
```

---

## 🔧 Environment Variables

### Wajib diatur:
```bash
PORT=5000                          # Server port (exposed publicly)
HOST=0.0.0.0                      # Listen on all interfaces
NODE_ENV=production                # Environment
CORS_ORIGIN=*                      # Public visibility
```

### Database:
```bash
DATABASE_URL=postgresql://...     # PostgreSQL connection string
DB_HOST=postgres                   # Docker service name
DB_PORT=5432
DB_USER=crypto_user
DB_PASSWORD=crypto_password
DB_NAME=crypto_bot
```

### Trading Bot:
```bash
SIGNALS_UPDATE_INTERVAL=60000     # Update interval in ms
MAX_POSITIONS=10                   # Max open positions
RISK_LIMIT=0.02                    # Risk limit per trade
AUTO_TRADE=true                    # Enable auto trading
SIGNAL_THRESHOLD=0.65              # Min confidence for signals
```

### Security:
```bash
JWT_SECRET=your-secret-key         # JWT secret key
API_KEY_TRADING=your-api-key       # Trading API key
```

---

## 📱 Menghubungkan Web & Mobile Apps

### Frontend (React/Vue/Angular)

```typescript
// frontend/src/config/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Usage
const getSignals = async () => {
  const response = await apiClient.get('/signals');
  return response.data;
};
```

### Mobile (React Native/Flutter)

```typescript
// mobile/src/config/api.ts
const API_BASE_URL = 'http://your-public-ip:5000/api';
// atau untuk production: 'https://your-domain.com/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
});
```

### Environment Variables untuk Client

```bash
# .env.local (Development)
REACT_APP_API_URL=http://localhost:5000/api

# .env.production (Production)
REACT_APP_API_URL=https://your-domain.com/api
```

---

## 🚢 Production Deployment

### Using Docker Stack

```bash
# Deploy dengan Docker Compose
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Production Environment Variables

```bash
# .env (Production)
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
CORS_ORIGIN=https://your-domain.com,https://app.your-domain.com

# Secure database credentials
DATABASE_URL=postgresql://secure_user:secure_password@prod-db.provider.com:5432/crypto_bot

# Secure secrets
JWT_SECRET=generate-a-secure-random-string-here
API_KEY_TRADING=your-secure-api-key

BINANCE_API_KEY=your-binance-key
BINANCE_API_SECRET=your-binance-secret
```

### Cloud Deployment Options

**Heroku:**
```bash
heroku create crypto-bot-trading-api
heroku config:set PORT=5000
heroku config:set NODE_ENV=production
git push heroku main
```

**AWS ECS/Fargate:**
```bash
# Push image to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

docker tag crypto-bot-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/crypto-bot-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/crypto-bot-backend:latest
```

**DigitalOcean / Linode:**
```bash
# Deploy using docker-compose
scp docker-compose.yml root@your-server:/app/
ssh root@your-server "cd /app && docker-compose up -d"
```

---

## 🐛 Troubleshooting

### Port 5000 Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### Database Connection Failed

```bash
# Check PostgreSQL status
docker-compose ps

# View database logs
docker-compose logs postgres

# Test connection
psql -h localhost -U crypto_user -d crypto_bot
```

### CORS Errors from Frontend

Ensure `CORS_ORIGIN=*` atau sesuaikan dengan domain frontend:
```bash
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
```

### Backend Not Responding

```bash
# Check health endpoint
curl http://localhost:5000/health

# View application logs
docker-compose logs -f backend

# Restart service
docker-compose restart backend
```

---

## 📈 Monitoring & Logging

### Health Check
```bash
# Continuous health monitoring
watch -n 5 'curl -s http://localhost:5000/health | jq .'
```

### View Logs
```bash
# Backend logs
docker-compose logs -f backend

# Database logs
docker-compose logs -f postgres

# All logs
docker-compose logs -f
```

### Performance Monitoring
```bash
# Check resource usage
docker stats crypto-bot-backend
```

---

## ✅ Checklist

- [x] Port 5000 terekspos ke public
- [x] CORS enabled untuk all origins
- [x] Health check endpoint tersedia
- [x] API routes untuk trading signals
- [x] Database connection configured
- [x] Docker Compose setup
- [x] Environment variables documented
- [x] Siap untuk menghubungkan frontend & mobile

---

## 🎯 Next Steps

1. ✅ Setup backend dengan `docker-compose up -d`
2. 📝 Update `.env` dengan credentials
3. 🔗 Hubungkan frontend ke `http://localhost:5000/api`
4. 📱 Hubungkan mobile ke public IP backend
5. 🚀 Deploy ke production

**Backend siap! 🎉**
