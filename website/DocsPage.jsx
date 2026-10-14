import React, { useEffect, useId, useRef, useState } from 'react'
import { Check, Copy, ArrowUpRight } from 'lucide-react'

const sections = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'installation', label: 'Installation' },
  { id: 'theming', label: 'Theming' },
  { id: 'motion', label: 'Motion' },
  { id: 'responsive', label: 'Desktop + mobile' },
  { id: 'releases', label: 'Releases' },
]

const buttonExample = `import { Button } from '@zanehu-ai/x-ui'

export function SaveAction({ saving, onSave }) {
  return (
    <Button
      type="button"
      variant="primary"
      loading={saving}
      onClick={onSave}
    >
      Save changes
    </Button>
  )
}`

const themeExample = `import {
  Button, UIThemeProvider, useUITheme,
} from '@zanehu-ai/x-ui'
import '@zanehu-ai/x-ui/dist/theme/styles.css'

function Appearance() {
  const { theme, resolvedTheme, setTheme } = useUITheme()

  return (
    <section aria-label="Appearance">
      <p>Current appearance: {resolvedTheme}</p>
      {['light', 'dark', 'system'].map(choice => (
        <Button
          key={choice}
          type="button"
          variant={theme === choice ? 'primary' : 'outline'}
          aria-pressed={theme === choice}
          onClick={() => setTheme(choice)}
        >
          {choice}
        </Button>
      ))}
    </section>
  )
}

export function ThemedRegion() {
  return (
    <UIThemeProvider defaultTheme="system" motion="auto">
      <Appearance />
    </UIThemeProvider>
  )
}`

