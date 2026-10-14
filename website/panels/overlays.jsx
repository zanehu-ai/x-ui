import React, { useState } from 'react'
import {
  Button, Input,
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose, DialogOverlay, SimpleDialog,
  AlertDialog, AlertDialogTrigger, AlertDialogPortal, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
  ConfirmDialog, ConfirmButton,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut,
  DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal,
  RowActions,
} from '@zanehu-ai/x-ui'
import { ArrowUpRight, ChevronDown, Copy, MoreHorizontal, Settings2, Trash2 } from 'lucide-react'

export function OverlaysPanel() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [simpleOpen, setSimpleOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [projectName, setProjectName] = useState('Untitled workspace')
  const [savedName, setSavedName] = useState('Untitled workspace')
  const [showDetails, setShowDetails] = useState(true)
  const [density, setDensity] = useState('comfortable')
  const [status, setStatus] = useState('Choose an action to explore the interaction.')

  function saveProject() {
    const name = projectName.trim() || 'Untitled workspace'
    setSavedName(name)
    setStatus(`Workspace renamed to “${name}” in this preview.`)
    setDialogOpen(false)
  }

  return (
    <div className="demo-panel demo-overlays-panel">
      <div className="demo-grid">
        <section className="demo-card demo-specimen" id="overlays-dialog" tabIndex={-1}>
          <p className="demo-eyebrow">01 / COMPOSITION</p>
          <h3>Dialog</h3>
          <p className="demo-caption">A focused edit with a clear title, description and two outcomes.</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" type="button"><Settings2 size={16} aria-hidden="true" /> Edit workspace</Button>
            </DialogTrigger>
            <DialogContent className="demo-dialog">
              <DialogHeader>
                <DialogTitle>Workspace settings</DialogTitle>
                <DialogDescription>Changes stay in this local preview.</DialogDescription>
              </DialogHeader>
              <div className="demo-stack demo-dialog-body">
                <Input label="Workspace name" value={projectName} onChange={event => setProjectName(event.target.value)} />
                <p className="demo-caption">Current name: {savedName}</p>
              </div>
              <DialogFooter className="demo-dialog-footer">
                <DialogClose asChild><Button variant="outline" type="button">Cancel</Button></DialogClose>
                <Button type="button" onClick={saveProject}>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <p className="demo-meta">Trigger · Content · Header · Title · Description · Footer · Close</p>
        </section>

        <section className="demo-card demo-specimen" id="overlays-simple-dialog" tabIndex={-1}>
          <p className="demo-eyebrow">02 / QUICK DETAIL</p>
          <h3>SimpleDialog</h3>
          <p className="demo-caption">The compact wrapper for a single focused piece of information.</p>
          <Button variant="outline" type="button" onClick={() => setSimpleOpen(true)}>View workspace details <ArrowUpRight size={16} aria-hidden="true" /></Button>
          <SimpleDialog open={simpleOpen} onClose={() => setSimpleOpen(false)} title="Workspace details" className="demo-dialog">
            <div className="demo-stack">
              <dl className="demo-definition-list">
                <div><dt>Name</dt><dd>{savedName}</dd></div>
                <div><dt>Visibility</dt><dd>Private preview</dd></div>
                <div><dt>Data</dt><dd>Synthetic examples only</dd></div>
              </dl>
              <Button variant="outline" type="button" onClick={() => setSimpleOpen(false)}>Done</Button>
            </div>
          </SimpleDialog>
        </section>

        <section className="demo-card demo-specimen" id="overlays-alert-dialog" tabIndex={-1}>
          <p className="demo-eyebrow">03 / DECISION</p>
          <h3>AlertDialog</h3>
          <p className="demo-caption">A deliberate confirmation for a consequential action.</p>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="outline" type="button"><Trash2 size={16} aria-hidden="true" /> Reset sample workspace</Button></AlertDialogTrigger>
            <AlertDialogPortal>
              <AlertDialogContent className="demo-dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset this sample workspace?</AlertDialogTitle>
                  <AlertDialogDescription>This resets the name inside the preview. It does not affect any product or saved data.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep workspace</AlertDialogCancel>
                  <AlertDialogAction onClick={() => {
                    setProjectName('Untitled workspace')
                    setSavedName('Untitled workspace')
                    setStatus('Sample workspace reset.')
                  }}>Reset sample</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogPortal>
          </AlertDialog>
          <p className="demo-meta">Portal · Content · Header · Title · Description · Footer · Cancel · Action</p>
        </section>

        <section className="demo-card demo-specimen" id="overlays-confirm-dialog" tabIndex={-1}>
          <p className="demo-eyebrow">04 / CONTROLLED STATE</p>
          <h3>ConfirmDialog</h3>
          <p className="demo-caption">The host controls when the confirmation opens and what happens next.</p>
          <Button variant="outline" type="button" onClick={() => setConfirmOpen(true)}>Archive sample</Button>
          <ConfirmDialog
            open={confirmOpen}
            title="Archive the sample?"
            description="This only records an action in the preview activity line."
            cancelLabel="Keep sample"
            confirmLabel="Archive sample"
            onCancel={() => setConfirmOpen(false)}
            onConfirm={() => { setConfirmOpen(false); setStatus('Sample archived in the preview.') }}
          />
        </section>

        <section className="demo-card demo-specimen" id="overlays-confirm-button" tabIndex={-1}>
          <p className="demo-eyebrow">05 / ONE COMPONENT</p>
          <h3>ConfirmButton</h3>
          <p className="demo-caption">A button and confirmation flow with state managed by the component.</p>
          <ConfirmButton
            label="Remove sample member"
            variant="outline"
            confirmTitle="Remove the sample member?"
            confirmDescription="No real member or account is involved."
            cancelLabel="Cancel"
            confirmLabel="Remove sample"
            onConfirm={() => setStatus('Sample member removed in the preview.')}
          />
        </section>

        <section className="demo-card demo-specimen" id="overlays-dropdown-menu" tabIndex={-1}>
          <p className="demo-eyebrow">06 / CONTEXTUAL TOOLS</p>
          <h3>DropdownMenu</h3>
          <p className="demo-caption">Actions, persistent checkboxes, radio options and a nested menu.</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" type="button">View options <ChevronDown size={16} aria-hidden="true" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent className="demo-popover" align="start">
              <DropdownMenuLabel>Workspace actions</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => setStatus('A sample copy was created.')}><Copy size={14} aria-hidden="true" /> Duplicate sample <DropdownMenuShortcut>Copy</DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={showDetails} onCheckedChange={value => setShowDetails(value === true)}>Show details</DropdownMenuCheckboxItem>
              <DropdownMenuLabel inset>Density</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
                <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Move sample to</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="demo-popover">
                    <DropdownMenuItem onSelect={() => setStatus('Sample moved to Research.')}>Research</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setStatus('Sample moved to Design.')}>Design</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuItem disabled>Share externally</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className={`demo-menu-result demo-density-${density}`}>
            <strong>{savedName}</strong>
            {showDetails && <p className="demo-caption">Private workspace · {density} view</p>}
          </div>
          <p className="demo-meta">CheckboxItem · RadioGroup · RadioItem · Sub · SubTrigger · SubContent · Portal · Shortcut</p>
        </section>

        <section className="demo-card demo-specimen" id="overlays-row-actions" tabIndex={-1}>
          <p className="demo-eyebrow">07 / INLINE ACTIONS</p>
          <h3>RowActions</h3>
          <p className="demo-caption">A compact row with a direct action, confirmation and unavailable state.</p>
          <div className="demo-row demo-row-actions">
            <MoreHorizontal size={18} aria-hidden="true" />
            <RowActions actions={[
              { key: 'open', label: 'Open', variant: 'outline', onAction: () => setStatus('Sample row opened.') },
              { key: 'archive', label: 'Archive', variant: 'outline', confirm: { title: 'Archive this row?', description: 'This is a synthetic preview row.', confirmLabel: 'Archive', cancelLabel: 'Cancel' }, onAction: () => setStatus('Sample row archived.') },
              { key: 'export', label: 'Export', disabled: true, onAction: () => {} },
              { key: 'hidden', label: 'Hidden action', hidden: true, onAction: () => {} },
            ]} />
          </div>
        </section>

        <section className="demo-card demo-specimen" id="overlays-dialog-overlay" tabIndex={-1}>
          <p className="demo-eyebrow">08 / BACKDROP</p>
          <h3>DialogOverlay</h3>
          <p className="demo-caption">The backdrop primitive. Standard DialogContent already supplies one.</p>
          <Dialog open={overlayOpen} onOpenChange={setOverlayOpen}>
            <DialogTrigger asChild><Button variant="outline" type="button">Inspect backdrop</Button></DialogTrigger>
            <DialogOverlay className="demo-backdrop-sample" style={{ position: 'relative', inset: 'auto', marginTop: 16, minHeight: 120, borderRadius: 8 }}>
              <div className="demo-backdrop-inner" style={{ display: 'grid', placeItems: 'center', minHeight: 120 }}>
                <DialogClose asChild><Button type="button" variant="outline">Close backdrop</Button></DialogClose>
              </div>
            </DialogOverlay>
          </Dialog>
          <p className="demo-meta">Inline primitive specimen; use the complete dialog for modal interactions.</p>
        </section>
      </div>
      <output className="demo-status" role="status" aria-live="polite">{status}</output>
    </div>
  )
}
