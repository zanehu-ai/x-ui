import React, { useMemo, useState } from 'react'
import {
  Button, Badge, StatusBadge, Alert, Card, CardHeader, CardTitle, CardContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  DataTable, Pagination, EmptyState, ErrorBoundary,
  ScrollArea, ScrollBar, Separator,
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
  AspectRatio, Avatar, AvatarImage, AvatarFallback,
} from '@zanehu-ai/x-ui'
import { ArrowUpRight, Check, FileText, Play, RotateCcw } from 'lucide-react'

const sampleRows = [
  { id: '01', name: 'Interface exploration', owner: 'Alex', state: 'active', items: 12 },
  { id: '02', name: 'Typography study', owner: 'Morgan', state: 'pending', items: 8 },
  { id: '03', name: 'Interaction notes', owner: 'Sam', state: 'success', items: 24 },
  { id: '04', name: 'Research synthesis', owner: 'Jordan', state: 'processing', items: 18 },
  { id: '05', name: 'Navigation review', owner: 'Alex', state: 'active', items: 6 },
  { id: '06', name: 'Component inventory', owner: 'Sam', state: 'success', items: 36 },
  { id: '07', name: 'Motion experiment', owner: 'Morgan', state: 'pending', items: 4 },
  { id: '08', name: 'Accessibility notes', owner: 'Jordan', state: 'active', items: 15 },
]

function ErrorSample({ fail, onFail }) {
  if (fail) throw new Error('Intentional preview error. No product was affected.')
  return <div className="demo-stack"><p className="demo-caption">The sample is working. Trigger an error to inspect recovery.</p><Button variant="outline" type="button" onClick={onFail}>Trigger sample error</Button></div>
}

