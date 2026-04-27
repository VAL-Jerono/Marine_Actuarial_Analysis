import { useState } from 'react';
import Dashboard from './components/Dashboard.jsx';
import ClaimsExplorer from './components/ClaimsExplorer.jsx';
import PricingModel from './components/PricingModel.jsx';
import AdvancedActuarial from './components/AdvancedActuarial.jsx';

const NAV = [
  { id: 'dashboard', label: 'Overview', icon: '◈' },
  { id: 'claims', label: 'Claims Explorer', icon: '⊞' },
  { id: 'pricing', label: 'Pricing Model', icon: '⊛' },
  { id: 'advanced', label: 'Advanced Analytics', icon: '◬' },
];

export default function App() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(180deg, #090f1e 0%, rgba(9,15,30,0) 100%)',
        borderBottom: '1px solid rgba(59,130,246,0.15)',
        padding: '0 32px',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(6,12,24,0.9)',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: '#fff'
            }}>⚓</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.5, color: '#e8f0fe' }}>
                AIG Marine Liability
              </div>
              <div style={{ fontSize: 10, color: '#4a6080', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Actuarial Intelligence Platform
              </div>
            </div>
          </div>

          <nav style={{ display: 'flex', gap: 4 }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => setTab(n.id)} style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontWeight: tab === n.id ? 600 : 400,
                transition: 'all 0.2s',
                background: tab === n.id
                  ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.15))'
                  : 'transparent',
                color: tab === n.id ? '#93c5fd' : '#4a6080',
                borderBottom: tab === n.id ? '2px solid #3b82f6' : '2px solid transparent',
              }}>
                <span style={{ marginRight: 6 }}>{n.icon}</span>{n.label}
              </button>
            ))}
          </nav>

          <div style={{
            fontSize: 11, color: '#2a4060', fontFamily: 'var(--font-mono)',
            textAlign: 'right', lineHeight: 1.6
          }}>
            <div>Oceanic Shipping Co.</div>
            <div>Period 2018–2023 · USD</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'claims' && <ClaimsExplorer />}
        {tab === 'pricing' && <PricingModel />}
        {tab === 'advanced' && <AdvancedActuarial />}
      </main>

      <footer style={{
        borderTop: '1px solid rgba(59,130,246,0.08)',
        padding: '14px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span style={{ fontSize: 11, color: '#1e3050', fontFamily: 'var(--font-mono)' }}>
          AIG Specialty Lines Actuarial · Marine Liability Pricing Analysis
        </span>
        <span style={{ fontSize: 11, color: '#1e3050', fontFamily: 'var(--font-mono)' }}>
          Analyst: V. Jerono · Pricing Year: 2024
        </span>
      </footer>
    </div>
  );
}
