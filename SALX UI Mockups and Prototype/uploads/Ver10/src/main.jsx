import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowUpRight, Check, ChevronDown, ExternalLink, Menu, X } from 'lucide-react';
import './styles.css';

const marketProjects = [
  { id: 1, title: 'Cần Giờ Mangrove Forest', badge: 'VCS VERIFIED', meta: 'ID: 1 | Ho Chi Minh City', price: '0.020 ETH/SAL', type: 'Mangrove', geography: 'Vietnam', vintage: '2024', image: '/assets/mangrove.svg' },
  { id: 2, title: 'Bạc Liêu Wind Power', badge: 'VCS VERIFIED', meta: 'ID: 2 | Bạc Liêu, Vietnam', price: '0.015 ETH/SAL', type: 'Wind', geography: 'Vietnam', vintage: '2025', image: '/assets/wind.svg' },
  { id: 3, title: 'Bình Dương Rooftop Solar', badge: 'GOLD STANDARD', meta: 'ID: 3 | Bình Dương', price: '0.010 ETH/SAL', type: 'Solar', geography: 'Vietnam', vintage: '2026', image: '/assets/solar.svg' },
];

const editions = [
  ['VCS • VERIFIED', 'SAL-0142', 'Cần Giờ Mangrove', 'MANGROVE RESTORATION • 2024', '0.028 ETH / tCO₂e', 'mangrove.svg'],
  ['GOLD STANDARD', 'SAL-0291', 'Bạc Liêu Wind Power', 'RENEWABLE ENERGY • 2025', '0.034 ETH / tCO₂e', 'wind.svg'],
  ['VERIFIED IMPACT', 'SAL-0364', 'Forest Corridor', 'NATURE-BASED • 2026', '0.031 ETH / tCO₂e', 'forest.svg'],
];

const leaderboard = [
  { rank: '01', name: 'Vinamilk', wallet: '0x1A72…8E4D', retired: '12,840 tCO₂e', status: 'VERIFIED ESG' },
  { rank: '02', name: 'TH True Milk', wallet: '0x7B39…2CF1', retired: '9,620 tCO₂e', status: 'VERIFIED ESG' },
  { rank: '03', name: 'Heineken Vietnam', wallet: '0x9F14…3B6A', retired: '7,480 tCO₂e', status: 'VERIFIED ESG' },
  { rank: '04', name: 'Masan Consumer', wallet: '0x2E67…C0D8', retired: '4,960 tCO₂e', status: 'VERIFIED ESG' },
];

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.style.setProperty('--reveal-delay', `${delay}ms`);
        node.classList.add('is-visible');
        observer.unobserve(node);
      }
    }, { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [delay]);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

function PageTransition({ children }) {
  const location = useLocation();
  return <div className="page-transition" key={location.pathname}>{children}</div>;
}

function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  return (
    <div className="site-shell">
      <div className="top-accent-line" aria-hidden="true" />
      <header className="topbar">
        <Link className="brand" to="/" onClick={() => setOpen(false)} aria-label="SALX home"><img src="/assets/salx-wordmark-dark.png" alt="SALX Carbon Credit Marketplace" /></Link>
        <span className="network-chip">SEPOLIA</span>
        <nav className={open ? 'main-nav open' : 'main-nav'}>
          <NavLink onClick={() => setOpen(false)} to="/market">Marketplace</NavLink>
          <NavLink onClick={() => setOpen(false)} to="/retire">Retire</NavLink>
          <NavLink onClick={() => setOpen(false)} to="/leaderboard">Dashboard</NavLink>
        </nav>
        <div className="wallet-group">
          <div className="wallet-pill"><span className="status-dot" />0xD7…91A2</div>
          <div className="wallet-pill wallet-pill-ghost">0.84 ETH</div>
        </div>
        <button className="menu-btn" onClick={() => setOpen(v => !v)} aria-label="Toggle navigation">{open ? <X size={20} /> : <Menu size={20} />}</button>
      </header>
      <PageTransition>{children}</PageTransition>
      {location.pathname === '/market' && <footer className="footer">© 2026 SALX | SAOLA CARBON MARKETPLACE. POWERED BY ETHEREUM.</footer>}
    </div>
  );
}

