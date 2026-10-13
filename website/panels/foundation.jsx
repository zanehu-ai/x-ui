import React, { useEffect, useRef, useState } from 'react';
import { Info, Check, Settings2 } from 'lucide-react';
import {
  Button, Input, Switch, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Skeleton, Spinner, Progress, Popover, PopoverRoot, PopoverTrigger, PopoverContent, PopoverClose,
  Tooltip, TooltipRoot, TooltipProvider, TooltipTrigger, TooltipContent, SegmentedControl, SegmentedControlItem,
} from '@zanehu-ai/x-ui';

export function FoundationPanel() {
  const [view, setView] = useState('overview');
  const [name, setName] = useState('Design studio');
  const [savedName, setSavedName] = useState('Design studio');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('All changes saved.');
  const [notifications, setNotifications] = useState(true);
  const [dataState, setDataState] = useState('ready');
  const [progress, setProgress] = useState(65);
  const timer = useRef();
  const [dialogOpen, setDialogOpen] = useState(false);
  useEffect(() => () => clearTimeout(timer.current), []);
  function save(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setStatus('Saving sample changes…');
    timer.current = setTimeout(() => {
      setSavedName(name); setSaving(false); setDialogOpen(false); setStatus('Sample changes saved.');
    }, 900);
  }
  return <TooltipProvider delayDuration={150}><div className="demo-grid foundation-grid">
    <article className="demo-card demo-card-wide foundation-workspace" id="foundation-workspace" tabIndex={-1}>
      <p className="demo-eyebrow">SHARED THEME / SOURCE PREVIEW</p>
      <div className="foundation-title"><div><h3>{savedName}</h3><p className="demo-caption">One form, with the same palette in its dialog and contextual controls.</p></div>
        <Popover><PopoverTrigger asChild><Button variant="outline" size="sm"><Settings2 size={14} aria-hidden="true"/> Quick settings</Button></PopoverTrigger>
          <PopoverContent align="end" className="foundation-popover"><h4>Notifications</h4><label className="foundation-switch"><span>Workspace updates</span><Switch checked={notifications} onCheckedChange={setNotifications}/></label><p>Only this preview's preference changes.</p><PopoverClose asChild><Button size="sm" variant="outline">Done</Button></PopoverClose></PopoverContent>
        </Popover>
      </div>
      <SegmentedControl label="Workspace view" value={view} onValueChange={setView}><SegmentedControlItem value="overview">Overview</SegmentedControlItem><SegmentedControlItem value="activity">Activity</SegmentedControlItem></SegmentedControl>
      <div className="foundation-content">{view==='overview'?<><dl><div><dt>Workspace</dt><dd>{savedName}</dd></div><div><dt>Notifications</dt><dd>{notifications?'Enabled':'Off'}</dd></div><div><dt>Visibility</dt><dd>Private</dd></div></dl>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogTrigger asChild><Button>Edit workspace</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Edit workspace</DialogTitle><DialogDescription>A local form showing shared appearance and loading feedback.</DialogDescription></DialogHeader><form onSubmit={save}><Input label="Workspace name" value={name} onChange={e=>setName(e.target.value)} required disabled={saving}/><DialogFooter className="mt-6"><Button type="button" variant="outline" disabled={saving} onClick={()=>setDialogOpen(false)}>Cancel</Button><Button type="submit" loading={saving}>Save workspace</Button></DialogFooter></form></DialogContent></Dialog>
      </>:<p className="foundation-activity"><Check size={16} aria-hidden="true"/>{status}</p>}</div>
      <output className="demo-status" role="status">{status}</output>
    </article>
    <article className="demo-card" id="foundation-data-states" tabIndex={-1}><div className="foundation-title"><h3>Data states</h3><Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" aria-label="Explain data states"><Info size={16}/></Button></TooltipTrigger><TooltipContent>Loading, errors and empty results have different meanings.</TooltipContent></Tooltip></div><p className="demo-caption">Skeleton · Spinner · explicit recovery</p>
      <SegmentedControl label="Data state" value={dataState} onValueChange={setDataState}>{['ready','loading','error','empty'].map(value=><SegmentedControlItem key={value} value={value}>{value[0].toUpperCase()+value.slice(1)}</SegmentedControlItem>)}</SegmentedControl>
      <div className="foundation-data">{dataState==='loading'||dataState==='ready'?<><Skeleton loading={dataState==='loading'}><div className="foundation-result"><strong>3 sample projects</strong><p>Design system · Console · Research</p></div></Skeleton>{dataState==='loading'&&<span className="foundation-loading"><Spinner label="Loading projects"/> Loading projects…</span>}</>:dataState==='error'?<div role="alert"><strong>Projects could not load.</strong><p>Keep your work and try again.</p><Button size="sm" variant="outline" onClick={()=>setDataState('ready')}>Retry sample</Button></div>:<div><strong>No projects yet.</strong><p>Create your first project when you're ready.</p><Button size="sm" variant="outline" onClick={()=>setDataState('ready')}>Create sample</Button></div>}</div>
    </article>
    <article className="demo-card" id="foundation-progress-help" tabIndex={-1}><h3>Progress and help</h3><p className="demo-caption">Progress · PopoverRoot · TooltipRoot aliases</p><label className="foundation-range">Example progress <span>{progress}%</span><input aria-label="Example progress" type="range" min="0" max="100" value={progress} onChange={e=>setProgress(Number(e.target.value))}/></label><Progress value={progress} label="Sample preparation"/><div className="foundation-loading"><Progress label="Waiting for sample"/><span>Indeterminate</span></div>
      <div className="demo-row"><PopoverRoot><PopoverTrigger asChild><Button size="sm" variant="outline">About this preview</Button></PopoverTrigger><PopoverContent className="foundation-popover"><h4>Local examples</h4><p>These examples use the current source preview. Check release availability before installing the library.</p><PopoverClose asChild><Button size="sm" variant="outline">Close details</Button></PopoverClose></PopoverContent></PopoverRoot><TooltipRoot><TooltipTrigger asChild><Button size="icon" variant="ghost" aria-label="Theme information"><Info size={16}/></Button></TooltipTrigger><TooltipContent>Light, Dark and System use the same component API.</TooltipContent></TooltipRoot></div>
    </article>
  </div></TooltipProvider>;
}
