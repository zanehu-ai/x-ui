import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { JSDOM } from 'jsdom'
import { act, createElement as h, createRef, useEffect, useState } from 'react'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost', pretendToBeVisual: true })
for (const key of ['window', 'document', 'HTMLElement', 'HTMLInputElement', 'HTMLButtonElement', 'Element', 'Node', 'NodeFilter', 'MutationObserver', 'CustomEvent', 'Event', 'FocusEvent', 'KeyboardEvent', 'MouseEvent', 'PointerEvent']) {
  globalThis[key] = dom.window[key]
}
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window)
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window)
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window)
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const { createRoot } = await import('react-dom/client')
const {
  Button, UIThemeProvider, Progress, Skeleton, Spinner, SegmentedControl, SegmentedControlItem,
  Popover, PopoverTrigger, PopoverContent, PopoverClose,
  TooltipProvider, Tooltip, TooltipTrigger, TooltipContent,
} = await import('../dist/index.js')
let root

async function render(element) {
  const container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  await act(async () => root.render(element))
  return container
}

async function settle() {
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })
}

afterEach(async () => {
  if (root) await act(async () => root.unmount())
  root = undefined
  document.body.innerHTML = ''
})

test('progress exposes a named, bounded percentage including zero and complete states', async () => {
  const progressRef = createRef()
  const container = await render(h('div', null,
    h(Progress, { value: -10, label: 'Upload', ref: progressRef }),
    h(Progress, { value: 150, label: 'Download' }),
    h('span', { id: 'analysis-progress' }, 'Analysis'),
    h(Progress, { value: 45.5, 'aria-labelledby': 'analysis-progress', 'aria-valuetext': '45.5 percent complete' }),
  ))
  const bars = [...container.querySelectorAll('[role="progressbar"]')]
  assert.equal(bars.length, 3)
  assert.equal(progressRef.current, bars[0])
  assert.equal(bars[0].getAttribute('aria-label'), 'Upload')
  assert.deepEqual(bars.map(bar => bar.getAttribute('aria-valuenow')), ['0', '100', '45.5'])
  for (const bar of bars) {
    assert.equal(bar.getAttribute('aria-valuemin'), '0')
    assert.equal(bar.getAttribute('aria-valuemax'), '100')
  }
  assert.equal(bars[2].getAttribute('aria-labelledby'), 'analysis-progress')
  assert.equal(bars[2].getAttribute('aria-valuetext'), '45.5 percent complete')
})

test('indeterminate progress does not announce a fabricated percentage', async () => {
  const container = await render(h('div', null,
    ...[undefined, null, Number.NaN, Number.POSITIVE_INFINITY].map((value, index) => h(Progress, { key: index, value, label: `Task ${index}` })),
  ))
  const bars = [...container.querySelectorAll('[role="progressbar"]')]
  assert.equal(bars.length, 4)
  for (const bar of bars) assert.equal(bar.hasAttribute('aria-valuenow'), false)
})

test('skeleton hides and makes loading content inert without discarding its local state', async () => {
  let mounts = 0
  function Content() {
    const [count, setCount] = useState(0)
    useEffect(() => { mounts++ }, [])
    return h('button', { onClick: () => setCount(value => value + 1) }, `Count ${count}`)
  }
  const view = loading => h(Skeleton, { loading }, h(Content))
  const container = await render(view(false))
  const button = container.querySelector('button')
  await act(async () => button.click())
  assert.equal(button.textContent, 'Count 1')

  await act(async () => root.render(view(true)))
  assert.equal(container.querySelector('button'), button)
  const inaccessibleAncestor = button.closest('[inert][aria-hidden="true"]')
  assert.ok(inaccessibleAncestor, 'Loading controls must be removed from keyboard and assistive-technology interaction')
  assert.equal(getComputedStyle(inaccessibleAncestor).visibility, 'hidden')
  assert.equal(container.firstElementChild.getAttribute('aria-busy'), 'true')

  await act(async () => root.render(view(false)))
  assert.equal(button.closest('[inert]'), null)
  assert.equal(button.closest('[aria-hidden="true"]'), null)
  await act(async () => button.click())
  assert.equal(button.textContent, 'Count 2')
  assert.equal(mounts, 1)
})

