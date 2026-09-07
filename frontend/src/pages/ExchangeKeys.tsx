import React, { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../lib/api';
import { ExchangeApiKey } from '../types';
import { Card } from '../components/ui';

const EXCHANGES = ['binance', 'bybit', 'okx'];

export default function ExchangeKeys() {
  const [keys, setKeys] = useState<ExchangeApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [exchangeName, setExchangeName] = useState(EXCHANGES[0]);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function loadKeys() {
    setLoading(true);
    api
      .get('/exchange-keys')
      .then((res) => setKeys(res.data.data))
      .finally(() => setLoading(false));
  }

  useEffect(loadKeys, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/exchange-keys', { exchangeName, apiKey, apiSecret, passphrase: passphrase || undefined });
      setApiKey('');
      setApiSecret('');
      setPassphrase('');
      setShowForm(false);
      loadKeys();
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to save API key'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this API key? Bots using it will stop working.')) return;
    try {
      await api.delete(`/exchange-keys/${id}`);
      loadKeys();
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to delete API key'));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">API keys</h1>
          <p className="text-sm text-muted">Connect an exchange account so your bots can trade.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-accent text-base font-semibold rounded-md px-4 py-2 text-sm hover:opacity-90 transition-opacity"
        >
          Add API key
        </button>
      </div>

      {showForm && (
        <Card className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs text-muted mb-1.5">Exchange</label>
              <select
                value={exchangeName}
                onChange={(e) => setExchangeName(e.target.value)}
                className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {EXCHANGES.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex[0].toUpperCase() + ex.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">API key</label>
              <input
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">API secret</label>
              <input
                required
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            {exchangeName === 'okx' && (
              <div>
                <label className="block text-xs text-muted mb-1.5">Passphrase</label>
                <input
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            )}

            {error && <p className="text-sm text-sell">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 border border-border rounded-md py-2 text-sm text-muted hover:text-text transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-accent text-base font-semibold rounded-md py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? 'Saving…' : 'Save key'}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {loading ? (
          <p className="text-sm text-muted p-6">Loading…</p>
        ) : keys.length === 0 ? (
          <p className="text-sm text-muted p-10 text-center">
            No exchange keys saved. Add one to let your bots place real or paper trades.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted text-left border-b border-border">
                <th className="font-medium px-4 py-3">Exchange</th>
                <th className="font-medium px-4 py-3">API key</th>
                <th className="font-medium px-4 py-3">Status</th>
                <th className="font-medium px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 capitalize">{key.exchange_name}</td>
                  <td className="px-4 py-3 font-mono text-muted">
                    {key.api_key.slice(0, 4)}••••••••{key.api_key.slice(-4)}
                  </td>
                  <td className="px-4 py-3 text-muted">{key.test_status || 'not tested'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(key.id)}
                      className="text-xs border border-border rounded px-2 py-1 text-muted hover:text-sell transition-colors"
                    >
                      Remove
                    </button>
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
