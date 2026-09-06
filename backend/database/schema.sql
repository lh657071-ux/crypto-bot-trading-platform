-- Create ENUM types
CREATE TYPE signal_type AS ENUM ('BUY', 'SELL', 'HOLD');
CREATE TYPE order_status AS ENUM ('open', 'closed', 'canceled', 'pending');
CREATE TYPE order_type AS ENUM ('limit', 'market');
CREATE TYPE order_side AS ENUM ('buy', 'sell');
CREATE TYPE bot_status AS ENUM ('active', 'paused', 'stopped', 'error');
CREATE TYPE trading_mode AS ENUM (
  'AUTO_GRID',
  'AUTO_GRID_FUTURES',
  'FUTURES_GRID',
  'DCA_FUTURES',
  'MARTINGALE',
  'MARTINGALE_FUTURES',
  'SNOWBALL_GRID',
  'SNOWBALL_FUTURES'
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(255),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Exchange API Keys table
CREATE TABLE exchange_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exchange_name VARCHAR(50) NOT NULL,
  api_key TEXT NOT NULL,
  api_secret TEXT NOT NULL,
  passphrase TEXT,
  is_active BOOLEAN DEFAULT true,
  last_tested_at TIMESTAMP,
  test_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, exchange_name)
);

CREATE INDEX idx_exchange_api_keys_user_id ON exchange_api_keys(user_id);

