import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, ArrowUpRight, Check, Code2, Copy, Github, Layers, Menu, RotateCcw, Settings2, Sparkles, X } from 'lucide-react';
import { Button, Input, Progress, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, UIThemeProvider, useUITheme, presentation } from '@zanehu-ai/x-ui';
import '../src/theme/styles.css';
import { ComponentSidebar } from './ComponentSidebar.jsx';
import inventory from './component-inventory.json';
import examples from './component-examples.json';
import './catalog.css';
import './site.css';
import './typography.css';

const repository = 'https://github.com/zanehu-ai/x-ui';
const FormsPanel = lazy(() => import('./panels/forms.jsx').then(module => ({ default: module.FormsPanel })));
const DataPanel = lazy(() => import('./panels/data.jsx').then(module => ({ default: module.DataPanel })));
const OverlaysPanel = lazy(() => import('./panels/overlays.jsx').then(module => ({ default: module.OverlaysPanel })));
const NavigationPanel = lazy(() => import('./panels/navigation.jsx').then(module => ({ default: module.NavigationPanel })));
const ChatPanel = lazy(() => import('./panels/chat.jsx').then(module => ({ default: module.ChatPanel })));
const FoundationPanel = lazy(() => import('./panels/foundation.jsx').then(module => ({ default: module.FoundationPanel })));
const MotionPanel = lazy(() => import('./panels/motion.jsx').then(module => ({ default: module.MotionPanel })));
const DocsPage = lazy(() => import('./DocsPage.jsx').then(module => ({ default: module.DocsPage })));
const groups = [
  { id: 'foundation', label: 'Theme & feedback', description: 'Appearance, loading states, contextual help, and view selection.', component: FoundationPanel },
  { id: 'forms', label: 'Buttons & forms', description: 'Actions, fields, choices, and validation.', component: FormsPanel },
  { id: 'data', label: 'Data & display', description: 'Tables, content, states, and structured information.', component: DataPanel },
  { id: 'overlays', label: 'Dialogs & menus', description: 'Contextual actions, confirmations, and overlays.', component: OverlaysPanel },
  { id: 'navigation', label: 'Navigation & layout', description: 'Navigation, shells, toolbars, tabs, and filters.', component: NavigationPanel },
  { id: 'chat', label: 'Chat', description: 'Messages, conversations, language, and human handoff.', component: ChatPanel },
  { id: 'details', label: 'Detail & configuration', description: 'The opt-in presentation namespace for detail screens.', component: DetailsPanel },
];
const exportCount = Object.values(inventory).flat().length;
const namesAtHash = () => Object.keys(examples).find(name => examples[name] === window.location.hash.slice(1)) || null;

function DetailsPanel() {
  const { DescriptionSummary, DescriptionSection, DescriptionItem, ConfigFieldGrid } = presentation;
  return <div className="demo-grid detail-examples">
    <article className="demo-card" id="details-description" tabIndex={-1}><h3>Description list</h3><p className="demo-caption">presentation.DescriptionSummary · DescriptionSection · DescriptionItem</p><div className="demo-stack"><DescriptionSummary title="Workspace settings" subtitle="Sample data"/><DescriptionSection title="Workspace"><DescriptionItem label="Name">Design studio</DescriptionItem><DescriptionItem label="Status">Active</DescriptionItem><DescriptionItem label="Region">Asia</DescriptionItem><DescriptionItem label="Notes"/></DescriptionSection></div></article>
    <article className="demo-card" id="details-config" tabIndex={-1}><h3>Configuration fields</h3><p className="demo-caption">presentation.ConfigFieldGrid</p><ConfigFieldGrid row={{ name: 'Design studio', enabled: true, limit: 0, contact: null, rules: { mode: 'manual' } }} fields={[{ key: 'name', label: 'Workspace' }, { key: 'enabled', label: 'Enabled' }, { key: 'limit', label: 'Limit', hint: 'Zero remains a real value.' }, { key: 'contact', label: 'Contact' }, { key: 'rules', label: 'Rules' }]} labels={{ emptyValue: '—', yes: 'Yes', no: 'No' }}/></article>
  </div>;
}

