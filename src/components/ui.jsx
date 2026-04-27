export function Card({ children, style = {}, accent }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${accent ? `rgba(${accent},0.25)` : 'var(--border)'}`,
      borderRadius: 12,
      padding: '20px 24px',
      ...style
    }}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{
        fontSize: 18, fontWeight: 700, color: '#e8f0fe',
        letterSpacing: 0.3,
      }}>{children}</h2>
      {sub && <p style={{ fontSize: 12, color: '#4a6080', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{sub}</p>}
    </div>
  );
}

export function KpiCard({ label, value, sub, color = '#3b82f6', trend, prefix = '' }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '20px 22px',
      borderLeft: `3px solid ${color}`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 80, height: 80,
        background: `radial-gradient(circle at 80% 0%, ${color}18, transparent 70%)`,
        pointerEvents: 'none'
      }} />
      <div style={{ fontSize: 11, color: '#4a6080', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color, letterSpacing: -0.5, fontFamily: 'var(--font-display)' }}>
        {prefix}{value}
      </div>
      {sub && <div style={{ fontSize: 11, color: '#4a6080', marginTop: 4 }}>{sub}</div>}
      {trend && (
        <div style={{ fontSize: 11, color: trend > 0 ? '#f43f5e' : '#10b981', marginTop: 4 }}>
          {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

export function Badge({ children, color = '#3b82f6' }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 600,
      fontFamily: 'var(--font-mono)',
      background: `${color}22`,
      color: color,
      border: `1px solid ${color}44`,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    }}>{children}</span>
  );
}

export function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: '8px 16px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          fontWeight: active === t.id ? 600 : 400,
          color: active === t.id ? '#93c5fd' : '#4a6080',
          borderBottom: active === t.id ? '2px solid #3b82f6' : '2px solid transparent',
          marginBottom: -1,
          transition: 'all 0.15s',
        }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export const COLORS = {
  collision: '#3b82f6',
  cargo: '#06b6d4',
  damage: '#f59e0b',
  pollution: '#f43f5e',
  injury: '#8b5cf6',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  teal: '#14b8a6',
  amber: '#f59e0b',
  rose: '#f43f5e',
  violet: '#8b5cf6',
  emerald: '#10b981',
};

export const TYPE_COLOR = {
  'Collision Liability': '#3b82f6',
  'Cargo Liability': '#06b6d4',
  'Damage to Other Vessels': '#f59e0b',
  'Environmental Pollution': '#f43f5e',
  'Injury to Third Parties': '#8b5cf6',
};

export const CAUSE_COLOR = {
  'Human Error': '#f59e0b',
  'Technical Failure': '#3b82f6',
  'Criminal Activity': '#f43f5e',
  'Natural Disaster': '#10b981',
};

export const STATUS_COLOR = {
  'Closed': '#10b981',
  'Open': '#f59e0b',
  'In Litigation': '#f43f5e',
};

export const LOC_COLOR = {
  'Indian Ocean': '#3b82f6',
  'Atlantic Ocean': '#06b6d4',
  'Pacific Ocean': '#14b8a6',
  'Mediterranean Sea': '#f59e0b',
  'North Sea': '#8b5cf6',
};

export function fmt(n, decimals = 0) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function fmtUSD(n) {
  if (n == null) return '—';
  if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (Math.abs(n) >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K';
  return '$' + n.toFixed(0);
}

export function fmtPct(n) {
  return (n * 100).toFixed(1) + '%';
}
