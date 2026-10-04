import fs from 'node:fs'
import { JSDOM } from 'jsdom'

const HTML = `<!doctype html>
<html lang="en">
<head>
  <style>
    .xui-live { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
  </style>
</head>
<body>
  <button type="button" class="xui-theme-toggle" aria-label="Theme"></button>
  <button type="button" class="xui-header__burger" aria-expanded="false">Menu</button>
  <div class="xui-drawer" role="dialog" aria-modal="true" aria-label="Menu">
    <button type="button" class="xui-drawer__close">Close</button>
    <a class="xui-drawer__row" href="#products">Work</a>
    <a href="#contact">Contact</a>
    <div class="xui-drawer__pref">
      <label>System<input type="radio" name="xui-theme" value="system" data-xui-theme-radio></label>
      <label>Light<input type="radio" name="xui-theme" value="light" data-xui-theme-radio></label>
      <label>Dark<input type="radio" name="xui-theme" value="dark" data-xui-theme-radio></label>
    </div>
    <div class="xui-drawer__pad">Notes</div>
  </div>
  <button type="button" class="page-main">Outside</button>
</body>
</html>`

/**
 * jsdom checks aligned with the shared xui.js: Close-button focus, Esc,
 * the focus trap, and the live-region strings (including the resolved
 * system theme).
 */
export async function checkMenuScript(file) {
  const source = fs.readFileSync(file, 'utf8')
  const errors = []
  try {
    errors.push(...checkMenu(source))
    errors.push(...(await checkTheme(source, 'en')))
    errors.push(...(await checkTheme(source, 'zh')))
  } catch (error) {
    errors.push(`xui.js DOM check threw: ${error.stack || error.message}`)
  }
  return errors
}

