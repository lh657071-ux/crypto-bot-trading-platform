import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(email, username, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-base text-text flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="font-semibold text-lg tracking-tight">CryptoBot</span>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <h1 className="text-lg font-semibold mb-1">Create your account</h1>
          <p className="text-sm text-muted mb-6">Start automating your trading strategy.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-muted mb-1.5">Username</label>
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="trader01"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="At least 8 characters"
              />
            </div>

            {error && <p className="text-sm text-sell">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-accent text-base font-semibold rounded-md py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