function CollectionContent({ component: Panel, selected }) {
  useEffect(() => {
    if (!selected) return;
    const target = document.getElementById(examples[selected]);
    if (!target) return;
    const frame = window.requestAnimationFrame(() => {
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selected]);
  return <Panel/>;
}

function CopyCode({ children, label = 'Example code' }) {
  const [status, setStatus] = useState('');
  async function copy() {
    try { await navigator.clipboard.writeText(children); setStatus('Copied'); }
    catch { setStatus('Select the code to copy it.'); }
  }
  return <div className="site-code"><div className="code-toolbar"><span>{label}</span><button type="button" onClick={copy} aria-label={`Copy ${label.toLowerCase()}`}>{status === 'Copied' ? <Check size={14}/> : <Copy size={14}/>} {status === 'Copied' ? 'Copied' : 'Copy'}</button></div><pre><code>{children}</code></pre><span className="sr-only" role="status">{status}</span></div>;
}

function Header({ path }) {
  const { theme, setTheme } = useUITheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = event => { if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);
  return <header className="site-header">
    <a className="site-brand" href="/" aria-label="x-ui by OpcOrbit home"><span className="wordmark">x-ui<span> / </span></span><span className="wordmark brand-owner">OPCORBIT</span></a>
    <nav aria-label="Main navigation" className={menuOpen ? 'site-nav is-open' : 'site-nav'} id="site-navigation"><a href="/components" aria-current={path === '/components' ? 'page' : undefined}>Components</a><a href="/docs" aria-current={path === '/docs' ? 'page' : undefined}>Documentation</a><a href="/motion" aria-current={path === '/motion' ? 'page' : undefined}>Motion <span className="nav-dot"/></a></nav>
    <div className="site-header-actions"><a className="release-badge" href="/docs#docs-releases">0.2 PREVIEW</a><Select value={theme} onValueChange={setTheme}><SelectTrigger className="appearance-trigger" aria-label="Appearance"><SelectValue/></SelectTrigger><SelectContent align="end" sideOffset={8} className="appearance-menu"><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem><SelectItem value="system">System</SelectItem></SelectContent></Select><a className="github-icon" href={repository} target="_blank" rel="noreferrer" aria-label="x-ui on GitHub"><Github size={19}/></a><button type="button" className="site-menu-button" ref={menuButton} aria-expanded={menuOpen} aria-controls="site-navigation" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={20}/> : <Menu size={20}/>}</button></div>
  </header>;
}

function WorkspacePreview() {
  const [name, setName] = useState('Design studio');
  const [view, setView] = useState('weekly');
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('All systems in orbit.');
  useEffect(() => {
    if (!saving) return;
    const timer = setTimeout(() => { setSaving(false); setStatus('Sample preferences saved.'); }, 850);
    return () => clearTimeout(timer);
  }, [saving]);
  return <div className="hero-preview" aria-label="Interactive x-ui workspace example">
    <div className="preview-topline"><span className="preview-dots"><i/><i/><i/></span><span>workspace / preferences</span><Code2 size={14}/></div>
    <div className="preview-shell"><aside aria-hidden="true"><span className="preview-x">x</span><Layers size={16}/><Settings2 size={16}/><span className="preview-avatar">D</span></aside><div className="preview-form">
      <div className="preview-form-heading"><div><p className="overline">YOUR WORKSPACE</p><h2>A little more you.</h2></div><span className="demo-avatar">DS</span></div>
      <form onSubmit={event => { event.preventDefault(); setSaving(true); setStatus('Saving sample preferences…'); }}><Input label="Workspace name" value={name} onChange={event => setName(event.target.value)} required disabled={saving}/><div className="preview-field"><label htmlFor="hero-view">Activity report</label><Select value={view} onValueChange={setView}><SelectTrigger id="hero-view" aria-label="Activity report"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="daily">Every day</SelectItem><SelectItem value="weekly">Every week</SelectItem><SelectItem value="monthly">Every month</SelectItem></SelectContent></Select></div><label className="preview-switch" htmlFor="hero-notifications"><span><strong>Keep me in the loop</strong><small>Updates that matter to your workspace.</small></span><Switch id="hero-notifications" checked={notifications} onCheckedChange={setNotifications}/></label><div className="preview-save-row"><span role="status"><span className="status-dot"/>{status}</span><Button type="submit" loading={saving}>Save changes <ArrowRight size={14}/></Button></div></form>
    </div></div><div className="preview-bottomline"><span>REAL COMPONENTS. SAMPLE DATA.</span><span>REACT / x-ui</span></div>
  </div>;
}

function HomePage() {
  return <main id="site-main" className="home-page">
    <section className="home-hero"><div className="hero-orbit" aria-hidden="true"><span/><span/><span/></div><div className="hero-text"><p className="eyebrow"><span className="status-dot"/> THE x-ui COMPONENT LIBRARY</p><h1>Interfaces,<br/><span>in orbit.</span></h1><p className="home-intro">A shared React library for the details<br className="desktop-break"/> that make an application feel whole.</p><div className="home-hero-actions"><a className="hero-primary" href="/components">Explore components <ArrowRight size={17}/></a><a className="text-link" href="/docs">Get started <ArrowUpRight size={16}/></a></div><p className="hero-footnote">REACT 18.3 / 19 <span>·</span> LIGHT / DARK / SYSTEM</p></div><WorkspacePreview/></section>
    <section className="library-strip" aria-label="Library overview"><div><span className="strip-number">{exportCount}</span><span>Visual exports &amp; aliases</span></div><div><span className="strip-number">07</span><span>Component collections</span></div><div><span className="strip-icon"><Layers size={23}/></span><span>One shared visual language</span></div><a href="/docs#docs-releases">Explore the source preview <ArrowUpRight size={17}/></a></section>
    <section className="home-components"><div className="section-intro"><div><p className="eyebrow">01 / THE BUILDING BLOCKS</p><h2>Small parts.<br/>A complete picture.</h2></div><p>From a single input to the surrounding workspace.<br/>Explore the actual components and their states.</p></div><div className="component-lineup">{[{ name: 'Button', copy: 'A clear next action.', sample: <span className="sample-button">Continue <ArrowRight size={14}/></span> }, { name: 'Select', copy: 'One choice, made easy.', sample: <span className="sample-select">Design studio <span>⌄</span></span> }, { name: 'Tabs', copy: 'Space for every view.', sample: <span className="sample-tabs"><span>Overview</span><span>Activity</span></span> }, { name: 'Progress', copy: 'Keep the next step visible.', sample: <Progress value={68} label="Example progress"/> }].map(item => <a key={item.name} href={`/components#${examples[item.name]}`} className="component-tile"><div className="component-tile-sample">{item.sample}</div><div className="component-tile-label"><h3>{item.name}</h3><ArrowUpRight size={17}/></div><p>{item.copy}</p></a>)}</div><a className="text-link" href="/components">Browse every collection <ArrowRight size={16}/></a></section>
    <section className="design-language"><div className="language-heading"><p className="eyebrow">02 / A SHARED LANGUAGE</p><h2>Quiet by design.<br/>Expressive in use.</h2><a className="hero-secondary" href="/docs#docs-theming">Explore the foundations <ArrowRight size={16}/></a></div><div className="language-rows"><a href="/docs#docs-theming"><span className="language-number">01</span><div><h3>Appearance that belongs.</h3><p>Light, dark, and system. A scoped palette that follows your components into their menus and overlays.</p></div><ArrowUpRight size={18}/></a><a href="/motion"><span className="language-number">02</span><div><h3>Motion with a purpose.</h3><p>Subtle feedback for the moments that change. An explicit off switch and respect for reduced motion.</p></div><ArrowUpRight size={18}/></a><a href="/docs#docs-responsive"><span className="language-number">03</span><div><h3>Make room for every screen.</h3><p>Responsive examples and practical guidance for desktop and mobile web integration.</p></div><ArrowUpRight size={18}/></a></div></section>
    <section className="home-start"><div><p className="eyebrow">03 / START BUILDING</p><h2>Your next interface<br/>starts here.</h2><p>Keep your product logic. Share the foundations.</p><a className="hero-primary" href="/docs#docs-installation">Read the setup guide <ArrowRight size={16}/></a></div><CopyCode label="React / first component">{"import { Button } from '@zanehu-ai/x-ui'\n\nexport function YourNextAction() {\n  return (\n    <Button onClick={() => console.log('Ready')}>\n      Start something\n    </Button>\n  )\n}"}</CopyCode></section>
  </main>;
}

function ComponentExplorer() {
  const [selected, setSelected] = useState(namesAtHash);
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggle = useRef(null);
  const close = () => { setMobileOpen(false); toggle.current?.focus(); };
  const showAll = () => { setSelected(null); setQuery(''); setMobileOpen(false); };
  useEffect(() => {
    const media = window.matchMedia('(max-width: 780px)');
    const closeOnDesktop = () => { if (!media.matches) setMobileOpen(false); };
    media.addEventListener('change', closeOnDesktop);
    return () => media.removeEventListener('change', closeOnDesktop);
  }, []);
  useEffect(() => { const update = () => { const id = window.location.hash.slice(1); setSelected(current => current && examples[current] === id ? current : namesAtHash()); setQuery(''); }; window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update); }, []);
  useEffect(() => {
    if (!mobileOpen) return;
    const panel = document.getElementById('component-sidebar');
    panel?.querySelector('input')?.focus();
    const onKey = event => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key !== 'Tab') return;
      const nodes = [...panel.querySelectorAll('button:not([disabled]),a[href],input')].filter(node => node.getClientRects().length);
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (!panel.contains(document.activeElement) || (!event.shiftKey && document.activeElement === last)) { event.preventDefault(); first?.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    const before = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = before; };
  }, [mobileOpen]);
  const term = query.trim().toLowerCase();
  const visibleGroups = groups.filter(group => selected ? inventory[group.id].includes(selected) : !term || [group.label, ...inventory[group.id]].join(' ').toLowerCase().includes(term));
  const importCode = selected && inventory.details.includes(selected) ? `import { presentation } from '@zanehu-ai/x-ui'\n\nconst { ${selected} } = presentation` : `import { ${selected || 'Button, Input, Select'} } from '@zanehu-ai/x-ui'`;
  return <div className="explorer-page">
    <div className="explorer-mobile-bar"><button ref={toggle} type="button" onClick={() => setMobileOpen(true)} aria-expanded={mobileOpen} aria-controls="component-sidebar"><Menu size={16}/> Components</button><span>{selected || 'All components'}</span></div>
    {mobileOpen && <button className="component-nav-backdrop" type="button" aria-label="Close component navigation" onClick={close}/>}
    <ComponentSidebar groups={groups} selected={selected} query={query} onQueryChange={value => { setQuery(value); setSelected(null); }} onSelect={name => { setSelected(name); setQuery(''); setMobileOpen(false); }} onShowAll={showAll} mobileOpen={mobileOpen} onClose={close}/>
    <main id="site-main" tabIndex={-1} className="explorer-main" data-view={selected ? 'single' : 'all'}><div className="explorer-heading"><p className="eyebrow">COMPONENTS / {selected ? visibleGroups[0]?.label.toUpperCase() : 'THE LIBRARY'}</p><h1>{selected || (query ? 'Search results' : 'Find your building blocks.')}</h1><p>{selected ? 'Try the component below. Every example uses sample data and the current source preview.' : 'Explore the components, their parts, and the states between them.'}</p></div>
      <div className="source-preview-note"><span>0.2.0-rc.0</span><p>Unpublished source preview. <a href="/docs#docs-releases">Release availability <ArrowUpRight size={11}/></a></p></div>
      {selected && <><style>{`.explorer-main[data-view="single"] .demo-card:not(#${examples[selected]}){display:none}`}</style><CopyCode label={inventory.details.includes(selected) ? 'Presentation namespace' : 'Import'}>{importCode}</CopyCode></>}
      {visibleGroups.length === 0 && <div className="gallery-empty"><h2>No components found.</h2><p>Try Button, Select, Dialog, Table, or Chat.</p><button className="hero-secondary" onClick={showAll}>Clear search</button></div>}
      {visibleGroups.map(group => <section className="collection" key={group.id} id={`collection-${group.id}`}><div className="collection-heading"><div><p className="overline">{String(groups.indexOf(group) + 1).padStart(2, '0')} / COLLECTION</p><h2>{group.label}</h2><p>{group.description}</p></div><span className="export-count">{inventory[group.id].length} exports</span></div><Suspense fallback={<p role="status" className="demo-note">Loading examples…</p>}><CollectionContent component={group.component} selected={selected}/></Suspense></section>)}
      <div className="explorer-next"><p>Make the examples work in your application.</p><a className="text-link" href="/docs">Read the integration guide <ArrowRight size={15}/></a></div>
    </main>
  </div>;
}