test('spinner announces loading once and supports a decorative instance and caller sizing', async () => {
  const spinnerRef = createRef()
  const container = await render(h('div', null,
    h(Spinner, { label: 'Saving changes', ref: spinnerRef, size: 'lg', style: { width: 30 } }),
    h(Spinner, { decorative: true, 'data-testid': 'decorative' }),
  ))
  const status = container.querySelector('[role="status"]')
  assert.equal(container.querySelectorAll('[role="status"]').length, 1)
  assert.equal(status.getAttribute('aria-label'), 'Saving changes')
  assert.equal(spinnerRef.current, status)
  assert.equal(status.style.width, '30px')
  assert.equal(status.style.height, '24px')
  const decorative = container.querySelector('[data-testid="decorative"]')
  assert.equal(decorative.getAttribute('aria-hidden'), 'true')
  assert.equal(decorative.hasAttribute('aria-label'), false)
})

test('loading Button preserves its accessible text and disables its native action', async () => {
  let calls = 0
  const container = await render(h(Button, { loading: true, onClick: () => { calls++ } }, 'Save changes'))
  const button = container.querySelector('button')
  assert.equal(button.textContent, 'Save changes')
  assert.equal(button.disabled, true)
  assert.equal(button.getAttribute('aria-busy'), 'true')
  assert.equal(button.querySelector('[role="status"]'), null)
  await act(async () => button.click())
  assert.equal(calls, 0)
})

test('loading asChild Button keeps one link and blocks both navigation and child actions', async () => {
  let childCalls = 0
  let parentCalls = 0
  const container = await render(h(Button, { asChild: true, loading: true, onClick: () => { parentCalls++ } },
    h('a', { href: '#details', onClick: () => { childCalls++ } }, 'View details'),
  ))
  const link = container.querySelector('a')
  assert.ok(link)
  assert.equal(container.querySelectorAll('a').length, 1)
  assert.equal(container.querySelector('button'), null)
  assert.equal(link.textContent, 'View details')
  assert.equal(link.getAttribute('aria-busy'), 'true')
  assert.equal(link.getAttribute('aria-disabled'), 'true')
  const click = new MouseEvent('click', { bubbles: true, cancelable: true })
  await act(async () => link.dispatchEvent(click))
  assert.equal(click.defaultPrevented, true)
  assert.equal(childCalls, 0)
  assert.equal(parentCalls, 0)
})

function segments(props) {
  return h(SegmentedControl, { label: 'Billing interval', ...props },
    h(SegmentedControlItem, { value: 'monthly' }, 'Monthly'),
    h(SegmentedControlItem, { value: 'yearly' }, 'Yearly'),
    h(SegmentedControlItem, { value: 'custom', disabled: true }, 'Custom'),
  )
}

test('segmented control owns uncontrolled selection and ignores disabled choices', async () => {
  const changes = []
  const container = await render(segments({ defaultValue: 'monthly', onValueChange: value => changes.push(value) }))
  const group = container.querySelector('[role="radiogroup"]')
  assert.equal(group.getAttribute('aria-label'), 'Billing interval')
  const [monthly, yearly, custom] = group.querySelectorAll('[role="radio"]')
  assert.equal(monthly.getAttribute('aria-checked'), 'true')
  await act(async () => yearly.click())
  assert.equal(yearly.getAttribute('aria-checked'), 'true')
  assert.equal(monthly.getAttribute('aria-checked'), 'false')
  await act(async () => custom.click())
  assert.deepEqual(changes, ['yearly'])
  assert.equal(custom.getAttribute('aria-checked'), 'false')
})

test('segmented control preserves caller-owned selection until the controlled value changes', async () => {
  const changes = []
  const onValueChange = value => changes.push(value)
  const container = await render(segments({ value: 'monthly', onValueChange }))
  await act(async () => container.querySelectorAll('[role="radio"]')[1].click())
  assert.deepEqual(changes, ['yearly'])
  assert.equal(container.querySelectorAll('[role="radio"]')[0].getAttribute('aria-checked'), 'true')
  await act(async () => root.render(segments({ value: 'yearly', onValueChange })))
  assert.equal(container.querySelectorAll('[role="radio"]')[1].getAttribute('aria-checked'), 'true')
})

test('segmented control supports arrow-key selection through the radio-group keyboard contract', async () => {
  const changes = []
  const container = await render(segments({ defaultValue: 'monthly', onValueChange: value => changes.push(value) }))
  const [monthly, yearly] = container.querySelectorAll('[role="radio"]')
  await act(async () => {
    monthly.focus()
    monthly.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 0))
  })
  assert.equal(document.activeElement, yearly)
  assert.equal(yearly.getAttribute('aria-checked'), 'true')
  assert.deepEqual(changes, ['yearly'])
})

