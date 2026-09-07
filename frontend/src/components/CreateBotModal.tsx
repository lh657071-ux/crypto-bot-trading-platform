import React, { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../lib/api';
import { ExchangeApiKey, TRADING_MODES } from '../types';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateBotModal({ onClose, onCreated }: Props) {
  const [keys, setKeys] = useState<ExchangeApiKey[]>([]);
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [tradingMode, setTradingMode] = useState(TRADING_MODES[0]);
  const [exchangeApiKeyId, setExchangeApiKeyId] = useState('');
  const [initialCapital, setInitialCapital] = useState('1000');
  const [isPaperTrading, setIsPaperTrading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/exchange-keys').then((res) => {
      setKeys(res.data.data);
      if (res.data.data[0]) setExchangeApiKeyId(res.data.data[0].id);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!exchangeApiKeyId) {
      setError('Add an exchange API key first.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/bots', {
        name,
        symbol,
        tradingMode,
        exchangeApiKeyId,
        initialCapital: Number(initialCapital),
        isPaperTrading,
      });
      onCreated();
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to create bot'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-surface border border-border rounded-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">Create trading bot</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1.5">Bot name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="BTC Grid Bot"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1.5">Symbol</label>
              <input
                required
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="BTC/USDT"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Initial capital</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={initialCapital}
                onChange={(e) => setInitialCapital(e.target.value)}
                className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1.5">Trading mode</label>
            <select
              value={tradingMode}
              onChange={(e) => setTradingMode(e.target.value as any)}
              className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {TRADING_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1.5">Exchange API key</label>
            {keys.length === 0 ? (
              <p className="text-xs text-sell">No API keys saved yet — add one under API Keys first.</p>
            ) : (
              <select
                value={exchangeApiKeyId}
                onChange={(e) => setExchangeApiKeyId(e.target.value)}
                className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {keys.map((key) => (
                  <option key={key.id} value={key.id}>
                    {key.exchange_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={isPaperTrading}
              onChange={(e) => setIsPaperTrading(e.target.checked)}
              className="accent-accent"
            />
            Paper trading (simulated, no real funds)
          </label>

          {error && <p className="text-sm text-sell">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border rounded-md py-2 text-sm text-muted hover:text-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || keys.length === 0}
              className="flex-1 bg-accent text-base font-semibold rounded-md py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create bot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