function MotionPage({ motionEnabled, setMotionEnabled, prefersReduced }) {
  const [replayToken, setReplayToken] = useState(0);
  const reducedMotion = prefersReduced || !motionEnabled;
  return <main id="site-main" className="motion-page"><div className="motion-page-heading"><p className="eyebrow">FOUNDATIONS / MOTION</p><h1>Small movements.<br/><span>Clear feedback.</span></h1><p>Movement should help you understand what changed.<br/>Try the controls. Turn it off. The interface still works.</p><div className="motion-controls"><button className="hero-secondary" type="button" aria-pressed={!motionEnabled} disabled={prefersReduced} onClick={() => setMotionEnabled(value => !value)}>{reducedMotion ? 'Motion off' : 'Turn motion off'}</button><button className="hero-primary" type="button" disabled={reducedMotion} onClick={() => setReplayToken(value => value + 1)}><RotateCcw size={15}/> Replay motion</button></div><p className="motion-setting" role="status">{prefersReduced ? 'Reduced motion follows your system preference.' : reducedMotion ? 'Motion is off. Controls respond immediately.' : 'Motion is on. Try saving, switching, and loading.'}</p></div><MotionPanel replayToken={replayToken} reducedMotion={reducedMotion}/><div className="motion-explainer"><p className="eyebrow">DESIGNED TO SUPPORT THE ACTION</p><h2>Feedback first.<br/>Animation second.</h2><p>Scoped motion follows the theme provider, including its portals. Your system’s reduced-motion preference takes priority.</p><a className="text-link" href="/docs#docs-motion">Implement motion <ArrowRight size={16}/></a></div></main>;
}

