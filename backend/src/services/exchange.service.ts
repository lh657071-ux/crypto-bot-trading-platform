import ccxt from 'ccxt';

export interface WalletBalance {
  currency: string;
  free: number;
  used: number;
  total: number;
}

export interface Order {
  id: string;
  symbol: string;
  type: 'limit' | 'market';
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  status: 'open' | 'closed' | 'canceled';
  timestamp: Date;
  filled: number;
  remaining: number;
}

export interface ExchangeCredentials {
  apiKey?: string;
  secret?: string;
  passphrase?: string;
  sandbox?: boolean;
}

export class ExchangeService {
  private exchange: any;
  private exchangeName: string;

  constructor(exchangeName: string = 'binance', credentials?: ExchangeCredentials) {
    this.exchangeName = exchangeName.toLowerCase();
    this.initializeExchange(credentials);
  }

  private initializeExchange(credentials?: ExchangeCredentials) {
    try {
      const ExchangeClass = (ccxt as any)[this.exchangeName];
      if (!ExchangeClass) {
        throw new Error(`Exchange ${this.exchangeName} not supported`);
      }

      this.exchange = new ExchangeClass({
        apiKey: credentials?.apiKey || process.env[`${this.exchangeName.toUpperCase()}_API_KEY`],
        secret: credentials?.secret || process.env[`${this.exchangeName.toUpperCase()}_API_SECRET`],
        password: credentials?.passphrase,
        enableRateLimit: true,
        options: {
          defaultType: 'spot',
        },
      });

      if (credentials?.sandbox && typeof this.exchange.setSandboxMode === 'function') {
        this.exchange.setSandboxMode(true);
      }
    } catch (error) {
      console.error(`Error initializing ${this.exchangeName}:`, error);
      throw error;
    }
  }

  async getBalance(): Promise<WalletBalance[]> {
    try {
      const balance = await this.exchange.fetchBalance();
      const result: WalletBalance[] = [];

      for (const currency in balance) {
        if (currency === 'free' || currency === 'used' || currency === 'total') continue;

        result.push({
          currency,
          free: balance[currency].free || 0,
          used: balance[currency].used || 0,
          total: balance[currency].total || 0,
        });
      }

      return result.filter(b => b.total > 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
      return [];
    }
  }

  async getCurrencyBalance(currency: string): Promise<WalletBalance | null> {
    try {
      const balance = await this.exchange.fetchBalance();
      const currencyUpper = currency.toUpperCase();

      if (balance[currencyUpper]) {
        return {
          currency,
          free: balance[currencyUpper].free || 0,
          used: balance[currencyUpper].used || 0,
          total: balance[currencyUpper].total || 0,
        };
      }

      return null;
    } catch (error) {
      console.error(`Error fetching ${currency} balance:`, error);
      return null;
    }
  }

  async createLimitOrder(
    symbol: string,
    side: 'buy' | 'sell',
    amount: number,
    price: number
  ): Promise<Order | null> {
    try {
      const order = await this.exchange.createLimitOrder(symbol, side, amount, price);

      return {
        id: order.id,
        symbol: order.symbol,
        type: 'limit',
        side: order.side as 'buy' | 'sell',
        price: order.price || price,
        amount: order.amount || amount,
        status: order.status as 'open' | 'closed' | 'canceled',
        timestamp: new Date(order.timestamp),
        filled: order.filled || 0,
        remaining: order.remaining || amount,
      };
    } catch (error) {
      console.error('Error creating limit order:', error);
      throw error;
    }
  }

  async createMarketOrder(
    symbol: string,
    side: 'buy' | 'sell',
    amount: number
  ): Promise<Order | null> {
    try {
      const order = await this.exchange.createMarketOrder(symbol, side, amount);

      return {
        id: order.id,
        symbol: order.symbol,
        type: 'market',
        side: order.side as 'buy' | 'sell',
        price: order.average || 0,
        amount: order.amount || amount,
        status: order.status as 'open' | 'closed' | 'canceled',
        timestamp: new Date(order.timestamp),
        filled: order.filled || amount,
        remaining: order.remaining || 0,
      };
    } catch (error) {
      console.error('Error creating market order:', error);
      throw error;
    }
  }

  async cancelOrder(orderId: string, symbol: string): Promise<boolean> {
    try {
      await this.exchange.cancelOrder(orderId, symbol);
      return true;
    } catch (error) {
      console.error(`Error canceling order ${orderId}:`, error);
      return false;
    }
  }

  async getOrderStatus(orderId: string, symbol: string): Promise<Order | null> {
    try {
      const order = await this.exchange.fetchOrder(orderId, symbol);

      return {
        id: order.id,
        symbol: order.symbol,
        type: order.type as 'limit' | 'market',
        side: order.side as 'buy' | 'sell',
        price: order.price || 0,
        amount: order.amount || 0,
        status: order.status as 'open' | 'closed' | 'canceled',
        timestamp: new Date(order.timestamp),
        filled: order.filled || 0,
        remaining: order.remaining || 0,
      };
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      return null;
    }
  }

  async getOpenOrders(symbol?: string): Promise<Order[]> {
    try {
      const orders = await this.exchange.fetchOpenOrders(symbol);

      return orders.map((order: any) => ({
        id: order.id,
        symbol: order.symbol,
        type: order.type as 'limit' | 'market',
        side: order.side as 'buy' | 'sell',
        price: order.price || 0,
        amount: order.amount || 0,
        status: order.status as 'open' | 'closed' | 'canceled',
        timestamp: new Date(order.timestamp),
        filled: order.filled || 0,
        remaining: order.remaining || 0,
      }));
    } catch (error) {
      console.error('Error fetching open orders:', error);
      return [];
    }
  }

  async getClosedOrders(symbol?: string, limit: number = 50): Promise<Order[]> {
    try {
      const orders = await this.exchange.fetchClosedOrders(symbol, undefined, limit);

      return orders.map((order: any) => ({
        id: order.id,
        symbol: order.symbol,
        type: order.type as 'limit' | 'market',
        side: order.side as 'buy' | 'sell',
        price: order.price || 0,
        amount: order.amount || 0,
        status: order.status as 'open' | 'closed' | 'canceled',
        timestamp: new Date(order.timestamp),
        filled: order.filled || 0,
        remaining: order.remaining || 0,
      }));
    } catch (error) {
      console.error('Error fetching closed orders:', error);
      return [];
    }
  }

  static getSupportedExchanges(): string[] {
    return [
      'binance',
      'bybit',
      'okx',
      'coinbase',
      'kraken',
      'gate',
      'huobi',
    ];
  }
}

export default ExchangeService;