function Home() {
  return <div className="home-page">
    <section className="hero section-pad">
      <Reveal><div className="hero-heading-row"><div className="hero-kicker">SALX / SAOLA CARBON MARKETPLACE</div><div className="hero-edition">EDITION 001 — 2026</div></div></Reveal>
      <Reveal delay={70} className="hero-stage-wrap">
        <div className="hero-art">
          <span className="hero-wordmark">SAL</span>
          <Reveal delay={160} className="hero-side-panel hero-side-panel-left"><p>TRADE<br />TRACE<br />RETIRE</p></Reveal>
          <Reveal delay={200} className="hero-side-panel hero-side-panel-right"><p>A UNIT OF<br />VERIFIED<br />IMPACT</p></Reveal>
        </div>
      </Reveal>
      <Reveal delay={110}>
        <div className="hero-copy">
          <h1>THE CARBON<br />CULTURE IS<br />ON-CHAIN.</h1>
          <div className="hero-copy-side">
            <p>SAL is the native unit for carbon with provenance — a collectible record of real-world restoration, held with complete transparency.</p>
            <Link className="text-link magnetic-link" to="/market">EXPLORE SAL <ArrowUpRight size={15} /></Link>
          </div>
        </div>
      </Reveal>
    </section>

    <Reveal><section className="sal-unit section-pad ruled-section">
      <div className="section-index">01 / THE SAL UNIT</div>
      <div className="two-col"><div><h2>ONE TOKEN.<br />ONE TONNE.<br /><span className="olive-italic">ONE TRACE.</span></h2></div>
        <div className="section-body"><p>Each SAL represents one verified tonne of avoided or removed carbon. Project evidence, retirement history, and ownership travel with the unit.</p>
          <div className="meta-grid"><div><span>TOKEN</span><b>SAL</b></div><div><span>PROVENANCE</span><b>VERIFIED / PUBLIC</b></div><div><span>SETTLEMENT</span><b>SEPOLIA</b></div></div>
        </div></div>
    </section></Reveal>

    <section className="pressing section-pad ruled-section">
      <Reveal><div className="section-index">02 / THE CURRENT PRESSING</div><h2>PICK A PROJECT.<br /><span className="olive-italic">MAKE IT LAST.</span></h2></Reveal>
      <div className="pressing-marquee" aria-hidden="true"><span>CARBON WITH PROVENANCE • TRACEABLE • RETIREABLE • CARBON WITH PROVENANCE • TRACEABLE • RETIREABLE • </span></div>
    </section>

    <Reveal><section className="editions section-pad ruled-section">
      <div className="section-heading-row"><div className="section-index">03 SELECTED EDITIONS</div><div className="hint">DRAG A SLEEVE TO THE SIDE <span className="drag-arrow">→</span></div></div>
      <div className="edition-scroller">
        {editions.map(([badge,id,title,meta,price,img], i) => <article className="edition-card" key={id} style={{'--card-index': i}}>
          <div className="edition-art"><img src={`/assets/${img}`} alt="" /><span className="art-badge" data-badge={badge === 'GOLD STANDARD' ? 'gold' : 'green'}>{badge}</span><span className="art-code">{id}</span></div>
          <h3>{title}</h3><p>{meta}</p><strong>{price}</strong>
          <Link className="card-link" to="/market">COLLECT SAL <ArrowUpRight size={14}/></Link>
        </article>)}
      </div>
    </section></Reveal>

    <Reveal><section className="final-cut section-pad ruled-section">
      <div className="section-index">03 / THE FINAL CUT</div>
      <div className="two-col"><div><h2>MAKE THE<br /><span className="olive-italic">IMPACT PERMANENT.</span></h2></div>
        <div className="section-body"><p>Retire SAL and receive a record that proves exactly what your organisation funded — from project to certificate.</p><Link className="pill-link" to="/retire">RETIRE SAL <ArrowUpRight size={15}/></Link></div></div>
    </section></Reveal>
  </div>;
}