function Footer() {
  return <footer className="site-footer"><div className="footer-top"><a className="site-brand" href="/"><span className="wordmark">x-ui<span> / </span></span><span className="wordmark brand-owner">OPCORBIT</span></a><p>Shared foundations.<br/>Room for your own ideas.</p><nav aria-label="Footer navigation"><a href="/components">Components</a><a href="/docs">Documentation</a><a href={repository} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={12}/></a></nav></div><div className="footer-bottom"><span>x-ui by OpcOrbit</span><span>MIT LICENSE / REACT LIBRARY</span><a href="/docs#docs-releases">Source preview · 0.2.0-rc.0</a></div></footer>;
}

function Site({ motionEnabled, setMotionEnabled }) {
  const { resolvedTheme } = useUITheme();
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const [prefersReduced, setPrefersReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { const media = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setPrefersReduced(media.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update); }, []);
  useEffect(() => { document.documentElement.dataset.theme = resolvedTheme; document.documentElement.dataset.motion = prefersReduced || !motionEnabled ? 'reduced' : 'full'; document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolvedTheme === 'dark' ? '#0a0a0a' : '#fafafa'); }, [resolvedTheme, prefersReduced, motionEnabled]);
  useEffect(() => { const title = { '/': 'Interfaces, in orbit.', '/components': 'Components', '/docs': 'Documentation', '/motion': 'Motion' }[path] || 'Page not found'; document.title = `${title} — x-ui / OpcOrbit`; document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://ui.opcorbit.com${path}`); }, [path]);
  return <div className="official-site"><a className="skip-link" href="#site-main">Skip to content</a><Header path={path}/><Suspense fallback={<main id="site-main" tabIndex={-1} className="not-found"><p role="status">Loading the library…</p></main>}>{path === '/' ? <HomePage/> : path === '/components' ? <ComponentExplorer/> : path === '/docs' ? <DocsPage/> : path === '/motion' ? <MotionPage motionEnabled={motionEnabled} setMotionEnabled={setMotionEnabled} prefersReduced={prefersReduced}/> : <main id="site-main" className="not-found"><p className="eyebrow">404 / OUT OF ORBIT</p><h1>Let’s get you back.</h1><p>This page isn’t part of the library.</p><a className="hero-primary" href="/">Back to x-ui <ArrowRight size={16}/></a></main>}</Suspense><Footer/></div>;
}

function Root() {
  const [motionEnabled, setMotionEnabled] = useState(() => {
    try { return window.localStorage.getItem('x-ui-site-motion') !== 'off'; }
    catch { return true; }
  });
  useEffect(() => {
    try { window.localStorage.setItem('x-ui-site-motion', motionEnabled ? 'auto' : 'off'); }
    catch { /* Preference changes still work when storage is unavailable. */ }
  }, [motionEnabled]);
  return <UIThemeProvider defaultTheme="dark" storageKey="x-ui-site-theme" motion={motionEnabled ? 'auto' : 'off'}><Site motionEnabled={motionEnabled} setMotionEnabled={setMotionEnabled}/></UIThemeProvider>;
}
const appRoot = import.meta.hot?.data.root ?? createRoot(document.getElementById('root'));
if (import.meta.hot) { import.meta.hot.data.root = appRoot; import.meta.hot.accept(); }
appRoot.render(<Root/>);