export function DataPanel() {
  const [tablePage, setTablePage] = useState(1)
  const [pageSize, setPageSize] = useState(4)
  const [tableState, setTableState] = useState('ready')
  const [standalonePage, setStandalonePage] = useState(1)
  const [standaloneSize, setStandaloneSize] = useState(5)
  const [fail, setFail] = useState(false)
  const [created, setCreated] = useState(false)
  const [status, setStatus] = useState('All records on this page are synthetic.')
  const columns = useMemo(() => [
    { key: 'name', title: 'Project', sortable: true },
    { key: 'owner', title: 'Owner', sortable: true },
    { key: 'items', title: 'Items', sortable: true },
    { key: 'state', title: 'Status', render: value => <StatusBadge status={value} /> },
  ], [])
  const visibleRows = sampleRows.slice((tablePage - 1) * pageSize, tablePage * pageSize)

  return (
    <div className="demo-panel demo-data-panel">
      <div className="demo-grid">
        <section className="demo-card demo-specimen" id="data-badge" tabIndex={-1}>
          <p className="demo-eyebrow">01 / LABELS</p>
          <h3>Badge</h3>
          <p className="demo-caption">Every visual variant, with meaning expressed in text.</p>
          <div className="demo-row demo-wrap">
            {['default', 'neutral', 'success', 'warning', 'danger', 'info', 'secondary'].map(variant => <Badge key={variant} variant={variant}>{variant}</Badge>)}
          </div>
        </section>

        <section className="demo-card demo-specimen" id="data-status-badge" tabIndex={-1}>
          <p className="demo-eyebrow">02 / STATE</p>
          <h3>StatusBadge</h3>
          <p className="demo-caption">Automatic colors from raw status values.</p>
          <div className="demo-row demo-wrap">
            {['active', 'pending', 'processing', 'failed', 'cancelled', 'unknown'].map(value => <StatusBadge key={value} status={value} />)}
          </div>
          <div className="demo-row demo-wrap" style={{ marginTop: 14 }}>
            <StatusBadge status="inactive" /><StatusBadge status="unread" /><StatusBadge status={1} /><StatusBadge status={0} />
          </div>
          <p className="demo-meta">Edge cases retain existing package behavior, including substring-based colors.</p>
        </section>

        <section className="demo-card demo-specimen demo-span-full" id="data-alert" tabIndex={-1}>
          <p className="demo-eyebrow">03 / FEEDBACK</p>
          <h3>Alert</h3>
          <div className="demo-stack">
            <Alert variant="neutral">Neutral — this workspace is a local preview.</Alert>
            <Alert variant="success">Success — your sample changes are ready.</Alert>
            <Alert variant="warning">Warning — one sample field needs review.</Alert>
            <Alert variant="danger">Danger — the sample action could not finish.</Alert>
            <Alert variant="info">Info — select a component to explore its states.</Alert>
          </div>
        </section>

        <section className="demo-card demo-specimen" id="data-card" tabIndex={-1}>
          <p className="demo-eyebrow">04 / CONTAINER</p>
          <h3>Card</h3>
          <Card className="demo-inner-card">
            <CardHeader><CardTitle>One place for the next idea.</CardTitle></CardHeader>
            <CardContent>
              <p className="demo-caption">An example of CardHeader, CardTitle and CardContent working together.</p>
              <Button variant="outline" type="button" onClick={() => setStatus('Example project opened.')} style={{ marginTop: 16 }}>Explore sample <ArrowUpRight size={16} aria-hidden="true" /></Button>
            </CardContent>
          </Card>
        </section>

        <section className="demo-card demo-specimen" id="data-empty-state" tabIndex={-1}>
          <p className="demo-eyebrow">05 / EMPTY STATE</p>
          <h3>EmptyState</h3>
          {created ? <div className="demo-stack"><Alert variant="success">Your sample project is ready.</Alert><Button variant="outline" type="button" onClick={() => setCreated(false)}><RotateCcw size={16} aria-hidden="true" /> Reset example</Button></div> :
            <EmptyState title="Make room for your first idea." description="Start with a small project. Every example here stays local." action={<Button type="button" onClick={() => setCreated(true)}>Create sample project</Button>} />}
        </section>

        <section className="demo-card demo-specimen demo-span-full" id="data-table" tabIndex={-1}>
          <p className="demo-eyebrow">06 / STRUCTURE</p>
          <h3>Table</h3>
          <p className="demo-caption">The primitive table: header, body, rows, headings and cells.</p>
          <div className="demo-table-wrap">
            <Table>
              <TableHeader><TableRow><TableHead>Component</TableHead><TableHead>Purpose</TableHead><TableHead>Availability</TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow><TableCell>Table</TableCell><TableCell>Present structured records</TableCell><TableCell><Badge variant="neutral">Published</Badge></TableCell></TableRow>
                <TableRow><TableCell>DataTable</TableCell><TableCell>Sort and page through records</TableCell><TableCell><Badge variant="neutral">Published</Badge></TableCell></TableRow>
                <TableRow><TableCell>Pagination</TableCell><TableCell>Navigate result pages</TableCell><TableCell><Badge variant="neutral">Published</Badge></TableCell></TableRow>
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="demo-card demo-specimen demo-span-full" id="data-data-table" tabIndex={-1}>
          <p className="demo-eyebrow">07 / COLLECTION</p>
          <h3>DataTable</h3>
          <div className="demo-row demo-wrap" style={{ marginBottom: 16 }}>
            {['ready', 'loading', 'empty'].map(value => <Button key={value} variant={tableState === value ? 'primary' : 'outline'} type="button" size="sm" aria-pressed={tableState === value} onClick={() => setTableState(value)}>{value[0].toUpperCase() + value.slice(1)}</Button>)}
          </div>
          <div className="demo-table-wrap">
            <DataTable
              columns={columns}
              data={tableState === 'empty' ? [] : visibleRows}
              getRowKey={row => row.id}
              loading={tableState === 'loading'}
              enableSorting
              page={tablePage}
              pageSize={pageSize}
              total={tableState === 'empty' ? 0 : sampleRows.length}
              onPageChange={tableState === 'empty' ? undefined : setTablePage}
              onPageSizeChange={size => { setPageSize(size); setTablePage(1) }}
              pageSizeOptions={[4, 8]}
              loadingText="Loading sample records…"
              emptyText="No sample records in this state."
              paginationLabels={{ total: '{total} records · Page {page} of {pages}', prev: 'Previous', next: 'Next' }}
            />
          </div>
          <p className="demo-meta">Click a column label to sort the current page. Pagination is controlled with local sample data.</p>
        </section>

        <section className="demo-card demo-specimen demo-span-full" id="data-pagination" tabIndex={-1}>
          <p className="demo-eyebrow">08 / PAGINATION</p>
          <h3>Pagination</h3>
          <p className="demo-caption">Controlled page navigation and page size, shown independently.</p>
          <div className="demo-pagination-wrap"><Pagination page={standalonePage} pageSize={standaloneSize} total={30} onPageChange={setStandalonePage} onPageSizeChange={size => { setStandaloneSize(size); setStandalonePage(1) }} pageSizeOptions={[5, 10, 15]} labels={{ total: '{total} examples · Page {page} of {pages}', prev: 'Previous', next: 'Next', perPage: '{size} per page' }} /></div>
        </section>

        <section className="demo-card demo-specimen" id="data-error-boundary" tabIndex={-1}>
          <p className="demo-eyebrow">09 / RECOVERY</p>
          <h3>ErrorBoundary</h3>
          <ErrorBoundary fallback={(error, reset) => (
            <div className="demo-stack">
              <Alert variant="danger">{error.message}</Alert>
              <Button variant="outline" type="button" onClick={() => { setFail(false); reset(); setStatus('The error boundary was reset successfully.') }}><RotateCcw size={16} aria-hidden="true" /> Reset error boundary</Button>
            </div>
          )}>
            <ErrorSample fail={fail} onFail={() => setFail(true)} />
          </ErrorBoundary>
          <p className="demo-meta">The error is intentional. Reset restores the example without reloading the page.</p>
        </section>

        <section className="demo-card demo-specimen" id="data-scroll-area" tabIndex={-1}>
          <p className="demo-eyebrow">10 / OVERFLOW</p>
          <h3>ScrollArea / ScrollBar</h3>
          <p className="demo-caption">A bounded viewport with vertical and horizontal scrolling.</p>
          <ScrollArea className="demo-scroll-area" type="always" style={{ height: 220, width: '100%', border: '1px solid var(--border, #ddd)', borderRadius: 8 }}>
            <div className="demo-scroll-content" style={{ minWidth: 540, padding: 20 }}>
              {sampleRows.map((row, index) => <div key={row.id}><div className="demo-row" style={{ display: 'flex', justifyContent: 'space-between', gap: 24, padding: '12px 0' }}><span>{row.name}</span><span className="demo-caption">{row.owner} · {row.items} items</span></div>{index < sampleRows.length - 1 && <Separator />}</div>)}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>

        <section className="demo-card demo-specimen" id="data-separator" tabIndex={-1}>
          <p className="demo-eyebrow">11 / RHYTHM</p>
          <h3>Separator</h3>
          <div className="demo-stack">
            <p className="demo-caption">Horizontal separation</p><Separator />
            <div className="demo-row" style={{ display: 'flex', alignItems: 'center', gap: 16, height: 28 }}><span>Explore</span><Separator orientation="vertical" /><span>Build</span><Separator orientation="vertical" /><span>Reflect</span></div>
          </div>
        </section>

        <section className="demo-card demo-specimen" id="data-accordion" tabIndex={-1}>
          <p className="demo-eyebrow">12 / PROGRESSIVE DISCLOSURE</p>
          <h3>Accordion</h3>
          <Accordion type="single" collapsible defaultValue="one">
            <AccordionItem value="one"><AccordionTrigger>What can I explore here?</AccordionTrigger><AccordionContent>x-ui source components with local state and synthetic examples.</AccordionContent></AccordionItem>
            <AccordionItem value="two"><AccordionTrigger>Does this change my application?</AccordionTrigger><AccordionContent>No. These examples use sample data in your browser. Your application stays separate.</AccordionContent></AccordionItem>
            <AccordionItem value="three"><AccordionTrigger>How do I compare interaction states?</AccordionTrigger><AccordionContent>Open menus, switch controls, sort the table and reset the error example.</AccordionContent></AccordionItem>
          </Accordion>
        </section>

        <section className="demo-card demo-specimen" id="data-aspect-ratio" tabIndex={-1}>
          <p className="demo-eyebrow">13 / MEDIA FRAME</p>
          <h3>AspectRatio</h3>
          <AspectRatio ratio={16 / 9} className="demo-aspect-ratio" style={{ background: 'var(--muted, #f1f1f1)', border: '1px solid var(--border, #ddd)', borderRadius: 8 }}>
            <img src="/avatar.svg" alt="Example avatar" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:8}}/>
          </AspectRatio>
        </section>

        <section className="demo-card demo-specimen" id="data-avatar" tabIndex={-1}>
          <p className="demo-eyebrow">14 / IDENTITY</p>
          <h3>Avatar</h3>
          <div className="demo-row demo-wrap" style={{ gap: 20 }}>
            <Avatar style={{ width: 56, height: 56 }}><AvatarImage src="/avatar.svg" alt="Sample user avatar" /><AvatarFallback>AL</AvatarFallback></Avatar>
            <Avatar style={{ width: 44, height: 44 }}><AvatarFallback><Check size={18} aria-hidden="true" /><span className="sr-only">Reviewed</span></AvatarFallback></Avatar>
            <Avatar style={{ width: 36, height: 36 }}><AvatarFallback><FileText size={16} aria-hidden="true" /><span className="sr-only">Document</span></AvatarFallback></Avatar>
          </div>
          <p className="demo-meta">AvatarImage shows an example avatar. The other avatars demonstrate text and icon fallbacks.</p>
        </section>
      </div>
      <output className="demo-status" role="status" aria-live="polite">{status}</output>
    </div>
  )
}