test('popover opens in a portal, focuses its form, closes with Escape and restores focus', async () => {
  const triggerRef = createRef()
  const contentRef = createRef()
  const container = await render(h(Popover, null,
    h(PopoverTrigger, { ref: triggerRef }, 'Open workspace options'),
    h(PopoverContent, { ref: contentRef, 'aria-label': 'Workspace options', style: { width: 320 } },
      h('label', null, 'Name', h('input', { defaultValue: 'My workspace' })),
      h(PopoverClose, null, 'Done'),
    ),
  ))
  await act(async () => triggerRef.current.click())
  const content = document.querySelector('[role="dialog"]')
  assert.ok(content)
  assert.equal(contentRef.current, content)
  assert.equal(container.contains(content), false)
  assert.equal(content.getAttribute('aria-label'), 'Workspace options')
  assert.equal(content.style.width, '320px')
  assert.equal(document.activeElement, content.querySelector('input'))
  await act(async () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
  await settle()
  assert.equal(document.querySelector('[role="dialog"]'), null)
  assert.equal(document.activeElement, triggerRef.current)
})

test('popover close composition dismisses an open uncontrolled popover', async () => {
  await render(h(Popover, { defaultOpen: true },
    h(PopoverTrigger, null, 'Options'),
    h(PopoverContent, { 'aria-label': 'Options' }, h(PopoverClose, null, 'Close options')),
  ))
  await act(async () => document.querySelector('[data-slot="popover-close"]').click())
  await settle()
  assert.equal(document.querySelector('[role="dialog"]'), null)
})

test('tooltip describes the focused trigger and dismisses with Escape', async () => {
  const container = await render(h(TooltipProvider, { delayDuration: 0 },
    h(Tooltip, null,
      h(TooltipTrigger, null, 'Inspect item'),
      h(TooltipContent, null, 'More detail about this item'),
    ),
  ))
  const trigger = container.querySelector('button')
  await act(async () => trigger.focus())
  await settle()
  const tooltip = document.querySelector('[role="tooltip"]')
  assert.ok(tooltip)
  assert.equal(tooltip.textContent, 'More detail about this item')
  assert.equal(trigger.getAttribute('aria-describedby'), tooltip.id)
  assert.equal(container.contains(tooltip), false)
  await act(async () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
  await settle()
  assert.equal(document.querySelector('[role="tooltip"]'), null)
  assert.equal(trigger.hasAttribute('aria-describedby'), false)
})

test('popover portal follows scoped theme changes while retaining caller style and class overrides', async () => {
  const view = theme => h(UIThemeProvider, { theme, storageKey: false, motion: 'off', style: { '--x-ui-surface': '#334455' } },
    h(Popover, { open: true },
      h(PopoverTrigger, null, 'Options'),
      h(PopoverContent, { 'aria-label': 'Options', className: 'host-popover', style: { '--x-ui-surface': '#445566', width: 310 } }, 'Content'),
    ),
  )
  const container = await render(view('dark'))
  let content = document.querySelector('[role="dialog"]')
  assert.equal(container.contains(content), false)
  assert.equal(content.getAttribute('data-x-ui-theme'), 'dark')
  assert.equal(content.getAttribute('data-x-ui-motion'), 'off')
  assert.ok(content.classList.contains('host-popover'))
  assert.ok(content.classList.contains('dark'))
  assert.equal(content.style.getPropertyValue('--x-ui-surface'), '#445566')
  assert.equal(content.style.width, '310px')
  await act(async () => root.render(view('light')))
  content = document.querySelector('[role="dialog"]')
  assert.equal(content.getAttribute('data-x-ui-theme'), 'light')
  assert.ok(content.classList.contains('light'))
  assert.equal(content.classList.contains('dark'), false)
  assert.equal(content.style.getPropertyValue('--x-ui-surface'), '#445566')
})

test('tooltip portal inherits the palette and motion setting outside its provider DOM', async () => {
  const container = await render(h(UIThemeProvider, { theme: 'dark', storageKey: false, motion: 'off', style: { '--x-ui-fg': '#fafafa' } },
    h(TooltipProvider, null,
      h(Tooltip, { open: true },
        h(TooltipTrigger, null, 'Inspect'),
        h(TooltipContent, { className: 'host-tooltip', style: { padding: 9 } }, 'Details'),
      ),
    ),
  ))
  const content = document.querySelector('[data-slot="tooltip-content"]')
  assert.ok(content)
  assert.equal(container.contains(content), false)
  assert.equal(content.getAttribute('data-x-ui-theme'), 'dark')
  assert.equal(content.getAttribute('data-x-ui-motion'), 'off')
  assert.equal(content.style.getPropertyValue('--x-ui-fg'), '#fafafa')
  assert.equal(content.style.padding, '9px')
  assert.ok(content.classList.contains('host-tooltip'))
})
