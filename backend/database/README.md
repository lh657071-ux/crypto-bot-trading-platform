# Database Schema Documentation

## Overview
PostgreSQL database for Crypto Trading Bot platform with complete support for:
- User management & authentication
- Exchange API key storage
- Trading bot configuration & management
- Trading signals & technical analysis
- Orders & trade tracking
- Performance analytics
- Audit logging

## Tables

### Users
- Stores user accounts with authentication
- 2FA support
- Email verification
- Last login tracking

### Exchange API Keys
- Encrypted API credentials for multiple exchanges
- Binance, Bybit, OKX support
- Per-user, per-exchange unique constraint
- Connection testing status

### Trading Bots
- Bot configuration & status
- Trading mode (Auto-Grid, Futures, etc.)
- Risk parameters (position size, leverage, max loss)
- Technical analysis settings
- Performance metrics (win rate, total profit)
- Paper trading support

### Trading Signals
- Signal history (BUY, SELL, HOLD)
- All technical indicators values
- Signal strength & confidence
- Entry/exit levels (support, resistance, TP, SL)
- Risk/reward ratio

### Price Alerts
- Entry, exit, take profit, stop loss alerts
- Alert trigger tracking
- Related to trading signals

### Orders
- Exchange orders linked to bots
- Order type, side, status tracking
- Filled amount & fee tracking
- Exchange order ID mapping

### Trades
- Complete trade pairs (entry + exit)
- P&L calculation
- Trade statistics
- Fee tracking

### Balance History
- Daily wallet balance snapshots
- Holdings per currency
- Available vs locked balance

### Bot Performance
- Daily performance metrics
- Win rate, ROI, Sharpe ratio
- Max drawdown tracking

### Audit Logs
- All user actions logged
- IP & user agent tracking
- Old & new values for changes
- Error logging

## Key Features

✅ **Auto-updating timestamps** - `updated_at` automatically set via trigger  
✅ **Foreign key constraints** - Referential integrity with CASCADE deletes  
✅ **Indexes** - Optimized queries for common operations  
✅ **ENUM types** - Type-safe signal/order/status values  
✅ **JSONB support** - Flexible settings & holdings storage  
✅ **Date filtering** - Optimized for time-series queries  

## Connection String

```
postgres://DB_USER:DB_PASSWORD@DB_HOST:DB_PORT/DB_NAME
```

## Setup

```bash
# Run initialization script
bash backend/database/init-db.sh

# Or manually
psql -h localhost -U postgres -d postgres -f backend/database/schema.sql
```