function resolveSection(value) {
  const id = String(value).replace(/^#?docs-/, '')
  return sections.some(section => section.id === id) ? id : 'introduction'
}

function CodeBlock({ label, language, children }) {
  const statusId = useId()
  const [copyState, setCopyState] = useState('idle')

  async function copyCode() {
    setCopyState('copying')
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(children)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  const status = copyState === 'copied'
    ? `${label} copied.`
    : copyState === 'failed'
      ? 'Copy is unavailable. Select the code and copy it manually.'
      : copyState === 'copying' ? 'Copying…' : ''

  return (
    <div className="docs-code-block">
      <div className="docs-code-header">
        <span>{label}</span>
        <button
          type="button"
          className="docs-copy-button"
          onClick={copyCode}
          disabled={copyState === 'copying'}
          aria-label={`Copy ${label}`}
          aria-describedby={statusId}
        >
          {copyState === 'copied' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          <span>{copyState === 'copied' ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre tabIndex={0} aria-label={label}><code className={`language-${language}`}>{children}</code></pre>
      <p className="docs-copy-status" id={statusId} role="status" aria-live="polite" aria-atomic="true">{status}</p>
    </div>
  )
}

export function DocsPage({ initialSection = 'introduction' }) {
  const [activeSection, setActiveSection] = useState(() => resolveSection(initialSection))
  const contentRef = useRef(null)
  const navigateRef = useRef(null)

  useEffect(() => {
    const headings = sections.map(section => ({
      id: section.id,
      element: contentRef.current?.querySelector(`#docs-${section.id}-title`),
    })).filter(heading => heading.element)
    if (!headings.length) return undefined

    let frame = 0
    let navigationFrame = 0
    let pendingScroll = null
    let settleTimer = 0

    const hashSection = () => sections.find(section => window.location.hash === `#docs-${section.id}`)?.id
    const headerHeight = () => {
      const header = document.querySelector('.site-header')
      return header?.getBoundingClientRect().height || (window.innerWidth <= 780 ? 64 : 80)
    }
    const writeHash = (section, method = 'replaceState') => {
      const hash = `#docs-${section}`
      if (window.location.hash !== hash) {
        // History updates never fire hashchange or trigger native anchor scrolling.
        window.history[method](window.history.state, '', hash)
      }
    }
    const clearPendingScroll = () => {
      pendingScroll = null
      window.clearTimeout(settleTimer)
    }
    const updateFromScroll = () => {
      frame = 0
      if (pendingScroll) {
        // Keep the chosen link stable while passing other headings in a smooth jump.
        if (Math.abs(window.scrollY - pendingScroll.top) > 2) return
        clearPendingScroll()
      }
      const readingLine = headerHeight() + 32
      let section = headings[0].id
      for (const heading of headings) {
        if (heading.element.getBoundingClientRect().top <= readingLine) section = heading.id
        else break
      }
      const pageHeight = document.documentElement.scrollHeight
      if (pageHeight > window.innerHeight && window.scrollY + window.innerHeight >= pageHeight - 2) {
        section = headings[headings.length - 1].id
      }
      setActiveSection(section)
      writeHash(section)
    }
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateFromScroll)
    }
    const navigate = (section, { push = false, focus = false, smooth = false } = {}) => {
      const target = headings.find(heading => heading.id === section)?.element
      if (!target) return
      clearPendingScroll()
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const top = Math.min(maxScroll, Math.max(0, window.scrollY + target.getBoundingClientRect().top - headerHeight() - 24))
      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        || document.documentElement.dataset.motion === 'reduced'
      setActiveSection(section)
      writeHash(section, push ? 'pushState' : 'replaceState')
      pendingScroll = { top }
      if (focus) target.focus({ preventScroll: true })
      // Explicit instant behavior also overrides the site's CSS smooth scrolling.
      window.scrollTo({ top, behavior: smooth && !reducedMotion ? 'smooth' : 'instant' })
      settleTimer = window.setTimeout(() => {
        clearPendingScroll()
        scheduleUpdate()
      }, 1500)
      scheduleUpdate()
    }
    const followHash = () => {
      const section = hashSection()
      if (!section) return
      window.cancelAnimationFrame(navigationFrame)
      navigationFrame = window.requestAnimationFrame(() => navigate(section))
    }
    const interruptScroll = () => {
      clearPendingScroll()
      scheduleUpdate()
    }
    const onKeyDown = event => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) interruptScroll()
    }

    navigateRef.current = navigate
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('hashchange', followHash)
    window.addEventListener('popstate', followHash)
    window.addEventListener('wheel', interruptScroll, { passive: true })
    window.addEventListener('touchstart', interruptScroll, { passive: true })
    window.addEventListener('pointerdown', interruptScroll, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    // Content reflow changes heading positions even without a scroll event.
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleUpdate)
    observer?.observe(contentRef.current)
    const header = document.querySelector('.site-header')
    if (header) observer?.observe(header)

    const initial = hashSection() || resolveSection(initialSection)
    if (hashSection() || initial !== 'introduction') {
      navigationFrame = window.requestAnimationFrame(() => navigate(initial))
    } else scheduleUpdate()

    return () => {
      navigateRef.current = null
      window.cancelAnimationFrame(frame)
      window.cancelAnimationFrame(navigationFrame)
      clearPendingScroll()
      observer?.disconnect()
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('hashchange', followHash)
      window.removeEventListener('popstate', followHash)
      window.removeEventListener('wheel', interruptScroll)
      window.removeEventListener('touchstart', interruptScroll)
      window.removeEventListener('pointerdown', interruptScroll)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [initialSection])

  function followSection(event, section) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !navigateRef.current) return
    event.preventDefault()
    navigateRef.current(section, { push: true, focus: true, smooth: true })
  }

  return (
    <div className="docs-layout">
      <aside className="docs-sidebar">
        <p className="docs-sidebar-label">Documentation</p>
        <nav aria-label="Documentation sections">
          {sections.map(section => (
            <a
              key={section.id}
              href={`#docs-${section.id}`}
              aria-current={activeSection === section.id ? 'location' : undefined}
              onClick={event => followSection(event, section.id)}
            >
              {section.label}
            </a>
          ))}
        </nav>
        <a className="docs-source-link" href="https://github.com/zanehu-ai/x-ui">
          View source <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </aside>

      <main ref={contentRef} id="site-main" tabIndex={-1} className="docs-content">
        <section className="docs-section" id="docs-introduction" aria-labelledby="docs-introduction-title">
          <p className="docs-eyebrow">Build with x-ui</p>
          <h1 id="docs-introduction-title" tabIndex={-1}>A shared foundation for OpcOrbit.</h1>
          <p className="docs-lead">React components for application interfaces, from everyday controls to data tables, navigation and conversations.</p>
          <p>Import from <code>@zanehu-ai/x-ui</code>. The host application supplies React, styles, routing and data. React and React DOM 18.3 or 19 are supported; check the selected release for its complete peer dependencies.</p>
          <div className="docs-callout" role="note">
            <strong>Published prerelease · 0.2.0-rc.0</strong>
            <p><code>@zanehu-ai/x-ui@0.2.0-rc.0</code> is available on GitHub Packages through the <code>next</code> channel. It includes the theme, motion, feedback and presentation APIs shown here. Validate the prerelease in your application before adoption.</p>
            <a href="#docs-releases" onClick={event => followSection(event, 'releases')}>Understand release availability</a>
          </div>
          <h2>A small starting point</h2>
          <p>Keep the save lifecycle in your application. The button displays the supplied loading state.</p>
          <CodeBlock label="A save action" language="jsx">{buttonExample}</CodeBlock>
          <p>Button variants are <code>default</code>, <code>primary</code>, <code>secondary</code>, <code>outline</code>, <code>ghost</code> and <code>destructive</code>. Sizes are <code>sm</code>, <code>md</code>, <code>lg</code> and <code>icon</code>. Give icon-only buttons an accessible name.</p>
        </section>

        <section className="docs-section" id="docs-installation" aria-labelledby="docs-installation-title">
          <p className="docs-eyebrow">Get started</p>
          <h2 id="docs-installation-title" tabIndex={-1}>Installation</h2>
          <p>The package is hosted on GitHub Packages. Configure the scope in your application’s <code>.npmrc</code>:</p>
          <CodeBlock label="Registry scope · .npmrc" language="ini">{'@zanehu-ai:registry=https://npm.pkg.github.com'}</CodeBlock>
          <p>Configure authorized <code>read:packages</code> access through private npm user settings or CI, outside this site. Keep credentials out of repository files and browser environment variables.</p>
          <p>Install the exact published prerelease to try the APIs shown here:</p>
          <CodeBlock label="Install the published prerelease" language="bash">{"npm install '@zanehu-ai/x-ui@0.2.0-rc.0'"}</CodeBlock>
          <h3>Include component styles</h3>
          <p>Scan the installed package’s <code>dist/**/*.js</code> with Tailwind. For Tailwind 4, add a source path relative to your application stylesheet:</p>
          <CodeBlock label="Tailwind 4 · application stylesheet" language="css">{'@import "tailwindcss";\n@source "../node_modules/@zanehu-ai/x-ui/dist/**/*.js";'}</CodeBlock>
          <p>Adjust the relative path for your workspace. The optional theme stylesheet does not replace this scan or Tailwind’s generated utilities.</p>
        </section>

        <section className="docs-section" id="docs-theming" aria-labelledby="docs-theming-title">
          <p className="docs-eyebrow">Prerelease API</p>
          <h2 id="docs-theming-title" tabIndex={-1}>Theming</h2>
          <p>Opt in with <code>UIThemeProvider</code> and explicitly import the theme stylesheet. Components outside the provider retain their legacy defaults; the stylesheet alone does not enable a global theme.</p>
          <CodeBlock label="Light, dark and system appearance" language="jsx">{themeExample}</CodeBlock>
          <p><code>useUITheme()</code> must run inside the provider. It exposes the selected <code>theme</code>, the effective <code>resolvedTheme</code> and <code>setTheme</code>. System mode follows the operating system.</p>
          <dl className="docs-property-list">
            <div><dt><code>storageKey</code></dt><dd>Defaults to <code>x-ui-theme</code>. Use a unique key for an independent region, or <code>{'storageKey={false}'}</code> to disable persistence. Valid saved preferences take precedence over the default.</dd></div>
            <div><dt><code>theme / onThemeChange</code></dt><dd>Use controlled state when several regions should share one appearance setting.</dd></div>
            <div><dt><code>style</code></dt><dd>Override <code>--x-ui-*</code> palette variables. Library portals receive the resolved theme, palette and motion setting.</dd></div>
          </dl>
          <p>Keep product regions that have not adopted the theme, including existing Cargo screens, outside the provider in both the React tree and the DOM. A nested plain wrapper does not isolate inherited styles.</p>
        </section>

        <section className="docs-section" id="docs-motion" aria-labelledby="docs-motion-title">
          <p className="docs-eyebrow">Prerelease API</p>
          <h2 id="docs-motion-title" tabIndex={-1}>Motion</h2>
          <p>The optional stylesheet adds restrained dialog and menu transitions, plus loading animations. The default <code>motion="auto"</code> honors the operating system’s reduced-motion preference.</p>
          <CodeBlock label="Disable motion for a region" language="jsx">{`import { Button, UIThemeProvider } from '@zanehu-ai/x-ui'
import '@zanehu-ai/x-ui/dist/theme/styles.css'

export function QuietRegion() {
  return (
    <UIThemeProvider defaultTheme="system" motion="off">
      <Button type="button">Continue</Button>
    </UIThemeProvider>
  )
}`}</CodeBlock>
          <p><code>motion="off"</code> stops scoped CSS animation, transitions and smooth scrolling, including library portals. Application-owned JavaScript scrolling still needs its own reduced-motion handling.</p>
        </section>

        <section className="docs-section" id="docs-responsive" aria-labelledby="docs-responsive-title">
          <p className="docs-eyebrow">Design for the available space</p>
          <h2 id="docs-responsive-title" tabIndex={-1}>Desktop + mobile</h2>
          <p>Responsive support is component-specific and currently partial. A responsive documentation page or preview wrapper does not establish responsive defaults for every library component.</p>
          <div className="docs-table-wrap" role="region" aria-label="Responsive component guidance" tabIndex={0}>
            <table className="docs-table">
              <thead><tr><th scope="col">Area</th><th scope="col">Current behavior and host responsibility</th></tr></thead>
              <tbody>
                <tr><th scope="row">Application shell</th><td><code>Layout</code> keeps its sidebar beside the content. The host must provide mobile collapse or a drawer and allow the main area to shrink.</td></tr>
                <tr><th scope="row">Headers and filters</th><td><code>PageHeader</code> and <code>FilterBar</code> stack at smaller widths. Check long titles, translations and action groups in context.</td></tr>
                <tr><th scope="row">Tables and pagination</th><td>Tables include a scroll wrapper. Constrain the parent width, check keyboard access to scrolling, and let pagination wrap or stack when needed.</td></tr>
                <tr><th scope="row">Tabs and details</th><td>Long tab lists need local scrolling or an intentional alternative. Long URLs, identifiers and configuration values need wrapping or local overflow handling.</td></tr>
                <tr><th scope="row">Overlays</th><td>Verify available height, body scrolling, initial focus, focus return and keyboard dismissal. A mobile keyboard can change the usable viewport.</td></tr>
              </tbody>
            </table>
          </div>
          <h3>Validate the complete screen</h3>
          <p>Check narrow phones, tablets and desktop widths with realistic content. Include text zoom, touch targets, keyboard navigation, reduced motion and IME composition. Test on real mobile browsers as well as a resized desktop preview.</p>
        </section>

        <section className="docs-section" id="docs-releases" aria-labelledby="docs-releases-title">
          <p className="docs-eyebrow">Adopt deliberately</p>
          <h2 id="docs-releases-title" tabIndex={-1}>Releases</h2>
          <dl className="docs-property-list">
            <div><dt>Historical synapse-ui 0.1.8</dt><dd>The published <code>@zanehu-ai/synapse-ui@0.1.8</code> consumer baseline remains unchanged. It does not include the new theme, feedback or <code>presentation</code> APIs. A package named <code>@zanehu-ai/x-ui@0.1.8</code> has not been published.</dd></div>
            <div><dt>0.2.0-rc.0 · published prerelease</dt><dd><code>@zanehu-ai/x-ui@0.2.0-rc.0</code> was published on October 14, 2026. It is available through the <code>next</code> channel, with an exact version for reproducible installs. Library publication does not establish production acceptance for the consuming application.</dd></div>
          </dl>
          <p>Before adoption, select an approved published release, verify its exports and peer dependencies, then validate the consuming application. Keep existing product behavior and styles until that product explicitly adopts the new theme.</p>
          <a className="docs-source-link" href="https://github.com/zanehu-ai/x-ui/releases/tag/v0.2.0-rc.0">View the prerelease <ArrowUpRight size={14} aria-hidden="true" /></a>
        </section>
      </main>
    </div>
  )
}
