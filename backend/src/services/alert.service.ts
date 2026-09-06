import { DetailedSignal } from './signal.service';

export interface PriceAlert {
  id: string;
  symbol: string;
  type: 'ENTRY' | 'EXIT' | 'TAKE_PROFIT' | 'STOP_LOSS';
  triggerPrice: number;
  currentPrice: number;
  isTriggered: boolean;
  triggeredAt?: Date;
  createdAt: Date;
}

export class AlertService {
  private alerts: Map<string, PriceAlert[]> = new Map();
  private checkInterval: NodeJS.Timer | null = null;

  /**
   * Create alerts for a trading signal
   */
  createAlertsFromSignal(signal: DetailedSignal): PriceAlert[] {
    const alerts: PriceAlert[] = [];

    // Entry alert
    alerts.push({
      id: `${signal.symbol}_entry_${Date.now()}`,
      symbol: signal.symbol,
      type: 'ENTRY',
      triggerPrice: signal.levels.entry,
      currentPrice: signal.price,
      isTriggered: false,
      createdAt: new Date(),
    });

    // Take Profit alert
    alerts.push({
      id: `${signal.symbol}_tp_${Date.now()}`,
      symbol: signal.symbol,
      type: 'TAKE_PROFIT',
      triggerPrice: signal.levels.takeProfit,
      currentPrice: signal.price,
      isTriggered: false,
      createdAt: new Date(),
    });

    // Stop Loss alert
    alerts.push({
      id: `${signal.symbol}_sl_${Date.now()}`,
      symbol: signal.symbol,
      type: 'STOP_LOSS',
      triggerPrice: signal.levels.stopLoss,
      currentPrice: signal.price,
      isTriggered: false,
      createdAt: new Date(),
    });

    // Store alerts
    const key = signal.symbol;
    if (!this.alerts.has(key)) {
      this.alerts.set(key, []);
    }
    this.alerts.get(key)!.push(...alerts);

    return alerts;
  }

  /**
   * Check if price alerts are triggered
   */
  checkAlerts(symbol: string, currentPrice: number): PriceAlert[] {
    const symbolAlerts = this.alerts.get(symbol) || [];
    const triggeredAlerts: PriceAlert[] = [];

    for (const alert of symbolAlerts) {
      if (!alert.isTriggered) {
        // Check trigger conditions
        const isTriggered = this.isPriceAlertTriggered(alert, currentPrice);

        if (isTriggered) {
          alert.isTriggered = true;
          alert.triggeredAt = new Date();
          alert.currentPrice = currentPrice;
          triggeredAlerts.push(alert);
        }
      }
    }

    return triggeredAlerts;
  }

  /**
   * Check if alert is triggered based on price
   */
  private isPriceAlertTriggered(alert: PriceAlert, currentPrice: number): boolean {
    switch (alert.type) {
      case 'ENTRY':
        // Entry alert: price must reach trigger price
        return currentPrice >= alert.triggerPrice * 0.995 && // 0.5% tolerance
               currentPrice <= alert.triggerPrice * 1.005;
      case 'TAKE_PROFIT':
        // TP alert: price must exceed trigger price
        return currentPrice >= alert.triggerPrice;
      case 'STOP_LOSS':
        // SL alert: price must fall below trigger price
        return currentPrice <= alert.triggerPrice;
      case 'EXIT':
        // Exit alert: price reaches target
        return currentPrice >= alert.triggerPrice * 0.99;
      default:
        return false;
    }
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(symbol?: string): PriceAlert[] {
    if (symbol) {
      return (this.alerts.get(symbol) || []).filter(a => !a.isTriggered);
    }

    const allAlerts: PriceAlert[] = [];
    for (const alerts of this.alerts.values()) {
      allAlerts.push(...alerts.filter(a => !a.isTriggered));
    }
    return allAlerts;
  }

  /**
   * Get all triggered alerts
   */
  getTriggeredAlerts(symbol?: string): PriceAlert[] {
    if (symbol) {
      return (this.alerts.get(symbol) || []).filter(a => a.isTriggered);
    }

    const allAlerts: PriceAlert[] = [];
    for (const alerts of this.alerts.values()) {
      allAlerts.push(...alerts.filter(a => a.isTriggered));
    }
    return allAlerts;
  }

  /**
   * Clear triggered alerts (keep active ones)
   */
  clearTriggeredAlerts(symbol?: string): number {
    let count = 0;

    if (symbol) {
      const alerts = this.alerts.get(symbol) || [];
      const filtered = alerts.filter(a => {
        if (a.isTriggered) {
          count++;
          return false;
        }
        return true;
      });
      this.alerts.set(symbol, filtered);
    } else {
      for (const [key, alerts] of this.alerts.entries()) {
        const filtered = alerts.filter(a => {
          if (a.isTriggered) {
            count++;
            return false;
          }
          return true;
        });
        this.alerts.set(key, filtered);
      }
    }

    return count;
  }

  /**
   * Clear all alerts for a symbol
   */
  clearAllAlerts(symbol?: string): number {
    if (symbol) {
      const count = (this.alerts.get(symbol) || []).length;
      this.alerts.delete(symbol);
      return count;
    }

    let total = 0;
    for (const alerts of this.alerts.values()) {
      total += alerts.length;
    }
    this.alerts.clear();
    return total;
  }

  /**
   * Get alert statistics
   */
  getAlertStats(): {
    total: number;
    active: number;
    triggered: number;
    bySymbol: Record<string, { total: number; active: number; triggered: number }>;
  } {
    let total = 0;
    let active = 0;
    let triggered = 0;
    const bySymbol: Record<string, { total: number; active: number; triggered: number }> = {};

    for (const [symbol, alerts] of this.alerts.entries()) {
      const symbolActive = alerts.filter(a => !a.isTriggered).length;
      const symbolTriggered = alerts.filter(a => a.isTriggered).length;

      total += alerts.length;
      active += symbolActive;
      triggered += symbolTriggered;

      bySymbol[symbol] = {
        total: alerts.length,
        active: symbolActive,
        triggered: symbolTriggered,
      };
    }

    return { total, active, triggered, bySymbol };
  }
}

export default new AlertService();
