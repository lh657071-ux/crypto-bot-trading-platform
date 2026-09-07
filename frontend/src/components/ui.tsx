import React from 'react';

const statusColors: Record<string, string> = {
  active: 'text-buy border-buy/40 bg-buy/10',
  open: 'text-buy border-buy/40 bg-buy/10',
  paused: 'text-accent border-accent/40 bg-accent/10',
  pending: 'text-accent border-accent/40 bg-accent/10',
  stopped: 'text-muted border-border bg-surface',
  closed: 'text-muted border-border bg-surface',
  canceled: 'text-muted border-border bg-surface',
  error: 'text-sell border-sell/40 bg-sell/10',
};

export function StatusPill({ status }: { status: string }) {
  const cls = statusColors[status] || statusColors.stopped;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}

export function SideTag({ side }: { side: 'buy' | 'sell' | 'BUY' | 'SELL' | 'HOLD' }) {
  const s = side.toLowerCase();
  const cls =
    s === 'buy' ? 'text-buy bg-buy/10 border-buy/40' : s === 'sell' ? 'text-sell bg-sell/10 border-sell/40' : 'text-muted bg-surface border-border';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold uppercase ${cls}`}>{side}</span>;
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-surface border border-border rounded-lg ${className}`}>{children}</div>;
}
