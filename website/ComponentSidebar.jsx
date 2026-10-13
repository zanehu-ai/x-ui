import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Check, ChevronRight, Search, X } from 'lucide-react';
import inventory from './component-inventory.json';
import examples from './component-examples.json';

const parts = {
  Popover: ['PopoverRoot', 'PopoverTrigger', 'PopoverContent', 'PopoverClose'],
  Tooltip: ['TooltipRoot', 'TooltipProvider', 'TooltipTrigger', 'TooltipContent'],
  SegmentedControl: ['SegmentedControlItem'],
  Select: ['SelectContent', 'SelectGroup', 'SelectItem', 'SelectLabel', 'SelectSeparator', 'SelectTrigger', 'SelectValue'],
  RadioGroup: ['RadioGroupItem'],
  Card: ['CardHeader', 'CardTitle', 'CardContent'],
  ScrollArea: ['ScrollBar'],
  Table: ['TableBody', 'TableCell', 'TableHead', 'TableHeader', 'TableRow'],
  Accordion: ['AccordionContent', 'AccordionItem', 'AccordionTrigger'],
  Avatar: ['AvatarFallback', 'AvatarImage'],
  Dialog: ['DialogClose', 'DialogContent', 'DialogDescription', 'DialogFooter', 'DialogHeader', 'DialogOverlay', 'DialogTitle', 'DialogTrigger'],
  DropdownMenu: ['DropdownMenuCheckboxItem', 'DropdownMenuContent', 'DropdownMenuItem', 'DropdownMenuLabel', 'DropdownMenuPortal', 'DropdownMenuRadioGroup', 'DropdownMenuRadioItem', 'DropdownMenuSeparator', 'DropdownMenuShortcut', 'DropdownMenuSub', 'DropdownMenuSubContent', 'DropdownMenuSubTrigger', 'DropdownMenuTrigger'],
  AlertDialog: ['AlertDialogAction', 'AlertDialogCancel', 'AlertDialogContent', 'AlertDialogDescription', 'AlertDialogFooter', 'AlertDialogHeader', 'AlertDialogPortal', 'AlertDialogTitle', 'AlertDialogTrigger'],
  Tabs: ['TabsContent', 'TabsList', 'TabsTrigger'],
  Toolbar: ['ToolbarSeparator'],
  DescriptionSummary: ['DescriptionSection', 'DescriptionItem'],
};
const childNames = new Set(Object.values(parts).flat());
export const componentFamilies = Object.fromEntries(Object.entries(inventory).map(([group, names]) => [
  group, names.filter(name => !childNames.has(name)).map(name => ({ name, parts: parts[name] || [] })),
]));
const common = ['Button', 'Input', 'Select', 'Dialog', 'Table', 'Tabs'];

export function ComponentSidebar({ groups, selected, query, onQueryChange, onSelect, onShowAll, mobileOpen, onClose }) {
  const [openGroups, setOpenGroups] = useState({ forms: true });
  const [openParts, setOpenParts] = useState({});
  const term = query.trim().toLowerCase();
  const matching = name => name.toLowerCase().includes(term);
  const activeGroup = groups.find(group => inventory[group.id].includes(selected))?.id;

  useEffect(() => {
    if (!selected || !activeGroup) return;
    setOpenGroups(current => ({ ...current, [activeGroup]: true }));
    const parent = componentFamilies[activeGroup].find(family => family.parts.includes(selected));
    if (parent) setOpenParts(current => ({ ...current, [parent.name]: true }));
  }, [selected, activeGroup]);

  const componentLink = (name, className = '') => (
    <a href={`#${examples[name]}`} className={className} aria-current={selected === name ? 'location' : undefined}
      data-component-name={name} onClick={() => onSelect(name)} title={name}>
      <span>{name}</span>
    </a>
  );

  return <aside className={`gallery-sidebar component-sidebar ${mobileOpen ? 'is-open' : ''}`} id="component-sidebar" role={mobileOpen ? 'dialog' : undefined} aria-modal={mobileOpen ? true : undefined} aria-label="Component navigation">
    <div className="sidebar-heading">Components <span>123</span><button type="button" className="tree-mobile-close" aria-label="Close component menu" onClick={onClose}><X size={17}/></button></div>
    <label className="gallery-search sidebar-search"><Search size={15} aria-hidden="true"/>
      <input value={query} onChange={event => onQueryChange(event.target.value)} placeholder="Find a component…" aria-label="Find a component"/>
      {query && <button type="button" aria-label="Clear search" onClick={() => onQueryChange('')}><X size={14}/></button>}
    </label>
    <div className="component-nav-scroll">
      <nav aria-label="Components" className="component-tree">
        <a className="tree-all" href="#site-main" aria-current={!selected && !term ? 'location' : undefined} onClick={onShowAll}>All components <span>123</span></a>
        {!term && <div className="tree-common"><p className="tree-section-label">Common components</p><ul>{common.map(name => <li key={name}>{componentLink(name)}</li>)}</ul></div>}
        <p className="tree-section-label">Browse library</p>
        <ul className="tree-groups">{groups.map(group => {
          const families = componentFamilies[group.id].filter(family => !term || matching(group.label) || matching(family.name) || family.parts.some(matching));
          if (!families.length) return null;
          const expanded = term ? true : !!openGroups[group.id];
          return <li key={group.id}>
            <button type="button" className="tree-group-toggle" aria-expanded={expanded} aria-controls={`tree-group-${group.id}`}
              onClick={() => setOpenGroups(current => ({ ...current, [group.id]: !expanded }))}>
              <ChevronRight size={13} aria-hidden="true"/><span>{group.label}</span><span className="tree-count">{inventory[group.id].length}</span>
            </button>
            <ul id={`tree-group-${group.id}`} className="tree-families" hidden={!expanded}>{families.map(family => {
              const expandedParts = term ? true : !!openParts[family.name];
              const shownParts = term && !matching(family.name) && !matching(group.label) ? family.parts.filter(matching) : family.parts;
              return <li key={family.name}>
                <div className="tree-family-row">{componentLink(family.name)}{family.parts.length > 0 && <button type="button" className="tree-parts-toggle"
                  aria-label={`${expandedParts ? 'Hide' : 'Show'} ${family.name} parts`} aria-expanded={expandedParts} aria-controls={`tree-parts-${family.name}`}
                  onClick={() => setOpenParts(current => ({ ...current, [family.name]: !expandedParts }))}><ChevronRight size={12} aria-hidden="true"/></button>}</div>
                {family.parts.length > 0 && <ul id={`tree-parts-${family.name}`} className="tree-parts" hidden={!expandedParts}>{shownParts.map(name => <li key={name}>{componentLink(name)}</li>)}</ul>}
              </li>;
            })}</ul>
          </li>;
        })}</ul>
        {term && !groups.some(group => matching(group.label) || inventory[group.id].some(matching)) && <p className="tree-no-results" role="status">No matching component.</p>}
      </nav>
    </div>
    <div className="sidebar-foot"><Check size={14}/><span>x-ui / OpcOrbit<br/>React component library</span></div>
    <a className="sidebar-report" href="/docs#docs-responsive">Desktop + mobile guide <ArrowUpRight size={13}/></a>
  </aside>;
}
