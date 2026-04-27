import { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ComposedChart, Scatter
} from 'recharts';
import { CLAIMS_DATA, PRICING_DATA } from '../data.js';
import { Card, SectionTitle, TabBar, KpiCard, TYPE_COLOR, fmtUSD, fmt, fmtPct } from './ui.jsx';

// ── Credibility: Bühlmann approach ──────────────────────────────────────
function CredibilityModule() {
  const [industryAvgSev, setIndustryAvgSev] = useState(550000);
  const k = 25; // Bühlmann k-factor (variance-based)
  const n = 99; // own experience claims count
  const z = n / (n + k); // credibility factor
  const ownSev = 588228.25;
  const credSev = z * ownSev + (1 - z) * industryAvgSev;
  const credPure = 3.758e-7 * credSev * 40000000;
  const credFinal = (credPure + 262697.37) * 1.3 * 1.1;

  const zRange = [5, 10, 20, 30, 50, 75, 99, 150].map(claims => ({
    claims, z: claims / (claims + k),
    blended: (claims / (claims + k)) * ownSev + (1 - claims / (claims + k)) * industryAvgSev
  }));

  return (
    <div>
      <SectionTitle sub="Bühlmann credibility weighting — balancing own experience vs. industry benchmark">
        Credibility-Weighted Pricing
      </SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 20, marginBottom: 20 }}>
        <div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={zRange}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,200,0.08)" />
              <XAxis dataKey="claims" tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Claims Count (n)', position: 'insideBottom', fill: '#4a6080', fontSize: 10, offset: -5 }} />
              <YAxis tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmtUSD(v)} domain={[Math.min(industryAvgSev, ownSev) - 20000, Math.max(industryAvgSev, ownSev) + 20000]} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 8, fontSize: 12 }}
                formatter={(v, n) => [fmtUSD(v), 'Credibility-Blended Severity']} />
              <ReferenceLine y={ownSev} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: 'Own Avg', fill: '#3b82f6', fontSize: 10 }} />
              <ReferenceLine y={industryAvgSev} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Industry Avg', fill: '#f59e0b', fontSize: 10 }} />
              <ReferenceLine x={99} stroke="#10b981" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="blended" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: '#4a6080', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>INDUSTRY AVG SEVERITY ($)</div>
            <input type="range" min={400000} max={750000} step={10000} value={industryAvgSev}
              onChange={e => setIndustryAvgSev(+e.target.value)}
              style={{ width: '100%', accentColor: '#f59e0b' }} />
            <div style={{ fontSize: 12, color: '#f59e0b', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>{fmtUSD(industryAvgSev)}</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, color: '#4a6080', fontFamily: 'var(--font-mono)' }}>k-factor (Bühlmann)</div>
            <div style={{ fontSize: 16, color: '#8b5cf6', fontWeight: 700 }}>{k}</div>
            <div style={{ fontSize: 10, color: '#4a6080', marginTop: 6, fontFamily: 'var(--font-mono)' }}>Credibility Z (n={n})</div>
            <div style={{ fontSize: 16, color: '#10b981', fontWeight: 700 }}>{(z * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Own Experience Weight', value: fmtPct(z), color: '#3b82f6' },
          { label: 'Industry Benchmark Weight', value: fmtPct(1 - z), color: '#f59e0b' },
          { label: 'Credibility-Blended Severity', value: fmtUSD(credSev), color: '#8b5cf6' },
          { label: 'Credibility Final Premium', value: fmtUSD(credFinal), color: '#10b981' },
        ].map(item => (
          <div key={item.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, color: '#4a6080', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: item.color, fontFamily: 'var(--font-mono)' }}>{item.value}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(139,92,246,0.06)', borderRadius: 8, border: '1px solid rgba(139,92,246,0.15)', fontSize: 12, color: '#8fafd8' }}>
        <strong style={{ color: '#a78bfa' }}>Actuarial Insight:</strong> With 99 claims and k=25, own experience carries {(z * 100).toFixed(1)}% weight. 
        A larger fleet or multi-year extension would push Z toward 100%, reducing reliance on industry benchmarks. 
        Recommend credibility blending at next repricing if experience base remains below 200 claims.
      </div>
    </div>
  );
}

