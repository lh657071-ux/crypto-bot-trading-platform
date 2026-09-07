import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../lib/api';
import { TradingBot, Order, DetailedSignal } from '../types';
import { Card, StatusPill, SideTag } from '../components/ui';

export default function BotDetail() {
  const { id } = useParams<{ id: string }>();
  const [bot, setBot] = useState<TradingBot | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [signal, setSignal] = useState<DetailedSignal | null>(null);
  const [loading, setLoading] = useState(true);
  const [signalLoading, setSignalLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([api.get(`/bots/${id}`), api.get(`/orders/bot/${id}`)])
      .then(([botRes, ordersRes]) => {
        setBot(botRes.data.data);
        setOrders(ordersRes.data.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function fetchSignal() {
    if (!bot) return;
    setSignalLoading(true);
    try {
      const res = await api.post(`/signals/generate/binance/${encodeURIComponent(bot.symbol)}`, {
        timeframe: bot.timeframe,
      });
      setSignal(res.data.data);
    } catch {
      setSignal(null);
    } finally {
      setSignalLoading(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>;
  if (!bot) return <p className="text-sm text-sell">Bot not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/bots" className="text-xs text-muted hover:text-accent">
            ← Bots
          </Link>
          <h1 className="text-xl font-semibold mt-1 flex items-center gap-3">
            {bot.name}
            <StatusPill status={bot.status} />
          </h1>
          <p className="text-sm text-muted font-mono">{bot.symbol} · {bot.trading_mode.replaceAll('_', ' ')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric label="Initial capital" value={Number(bot.initial_capital).toFixed(2)} mono />
        <Metric label="Total trades" value={bot.total_trades} />
        <Metric label="Win rate" value={`${Number(bot.win_rate || 0).toFixed(1)}%`} />
        <Metric
          label="Total P&L"
          value={`${Number(bot.total_profit) >= 0 ? '+' : ''}${Number(bot.total_profit || 0).toFixed(2)}`}
          accent={Number(bot.total_profit) >= 0 ? 'buy' : 'sell'}
          mono
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Latest signal</h2>
            <button
              onClick={fetchSignal}
              disabled={signalLoading}
              className="text-xs border border-border rounded px-2 py-1 hover:text-accent transition-colors disabled:opacity-50"
            >
              {signalLoading ? 'Fetching…' : 'Refresh'}
            </button>
          </div>
          {!signal ? (
            <p className="text-sm text-muted py-6 text-center">No signal fetched yet.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <SideTag side={signal.signal} />
                <span className="text-sm text-muted">
                  strength {signal.strength.strength.toFixed(0)} · confidence {signal.strength.confidence.toFixed(0)}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm font-mono">
                <LevelBox label="Entry" value={signal.levels.entry} />
                <LevelBox label="Take profit" value={signal.levels.takeProfit} accent="buy" />
                <LevelBox label="Stop loss" value={signal.levels.stopLoss} accent="sell" />
              </div>
              {signal.strength.reasoning?.length > 0 && (
                <ul className="text-xs text-muted list-disc list-inside space-y-1">
                  {signal.strength.reasoning.slice(0, 4).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3">Configuration</h2>
          <dl className="text-sm space-y-2">
            <Row label="Timeframe" value={bot.timeframe} />
            <Row label="Leverage" value={`${bot.leverage}x`} />
            <Row label="Min signal strength" value={`${bot.min_signal_strength}`} />
            <Row label="Paper trading" value={bot.is_paper_trading ? 'Yes' : 'No'} />
          </dl>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold">Order history</h2>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-muted p-10 text-center">No orders placed by this bot yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted text-left border-b border-border">
                <th className="font-medium px-4 py-3">Side</th>
                <th className="font-medium px-4 py-3">Type</th>
                <th className="font-medium px-4 py-3 text-right">Price</th>
                <th className="font-medium px-4 py-3 text-right">Amount</th>
                <th className="font-medium px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3">
                    <SideTag side={order.order_side} />
                  </td>
                  <td className="px-4 py-3 text-muted">{order.order_type}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {order.price ? Number(order.price).toFixed(2) : 'market'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{Number(order.amount).toFixed(6)}</td>
                  <td className="px-4 py-3 text-right">
                    <StatusPill status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
  mono,
}: {
  label: string;
  value: string | number;
  accent?: 'buy' | 'sell';
  mono?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted mb-1.5">{label}</div>
      <div
        className={`text-xl font-semibold ${mono ? 'font-mono' : ''} ${
          accent === 'buy' ? 'text-buy' : accent === 'sell' ? 'text-sell' : 'text-text'
        }`}
      >
        {value}
      </div>
    </Card>
  );
}

function LevelBox({ label, value, accent }: { label: string; value: number; accent?: 'buy' | 'sell' }) {
  return (
    <div className="border border-border rounded-md p-2 text-center">
      <div className="text-[11px] text-muted mb-0.5">{label}</div>
      <div className={accent === 'buy' ? 'text-buy' : accent === 'sell' ? 'text-sell' : 'text-text'}>
        {value?.toFixed(2)}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  );
}