function Market() {
  const [type, setType] = useState('Solar');
  const [geo, setGeo] = useState('Vietnam');
  const [vintageTo, setVintageTo] = useState(2026);
  const [applied, setApplied] = useState(false);
  const vintageLabel = `2024–${vintageTo}`;
  const filtered = useMemo(() => {
    if (!applied) return marketProjects;
    return marketProjects.filter(p => (type === 'All' || p.type === type) && (geo === 'All' || p.geography === geo) && Number(p.vintage) <= vintageTo);
  }, [applied, type, geo, vintageTo]);

  function clearAll() { setType('Solar'); setGeo('Vietnam'); setVintageTo(2026); setApplied(false); }
  const vintagePct = ((vintageTo - 2024) / (2026 - 2024)) * 100;

  return <div className="listing-page section-pad">
    <Reveal className="listing-intro-wrap"><div className="page-intro"><div className="section-index">MARKET / VERIFIED PROJECTS</div><h1>Active Carbon Projects</h1><p>Verified VCS and Gold Standard certified projects</p></div></Reveal>
    <Reveal delay={60}><section className="filters glass-panel"><div className="filters-label">FILTERS <span>REFINE THE PRESSING</span></div>
      <div className="filter-grid">
        <label>PROJECT TYPE<div className="select-wrap"><select value={type} onChange={e=>setType(e.target.value)}><option>Solar</option><option>Wind</option><option>Mangrove</option><option>All</option></select><ChevronDown size={15}/></div></label>
        <label>GEOGRAPHY<div className="select-wrap"><select value={geo} onChange={e=>setGeo(e.target.value)}><option>Vietnam</option><option>All</option></select><ChevronDown size={15}/></div></label>
        <label>VINTAGE YEARS ({vintageLabel})
          <div className="vintage-slider">
            <input type="range" min="2024" max="2026" step="1" value={vintageTo} onChange={e=>setVintageTo(Number(e.target.value))} style={{'--fill': `${vintagePct}%`}} />
            <div className="vintage-slider-labels"><span>2024</span><span>2026</span></div>
          </div>
        </label>
      </div>
      <div className="filter-actions"><button onClick={()=>setApplied(true)} className="primary-btn">APPLY FILTERS <ArrowUpRight size={14}/></button><button onClick={clearAll} className="ghost-btn">CLEAR ALL</button></div>
    </section></Reveal>
    <section className="project-grid">
      {filtered.map((p, i) => <Reveal key={p.id} delay={90 + i * 80}><article className="project-card">
        <div className="project-img"><img src={p.image} alt="" /><div className="project-badge" data-badge={p.badge === 'GOLD STANDARD' ? 'gold' : 'green'}>{p.badge}</div><div className="project-id">SAL-{String(p.id).padStart(4,'0')}</div></div>
        <div className="project-card-body"><h2>{p.title}</h2><p>{p.meta}</p><div className="project-footer"><div><span>UNIT PRICE</span><strong>{p.price}</strong></div><a href="#mrv" className="mrv">IPFS MRV Report <ExternalLink size={14}/></a></div><button className="wide-btn">BUY SAL <ArrowUpRight size={15}/></button></div>
      </article></Reveal>)}
    </section>
  </div>;
}

