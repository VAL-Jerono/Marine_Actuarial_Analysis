import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine } from 'recharts';
import { PRICING_DATA } from '../data.js';
import { Card, SectionTitle, KpiCard, fmtUSD, fmt, fmtPct } from './ui.jsx';

const STEP_LABELS = [
  'Claim Frequency',
  'Loss Severity',
  'Expected Loss/GT',
  'Pure Premium',
  'Large Loss Loading',
  'Final Premium',
  'Sensitivity',
];

export default function PricingModel() {
  const [activeStep, setActiveStep] = useState(0);
  const [sevShock, setSevShock] = useState(6);
  const [expLoading, setExpLoading] = useState(30);
  const [profitMargin, setProfitMargin] = useState(10);

  const pd = PRICING_DATA;
  const avgFreq = pd.frequencyByYear.reduce((s, r) => s + r.freqPerGT, 0) / pd.frequencyByYear.length;
  const avgSev = pd.severityByYear.reduce((s, r) => s + r.avgSeverity, 0) / pd.severityByYear.length;

  // Interactive premium calc
  const shockedSev = avgSev * (1 + sevShock / 100);
  const shockedPure = avgFreq * shockedSev * 40000000;
  const shockedTRP = shockedPure + pd.pricingSummary.largeLossLoading;
  const shockedFinal = shockedTRP * (1 + expLoading / 100) * (1 + profitMargin / 100);
  const baseFinal = pd.pricingSummary.purePremium + pd.pricingSummary.largeLossLoading;
  const baseFinalWithLoads = baseFinal * (1 + expLoading / 100) * (1 + profitMargin / 100);

  const sensitivityData = [-10, -6, -3, 0, 3, 6, 10, 15, 20].map(shock => {
    const sev = avgSev * (1 + shock / 100);
    const pure = avgFreq * sev * 40000000;
    const trp = pure + pd.pricingSummary.largeLossLoading;
    const final = trp * (1 + expLoading / 100) * (1 + profitMargin / 100);
    return { shock: `${shock > 0 ? '+' : ''}${shock}%`, finalPremium: Math.round(final), pure: Math.round(pure) };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <div style={{ color: '#93c5fd', fontWeight: 600, marginBottom: 6 }}>Severity shock: {label}</div>
        {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {fmtUSD(p.value)}</div>)}
      </div>
    );
  };

  const StepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div>
            <SectionTitle sub="Attritional claims per unit of Gross Tonnage (excl. CLM-00100)">Step 1: Claim Frequency Analysis</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pd.frequencyByYear}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,200,0.08)" />
                <XAxis dataKey="year" tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => (v * 1e7).toFixed(1) + 'e-7'} />
                <Tooltip formatter={v => [(v * 1e7).toFixed(3) + '×10⁻⁷', 'Freq/GT']} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 8, fontSize: 12 }} />
                <ReferenceLine y={avgFreq} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Average', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
                <Bar dataKey="freqPerGT" name="Freq/GT" fill="#3b82f6" radius={[3, 3, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
              {pd.frequencyByYear.map(r => (
                <div key={r.year} style={{ background: 'var(--bg-surface)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: '#4a6080', fontFamily: 'var(--font-mono)' }}>{r.year}</div>
                  <div style={{ fontSize: 13, color: '#e8f0fe', fontWeight: 600 }}>{r.claims} claims</div>
                  <div style={{ fontSize: 11, color: '#3b82f6', fontFamily: 'var(--font-mono)' }}>{(r.freqPerGT * 1e7).toFixed(3)}×10⁻⁷ /GT</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(59,130,246,0.06)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.15)' }}>
              <span style={{ fontSize: 12, color: '#8fafd8' }}>
                <strong style={{ color: '#93c5fd' }}>Average Frequency:</strong> {(avgFreq * 1e7).toFixed(3)} × 10⁻⁷ claims per Gross Tonnage unit · Used in Pure Premium calculation
              </span>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <SectionTitle sub="Inflation-adjusted capped net severity by year">Step 2: Loss Severity Analysis</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pd.severityByYear}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,200,0.08)" />
                <XAxis dataKey="year" tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmtUSD(v)} />
                <Tooltip formatter={v => [fmtUSD(v)]} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 8, fontSize: 12 }} />
                <ReferenceLine y={avgSev} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Average', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
                <Bar dataKey="avgSeverity" name="Avg Severity" fill="#f59e0b" radius={[3, 3, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(245,158,11,0.06)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.15)' }}>
              <span style={{ fontSize: 12, color: '#8fafd8' }}>
                <strong style={{ color: '#fbbf24' }}>Average Severity:</strong> {fmtUSD(avgSev)} · 2023 shows downward trend ({fmtUSD(465367.34)}) — potentially a favourable shift or IBNR understatement for recent years
              </span>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <SectionTitle sub="Freq × Severity = Expected Loss per unit of Gross Tonnage">Step 3: Expected Loss per GT</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={[
                { year: 2018, value: 0.14285 }, { year: 2019, value: 0.21153 },
                { year: 2020, value: 0.28918 }, { year: 2021, value: 0.28835 },
                { year: 2022, value: 0.22371 }, { year: 2023, value: 0.16639 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,200,0.08)" />
                <XAxis dataKey="year" tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + v.toFixed(3)} />
                <Tooltip formatter={v => ['$' + v.toFixed(5), 'Loss/GT']} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 8, fontSize: 12 }} />
                <ReferenceLine y={0.22034} stroke="#10b981" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2.5} dot={{ fill: '#14b8a6', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(20,184,166,0.06)', borderRadius: 8, border: '1px solid rgba(20,184,166,0.15)' }}>
              <span style={{ fontSize: 12, color: '#8fafd8' }}>
                <strong style={{ color: '#5eead4' }}>6-Year Average:</strong> $0.22034 per GT · Peaked 2020–2021 consistent with COVID-era operational disruption and reduced maintenance frequency
              </span>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <SectionTitle sub="Frequency × Severity × Expected 2024 Tonnage">Step 4: Pure Premium Calculation</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Average Frequency per GT', value: `${(avgFreq * 1e7).toFixed(3)} × 10⁻⁷`, mono: true },
                { label: '× Average Severity per Claim', value: fmtUSD(avgSev), mono: true },
                { label: '× 2024 Expected Gross Tonnage', value: '40,000,000 GT', mono: true },
                { label: '= Pure Premium', value: fmtUSD(pd.pricingSummary.purePremium), highlight: true, color: '#3b82f6' },
              ].map((r, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 18px', borderRadius: 8,
                  background: r.highlight ? 'rgba(59,130,246,0.08)' : 'var(--bg-surface)',
                  border: r.highlight ? '1px solid rgba(59,130,246,0.25)' : '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: 13, color: '#8fafd8' }}>{r.label}</span>
                  <span style={{
                    fontSize: r.highlight ? 18 : 14, fontWeight: r.highlight ? 700 : 500,
                    fontFamily: 'var(--font-mono)', color: r.color || '#e8f0fe'
                  }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <SectionTitle sub="CLM-00100 · 1-in-20 year return period catastrophe loading">Step 5–7: Large Loss Loading</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: 11, color: '#f87171', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>Large Loss Event</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fca5a5' }}>{pd.largeLoss.claimId}</div>
                <div style={{ fontSize: 12, color: '#f87171', marginTop: 4 }}>{pd.largeLoss.type} · {pd.largeLoss.year}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#f43f5e', marginTop: 8 }}>{fmtUSD(pd.largeLoss.inflAdjCost)}</div>
                <div style={{ fontSize: 11, color: '#4a6080', marginTop: 2 }}>Inflation-adjusted incurred</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Inflation-Adj Cost', value: fmtUSD(pd.largeLoss.inflAdjCost) },
                  { label: '÷ Return Period', value: `${pd.largeLoss.returnPeriod} years` },
                  { label: '= Large Loss Loading', value: fmtUSD(pd.largeLoss.loading), highlight: true },
                ].map((r, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 8,
                    background: r.highlight ? 'rgba(244,63,94,0.08)' : 'var(--bg-surface)',
                    border: r.highlight ? '1px solid rgba(244,63,94,0.3)' : '1px solid var(--border)',
                  }}>
                    <span style={{ fontSize: 12, color: '#8fafd8' }}>{r.label}</span>
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: r.highlight ? 700 : 400, color: r.highlight ? '#f43f5e' : '#e8f0fe' }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <SectionTitle sub="Steps 8–9: Building up to final loaded premium">Final Premium Build-Up</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Pure Premium', value: pd.pricingSummary.purePremium, color: '#3b82f6', pct: null },
                { label: '+ Large Loss Loading', value: pd.pricingSummary.largeLossLoading, color: '#f43f5e', pct: null },
                { label: '= Total Risk Premium', value: pd.pricingSummary.totalRiskPremium, color: '#06b6d4', separator: true },
                { label: `× (1 + Expense Loading ${expLoading}%)`, value: null, color: '#8fafd8' },
                { label: `× (1 + Profit Margin ${profitMargin}%)`, value: null, color: '#8fafd8' },
                { label: '= FINAL PREMIUM', value: baseFinalWithLoads, color: '#10b981', big: true },
              ].map((r, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: r.big ? '16px 20px' : '12px 16px', borderRadius: 8,
                  background: r.big ? 'rgba(16,185,129,0.08)' : r.separator ? 'rgba(6,182,212,0.05)' : 'var(--bg-surface)',
                  border: r.big ? '1px solid rgba(16,185,129,0.3)' : `1px solid var(--border)`,
                  marginTop: r.separator ? 4 : 0,
                }}>
                  <span style={{ fontSize: 13, color: r.big ? '#6ee7b7' : '#8fafd8', fontWeight: r.big ? 600 : 400 }}>{r.label}</span>
                  {r.value != null && (
                    <span style={{ fontSize: r.big ? 22 : 14, fontWeight: r.big ? 700 : 500, fontFamily: 'var(--font-mono)', color: r.color }}>
                      {fmtUSD(r.value)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div>
            <SectionTitle sub="How severity shocks translate to premium impact">Step 10: Sensitivity Analysis</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 20, marginBottom: 16 }}>
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={sensitivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,200,0.08)" />
                    <XAxis dataKey="shock" tick={{ fill: '#4a6080', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4a6080', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmtUSD(v)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="finalPremium" name="Final Premium" radius={[3, 3, 0, 0]}>
                      {sensitivityData.map((e, i) => (
                        <rect key={i} fill={e.shock.includes('-') ? '#10b981' : e.shock === '0%' ? '#3b82f6' : '#f43f5e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#4a6080', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>SEVERITY SHOCK</div>
                  <input type="range" min={-15} max={30} value={sevShock} onChange={e => setSevShock(+e.target.value)}
                    style={{ width: '100%', accentColor: '#f59e0b' }} />
                  <div style={{ fontSize: 12, color: '#f59e0b', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                    {sevShock > 0 ? '+' : ''}{sevShock}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#4a6080', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>EXPENSE LOADING</div>
                  <input type="range" min={15} max={45} value={expLoading} onChange={e => setExpLoading(+e.target.value)}
                    style={{ width: '100%', accentColor: '#3b82f6' }} />
                  <div style={{ fontSize: 12, color: '#3b82f6', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>{expLoading}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#4a6080', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>PROFIT MARGIN</div>
                  <input type="range" min={5} max={25} value={profitMargin} onChange={e => setProfitMargin(+e.target.value)}
                    style={{ width: '100%', accentColor: '#10b981' }} />
                  <div style={{ fontSize: 12, color: '#10b981', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>{profitMargin}%</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '14px 18px' }}>
                <div style={{ fontSize: 11, color: '#4a6080', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>BASE FINAL PREMIUM</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#3b82f6', fontFamily: 'var(--font-display)' }}>{fmtUSD(baseFinalWithLoads)}</div>
              </div>
              <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '14px 18px' }}>
                <div style={{ fontSize: 11, color: '#4a6080', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>SHOCKED FINAL PREMIUM</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b', fontFamily: 'var(--font-display)' }}>{fmtUSD(shockedFinal)}</div>
                <div style={{ fontSize: 11, color: shockedFinal > baseFinalWithLoads ? '#f43f5e' : '#10b981', marginTop: 2 }}>
                  {shockedFinal > baseFinalWithLoads ? '▲' : '▼'} {fmtUSD(Math.abs(shockedFinal - baseFinalWithLoads))} ({fmtPct(Math.abs(shockedFinal - baseFinalWithLoads) / baseFinalWithLoads)})
                </div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 4 }}>Pricing Model</h2>
        <p style={{ color: '#4a6080', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          Experience-Based Rating · 10-Step Pure Premium Methodology · Pricing Year 2024
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 18 }}>
        {/* Step nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {STEP_LABELS.map((label, i) => (
            <button key={i} onClick={() => setActiveStep(i)} style={{
              padding: '10px 14px', borderRadius: 8, border: '1px solid',
              borderColor: activeStep === i ? 'rgba(59,130,246,0.4)' : 'var(--border)',
              background: activeStep === i ? 'rgba(59,130,246,0.1)' : 'var(--bg-card)',
              color: activeStep === i ? '#93c5fd' : '#4a6080',
              fontSize: 12, cursor: 'pointer', textAlign: 'left',
              fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', fontSize: 10,
                background: activeStep === i ? '#3b82f6' : 'var(--bg-surface)',
                color: activeStep === i ? '#fff' : '#4a6080',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', flexShrink: 0,
              }}>{i + 1}</span>
              {label}
            </button>
          ))}

          {/* Summary box */}
          <div style={{ marginTop: 12, padding: '14px', background: 'var(--bg-card)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: '#4a6080', fontFamily: 'var(--font-mono)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Final Premium</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-display)' }}>$13.0M</div>
            <div style={{ fontSize: 10, color: '#4a6080', marginTop: 4 }}>Base · 2024</div>
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, color: '#4a6080', fontFamily: 'var(--font-mono)' }}>+6% Sensitivity</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f59e0b', fontFamily: 'var(--font-display)' }}>$13.8M</div>
            </div>
          </div>
        </div>

        {/* Step content */}
        <Card>
          <StepContent />
        </Card>
      </div>
    </div>
  );
}
