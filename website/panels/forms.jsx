import React, { useId, useState } from 'react';
import {Plus, ArrowUpRight} from 'lucide-react';
import {
  Button,
  Input,
  Textarea,
  Checkbox,
  CheckboxField,
  Switch,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectField,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  FileInput,
  RangeInput,
  ToggleChip,
} from '@zanehu-ai/x-ui';

const buttonVariants = ['default', 'primary', 'secondary', 'outline', 'ghost', 'destructive'];
const fieldOptions = [
  { label: 'Research', value: 'research' },
  { label: 'Design', value: 'design' },
  { label: 'Engineering', value: 'engineering' },
  { label: 'Archived workspace', value: 'archived', disabled: true },
];

function ApiNames({ children }) {
  return <p className="demo-caption"><code>{children}</code></p>;
}

export function FormsPanel() {
  const uid = useId();
  const id = (name) => `${uid}-${name}`;
  const [lastAction, setLastAction] = useState('Choose an action to try it.');
  const [projectName, setProjectName] = useState('A new perspective');
  const [query, setQuery] = useState('');
  const [description, setDescription] = useState('Explore an idea. Build something useful.');
  const [checked, setChecked] = useState(true);
  const [mixed, setMixed] = useState('indeterminate');
  const [fieldChecked, setFieldChecked] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sync, setSync] = useState(false);
  const [plan, setPlan] = useState('personal');
  const [model, setModel] = useState('');
  const [workspace, setWorkspace] = useState('design');
  const [files, setFiles] = useState([]);
  const [intensity, setIntensity] = useState(40);
  const [topics, setTopics] = useState(['Design']);

  const recordAction = (label) => setLastAction(`${label} selected. Demo state only.`);
  const toggleTopic = (topic) => setTopics((current) => (
    current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic]
  ));

  return (
    <div className="demo-grid demo-forms">
      <section className="demo-card" id="forms-button" tabIndex={-1}>
        <h3>Actions</h3>
        <ApiNames>Button</ApiNames>
        <div className="demo-stack">
          <div className="demo-row">
            {buttonVariants.map((variant) => (
              <Button key={variant} type="button" variant={variant} onClick={() => recordAction(variant)}>
                {variant}
              </Button>
            ))}
          </div>
          <div className="demo-row">
            <Button type="button" size="sm" onClick={() => recordAction('Small')}>Small</Button>
            <Button type="button" size="md" onClick={() => recordAction('Medium')}>Medium</Button>
            <Button type="button" size="lg" onClick={() => recordAction('Large')}>Large</Button>
            <Button type="button" size="icon" aria-label="Add an item" onClick={() => recordAction('Add item')}>
              <Plus size={16} aria-hidden="true"/>
            </Button>
          </div>
          <div className="demo-row">
            <Button type="button" disabled>Disabled</Button>
            <Button type="button" loading>Working</Button>
            <Button asChild variant="outline"><a href="#forms-inputs">Link with asChild <ArrowUpRight size={14} aria-hidden="true"/></a></Button>
          </div>
          <p className="demo-note" role="status">{lastAction}</p>
        </div>
      </section>

      <section className="demo-card" id="forms-inputs" tabIndex={-1}>
        <h3>Single-line fields</h3>
        <ApiNames>Input</ApiNames>
        <div className="demo-stack">
          <Input label="Project name" value={projectName} onChange={(event) => setProjectName(event.target.value)} hint="Editable, with an associated label and hint." />
          <Input type="search" label="Search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an idea…" />
          <Input type="password" label="Password" autoComplete="off" placeholder="Enter a sample password" />
          <Input label="Error state" defaultValue="" error="Please enter a value." placeholder="Validation specimen" />
          <Input label="Disabled" value="Read-only specimen" disabled />
        </div>
      </section>

      <section className="demo-card" id="forms-textarea" tabIndex={-1}>
        <h3>Long-form input</h3>
        <ApiNames>Textarea</ApiNames>
        <div className="demo-stack">
          <Textarea label="Describe your idea" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} hint={`${description.length} characters · local draft`} />
          <Textarea label="Error state" rows={2} error="Add a short description." placeholder="Validation specimen" />
          <Textarea label="Disabled" rows={2} value="This field cannot be edited." disabled />
        </div>
      </section>

      <section className="demo-card" id="forms-checkboxes" tabIndex={-1}>
        <h3>Checkboxes</h3>
        <ApiNames>Checkbox · CheckboxField</ApiNames>
        <div className="demo-stack">
          <label className="demo-row">
            <Checkbox checked={checked} onCheckedChange={setChecked} />
            <span>Include supporting context</span>
          </label>
          <label className="demo-row">
            <Checkbox checked={mixed} onCheckedChange={setMixed} />
            <span>Mixed selection</span>
          </label>
          <label className="demo-row">
            <Checkbox disabled checked />
            <span>Disabled, checked</span>
          </label>
          <CheckboxField checked={fieldChecked} onCheckedChange={setFieldChecked} label="Send a weekly digest" hint="A composed checkbox with label and hint." />
          <CheckboxField checked={false} onCheckedChange={() => {}} disabled label="Disabled field" hint="Unavailable specimen." />
          <Button type="button" variant="ghost" size="sm" onClick={() => setMixed('indeterminate')}>Restore mixed state</Button>
        </div>
      </section>

      <section className="demo-card" id="forms-switch" tabIndex={-1}>
        <h3>Switches</h3>
        <ApiNames>Switch</ApiNames>
        <div className="demo-stack">
          <div className="demo-row">
            <Switch id={id('notifications')} checked={notifications} onCheckedChange={setNotifications} />
            <label htmlFor={id('notifications')}>Notifications</label>
          </div>
          <div className="demo-row">
            <Switch id={id('sync')} checked={sync} onCheckedChange={setSync} />
            <label htmlFor={id('sync')}>Background sync</label>
          </div>
          <div className="demo-row">
            <Switch id={id('switch-disabled')} disabled defaultChecked />
            <label htmlFor={id('switch-disabled')}>Disabled switch</label>
          </div>
          <p className="demo-note" role="status">Notifications {notifications ? 'on' : 'off'} · Sync {sync ? 'on' : 'off'}</p>
        </div>
      </section>

      <section className="demo-card" id="forms-radio-group" tabIndex={-1}>
        <h3>Single choice</h3>
        <ApiNames>RadioGroup · RadioGroupItem</ApiNames>
        <div className="demo-stack">
          <RadioGroup value={plan} onValueChange={setPlan} aria-label="Example workspace plan" className="demo-stack">
            {[
              ['personal', 'Personal', false],
              ['team', 'Team', false],
              ['enterprise', 'Enterprise · unavailable', true],
            ].map(([value, label, disabled]) => (
              <div className="demo-row" key={value}>
                <RadioGroupItem id={id(value)} value={value} disabled={disabled} />
                <label htmlFor={id(value)}>{label}</label>
              </div>
            ))}
          </RadioGroup>
          <p className="demo-note" role="status">Selected: {plan}</p>
        </div>
      </section>

      <section className="demo-card" id="forms-select" tabIndex={-1}>
        <h3>Composed select</h3>
        <ApiNames>Select · SelectTrigger · SelectValue · SelectContent · SelectGroup · SelectLabel · SelectItem · SelectSeparator</ApiNames>
        <div className="demo-stack">
          <label htmlFor={id('model')}>Choose a mode</label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger id={id('model')}><SelectValue placeholder="Select a mode" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Everyday</SelectLabel>
                <SelectItem value="quick">Quick response</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Focused</SelectLabel>
                <SelectItem value="deep">Deep exploration</SelectItem>
                <SelectItem value="preview" disabled>Preview · unavailable</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select disabled value="locked">
            <SelectTrigger aria-label="Disabled mode"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="locked">Disabled select</SelectItem></SelectContent>
          </Select>
          <p className="demo-note" role="status">Selected: {model || 'none'}</p>
        </div>
      </section>

      <section className="demo-card" id="forms-select-field" tabIndex={-1}>
        <h3>Ready-made select field</h3>
        <ApiNames>SelectField</ApiNames>
        <div className="demo-stack">
          <SelectField label="Workspace" hint="Includes a disabled option." className="w-full" options={fieldOptions} value={workspace} onValueChange={setWorkspace} placeholder="Choose a workspace" />
          <SelectField label="Disabled" className="w-full" options={fieldOptions} value="research" onValueChange={() => {}} disabled />
          <p className="demo-note" role="status">Selected: {workspace}</p>
        </div>
      </section>

      <section className="demo-card" id="forms-files-range" tabIndex={-1}>
        <h3>Files and range</h3>
        <ApiNames>FileInput · RangeInput</ApiNames>
        <div className="demo-stack">
          <label htmlFor={id('files')}>Attachments</label>
          <FileInput id={id('files')} multiple aria-describedby={id('file-help')} onChange={(event) => setFiles(Array.from(event.target.files || []).map((file) => file.name))} />
          <p id={id('file-help')} className="demo-note" role="status">{files.length ? `${files.length} selected: ${files.join(', ')}` : 'Select files to show their names. Nothing is uploaded.'}</p>
          <RangeInput label={`Intensity · ${intensity}%`} min={0} max={100} step={5} value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} hint="Drag the slider or use the arrow keys." />
          <RangeInput label="Disabled range" min={0} max={100} value={65} disabled />
        </div>
      </section>

      <section className="demo-card" id="forms-toggle-chip" tabIndex={-1}>
        <h3>Toggle chips</h3>
        <ApiNames>ToggleChip</ApiNames>
        <div className="demo-stack">
          <div className="demo-row" role="group" aria-label="Example topics">
            {['Design', 'Research', 'Code'].map((topic) => (
              <ToggleChip key={topic} active={topics.includes(topic)} onPressedChange={() => toggleTopic(topic)}>{topic}</ToggleChip>
            ))}
            <ToggleChip active={false} disabled onPressedChange={() => {}}>Unavailable</ToggleChip>
          </div>
          <p className="demo-note" role="status">Selected: {topics.length ? topics.join(', ') : 'none'}</p>
        </div>
      </section>
    </div>
  );
}
