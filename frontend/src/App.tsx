import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { SubmitProjectPage } from './pages/SubmitProjectPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { AdminPage } from './pages/AdminPage';
import { RetirePage } from './pages/RetirePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ValidatorPage } from './pages/ValidatorPage';
import { ActivityPage } from './pages/ActivityPage';

export default function App() {
  return <Routes>
    <Route element={<AppShell />}>
      <Route path="/"            element={<HomePage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/retire"      element={<RetirePage />} />
      <Route path="/submit"      element={<SubmitProjectPage />} />
      <Route path="/dashboard"   element={<PortfolioPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/activity"    element={<ActivityPage />} />
      <Route path="/validator"   element={<ValidatorPage />} />
      <Route path="/admin"       element={<AdminPage />} />
      {/* Legacy redirects */}
      <Route path="/certificates"   element={<Navigate to="/dashboard?tab=certificates" replace />} />
      <Route path="/submit-project" element={<Navigate to="/submit" replace />} />
      <Route path="/portfolio"      element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<div style={{ padding: '60px 34px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--mut)' }}><h1 style={{ fontSize: 48, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: 'var(--ink)', margin: '0 0 12px' }}>404</h1><p style={{ fontSize: 12 }}>Page not found.</p></div>} />
    </Route>
  </Routes>;
}
