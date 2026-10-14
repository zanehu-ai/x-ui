import React, { useEffect, useId, useState } from 'react';
import { Check, ArrowRight, Layers, Activity } from 'lucide-react';
import {
  Button,
  Switch,
  Checkbox,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@zanehu-ai/x-ui';

export function MotionPanel({ replayToken = 0, reducedMotion = false }) {
  const uid = useId();
  const [saved, setSaved] = useState(false);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [loadStatus, setLoadStatus] = useState('Ready to load a local example.');

  useEffect(() => {
    if (!loading) return undefined;
    const timer = window.setTimeout(() => {
      setLoading(false);
      setLoadStatus('Example loaded. Everything stayed in this preview.');
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [loading]);

  return (
    <div className="motion-demo-grid" data-reduced-motion={reducedMotion ? 'true' : 'false'}>
      <section className="motion-demo-card motion-demo-enter" data-motion-step="0" key={`feedback-${replayToken}`}>
        <div className="motion-demo-heading">
          <span className="motion-demo-number">01</span>
          <h3>Action &amp; feedback</h3>
        </div>
        <p className="motion-demo-caption">Hover, focus or press the button, then see the result.</p>
        <div className="motion-demo-stack">
          <Button
            type="button"
            className="motion-demo-button motion-demo-save-button"
            onClick={() => setSaved((current) => !current)}
          >
            {saved ? 'Reset example' : 'Save example'}
            <ArrowRight size={16} aria-hidden="true" className="motion-demo-arrow" />
          </Button>
          <p className="motion-demo-status" role="status" aria-live="polite" data-state={saved ? 'saved' : 'ready'}>
            <Check size={16} aria-hidden="true" className="motion-demo-status-icon" />
            <span>{saved ? 'Saved. This change is local to the preview.' : 'Your next action gets a clear response.'}</span>
          </p>
        </div>
      </section>

      <section className="motion-demo-card motion-demo-enter" data-motion-step="1" key={`controls-${replayToken}`}>
        <div className="motion-demo-heading">
          <span className="motion-demo-number">02</span>
          <h3>Small state changes</h3>
        </div>
        <p className="motion-demo-caption">Try the real switch and checkbox, including with your keyboard.</p>
        <div className="motion-demo-stack">
          <div className="motion-demo-control-row">
            <Switch
              id={`${uid}-preview`}
              className="motion-demo-switch"
              checked={previewEnabled}
              onCheckedChange={setPreviewEnabled}
            />
            <label htmlFor={`${uid}-preview`}>Live preview</label>
          </div>
          <div className="motion-demo-control-row">
            <Checkbox
              id={`${uid}-details`}
              className="motion-demo-checkbox"
              checked={includeDetails}
              onCheckedChange={(next) => setIncludeDetails(next === true)}
            />
            <label htmlFor={`${uid}-details`}>Include details</label>
          </div>
          <p className="motion-demo-status" role="status" aria-live="polite">
            Preview {previewEnabled ? 'on' : 'off'} · Details {includeDetails ? 'included' : 'hidden'}
          </p>
        </div>
      </section>

      <section className="motion-demo-card motion-demo-enter" data-motion-step="2" key={`content-${replayToken}`}>
        <div className="motion-demo-heading">
          <span className="motion-demo-number">03</span>
          <h3>Content &amp; progress</h3>
        </div>
        <p className="motion-demo-caption">Switch the view or start a one-second loading example.</p>
        <div className="motion-demo-stack">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="motion-demo-tabs">
            <TabsList aria-label="Motion example views">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="motion-demo-tab-content">
              <p className="motion-demo-tab-copy"><Layers size={18} aria-hidden="true" /> One clear view, ready to explore.</p>
            </TabsContent>
            <TabsContent value="activity" className="motion-demo-tab-content">
              <p className="motion-demo-tab-copy"><Activity size={18} aria-hidden="true" /> Your latest changes appear here.</p>
            </TabsContent>
          </Tabs>
          <Button
            type="button"
            variant="outline"
            className="motion-demo-button motion-demo-loading-button"
            loading={loading}
            onClick={() => {
              setLoadStatus('Loading the local example…');
              setLoading(true);
            }}
          >
            {loading ? 'Loading example' : 'Load example'}
          </Button>
          <p className="motion-demo-status" role="status" aria-live="polite">{loadStatus}</p>
        </div>
      </section>
    </div>
  );
}
