import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { JSDOM } from 'jsdom'
import { createElement as h, act } from 'react'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost', pretendToBeVisual: true })
for (const key of ['window', 'document', 'HTMLElement', 'Element', 'Node', 'NodeFilter', 'MutationObserver', 'CustomEvent', 'Event', 'FocusEvent', 'KeyboardEvent', 'MouseEvent', 'PointerEvent']) {
  globalThis[key] = dom.window[key]
}
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window)
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const { createRoot } = await import('react-dom/client')
// Exercise the emitted public entry, including its generated relative imports.
const { presentation: ui, StatusBadge, SimpleDialog, formatMoney, formatAmount, formatDateTime } = await import('../dist/index.js')
let root

async function render(element) {
  const container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  await act(async () => { root.render(element) })
  return container
}

afterEach(async () => {
  if (root) await act(async () => root.unmount())
  root = undefined
  document.body.innerHTML = ''
})

test('date rendering converts UTC and timezone-less backend values to the viewer timezone', () => {
  const previous = process.env.TZ
  try {
    process.env.TZ = 'Asia/Shanghai'
    for (const value of ['2026-06-01T02:19:14Z', '2026-06-01 02:19:14', '2026-06-01T04:19:14+02:00']) {
      assert.equal(ui.renderDateTime(value), '2026-06-01 10:19:14')
    }
    process.env.TZ = 'UTC'
    assert.equal(ui.renderDateTime('2026-06-01 02:19:14'), '2026-06-01 02:19:14')
  } finally {
    if (previous === undefined) delete process.env.TZ
    else process.env.TZ = previous
  }
  assert.equal(ui.renderDateTime(null), '-')
  assert.equal(ui.renderDateTime(0), '0')
  assert.equal(ui.renderDateTime('abc'), 'abc')
  assert.equal(ui.renderDateTime('2026-99-01T02:19:14Z'), '2026-99-01 02:19:14')
})

test('money rendering preserves missing, invalid, decimal object and multi-currency values', () => {
  assert.equal(ui.renderMoney(null), '-')
  assert.equal(ui.renderMoney(''), '-')
  assert.equal(ui.renderMoney('12invalid', 'RUB'), '12invalid')
  assert.equal(ui.renderMoney({ amount: '1234.5' }, 'RUB'), '1,234.50 RUB')
  assert.equal(ui.renderMoney(0), '0.00')
  assert.equal(ui.renderMoney(-1250.2, 'USD'), '-1,250.20 USD')
  assert.equal(ui.renderBoolean(true), '是')
  assert.equal(ui.renderBoolean(false), '否')
  assert.equal(ui.renderBoolean(1), '-')
  // The pre-existing root utilities intentionally have a different contract.
  assert.equal(formatMoney(null), '¥0.00')
  assert.equal(formatMoney('12invalid'), '¥12.00')
  assert.equal(formatAmount(null), '0.00')
  assert.equal(formatDateTime(0), '-')
})

test('status rendering keeps the label independent from the status color without changing the root badge', async () => {
  const container = await render(h('div', null,
    ui.renderStatusBadge('pending', '待审核'),
    h(ui.StatusBadge, { status: '1' }, '一'),
    h(StatusBadge, { status: 1 }),
  ))
  const badges = container.querySelectorAll('span')
  assert.equal(badges[0].textContent, '待审核')
  assert.match(badges[0].className, /bg-yellow-100/)
  assert.equal(badges[1].textContent, '一')
  assert.match(badges[1].className, /bg-slate-100/)
  assert.match(badges[2].className, /bg-green-100/)
  assert.equal(ui.renderStatusBadge(undefined), '-')
})

test('detail descriptions render zero and fall back only for empty values', async () => {
  const container = await render(h('div', null,
    h(ui.DescriptionSummary, { title: 'Account', subtitle: 'Details', extra: h('button', null, 'Edit') }),
    h(ui.DescriptionSection, { title: 'Balance' },
      h(ui.DescriptionItem, { label: 'Amount' }, 0),
      h(ui.DescriptionItem, { label: 'Missing', span: 2 }, ''),
    ),
  ))
  assert.equal(container.querySelector('h3').textContent, 'Balance')
  assert.deepEqual([...container.querySelectorAll('dd')].map(el => el.textContent), ['0', '—'])
  assert.match(container.querySelectorAll('dd')[1].parentElement.className, /sm:col-span-2/)
  assert.equal(container.querySelector('button').textContent, 'Edit')
})

test('configuration fields accept host translations and custom renderers without a provider', async () => {
  const container = await render(h(ui.ConfigFieldGrid, {
    fields: [
      { key: 'enabled', label: 'Enabled' },
      { key: 'disabled', label: 'Disabled' },
      { key: 'absent', label: 'Missing' },
      { key: 'settings', label: 'Settings', hint: 'Raw settings' },
      { key: 'count', label: 'Count', render: row => `Count ${row.count}` },
    ],
    row: { enabled: true, disabled: false, absent: null, settings: { limit: 5 }, count: 0 },
    labels: { emptyValue: 'Empty', yes: 'Yes', no: 'No' },
  }))
  assert.deepEqual([...container.querySelectorAll('dd')].map(el => el.textContent), ['Yes', 'No', 'Empty', '{\n  "limit": 5\n}', 'Count 0'])
  assert.equal(container.querySelector('p').textContent, 'Raw settings')
})

test('presentation controls preserve loading, neutral badges and toggle callbacks', async () => {
  const changes = []
  const container = await render(h('div', null,
    h(ui.Button, { loading: true }, 'Submit'),
    h(ui.Badge, { variant: 'outline' }, 'Label'),
    h(ui.ToggleChip, { active: false, onPressedChange: () => changes.push(true) }, 'Filter'),
  ))
  const buttons = container.querySelectorAll('button')
  assert.equal(buttons[0].disabled, true)
  assert.equal(buttons[0].textContent, 'Loading...')
  assert.match(container.querySelector('span').className, /bg-slate-100/)
  assert.equal(buttons[1].getAttribute('aria-pressed'), 'false')
  await act(async () => { buttons[1].click() })
  assert.deepEqual(changes, [true])
})

test('presentation dialog retains body, footer, outside protection and explicit close behavior', async () => {
  let closes = 0
  await render(h(ui.SimpleDialog, {
    open: true, title: 'Edit parcel', onClose: () => { closes++ },
    bodyClassName: 'custom-body', footer: h('button', null, 'Save'),
  }, h('p', null, 'Form fields')))
  const dialog = document.querySelector('[role="dialog"]')
  assert.ok(dialog)
  assert.match(dialog.className, /max-h-\[90vh\]/)
  assert.equal(dialog.querySelector('.custom-body').textContent, 'Form fields')
  assert.match(dialog.querySelector('button').parentElement.className, /shrink-0/)
  // Radix installs its document pointer listener on the following task.
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })
  await act(async () => { document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' })) })
  assert.equal(closes, 0)
  await act(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })) })
  assert.equal(closes, 1)
})

test('root SimpleDialog keeps its original outside-dismiss and unwrapped-body defaults', async () => {
  let closes = 0
  await render(h(SimpleDialog, { open: true, title: 'Legacy', onClose: () => { closes++ } }, h('p', null, 'Legacy body')))
  const dialog = document.querySelector('[role="dialog"]')
  assert.doesNotMatch(dialog.className, /max-h-\[90vh\]/)
  assert.equal(dialog.querySelector('p').parentElement, dialog)
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })
  await act(async () => { document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' })) })
  assert.equal(closes, 1)
})
