import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { CLAIMS_DATA } from '../data.js';
import { Card, SectionTitle, Badge, TYPE_COLOR, CAUSE_COLOR, STATUS_COLOR, LOC_COLOR, fmtUSD, fmt } from './ui.jsx';

const TYPES = ['All', 'Collision Liability', 'Cargo Liability', 'Damage to Other Vessels', 'Environmental Pollution', 'Injury to Third Parties'];
const STATUSES = ['All', 'Closed', 'Open', 'In Litigation'];
const YEARS = ['All', '2018', '2019', '2020', '2021', '2022', '2023'];

export default function ClaimsExplorer() {
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [sortBy, setSortBy] = useState('incurred');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 15;

  const filtered = useMemo(() => {
    let d = CLAIMS_DATA;
    if (typeFilter !== 'All') d = d.filter(c => c.type === typeFilter);
    if (statusFilter !== 'All') d = d.filter(c => c.status === statusFilter);
    if (yearFilter !== 'All') d = d.filter(c => String(c.year) === yearFilter);
    d = [...d].sort((a, b) => {
      const av = a[sortBy] ?? 0, bv = b[sortBy] ?? 0;
      return sortDir === 'desc' ? bv - av : av - bv;
    });
    return d;
  }, [typeFilter, statusFilter, yearFilter, sortBy, sortDir]);

  const page_data = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Scatter: severity vs tonnage
  const scatterData = useMemo(() =>
    filtered.map(c => ({ x: c.grossTonnage, y: c.incurred, name: c.claimId, type: c.type })),
    [filtered]
  );

  // Bar by type for filtered
  const byType = useMemo(() => {
    const m = {};
    filtered.forEach(c => {
      if (!m[c.type]) m[c.type] = { type: c.type, count: 0, total: 0 };
      m[c.type].count++;
      m[c.type].total += c.incurred || 0;
    });
    return Object.values(m).sort((a, b) => b.total - a.total);
  }, [filtered]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir('desc'); }
    setPage(0);
  };

  const FilterBtn = ({ val, active, onChange }) => (
    <button onClick={() => { onChange(val); setPage(0); }} style={{
      padding: '5px 12px', borderRadius: 6, border: '1px solid',
      borderColor: active ? 'rgba(59,130,246,0.5)' : 'var(--border)',
      background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
      color: active ? '#93c5fd' : '#4a6080',
      fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-sans)',
      transition: 'all 0.15s'
    }}>{val}</button>
  );

  const Th = ({ col, label }) => (
    <th onClick={() => toggleSort(col)} style={{
      padding: '10px 12px', textAlign: 'left', fontSize: 10,
      color: sortBy === col ? '#93c5fd' : '#4a6080',
      textTransform: 'uppercase', letterSpacing: 1, cursor: 'pointer',
      fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--border)',
      whiteSpace: 'nowrap', userSelect: 'none',
    }}>
      {label} {sortBy === col ? (sortDir === 'desc' ? '↓' : '↑') : ''}
    </th>
  );

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <div style={{ color: '#93c5fd', marginBottom: 4 }}>{d.name}</div>
        <div style={{ color: '#8fafd8' }}>Tonnage: {fmt(d.x)} GT</div>
        <div style={{ color: '#f59e0b' }}>Incurred: {fmtUSD(d.y)}</div>
        <div style={{ color: '#4a6080', fontSize: 10 }}>{d.type}</div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 4 }}>Claims Explorer</h2>
        <p style={{ color: '#4a6080', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          Interactive filtering · {filtered.length} of {CLAIMS_DATA.length} claims shown
        </p>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 18, padding: '14px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, color: '#4a6080', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>Claim Type</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {TYPES.map(t => <FilterBtn key={t} val={t} active={typeFilter === t} onChange={setTypeFilter} />)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#4a6080', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>Status</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {STATUSES.map(s => <FilterBtn key={s} val={s} active={statusFilter === s} onChange={setStatusFilter} />)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#4a6080', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>Year</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {YEARS.map(y => <FilterBtn key={y} val={y} active={yearFilter === y} onChange={setYearFilter} />)}
            </div>
          </div>
        </div>
      </Card>

      {/* Mini charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <Card>
          <SectionTitle sub="Filtered selection">Incurred by Claim Type</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={byType} layout="vertical" barSize={10}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="rgba(100,140,200,0.08)" />
              <XAxis type="number" tick={{ fill: '#4a6080', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmtUSD(v)} />
              <YAxis type="category" dataKey="type" tick={{ fill: '#8fafd8', fontSize: 10 }} axisLine={false} tickLine={false} width={160} />
              <Tooltip formatter={(v) => fmtUSD(v)} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="total" name="Total Incurred" radius={[0, 3, 3, 0]}>
                {byType.map((e, i) => (
                  <rect key={i} fill={TYPE_COLOR[e.type] || '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle sub="Incurred vs Gross Tonnage — bubble = size of claim">Severity vs Vessel Size</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,200,0.08)" />
              <XAxis dataKey="x" name="Tonnage" tick={{ fill: '#4a6080', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v / 1000) + 'K'} label={{ value: 'GT', position: 'insideBottomRight', fill: '#4a6080', fontSize: 10 }} />
              <YAxis dataKey="y" name="Incurred" tick={{ fill: '#4a6080', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmtUSD(v)} />
              <ZAxis range={[20, 200]} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={scatterData} fill="#3b82f6" opacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)' }}>
                <Th col="claimId" label="Claim ID" />
                <Th col="date" label="Date" />
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10, color: '#4a6080', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--border)' }}>Type</th>
                <Th col="incurred" label="Incurred ($)" />
                <Th col="cappedNetAdj" label="Capped Net Adj" />
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10, color: '#4a6080', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--border)' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10, color: '#4a6080', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--border)' }}>Cause</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10, color: '#4a6080', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--border)' }}>Location</th>
                <Th col="grossTonnage" label="Tonnage" />
                <Th col="priorClaims" label="Prior Claims" />
              </tr>
            </thead>
            <tbody>
              {page_data.map((c, i) => (
                <tr key={c.claimId} style={{
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  borderBottom: '1px solid rgba(100,140,200,0.05)',
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
                >
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#3b82f6' }}>{c.claimId}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: '#8fafd8', whiteSpace: 'nowrap' }}>{c.date}</td>
                  <td style={{ padding: '10px 12px' }}><Badge color={TYPE_COLOR[c.type] || '#3b82f6'}>{c.type?.split(' ')[0]}</Badge></td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#e8f0fe', textAlign: 'right' }}>{fmtUSD(c.incurred)}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#8fafd8', textAlign: 'right' }}>{fmtUSD(c.cappedNetAdj)}</td>
                  <td style={{ padding: '10px 12px' }}><Badge color={STATUS_COLOR[c.status] || '#4a6080'}>{c.status}</Badge></td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: '#8fafd8' }}>{c.cause}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: '#8fafd8' }}>{c.location}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#4a6080', textAlign: 'right' }}>{fmt(c.grossTonnage)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11, color: c.priorClaims > 5 ? '#f43f5e' : '#4a6080', fontFamily: 'var(--font-mono)' }}>{c.priorClaims}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 11, color: '#4a6080', fontFamily: 'var(--font-mono)' }}>
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i)} style={{
                width: 28, height: 28, borderRadius: 6, border: '1px solid',
                borderColor: page === i ? 'rgba(59,130,246,0.5)' : 'var(--border)',
                background: page === i ? 'rgba(59,130,246,0.12)' : 'transparent',
                color: page === i ? '#93c5fd' : '#4a6080',
                fontSize: 11, cursor: 'pointer',
              }}>{i + 1}</button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
