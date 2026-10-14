import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { afterEach, beforeEach, test } from 'node:test'
import { JSDOM } from 'jsdom'
import { createElement as h, act } from 'react'

const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { url: 'http://localhost', pretendToBeVisual: true })
for (const key of ['window', 'document', 'HTMLElement', 'Element', 'Node', 'MutationObserver', 'Event', 'MouseEvent']) globalThis[key] = dom.window[key]
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window)
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const { createRoot, hydrateRoot } = await import('react-dom/client')
const { createPortal } = await import('react-dom')
const { renderToString } = await import('react-dom/server')
const { UIThemeProvider, useUITheme, useThemeSurface } = await import('../dist/theme/ThemeProvider.js')
const themeCss = await readFile(new URL('../src/theme/styles.css', import.meta.url), 'utf8')
let root
let preference

function createMediaPreference(matches = false) {
  const listeners = new Set()
  return {
    matches,
    media: '(prefers-color-scheme: dark)',
    addEventListener(type, callback) { if (type === 'change') listeners.add(callback) },
    removeEventListener(type, callback) { if (type === 'change') listeners.delete(callback) },
    change(next) { this.matches = next; for (const callback of listeners) callback({ matches: next }) },
    get listeners() { return listeners.size },
  }
}

function ThemeProbe() {
  const { theme, resolvedTheme, setTheme } = useUITheme()
  return h('section', null,
    h('output', { 'data-testid': 'choice' }, `${theme}:${resolvedTheme}`),
    ...['light', 'dark', 'system'].map(choice => h('button', { key: choice, 'data-choice': choice, onClick: () => setTheme(choice) }, choice)),
  )
}

function SurfaceProbe({ portal = false }) {
  const surface = useThemeSurface()
  const node = h('div', { ...surface, 'data-testid': portal ? 'portal' : 'surface' }, h('span', { className: 'x-ui-spinner', 'data-testid': 'spinner' }))
  return portal ? createPortal(node, document.body) : node
}

async function render(element) {
  const container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  await act(async () => root.render(element))
  return container
}

async function choose(container, choice) {
  await act(async () => container.querySelector(`[data-choice="${choice}"]`).click())
}

beforeEach(() => {
  window.localStorage.clear()
  preference = createMediaPreference()
  window.matchMedia = () => preference
})

afterEach(async () => {
  if (root) await act(async () => root.unmount())
  root = undefined
  document.body.innerHTML = ''
  document.head.innerHTML = ''
})

test('legacy surfaces remain unthemed without a provider', async () => {
  const container = await render(h(SurfaceProbe))
  const surface = container.querySelector('[data-testid="surface"]')
  assert.equal(surface.hasAttribute('data-x-ui-theme'), false)
  assert.equal(surface.hasAttribute('data-x-ui-motion'), false)
  assert.equal(surface.hasAttribute('class'), false)
  assert.equal(surface.hasAttribute('style'), false)
})

test('system theme follows preference changes and cleans up its subscription', async () => {
  preference.matches = true
  const container = await render(h(UIThemeProvider, { storageKey: false }, h(ThemeProbe)))
  assert.equal(container.querySelector('output').textContent, 'system:dark')
  assert.equal(preference.listeners, 1)
  assert.equal(container.querySelector('[data-x-ui-theme]').style.getPropertyValue('--x-ui-background'), '#0a0a0a')
  await act(async () => preference.change(false))
  assert.equal(container.querySelector('output').textContent, 'system:light')
  assert.equal(document.documentElement.hasAttribute('data-x-ui-theme'), false)
  assert.equal(document.documentElement.className, '')
  await act(async () => root.unmount())
  root = undefined
  assert.equal(preference.listeners, 0)
})

test('saved choice wins over the default and user choices persist under the selected key', async () => {
  window.localStorage.setItem('test-theme', 'dark')
  const changes = []
  const container = await render(h(UIThemeProvider, { defaultTheme: 'light', storageKey: 'test-theme', onThemeChange: value => changes.push(value) }, h(ThemeProbe)))
  assert.equal(container.querySelector('output').textContent, 'dark:dark')
  await choose(container, 'light')
  assert.equal(container.querySelector('output').textContent, 'light:light')
  assert.equal(window.localStorage.getItem('test-theme'), 'light')
  assert.deepEqual(changes, ['light'])
  await choose(container, 'system')
  await act(async () => preference.change(true))
  assert.equal(container.querySelector('output').textContent, 'system:dark')
  assert.equal(window.localStorage.getItem('test-theme'), 'system')
})

test('controlled changes are requests until the owner supplies a new theme', async () => {
  window.localStorage.setItem('x-ui-theme', 'dark')
  const changes = []
  const props = { theme: 'light', onThemeChange: value => changes.push(value) }
  const container = await render(h(UIThemeProvider, props, h(ThemeProbe)))
  assert.equal(container.querySelector('output').textContent, 'light:light')
  await choose(container, 'dark')
  assert.deepEqual(changes, ['dark'])
  assert.equal(container.querySelector('output').textContent, 'light:light')
  assert.equal(window.localStorage.getItem('x-ui-theme'), 'light')
  await act(async () => root.render(h(UIThemeProvider, { ...props, theme: 'dark' }, h(ThemeProbe))))
  assert.equal(container.querySelector('output').textContent, 'dark:dark')
  assert.equal(window.localStorage.getItem('x-ui-theme'), 'dark')
})