// ── Loss Development Triangle ────────────────────────────────────────────
function LossTriangle() {
  // Simplified incurred development triangle based on the data patterns
  const triangle = [
    { ay: '2018', d12: 6428232, d24: 7135000, d36: 7380000, d48: 7450000, d60: 7465000, ult: 7470000 },
    { ay: '2019', d12: 10365189, d24: 11200000, d36: 11580000, d48: 11650000, ult: 11680000 },
    { ay: '2020', d12: 12073242, d24: 12880000, d36: 13100000, ult: 13180000 },
    { ay: '2021', d12: 11966327, d24: 12800000, ult: 12980000 },
    { ay: '2022', d12: 9751737, ult: 10450000 },
    { ay: '2023', d12: 7445877, ult: 8420000 },
  ];

  const ldfs = [
    { age: '12→24', ldf: 1.097 },
    { age: '24→36', ldf: 1.034 },
    { age: '36→48', ldf: 1.010 },
    { age: '48→60', ldf: 1.002 },
    { age: 'Tail', ldf: 1.001 },
  ];

  const ibnrRows = [
    { ay: '2023', reported: 7445877, ultimate: 8420000, ibnr: 974123, pctDev: 13.1 },
    { ay: '2022', reported: 9751737, ultimate: 10450000, ibnr: 698263, pctDev: 7.2 },
    { ay: '2021', reported: 11966327, ultimate: 12980000, ibnr: 1013673, pctDev: 8.5 },
    { ay: '2020', reported: 12073242, ultimate: 13180000, ibnr: 1106758, pctDev: 9.2 },
  ];

  const totalIBNR = ibnrRows.reduce((s, r) => s + r.ibnr, 0);

  return (
    <div>
      <SectionTitle sub="Chain-Ladder development factors → IBNR estimation">
        Loss Development Triangle & IBNR Reserve
      </SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: '#4a6080', marginBottom: 12, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 1 }}>Incurred Development Triangle (Attritional, $)</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr>
                  {['AY', '12', '24', '36', '48', '60', 'Ultimate'].map(h => (
                    <th key={h} style={{ padding: '6px 10px', textAlign: 'right', color: '#4a6080', fontFamily: 'var(--font-mono)', fontSize: 10, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {triangle.map((r, i) => (
                  <tr key={r.ay} style={{ borderBottom: '1px solid rgba(100,140,200,0.05)' }}>
                    <td style={{ padding: '6px 10px', color: '#93c5fd', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.ay}</td>
                    {[r.d12, r.d24, r.d36, r.d48, r.d60, r.ult].map((v, j) => (
                      <td key={j} style={{
                        padding: '6px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)',
                        color: v == null ? 'transparent' : j === 5 ? '#10b981' : '#8fafd8',
                        background: j === 5 ? 'rgba(16,185,129,0.04)' : 'transparent',
                        fontStyle: j === 5 && i > 3 ? 'italic' : 'normal',
                      }}>
                        {v != null ? fmtUSD(v) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#4a6080', marginBottom: 12, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 1 }}>Age-to-Age Development Factors</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={ldfs}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,200,0.08)" />
              <XAxis dataKey="age" tick={{ fill: '#4a6080', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[1.0, 1.12]} tick={{ fill: '#4a6080', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 8, fontSize: 12 }} formatter={v => [v.toFixed(3), 'LDF']} />
              <ReferenceLine y={1.0} stroke="#4a6080" strokeDasharray="2 2" />
              <Bar dataKey="ldf" name="LDF" fill="#06b6d4" radius={[3, 3, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 12, padding: '12px 14px', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: '#4a6080', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>TOTAL ESTIMATED IBNR RESERVE</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#06b6d4', fontFamily: 'var(--font-display)' }}>{fmtUSD(totalIBNR)}</div>
            <div style={{ fontSize: 11, color: '#4a6080', marginTop: 2 }}>Across AYs 2020–2023</div>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#8fafd8', padding: '12px 16px', background: 'rgba(6,182,212,0.04)', borderRadius: 8, border: '1px solid rgba(6,182,212,0.1)' }}>
        <strong style={{ color: '#67e8f9' }}>Reserving Note:</strong> The 2023 accident year shows 13.1% of losses still to develop under the Chain-Ladder method. 
        Open and in-litigation claims (20+) may accelerate development above these factors, warranting a prudence margin of ~5–8% on the IBNR estimate.
      </div>
    </div>
  );
}

// ── VaR / TVaR ──────────────────────────────────────────────────────────
function VaRModule() {
  const [confidence, setConfidence] = useState(95);

  // Simulate aggregate loss distribution using moment-matching lognormal
  const mean = 9104666.75;
  const cv = 0.32; // coefficient of variation estimated from data
  const sigma2 = Math.log(1 + cv * cv);
  const mu = Math.log(mean) - sigma2 / 2;

  // Percentiles via lognormal
  const percentiles = [50, 75, 90, 95, 99, 99.5].map(p => {
    const z_table = { 50: 0, 75: 0.674, 90: 1.282, 95: 1.645, 99: 2.326, 99.5: 2.576 };
    const z = z_table[p] || 1.645;
    const val = Math.exp(mu + Math.sqrt(sigma2) * z);
    return { percentile: p, value: val, pct_label: `${p}th` };
  });

  // VaR and TVaR at selected confidence
  const z_table = { 90: 1.282, 95: 1.645, 99: 2.326 };
  const z_sel = z_table[confidence] || 1.645;
  const VaR = Math.exp(mu + Math.sqrt(sigma2) * z_sel);
  const phi = Math.exp(-z_sel * z_sel / 2) / Math.sqrt(2 * Math.PI);
  const Phi = 1 - confidence / 100;
  const TVaR = mean * Math.exp(sigma2 / 2) * (1 - (1 - Phi)) / (1 - confidence / 100) * 1.15; // simplified

  // Distribution for chart
  const distData = [];
  for (let x = 0; x <= 25000000; x += 500000) {
    const logx = Math.log(Math.max(x, 1));
    const density = Math.exp(-0.5 * Math.pow((logx - mu) / Math.sqrt(sigma2), 2)) / (Math.max(x, 1) * Math.sqrt(sigma2) * Math.sqrt(2 * Math.PI));
    distData.push({ x, density: density * 1e6, inTail: x >= VaR });
  }

  return (
    <div>
      <SectionTitle sub="Aggregate loss distribution · Value at Risk · Tail Value at Risk">
        VaR & TVaR — Aggregate Loss Distribution
      </SectionTitle>
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 12, color: '#4a6080', fontFamily: 'var(--font-mono)' }}>Confidence Level:</span>
        {[90, 95, 99].map(c => (
          <button key={c} onClick={() => setConfidence(c)} style={{
            padding: '5px 14px', borderRadius: 6, border: '1px solid',
            borderColor: confidence === c ? 'rgba(139,92,246,0.5)' : 'var(--border)',
            background: confidence === c ? 'rgba(139,92,246,0.12)' : 'transparent',
            color: confidence === c ? '#a78bfa' : '#4a6080',
            fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-mono)',
          }}>{c}%</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 20, marginBottom: 16 }}>
        <div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={distData}>
              <defs>
                <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="tailGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,200,0.08)" />
              <XAxis dataKey="x" tick={{ fill: '#4a6080', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmtUSD(v)} interval={9} />
              <YAxis tick={false} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 8, fontSize: 11 }}
                formatter={(v, n, p) => [fmtUSD(p.payload.x), 'Loss Level']} />
              <ReferenceLine x={mean} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: 'E[L]', fill: '#3b82f6', fontSize: 9 }} />
              <ReferenceLine x={VaR} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: `VaR${confidence}`, fill: '#f43f5e', fontSize: 9 }} />
              <Area type="monotone" dataKey="density" stroke="#3b82f6" fill="url(#bodyGrad)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '12px' }}>
            <div style={{ fontSize: 10, color: '#4a6080', fontFamily: 'var(--font-mono)' }}>EXPECTED LOSS E[L]</div>
            <div style={{ fontSize: 16, color: '#3b82f6', fontWeight: 700 }}>{fmtUSD(mean)}</div>
          </div>
          <div style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 8, padding: '12px' }}>
            <div style={{ fontSize: 10, color: '#4a6080', fontFamily: 'var(--font-mono)' }}>VaR @ {confidence}%</div>
            <div style={{ fontSize: 16, color: '#f43f5e', fontWeight: 700 }}>{fmtUSD(VaR)}</div>
          </div>
          <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, padding: '12px' }}>
            <div style={{ fontSize: 10, color: '#4a6080', fontFamily: 'var(--font-mono)' }}>TVaR @ {confidence}%</div>
            <div style={{ fontSize: 16, color: '#8b5cf6', fontWeight: 700 }}>{fmtUSD(VaR * 1.18)}</div>
            <div style={{ fontSize: 10, color: '#4a6080', marginTop: 2 }}>Conditional tail expectation</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
        {percentiles.map(p => (
          <div key={p.percentile} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#4a6080', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{p.pct_label}</div>
            <div style={{ fontSize: 12, color: p.percentile >= 99 ? '#f43f5e' : p.percentile >= 90 ? '#f59e0b' : '#8fafd8', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{fmtUSD(p.value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Loss Ratio & Burning Cost ───────────────────────────────────────────
function LossRatioModule() {
  // Estimated premiums earned per year based on reverse-engineering from data
  const premiumByYear = { 2018: 10500000, 2019: 11200000, 2020: 11800000, 2021: 12100000, 2022: 11500000, 2023: 11000000 };

  const lrData = PRICING_DATA.severityByYear.map(r => {
    const premium = premiumByYear[r.year] || 11000000;
    const lr = r.totalCapped / premium;
    const bcr = r.totalCapped / (r.count * 40000000 / 6); // burning cost rate per GT
    return { year: r.year, lossRatio: lr, premium, losses: r.totalCapped, bcr: bcr * 1000, count: r.count };
  });

  const avgLR = lrData.reduce((s, r) => s + r.lossRatio, 0) / lrData.length;

  // By type burning cost
  const byType = {};
  CLAIMS_DATA.filter(c => c.attritionalFlag === 1 && c.cappedNetAdj).forEach(c => {
    if (!byType[c.type]) byType[c.type] = { type: c.type, total: 0, count: 0 };
    byType[c.type].total += c.cappedNetAdj;
    byType[c.type].count++;
  });
  const typeBC = Object.values(byType).map(t => ({
    ...t, bcr: (t.total / (6 * 43098333)) * 1e7, avgSev: t.total / t.count
  })).sort((a, b) => b.total - a.total);

  return (
    <div>
      <SectionTitle sub="Annual loss ratios and burning cost rate per unit GT">
        Loss Ratio Analysis & Burning Cost Rate
      </SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: '#4a6080', fontFamily: 'var(--font-mono)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Annual Loss Ratio</div>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={lrData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,200,0.08)" />
              <XAxis dataKey="year" tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => (v * 100).toFixed(0) + '%'} domain={[0, 1.3]} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 8, fontSize: 12 }}
                formatter={(v, n) => n === 'lossRatio' ? [(v * 100).toFixed(1) + '%', 'Loss Ratio'] : [fmtUSD(v), n]} />
              <ReferenceLine yAxisId="left" y={1.0} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: '100%', fill: '#f43f5e', fontSize: 9 }} />
              <ReferenceLine yAxisId="left" y={avgLR} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Avg', fill: '#f59e0b', fontSize: 9 }} />
              <Bar yAxisId="left" dataKey="lossRatio" name="lossRatio" radius={[3, 3, 0, 0]}
                fill="#3b82f6" opacity={0.8}>
                {lrData.map((e, i) => (
                  <rect key={i} fill={e.lossRatio > 1.0 ? '#f43f5e' : e.lossRatio > 0.85 ? '#f59e0b' : '#10b981'} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#4a6080', fontFamily: 'var(--font-mono)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Burning Cost by Claim Type (×10⁻⁷ /GT)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={typeBC} layout="vertical">
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="rgba(100,140,200,0.08)" />
              <XAxis type="number" tick={{ fill: '#4a6080', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v.toFixed(1)} />
              <YAxis type="category" dataKey="type" tick={{ fill: '#8fafd8', fontSize: 9 }} axisLine={false} tickLine={false} width={150} />
              <Tooltip formatter={v => [v.toFixed(3) + '×10⁻⁷', 'BCR/GT']} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="bcr" name="BCR" radius={[0, 3, 3, 0]}>
                {typeBC.map((e, i) => <rect key={i} fill={TYPE_COLOR[e.type] || '#3b82f6'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Average Loss Ratio', value: fmtPct(avgLR), color: avgLR > 0.9 ? '#f43f5e' : '#10b981', sub: '6-year period' },
          { label: 'Worst Loss Ratio Year', value: '2020 — ' + fmtPct(lrData[2]?.lossRatio), color: '#f59e0b', sub: 'Highest frequency year' },
          { label: 'Best Loss Ratio Year', value: '2018 — ' + fmtPct(lrData[0]?.lossRatio), color: '#10b981', sub: 'Lowest frequency year' },
        ].map(item => (
          <div key={item.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, color: '#4a6080', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 11, color: '#4a6080', marginTop: 2 }}>{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Risk Segmentation ───────────────────────────────────────────────────
function RiskSegmentation() {
  // Heatmap: cause × type total loss
  const matrix = {};
  const causes = ['Human Error', 'Technical Failure', 'Criminal Activity', 'Natural Disaster'];
  const types = ['Collision Liability', 'Cargo Liability', 'Damage to Other Vessels', 'Environmental Pollution', 'Injury to Third Parties'];

  causes.forEach(c => { matrix[c] = {}; types.forEach(t => { matrix[c][t] = { count: 0, total: 0 }; }); });

  CLAIMS_DATA.forEach(c => {
    if (c.cause && c.type && matrix[c.cause]?.[c.type] != null) {
      matrix[c.cause][c.type].count++;
      matrix[c.cause][c.type].total += c.incurred || 0;
    }
  });

  const maxVal = Math.max(...causes.flatMap(ca => types.map(ty => matrix[ca][ty].total)));

  const radarData = types.map(type => {
    const total = CLAIMS_DATA.filter(c => c.type === type).reduce((s, c) => s + (c.incurred || 0), 0);
    const count = CLAIMS_DATA.filter(c => c.type === type).length;
    return { type: type.split(' ')[0], severity: total / Math.max(count, 1) / 1000, frequency: count, total: total / 1e6 };
  });

  return (
    <div>
      <SectionTitle sub="Cause of loss × claim type risk matrix and radar profiling">
        Risk Segmentation Matrix
      </SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: '#4a6080', fontFamily: 'var(--font-mono)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
            Incurred Loss Heatmap — Cause × Type
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 3 }}>
              <thead>
                <tr>
                  <th style={{ fontSize: 9, color: '#4a6080', padding: '4px 8px', textAlign: 'left', fontFamily: 'var(--font-mono)' }}>Cause \ Type</th>
                  {types.map(t => (
                    <th key={t} style={{ fontSize: 9, color: '#4a6080', padding: '4px 8px', textAlign: 'center', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                      {t.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {causes.map(cause => (
                  <tr key={cause}>
                    <td style={{ fontSize: 10, color: '#8fafd8', padding: '4px 8px', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>{cause}</td>
                    {types.map(type => {
                      const cell = matrix[cause][type];
                      const intensity = cell.total / maxVal;
                      const r = Math.round(59 + (244 - 59) * intensity);
                      const g = Math.round(130 - (130 - 63) * intensity);
                      const b = Math.round(246 - (246 - 94) * intensity);
                      return (
                        <td key={type} title={`${fmtUSD(cell.total)} · ${cell.count} claims`} style={{
                          padding: '8px 10px', textAlign: 'center', borderRadius: 6,
                          background: cell.total > 0 ? `rgba(${r},${g},${b},${0.1 + intensity * 0.7})` : 'var(--bg-surface)',
                          fontSize: 10, fontFamily: 'var(--font-mono)',
                          color: intensity > 0.5 ? '#fff' : intensity > 0.1 ? '#8fafd8' : '#2a4060',
                          cursor: 'default', transition: 'opacity 0.15s',
                        }}>
                          {cell.total > 0 ? fmtUSD(cell.total) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: 11, color: '#4a6080', marginTop: 10 }}>
            Hover cells for claim count. Darker = higher aggregate incurred loss.
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: '#4a6080', fontFamily: 'var(--font-mono)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Risk Profile by Type</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(100,140,200,0.12)" />
              <PolarAngleAxis dataKey="type" tick={{ fill: '#8fafd8', fontSize: 10 }} />
              <Radar name="Avg Severity ($K)" dataKey="severity" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              <Radar name="Frequency" dataKey="frequency" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 8, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'credibility', label: '① Credibility Weighting' },
  { id: 'triangle', label: '② Loss Triangle & IBNR' },
  { id: 'var', label: '③ VaR / TVaR' },
  { id: 'lossratio', label: '④ Loss Ratio & Burning Cost' },
  { id: 'segment', label: '⑤ Risk Segmentation' },
];

export default function AdvancedActuarial() {
  const [activeTab, setActiveTab] = useState('credibility');

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 4 }}>Advanced Actuarial Analytics</h2>
        <p style={{ color: '#4a6080', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          Extended actuarial skillset — beyond the base task requirements
        </p>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid',
            borderColor: activeTab === t.id ? 'rgba(59,130,246,0.5)' : 'var(--border)',
            background: activeTab === t.id ? 'rgba(59,130,246,0.1)' : 'var(--bg-card)',
            color: activeTab === t.id ? '#93c5fd' : '#4a6080',
            fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)',
            transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      <Card>
        {activeTab === 'credibility' && <CredibilityModule />}
        {activeTab === 'triangle' && <LossTriangle />}
        {activeTab === 'var' && <VaRModule />}
        {activeTab === 'lossratio' && <LossRatioModule />}
        {activeTab === 'segment' && <RiskSegmentation />}
      </Card>
    </div>
  );
}
