import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { TradingBot, Order } from '../types';
import { Card, StatusPill, SideTag } from '../components/ui';

export default function Dashboard() {
  const [bots, setBots] = useState<TradingBot[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/bots'), api.get('/orders?limit=8')])
      .then(([botsRes, ordersRes]) => {
        setBots(botsRes.data.data);
        setOrders(ordersRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeBots = bots.filter((b) => b.status === 'active').length;
  const totalProfit = bots.reduce((sum, b) => sum + Number(b.total_profit || 0), 0);
  const totalTrades = bots.reduce((sum, b) => sum + Number(b.total_trades || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted">Overview of your bots and recent activity.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Trading bots" value={bots.length} />
        <StatCard label="Active now" value={activeBots} accent="buy" />
        <StatCard
          label="Total P&L"
          value={`${totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}`}
          accent={totalProfit >= 0 ? 'buy' : 'sell'}
          mono
        />
        <StatCard label="Total trades" value={totalTrades} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Your bots</h2>
            <Link to="/bots" className="text-xs text-accent hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : bots.length === 0 ? (
            <EmptyState message="No bots yet. Create your first bot to start trading." />
          ) : (
            <div className="space-y-2">
              {bots.slice(0, 5).map((bot) => (
                <Link
                  key={bot.id}
                  to={`/bots/${bot.id}`}
                  className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-surface-raised transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium">{bot.name}</div>
                    <div className="text-xs text-muted font-mono">{bot.symbol}</div>
                  </div>
                  <StatusPill status={bot.status} />
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Recent orders</h2>
            <Link to="/orders" className="text-xs text-accent hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : orders.length === 0 ? (
            <EmptyState message="No orders yet. Orders placed by your bots will show up here." />
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-border first:border-t-0">
                    <td className="py-2 font-mono">{order.symbol}</td>
                    <td className="py-2">
                      <SideTag side={order.order_side} />
                    </td>
                    <td className="py-2 text-right font-mono text-muted">
                      {order.price ? Number(order.price).toFixed(2) : 'market'}
                    </td>
                    <td className="py-2 text-right">
                      <StatusPill status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({
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
        className={`text-2xl font-semibold ${mono ? 'font-mono' : ''} ${
          accent === 'buy' ? 'text-buy' : accent === 'sell' ? 'text-sell' : 'text-text'
        }`}
      >
        {value}
      </div>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-muted py-6 text-center">{message}</p>;
}