test('invalid saved values are ignored and changing storage keys loads the new preference', async () => {
  window.localStorage.setItem('first', 'invalid')
  window.localStorage.setItem('second', 'light')
  const container = await render(h(UIThemeProvider, { defaultTheme: 'dark', storageKey: 'first' }, h(ThemeProbe)))
  assert.equal(container.querySelector('output').textContent, 'dark:dark')
  await act(async () => root.render(h(UIThemeProvider, { defaultTheme: 'dark', storageKey: 'second' }, h(ThemeProbe))))
  assert.equal(container.querySelector('output').textContent, 'light:light')
  assert.equal(window.localStorage.getItem('second'), 'light')
})

test('storage can be disabled or unavailable without preventing theme changes', async () => {
  window.localStorage.setItem('x-ui-theme', 'dark')
  const container = await render(h(UIThemeProvider, { defaultTheme: 'light', storageKey: false }, h(ThemeProbe)))
  assert.equal(container.querySelector('output').textContent, 'light:light')
  await choose(container, 'system')
  assert.equal(window.localStorage.getItem('x-ui-theme'), 'dark')
  const original = Object.getOwnPropertyDescriptor(window, 'localStorage')
  Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('Storage unavailable') } })
  try {
    await act(async () => root.render(h(UIThemeProvider, { defaultTheme: 'light', storageKey: 'blocked' }, h(ThemeProbe))))
    await choose(container, 'dark')
    assert.equal(container.querySelector('output').textContent, 'dark:dark')
  } finally {
    Object.defineProperty(window, 'localStorage', original)
  }
})

test('portals receive palette overrides, resolved class and manual motion setting without root layout styles', async () => {
  const container = await render(h(UIThemeProvider, {
    theme: 'dark', storageKey: false, motion: 'off', className: 'custom-host',
    style: { '--x-ui-primary': '#abcdef', padding: 24 },
  }, h(SurfaceProbe, { portal: true })))
  const portal = document.querySelector('[data-testid="portal"]')
  assert.equal(container.contains(portal), false)
  assert.equal(portal.getAttribute('data-x-ui-theme'), 'dark')
  assert.equal(portal.getAttribute('data-x-ui-motion'), 'off')
  assert.equal(portal.className, 'dark')
  assert.equal(portal.style.colorScheme, 'dark')
  assert.equal(portal.style.getPropertyValue('--x-ui-primary'), '#abcdef')
  assert.equal(portal.style.padding, '')
  assert.match(container.firstElementChild.className, /custom-host/)
})

test('manual reduced motion disables themed animations while leaving legacy motion untouched', async () => {
  const stylesheet = document.createElement('style')
  stylesheet.textContent = `${themeCss}\n.legacy-spinner { animation: legacy-spin 1s infinite; }`
  document.head.append(stylesheet)
  const container = await render(h('div', null,
    h(UIThemeProvider, { motion: 'off', storageKey: false }, h(SurfaceProbe, { portal: true })),
    h('span', { className: 'legacy-spinner' }),
  ))
  const spinner = document.querySelector('[data-testid="portal"] .x-ui-spinner')
  assert.equal(getComputedStyle(spinner).animation, 'none')
  assert.equal(getComputedStyle(spinner).transition, 'none')
  assert.match(getComputedStyle(container.querySelector('.legacy-spinner')).animation, /legacy-spin/)
  const systemRule = [...stylesheet.sheet.cssRules].find(rule => rule.conditionText === '(prefers-reduced-motion: reduce)')
  assert.ok(systemRule, 'the stylesheet honors the system reduced-motion preference')
  assert.ok([...systemRule.cssRules].some(rule => spinner.matches(rule.selectorText) && rule.style.getPropertyValue('animation') === 'none'))
})

test('SSR does not require browser globals and uses the same deterministic initial theme', () => {
  const savedWindow = globalThis.window
  delete globalThis.window
  try {
    const markup = renderToString(h(UIThemeProvider, null, h(ThemeProbe)))
    assert.match(markup, /system:light/)
    assert.match(markup, /data-x-ui-motion="auto"/)
    const darkMarkup = renderToString(h(UIThemeProvider, { theme: 'dark' }, h(ThemeProbe)))
    assert.match(darkMarkup, /dark:dark/)
  } finally {
    globalThis.window = savedWindow
  }
})

test('hydration applies a saved browser preference without a server markup mismatch', async () => {
  window.localStorage.setItem('x-ui-theme', 'dark')
  preference.matches = true
  const element = h(UIThemeProvider, null, h(ThemeProbe))
  const container = document.createElement('div')
  container.innerHTML = renderToString(element)
  document.body.append(container)
  assert.equal(container.querySelector('output').textContent, 'system:light')
  const errors = []
  await act(async () => { root = hydrateRoot(container, element, { onRecoverableError: error => errors.push(error) }) })
  assert.equal(container.querySelector('output').textContent, 'dark:dark')
  assert.deepEqual(errors, [])
})