function Leaderboard() {
  return <div className="leaderboard-page section-pad">
    <Reveal><div className="leader-top"><div className="section-index">01 / VERIFIED CLIMATE IMPACT</div><div className="fy">FY 2026</div></div></Reveal>
    <Reveal delay={50}><div className="leader-intro"><div><h1>GREEN LEADERS,<br /><span className="olive-italic">ON-CHAIN.</span></h1></div><p>A transparent record of enterprises converting verified climate commitments into auditable impact.</p></div></Reveal>
    <section className="rank-highlights">
      {leaderboard.slice(1, 4).map((row, i) => <Reveal key={row.rank} delay={90 + i * 70}><div className={i === 1 ? 'rank-card featured' : 'rank-card'}><div className="rank-label">{row.rank} · {i === 1 ? 'LEADING IMPACT' : 'IMPACT LEADER'}</div><div className="rank-name">{row.name}</div><strong>{row.retired}</strong><span className="rank-orb">{row.rank}</span></div></Reveal>)}
    </section>
    <Reveal delay={160}><div className="table-wrap"><div className="table-head"><span>RANK</span><span>ENTERPRISE / WALLET</span><span>RETIRED</span><span>STATUS</span></div>
      {leaderboard.map(row => <div className="table-row" key={row.rank}><span>{row.rank}</span><span><strong>{row.name}</strong> · {row.wallet}</span><span>{row.retired}</span><span><i className="verified-dot" />{row.status}</span></div>)}
    </div></Reveal>
  </div>;
}

function Retire() {
  const [amount, setAmount] = useState(80);
  const [project, setProject] = useState('Select');
  return <div className="retire-page section-pad">
    <div className="retire-layout">
      <Reveal><section className="terminal-card glass-panel">
        <div className="section-index">RETIREMENT TERMINAL / ERC-1155</div>
        <div className="terminal-rule" />
        <h1>Retire carbon.<br /><span className="olive-italic">Mint proof.</span></h1>
        <p>Your retirement is permanent and is written to an auditable Soulbound Token certificate.</p>
        <label>TOKEN PROJECT<div className="select-wrap"><select value={project} onChange={e=>setProject(e.target.value)}><option>Select</option><option>Cần Giờ Mangrove Forest</option><option>Bạc Liêu Wind Power</option><option>Bình Dương Rooftop Solar</option></select><ChevronDown size={15}/></div></label>
        <label>AMOUNT TO RETIRE<div className="amount-input"><input type="number" min="1" value={amount} onChange={e=>setAmount(Number(e.target.value) || 0)} /><span>SAL</span></div></label>
        <div className="preview"><span>RETIREMENT PREVIEW</span><strong><span className="preview-number">{amount}</span> SAL = {amount} Tons of CO₂e retired</strong></div>
        <button className="wide-btn">Retire &amp; Mint Soulbound Certificate <ArrowUpRight size={15}/></button>
      </section></Reveal>
      <Reveal delay={120}><section className="certificate-card">
        <div className="certificate-glow" /><div className="certificate-top"><div className="certificate-stamp"><img src="/assets/salx-mark-dark.png" alt="SALX" /></div><div className="section-index">SOULBOUND TOKEN</div></div>
        <div className="certificate-main"><div className="beneficiary-label">BENEFICIARY</div><h2>Công ty Cổ phần Sữa Vinamilk</h2><div className="certificate-total">{amount} SAL <span>({amount} TONS CO₂e)</span></div></div>
        <div className="certificate-bottom"><a href="https://sepolia.etherscan.io" target="_blank" rel="noreferrer" className="hash-link">0x9e65…7526 <ExternalLink size={14}/></a><div className="verified"><Check size={18}/></div></div>
      </section></Reveal>
    </div>
  </div>;
}

function App() {
  return <AppShell><Routes><Route path="/" element={<Home/>}/><Route path="/market" element={<Market/>}/><Route path="/leaderboard" element={<Leaderboard/>}/><Route path="/retire" element={<Retire/>}/><Route path="*" element={<Home/>}/></Routes></AppShell>;
}

createRoot(document.getElementById('root')).render(<BrowserRouter><App /></BrowserRouter>);