function checkMenu(source) {
  const errors = []
  const { window, document } = boot(source)
  reveal(window)
  const burger = document.querySelector('.xui-header__burger')
  const drawer = document.querySelector('.xui-drawer')
  const close = document.querySelector('.xui-drawer__close')
  const items = [...drawer.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea')]
  const first = items[0]
  const last = items[items.length - 1]

  const expectClosed = (label) => {
    if (burger.getAttribute('aria-expanded') !== 'false' || document.documentElement.classList.contains('xui-menu-open')) {
      errors.push(`${label}: menu stayed open (aria-expanded=${burger.getAttribute('aria-expanded')})`)
    }
    if (document.activeElement !== burger) errors.push(`${label}: focus did not return to the burger`)
  }

  if (burger.getAttribute('aria-expanded') !== 'false') errors.push('burger did not start collapsed')
  if (first !== close) errors.push('Close button is not the first focusable item in the drawer')

  burger.focus()
  burger.click()
  if (burger.getAttribute('aria-expanded') !== 'true') errors.push('opening did not set aria-expanded="true"')
  if (document.activeElement !== close) errors.push('opening did not move focus to the Close button')

  last.focus()
  const tab = key(window, 'Tab')
  if (!tab.defaultPrevented || document.activeElement !== close) errors.push('Tab on the last item did not wrap to the Close button')
  close.focus()
  const shift = key(window, 'Tab', { shiftKey: true })
  if (!shift.defaultPrevented || document.activeElement !== last) errors.push('Shift+Tab from the Close button did not wrap to the last item')
  items[1].focus()
  const middle = key(window, 'Tab')
  if (middle.defaultPrevented) errors.push('Tab in the middle of the menu was trapped too early')
  document.activeElement.blur()
  const outsideTab = key(window, 'Tab')
  if (!outsideTab.defaultPrevented || document.activeElement !== close) errors.push('Tab outside the menu did not move focus to the Close button')

  key(window, 'Escape')
  expectClosed('Escape')

  burger.click()
  close.click()
  expectClosed('Close button')

  key(window, 'Escape')
  if (burger.getAttribute('aria-expanded') !== 'false') errors.push('Escape while closed changed aria-expanded')
  return errors
}

async function checkTheme(source, lang) {
  const errors = []
  const { window, document, mq } = boot(source, { lang, matches: false, pref: 'system' })
  const zh = lang === 'zh'
  const toggle = document.querySelector('.xui-theme-toggle')
  const light = document.querySelector('[data-xui-theme-radio][value="light"]')
  const dark = document.querySelector('[data-xui-theme-radio][value="dark"]')
  const system = document.querySelector('[data-xui-theme-radio][value="system"]')
  const live = () => document.querySelector('.xui-live')
  const text = {
    light: zh ? '主题：浅色' : 'Theme: Light',
    dark: zh ? '主题：深色' : 'Theme: Dark',
    systemDark: zh ? '主题：跟随系统（深色）' : 'Theme: System (Dark)',
  }

  if (live()) errors.push(`${lang}: live region existed before a theme change`)
  if (mq.size !== 1) errors.push(`${lang}: system mode did not subscribe to prefers-color-scheme`)

  mq.dispatch(true)
  if (document.documentElement.dataset.theme !== 'light') errors.push(`${lang}: system mode ignored a live scheme change to light`)
  mq.dispatch(false)
  if (document.documentElement.dataset.theme !== 'dark') errors.push(`${lang}: system mode ignored a live scheme change to dark`)
  if (live()) errors.push(`${lang}: an operating-system change announced a theme`)

  document.documentElement.dataset.themePref = 'dark'
  document.documentElement.dataset.theme = 'dark'
  mq.dispatch(true)
  if (document.documentElement.dataset.theme !== 'dark') errors.push(`${lang}: an explicit theme followed the system scheme`)
  if (mq.size !== 1) errors.push(`${lang}: explicit theme removed the scheme listener`)

  choose(window, light)
  await announced(live(), text.light, `${lang} Light`, errors)
  mq.dispatch(false)
  if (document.documentElement.dataset.theme !== 'light') errors.push(`${lang}: explicit Light followed the OS`)

  choose(window, dark)
  await announced(live(), text.dark, `${lang} Dark`, errors)

  choose(window, system)
  await announced(live(), text.systemDark, `${lang} System`, errors)
  const spoken = live().textContent
  mq.dispatch(true)
  if (document.documentElement.dataset.theme !== 'light') errors.push(`${lang}: system mode did not apply after returning to system`)
  if (live().textContent !== spoken) errors.push(`${lang}: system scheme change rewrote the live region`)

  toggle.click()
  if (toggle.getAttribute('aria-label') !== (zh ? '主题：浅色。切换到深色。' : 'Theme: Light. Switch to Dark.')) {
    errors.push(`${lang}: aria-label was not updated (${toggle.getAttribute('aria-label')})`)
  }
  await announced(live(), text.light, `${lang} toggle`, errors)
  return errors
}

function choose(window, input) {
  input.checked = true
  input.dispatchEvent(new window.Event('change', { bubbles: true }))
}

async function announced(region, expected, label, errors) {
  await new Promise((resolve) => setTimeout(resolve, 80))
  if (!region || !region.classList.contains('xui-live') || region.getAttribute('role') !== 'status' || region.getAttribute('aria-live') !== 'polite') {
    errors.push(`${label}: live region is not a polite status .xui-live`)
    return
  }
  if (region.textContent !== expected) errors.push(`${label}: live region said ${JSON.stringify(region.textContent)}`)
  const width = region.ownerDocument.defaultView.getComputedStyle(region).width
  if (width !== '1px') errors.push(`${label}: live region width is ${width}`)
}

function boot(source, { lang = 'en', matches = false, pref = 'system' } = {}) {
  const dom = new JSDOM(HTML, { url: 'https://example.test/demo', runScripts: 'outside-only' })
  const { window } = dom
  const { document } = window
  document.documentElement.lang = lang
  document.documentElement.dataset.themePref = pref
  document.documentElement.dataset.theme = pref === 'system' ? (matches ? 'light' : 'dark') : pref
  const mq = installMatchMedia(window, matches)
  window.eval(source)
  return { window, document, mq }
}

function reveal(window) {
  for (const el of window.document.querySelectorAll('a,button,input,select,textarea')) {
    Object.defineProperty(el, 'offsetParent', { configurable: true, get: () => window.document.body })
  }
}

function installMatchMedia(window, matches) {
  const listeners = new Set()
  const mq = {
    matches,
    media: '(prefers-color-scheme: light)',
    addEventListener(type, fn) {
      if (type === 'change') listeners.add(fn)
    },
    removeEventListener(type, fn) {
      if (type === 'change') listeners.delete(fn)
    },
    addListener(fn) {
      listeners.add(fn)
    },
    removeListener(fn) {
      listeners.delete(fn)
    },
    dispatch(next) {
      this.matches = next
      for (const fn of listeners) fn({ matches: next, media: this.media })
    },
    get size() {
      return listeners.size
    },
  }
  window.matchMedia = () => mq
  return mq
}

function key(window, name, extra = {}) {
  const event = new window.KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...extra })
  window.document.dispatchEvent(event)
  return event
}