-- Trading Bots table
CREATE TABLE trading_bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exchange_api_key_id UUID NOT NULL REFERENCES exchange_api_keys(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  symbol VARCHAR(20) NOT NULL,
  trading_mode trading_mode NOT NULL,
  status bot_status DEFAULT 'stopped',
  is_paper_trading BOOLEAN DEFAULT false,
  
  -- Trading parameters
  initial_capital DECIMAL(20, 8) NOT NULL,
  position_size DECIMAL(20, 8),
  leverage DECIMAL(5, 2) DEFAULT 1,
  max_daily_loss DECIMAL(5, 2),
  risk_per_trade DECIMAL(5, 2) DEFAULT 2,
  
  -- Technical Analysis
  timeframe VARCHAR(10) DEFAULT '1h',
  use_indicators BOOLEAN DEFAULT true,
  min_signal_strength DECIMAL(5, 2) DEFAULT 70,
  
  -- Strategy settings
  settings JSONB DEFAULT '{}',
  
  -- Statistics
  total_trades INT DEFAULT 0,
  winning_trades INT DEFAULT 0,
  losing_trades INT DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,
  total_profit DECIMAL(20, 8) DEFAULT 0,
  
  started_at TIMESTAMP,
  last_trade_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trading_bots_user_id ON trading_bots(user_id);
CREATE INDEX idx_trading_bots_status ON trading_bots(status);

-- Trading Signals table
CREATE TABLE trading_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES trading_bots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  timeframe VARCHAR(10) NOT NULL,
  signal signal_type NOT NULL,
  
  -- Indicators
  ma20 DECIMAL(20, 8),
  ma50 DECIMAL(20, 8),
  stoch_rsi DECIMAL(5, 2),
  kdj DECIMAL(5, 2),
  obv DECIMAL(20, 8),
  macd DECIMAL(20, 8),
  supertrend DECIMAL(20, 8),
  
  -- Signal strength
  strength DECIMAL(5, 2) NOT NULL,
  confidence DECIMAL(5, 2) NOT NULL,
  reasoning TEXT[],
  
  -- Levels
  support_level DECIMAL(20, 8),
  resistance_level DECIMAL(20, 8),
  entry_level DECIMAL(20, 8),
  take_profit_level DECIMAL(20, 8),
  stop_loss_level DECIMAL(20, 8),
  risk_reward_ratio DECIMAL(5, 2),
  
  current_price DECIMAL(20, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trading_signals_user_id ON trading_signals(user_id);
CREATE INDEX idx_trading_signals_bot_id ON trading_signals(bot_id);
CREATE INDEX idx_trading_signals_symbol ON trading_signals(symbol);
CREATE INDEX idx_trading_signals_created_at ON trading_signals(created_at DESC);

-- Price Alerts table
CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signal_id UUID REFERENCES trading_signals(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  alert_type VARCHAR(50) NOT NULL,
  trigger_price DECIMAL(20, 8) NOT NULL,
  current_price DECIMAL(20, 8),
  is_triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_symbol ON price_alerts(symbol);
CREATE INDEX idx_price_alerts_is_triggered ON price_alerts(is_triggered);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES trading_bots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exchange_order_id VARCHAR(255),
  symbol VARCHAR(20) NOT NULL,
  order_type order_type NOT NULL,
  order_side order_side NOT NULL,
  status order_status DEFAULT 'pending',
  
  -- Order details
  price DECIMAL(20, 8),
  amount DECIMAL(20, 8) NOT NULL,
  filled DECIMAL(20, 8) DEFAULT 0,
  remaining DECIMAL(20, 8),
  total_cost DECIMAL(20, 8),
  fee DECIMAL(20, 8),
  
  -- Related signal
  signal_id UUID REFERENCES trading_signals(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  filled_at TIMESTAMP,
  canceled_at TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_bot_id ON orders(bot_id);
CREATE INDEX idx_orders_symbol ON orders(symbol);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Trades table (pairs of BUY and SELL orders)
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES trading_bots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  
  -- Entry
  entry_order_id UUID NOT NULL REFERENCES orders(id),
  entry_price DECIMAL(20, 8) NOT NULL,
  entry_amount DECIMAL(20, 8) NOT NULL,
  entry_time TIMESTAMP NOT NULL,
  
  -- Exit
  exit_order_id UUID REFERENCES orders(id),
  exit_price DECIMAL(20, 8),
  exit_amount DECIMAL(20, 8),
  exit_time TIMESTAMP,
  exit_reason VARCHAR(50),
  
  -- P&L
  profit_loss DECIMAL(20, 8),
  profit_loss_percent DECIMAL(10, 2),
  fee_paid DECIMAL(20, 8),
  net_profit_loss DECIMAL(20, 8),
  
  -- Status
  status VARCHAR(50) DEFAULT 'open',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_bot_id ON trades(bot_id);
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trades_status ON trades(status);

-- Balance History table (snapshots)
CREATE TABLE balance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exchange_name VARCHAR(50) NOT NULL,
  
  -- Balance snapshot
  total_balance DECIMAL(20, 8) NOT NULL,
  available_balance DECIMAL(20, 8),
  locked_balance DECIMAL(20, 8),
  
  -- Holdings
  holdings JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_balance_history_user_id ON balance_history(user_id);
CREATE INDEX idx_balance_history_created_at ON balance_history(created_at DESC);

-- Bot Performance table
CREATE TABLE bot_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES trading_bots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Daily metrics
  trade_date DATE NOT NULL,
  
  total_trades INT DEFAULT 0,
  winning_trades INT DEFAULT 0,
  losing_trades INT DEFAULT 0,
  win_rate DECIMAL(5, 2),
  
  gross_profit DECIMAL(20, 8) DEFAULT 0,
  total_fees DECIMAL(20, 8) DEFAULT 0,
  net_profit DECIMAL(20, 8) DEFAULT 0,
  
  max_drawdown DECIMAL(5, 2),
  roi DECIMAL(5, 2),
  sharpe_ratio DECIMAL(10, 2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(bot_id, trade_date)
);

CREATE INDEX idx_bot_performance_bot_id ON bot_performance(bot_id);
CREATE INDEX idx_bot_performance_trade_date ON bot_performance(trade_date DESC);

-- Audit Log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(50),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exchange_api_keys_updated_at BEFORE UPDATE ON exchange_api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_bots_updated_at BEFORE UPDATE ON trading_bots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_alerts_updated_at BEFORE UPDATE ON price_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
