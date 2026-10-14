import React, { useMemo, useState } from 'react';
import {
  Button,
  FilterBar,
  Input,
  Layout,
  PageHeader,
  SidebarNavigation,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toolbar,
  ToolbarSeparator,
  TopNavigation,
} from '@zanehu-ai/x-ui';

const navigationItems = [
  { label: 'Overview', to: '/preview/overview', end: true },
  {
    label: 'Projects',
    to: '/preview/projects',
    children: [
      { label: 'Research', to: '/preview/projects/research', end: true },
      { label: 'Interface', to: '/preview/projects/interface', end: true },
    ],
  },
  { label: 'Settings', to: '/preview/settings', end: true },
];

const pageNames = {
  '/preview/overview': 'Overview',
  '/preview/projects': 'Projects',
  '/preview/projects/research': 'Research',
  '/preview/projects/interface': 'Interface',
  '/preview/settings': 'Settings',
};

const topItems = [
  { id: 'explore', label: 'Explore', to: 'explore' },
  { id: 'build', label: 'Build', to: 'build' },
  { id: 'review', label: 'Review', to: 'review' },
];

const startingItems = ['Research brief', 'Interface study', 'Release checklist'];

export function NavigationPanel() {
  const [activePath, setActivePath] = useState('/preview/overview');
  const [activeTop, setActiveTop] = useState('explore');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState(startingItems);
  const [tab, setTab] = useState('overview');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [notice, setNotice] = useState('Choose a section, filter the list or add a local draft.');

  const SidebarLink = useMemo(() => function SidebarLink({ to, children, ...props }) {
    return (
      <a
        {...props}
        href={`#demo${to.replaceAll('/', '-')}`}
        onClick={(event) => {
          event.preventDefault();
          setActivePath(to);
          setNotice(`Opened ${pageNames[to]} in this preview.`);
        }}
      >
        {children}
      </a>
    );
  }, []);

  const TopLink = useMemo(() => function TopLink({ to, children, ...props }) {
    return (
      <a
        {...props}
        href={`#demo-top-${to}`}
        onClick={(event) => {
          event.preventDefault();
          setActiveTop(to);
        }}
      >
        {children}
      </a>
    );
  }, []);

  const filteredItems = items.filter((item) => item.toLowerCase().includes(query.toLowerCase()));

  function addDraft() {
    const name = `Untitled draft ${items.length - startingItems.length + 1}`;
    setItems((current) => [...current, name]);
    setQuery('');
    setNotice(`${name} added locally.`);
  }

  return (
    <div className="demo-grid">
      <section className="demo-card demo-card-wide" id="navigation-layout" tabIndex={-1}>
        <h3>Layout &amp; page structure</h3>
        <p className="demo-code-list"><code>Layout</code> <code>PageHeader</code> <code>FilterBar</code> <code>SidebarNavigation</code></p>
        <p className="demo-note">A working local shell. Navigation, filtering and draft creation stay inside the gallery.</p>
        <div className="demo-layout">
          <Layout
            brand={<strong>Workspace / Preview</strong>}
            sidebar={
              <SidebarNavigation
                activePath={activePath}
                ariaLabel="Demo workspace navigation"
                groupLabel="Workspace"
                items={navigationItems}
                LinkComponent={SidebarLink}
                notice="Local specimen · no account required"
              />
            }
          >
            <div className="demo-stack">
              <PageHeader
                eyebrow="Navigation specimen"
                title={pageNames[activePath]}
                description="Follow the active section and work with a small set of sample documents."
                actions={<Button onClick={addDraft}>New draft</Button>}
              />
              <FilterBar>
                <Input
                  label="Find a document"
                  placeholder="Search sample documents"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <Button variant="outline" disabled={!query} onClick={() => setQuery('')}>Clear filter</Button>
              </FilterBar>
              <p className="demo-status" role="status">{notice} {filteredItems.length} document{filteredItems.length === 1 ? '' : 's'} visible.</p>
              {filteredItems.length ? <ul className="demo-list">{filteredItems.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="demo-note">No documents match “{query}”. Clear the filter to show all documents.</p>}
            </div>
          </Layout>
        </div>
      </section>

      <section className="demo-card" id="navigation-top" tabIndex={-1}>
        <h3>Top navigation</h3>
        <p className="demo-code-list"><code>TopNavigation</code></p>
        <div className="demo-navigation demo-stack">
          <TopNavigation activeId={activeTop} ariaLabel="Demo product navigation" items={topItems} LinkComponent={TopLink} />
          <p className="demo-status" role="status">
            {activeTop === 'explore' ? 'Explore ideas and discover reusable components.' : activeTop === 'build' ? 'Build a focused interface from shared primitives.' : 'Review the finished flow and its interaction states.'}
          </p>
        </div>
      </section>

      <section className="demo-card" id="navigation-tabs" tabIndex={-1}>
        <h3>Tabs</h3>
        <p className="demo-code-list"><code>Tabs</code> <code>TabsList</code> <code>TabsTrigger</code> <code>TabsContent</code></p>
        <div className="demo-stack">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList aria-label="Document sections">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="archived" disabled>Archived</TabsTrigger>
            </TabsList>
            <TabsContent value="overview"><p className="demo-note">A compact overview of the current document.</p></TabsContent>
            <TabsContent value="activity"><p className="demo-note">Latest activity: a sample document was created locally.</p></TabsContent>
          </Tabs>
          <Tabs defaultValue="design">
            <TabsList variant="line" aria-label="Line-style tabs">
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            <TabsContent value="design"><p className="demo-note">Line variant · minimal emphasis for supporting navigation.</p></TabsContent>
            <TabsContent value="code"><p className="demo-note">The same Tabs API, using the line variant on TabsList.</p></TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="demo-card demo-card-wide" id="navigation-toolbar" tabIndex={-1}>
        <h3>Toolbar</h3>
        <p className="demo-code-list"><code>Toolbar</code> <code>ToolbarSeparator</code></p>
        <div className="demo-stack">
          <Toolbar aria-label="Sample text formatting">
            <Button variant={bold ? 'primary' : 'outline'} aria-pressed={bold} onClick={() => setBold((value) => !value)}>Bold</Button>
            <Button variant={italic ? 'primary' : 'outline'} aria-pressed={italic} onClick={() => setItalic((value) => !value)}>Italic</Button>
            <ToolbarSeparator />
            <Button variant="outline" disabled={!bold && !italic} onClick={() => { setBold(false); setItalic(false); }}>Reset</Button>
          </Toolbar>
          <p className="demo-preview-text" style={{ fontWeight: bold ? 700 : 400, fontStyle: italic ? 'italic' : 'normal' }}>Make the next action clear.</p>
          <p className="demo-status" role="status">Formatting: {bold ? 'bold' : 'regular'}{italic ? ', italic' : ''}.</p>
        </div>
      </section>
    </div>
  );
}
