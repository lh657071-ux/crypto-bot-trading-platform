import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Order } from '../types';
import { Card, StatusPill, SideTag } from '../components/ui';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders?limit=100')
      .then((res) => setOrders(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Orders</h1>
        <p className="text-sm text-muted">All orders placed across your bots.</p>
      </div>

      <Card>
        {loading ? (
          <p className="text-sm text-muted p-6">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted p-10 text-center">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted text-left border-b border-border">
                <th className="font-medium px-4 py-3">Symbol</th>
                <th className="font-medium px-4 py-3">Side</th>
                <th className="font-medium px-4 py-3">Type</th>
                <th className="font-medium px-4 py-3 text-right">Price</th>
                <th className="font-medium px-4 py-3 text-right">Amount</th>
                <th className="font-medium px-4 py-3 text-right">Filled</th>
                <th className="font-medium px-4 py-3 text-right">Status</th>
                <th className="font-medium px-4 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 font-mono">{order.symbol}</td>
                  <td className="px-4 py-3">
                    <SideTag side={order.order_side} />
                  </td>
                  <td className="px-4 py-3 text-muted">{order.order_type}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {order.price ? Number(order.price).toFixed(2) : 'market'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{Number(order.amount).toFixed(6)}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted">{Number(order.filled).toFixed(6)}</td>
                  <td className="px-4 py-3 text-right">
                    <StatusPill status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right text-muted text-xs">
                    {new Date(order.created_at).toLocaleString()}
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
