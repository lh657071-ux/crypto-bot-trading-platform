# Crypto Bot Trading Platform - Backend Setup

## 🚀 Quick Start

### Port 5000 - Public Visibility

Backend server berjalan di **port 5000** dengan akses publik terbuka.

### Option 1: Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run development server
npm run dev
```

Server akan berjalan di: `http://localhost:5000`

### Option 2: Docker Compose (Recommended)

```bash
# Build dan jalankan semua services
docker-compose up -d

# Check status
docker-compose ps
```

Services yang berjalan:
- **Backend**: http://localhost:5000 (Public)
- **PostgreSQL**: localhost:5432

### Option 3: Docker Build

```bash
# Build image
npm run docker:build

# Run container with port 5000 exposed
npm run docker:run
```

## 📡 API Endpoints

### Health Check
```bash
curl http://localhost:5000/health
```

### Get Trading Signals
```bash
curl http://localhost:5000/api/signals
```

### Bot Status
```bash
curl http://localhost:5000/api/bot/status
```

### Execute Trade
```bash
curl -X POST http://localhost:5000/api/bot/trade \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTC/USDT",
    "action": "BUY",
    "amount": 0.01
  }'
```

### Get Bot Configuration
```bash
curl http://localhost:5000/api/bot/config
```

### Update Bot Configuration
```bash
curl -X PUT http://localhost:5000/api/bot/config \
  -H "Content-Type: application/json" \
  -d '{
    "maxPositions": 15,
    "riskLimit": 0.03
  }'
```

## 🔒 CORS Configuration

Backend dikonfigurasi dengan CORS publik:
```
CORS_ORIGIN=*
```

Ini memungkinkan web app dan mobile app terhubung dari mana saja.

## 📊 Database Connection

PostgreSQL berjalan di `localhost:5432` dengan credentials:
- User: `crypto_user`
- Password: `crypto_password`
- Database: `crypto_bot`

## 🔧 Environment Variables

Lihat `.env.example` untuk konfigurasi lengkap.

Variabel penting:
- `PORT=5000` - Server port
- `HOST=0.0.0.0` - Listen on all interfaces
- `CORS_ORIGIN=*` - Public access
- `DATABASE_URL` - PostgreSQL connection string

## 📱 Connect Web & Mobile Apps

### Frontend Configuration

```typescript
// frontend/src/config/api.ts
const API_BASE_URL = 'http://localhost:5000/api';
// atau production URL
// const API_BASE_URL = 'https://your-domain.com/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});
```

### Mobile Configuration

```typescript
// mobile/src/config/api.ts
const API_BASE_URL = 'http://your-public-ip:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL
});
```

## 🚢 Production Deployment

### Using Docker Stack

```bash
# Deploy to production
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f backend
```

### Environment Variables untuk Production

```bash
# Ganti di .env sebelum deploy
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
CORS_ORIGIN=https://your-domain.com
DATABASE_URL=postgresql://user:password@prod-db:5432/crypto_bot
JWT_SECRET=your-secure-random-secret
API_KEY_TRADING=your-secure-api-key
```

## 🐛 Troubleshooting

### Port 5000 already in use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Database connection failed

```bash
# Check PostgreSQL status
docker-compose ps

# Check logs
docker-compose logs postgres
```

### CORS errors

Pastikan `CORS_ORIGIN=*` di `.env` atau sesuaikan dengan domain frontend.

## 📈 Monitoring

Health check endpoint: `http://localhost:5000/health`

Response:
```json
{
  "status": "OK",
  "timestamp": "2026-09-07T10:00:00.000Z"
}
```

---

✅ Backend siap untuk menghubungkan dengan web app dan mobile app!
