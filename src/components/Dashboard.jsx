import { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { CLAIMS_DATA, PRICING_DATA } from '../data.js';
import { KpiCard, Card, SectionTitle, TYPE_COLOR, CAUSE_COLOR, fmtUSD, fmt, fmtPct, LOC_COLOR } from './ui.jsx';

export default function Dashboard() {
  const stats = useMemo(() => {
    const valid = CLAIMS_DATA;
    const totalIncurred = valid.reduce((s, c) => s + (c.incurred || 0), 0);
    const totalCapped = valid.filter(c => c.attritionalFlag === 1).reduce((s, c) => s + (c.cappedNetAdj || 0), 0);
    const closed = valid.filter(c => c.status === 'Closed').length;
    const open = valid.filter(c => c.status === 'Open').length;
    const litigation = valid.filter(c => c.status === 'In Litigation').length;
    const avgSeverity = totalIncurred / valid.length;

    // By year
    const byYear = {};
    valid.forEach(c => {
      if (!c.year) return;
      if (!byYear[c.year]) byYear[c.year] = { year: c.year, count: 0, total: 0, cappedTotal: 0 };
      byYear[c.year].count++;
      byYear[c.year].total += c.incurred || 0;
      if (c.attritionalFlag === 1) byYear[c.year].cappedTotal += c.cappedNetAdj || 0;
    });

    // By type
    const byType = {};
    valid.forEach(c => {
      if (!byType[c.type]) byType[c.type] = { type: c.type, count: 0, total: 0 };
      byType[c.type].count++;
      byType[c.type].total += c.incurred || 0;
    });

    // By cause
    const byCause = {};
    valid.forEach(c => {
      if (!c.cause) return;
      if (!byCause[c.cause]) byCause[c.cause] = { cause: c.cause, count: 0, total: 0 };
      byCause[c.cause].count++;
      byCause[c.cause].total += c.incurred || 0;
    });

    // By location
    const byLoc = {};
    valid.forEach(c => {
      if (!c.location) return;
      if (!byLoc[c.location]) byLoc[c.location] = { location: c.location, count: 0, total: 0 };
      byLoc[c.location].count++;
      byLoc[c.location].total += c.incurred || 0;
    });

    return {
      total: valid.length, totalIncurred, totalCapped, closed, open, litigation, avgSeverity,
      byYear: Object.values(byYear).sort((a, b) => a.year - b.year),
      byType: Object.values(byType).sort((a, b) => b.total - a.total),
      byCause: Object.values(byCause).sort((a, b) => b.total - a.total),
      byLoc: Object.values(byLoc).sort((a, b) => b.total - a.total),
    };
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <div style={{ color: '#93c5fd', fontWeight: 600, marginBottom: 6 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, marginBottom: 2 }}>
            {p.name}: {typeof p.value === 'number' && p.value > 10000 ? fmtUSD(p.value) : fmt(p.value)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#e8f0fe', marginBottom: 6 }}>
          Marine Liability Portfolio Overview
        </h1>
        <p style={{ color: '#4a6080', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
          Oceanic Shipping Co. · Analysis Period 2018–2023 · 100 Claims · Experience-Based Rating
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 24 }}>
        <KpiCard label="Total Claims" value={fmt(stats.total)} color="#3b82f6" sub="2018–2023" />
        <KpiCard label="Total Incurred" value={fmtUSD(stats.totalIncurred)} color="#06b6d4" sub="Gross incurred losses" />
        <KpiCard label="Avg Severity" value={fmtUSD(stats.avgSeverity)} color="#f59e0b" sub="Per claim" />
        <KpiCard label="Closed Claims" value={fmt(stats.closed)} color="#10b981" sub={fmtPct(stats.closed / stats.total)} />
        <KpiCard label="In Litigation" value={fmt(stats.litigation)} color="#f43f5e" sub="Adverse dev. risk" />
        <KpiCard label="Final Premium" value="$13.0M" color="#8b5cf6" sub="2024 Pricing Year" />
      </div>

      {/* Row 2: Claims by Year + Type breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <Card>
          <SectionTitle sub="Attritional claims frequency and aggregate incurred">Claims Volume & Total Incurred by Year</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.byYear} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,200,0.08)" />
              <XAxis dataKey="year" tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmtUSD(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#4a6080' }} />
              <Bar yAxisId="left" dataKey="count" name="# Claims" fill="#3b82f6" radius={[3,3,0,0]} opacity={0.85} />
              <Bar yAxisId="right" dataKey="total" name="Total Incurred" fill="#06b6d4" radius={[3,3,0,0]} opacity={0.75} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle sub="Claim count distribution by loss type">Claims by Type</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.byType} dataKey="count" nameKey="type" cx="45%" cy="50%" outerRadius={85} innerRadius={45}
                label={({ type, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}>
                {stats.byType.map((entry, i) => (
                  <Cell key={i} fill={TYPE_COLOR[entry.type] || '#3b82f6'} opacity={0.9} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n, p) => [fmt(v), p.payload.type]} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 8, fontSize: 12 }} />
              <Legend
                formatter={(v, e) => <span style={{ fontSize: 11, color: '#8fafd8' }}>{e.payload.type}</span>}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Row 3: Severity trend + Cause + Location */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 18, marginBottom: 18 }}>
        <Card>
          <SectionTitle sub="Inflation-adjusted average severity trend">Avg Severity Trend (Capped Net Adj)</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={PRICING_DATA.severityByYear}>
              <defs>
                <linearGradient id="sevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,200,0.08)" />
              <XAxis dataKey="year" tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmtUSD(v)} />
              <Tooltip content={<CustomTooltip />} formatter={(v) => fmtUSD(v)} />
              <Area type="monotone" dataKey="avgSeverity" name="Avg Severity" stroke="#f59e0b" strokeWidth={2} fill="url(#sevGrad)" dot={{ fill: '#f59e0b', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle sub="Claims by root cause">Cause of Loss</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {stats.byCause.map(c => (
              <div key={c.cause}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#8fafd8' }}>{c.cause}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: CAUSE_COLOR[c.cause] || '#3b82f6' }}>{c.count}</span>
                </div>
                <div style={{ background: 'var(--bg-surface)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(c.count / stats.total) * 100}%`, background: CAUSE_COLOR[c.cause] || '#3b82f6', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle sub="Geographic risk spread">By Location</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {stats.byLoc.map(c => (
              <div key={c.location}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#8fafd8' }}>{c.location}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: LOC_COLOR[c.location] || '#3b82f6' }}>{fmtUSD(c.total)}</span>
                </div>
                <div style={{ background: 'var(--bg-surface)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(c.total / stats.totalIncurred) * 100}%`, background: LOC_COLOR[c.location] || '#3b82f6', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Pricing Summary Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(6,182,212,0.05))',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 12, padding: '20px 28px',
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20
      }}>
        {[
          { label: 'Pure Premium', value: '$8.84M', color: '#3b82f6' },
          { label: 'Large Loss Loading', value: '$263K', color: '#f43f5e', sub: '1-in-20yr return' },
          { label: 'Total Risk Premium', value: '$9.10M', color: '#06b6d4' },
          { label: 'Final Premium (Base)', value: '$13.02M', color: '#10b981', bold: true },
          { label: 'Sensitivity +6% Sev', value: '$13.78M', color: '#f59e0b', sub: '+5.83% uplift' },
        ].map(item => (
          <div key={item.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#4a6080', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontFamily: 'var(--font-mono)' }}>{item.label}</div>
            <div style={{ fontSize: item.bold ? 22 : 18, fontWeight: 700, color: item.color, fontFamily: 'var(--font-display)' }}>{item.value}</div>
            {item.sub && <div style={{ fontSize: 10, color: '#4a6080', marginTop: 3 }}>{item.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
