import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { apiErrorMessage } from '../lib/api';
import { TradingBot } from '../types';
import { Card, StatusPill } from '../components/ui';
import CreateBotModal from '../components/CreateBotModal';

export default function Bots() {
  const [bots, setBots] = useState<TradingBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');

  function loadBots() {
    setLoading(true);
    api
      .get('/bots')
      .then((res) => setBots(res.data.data))
      .finally(() => setLoading(false));
  }

  useEffect(loadBots, []);

  async function toggleStatus(bot: TradingBot) {
    const nextStatus = bot.status === 'active' ? 'paused' : 'active';
    setError('');
    try {
      await api.patch(`/bots/${bot.id}/status`, { status: nextStatus });
      loadBots();
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to update bot status'));
    }
  }

  async function deleteBot(bot: TradingBot) {
    if (!confirm(`Delete "${bot.name}"? This cannot be undone.`)) return;
    setError('');
    try {
      await api.delete(`/bots/${bot.id}`);
      loadBots();
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to delete bot'));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Trading bots</h1>
          <p className="text-sm text-muted">Create and manage your automated strategies.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-accent text-base font-semibold rounded-md px-4 py-2 text-sm hover:opacity-90 transition-opacity"
        >
          Create bot
        </button>
      </div>

      {error && <p className="text-sm text-sell">{error}</p>}

      <Card>
        {loading ? (
          <p className="text-sm text-muted p-6">Loading…</p>
        ) : bots.length === 0 ? (
          <p className="text-sm text-muted p-10 text-center">
            No bots yet. Click "Create bot" to set up your first strategy.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted text-left border-b border-border">
                <th className="font-medium px-4 py-3">Bot</th>
                <th className="font-medium px-4 py-3">Symbol</th>
                <th className="font-medium px-4 py-3">Mode</th>
                <th className="font-medium px-4 py-3">Status</th>
                <th className="font-medium px-4 py-3 text-right">Win rate</th>
                <th className="font-medium px-4 py-3 text-right">P&amp;L</th>
                <th className="font-medium px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bots.map((bot) => (
                <tr key={bot.id} className="border-b border-border last:border-b-0 hover:bg-surface-raised/50">
                  <td className="px-4 py-3">
                    <Link to={`/bots/${bot.id}`} className="font-medium hover:text-accent">
                      {bot.name}
                    </Link>
                    {bot.is_paper_trading && (
                      <span className="ml-2 text-xs text-muted border border-border rounded px-1.5 py-0.5">paper</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-muted">{bot.symbol}</td>
                  <td className="px-4 py-3 text-muted">{bot.trading_mode.replaceAll('_', ' ')}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={bot.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{Number(bot.win_rate || 0).toFixed(1)}%</td>
                  <td
                    className={`px-4 py-3 text-right font-mono ${
                      Number(bot.total_profit) >= 0 ? 'text-buy' : 'text-sell'
                    }`}
                  >
                    {Number(bot.total_profit || 0) >= 0 ? '+' : ''}
                    {Number(bot.total_profit || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {bot.status !== 'stopped' && bot.status !== 'error' && (
                        <button
                          onClick={() => toggleStatus(bot)}
                          className="text-xs border border-border rounded px-2 py-1 hover:text-accent transition-colors"
                        >
                          {bot.status === 'active' ? 'Pause' : 'Resume'}
                        </button>
                      )}
                      <button
                        onClick={() => deleteBot(bot)}
                        className="text-xs border border-border rounded px-2 py-1 text-muted hover:text-sell transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {showCreate && (
        <CreateBotModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            loadBots();
          }}
        />
      )}
    </div>
  );
}
