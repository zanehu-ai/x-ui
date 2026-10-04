import fs from 'node:fs'
import { JSDOM } from 'jsdom'

const HTML = `<!doctype html>
<html lang="en">
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
 * jsdom checks for the phone menu (aria-expanded, focus return, Esc, focus
 * trap) and the theme live region. Also checks the system-theme listener,
 * since it shares this script.
 */
export function checkMenuScript(file) {
  const source = fs.readFileSync(file, 'utf8')
  const errors = []
  try {
    errors.push(...checkMenu(source))
    errors.push(...checkTheme(source, 'en'))
    errors.push(...checkTheme(source, 'zh'))
  } catch (error) {
    errors.push(`xui.js DOM check threw: ${error.stack || error.message}`)
  }
  return errors
}

function checkMenu(source) {
  const errors = []
  const { window, document } = boot(source)
  const burger = document.querySelector('.xui-header__burger')
  const drawer = document.querySelector('.xui-drawer')
  const close = document.querySelector('.xui-drawer__close')
  const link = document.querySelector('.xui-drawer a[href]')
  const pad = document.querySelector('.xui-drawer__pad')
  const outside = document.querySelector('.page-main')
  const items = focusables(drawer)
  const first = items[0]
  const last = items[items.length - 1]

  const expectClosed = (label) => {
    if (burger.getAttribute('aria-expanded') !== 'false' || document.documentElement.classList.contains('xui-menu-open')) {
      errors.push(`${label}: menu stayed open (aria-expanded=${burger.getAttribute('aria-expanded')})`)
    }
    if (document.activeElement !== burger) errors.push(`${label}: focus did not return to the burger`)
  }

  if (burger.getAttribute('aria-expanded') !== 'false') errors.push('burger did not start collapsed')

  burger.focus()
  burger.click()
  if (burger.getAttribute('aria-expanded') !== 'true') errors.push('opening did not set aria-expanded="true"')
  if (document.activeElement !== first) errors.push('opening did not move focus into the menu')

  last.focus()
  const tab = key(window, 'Tab')
  if (!tab.defaultPrevented || document.activeElement !== first) errors.push('Tab on the last item did not wrap to the first')
  first.focus()
  const shift = key(window, 'Tab', { shiftKey: true })
  if (!shift.defaultPrevented || document.activeElement !== last) errors.push('Shift+Tab on the first item did not wrap to the last')
  items[1].focus()
  const middle = key(window, 'Tab')
  if (middle.defaultPrevented) errors.push('Tab in the middle of the menu was trapped too early')
  document.activeElement.blur()
  const outsideTab = key(window, 'Tab')
  if (!outsideTab.defaultPrevented || document.activeElement !== first) errors.push('Tab outside the menu did not move focus back in')

  key(window, 'Escape')
  expectClosed('Escape')

  burger.click()
  close.click()
  expectClosed('close button')

  burger.click()
  link.click()
  expectClosed('link click')

  burger.click()
  outside.click()
  expectClosed('outside click')

  burger.click()
  pad.click()
  if (burger.getAttribute('aria-expanded') !== 'true') errors.push('a click inside the drawer closed the menu')
  burger.click()
  expectClosed('burger toggle')

  key(window, 'Escape')
  if (burger.getAttribute('aria-expanded') !== 'false') errors.push('Escape while closed changed aria-expanded')
  return errors
}

function checkTheme(source, lang) {
  const errors = []
  const { window, document, mq } = boot(source, { lang, matches: false, pref: 'system' })
  const zh = lang === 'zh'
  const live = document.querySelector('[aria-live="polite"]')
  const toggle = document.querySelector('.xui-theme-toggle')
  const light = document.querySelector('[data-xui-theme-radio][value="light"]')
  const system = document.querySelector('[data-xui-theme-radio][value="system"]')

  if (!live || !live.classList.contains('xui-visually-hidden')) {
    errors.push(`${lang}: missing the visually hidden polite live region`)
  }
  if (live && live.textContent !== '') errors.push(`${lang}: live region announced before a theme change`)
  if (mq.size !== 1) errors.push(`${lang}: system mode did not subscribe to prefers-color-scheme`)

  mq.dispatch(true)
  if (document.documentElement.dataset.theme !== 'light') errors.push(`${lang}: system mode ignored a live scheme change to light`)
  mq.dispatch(false)
  if (document.documentElement.dataset.theme !== 'dark') errors.push(`${lang}: system mode ignored a live scheme change to dark`)

  document.documentElement.dataset.themePref = 'dark'
  document.documentElement.dataset.theme = 'dark'
  mq.dispatch(true)
  if (document.documentElement.dataset.theme !== 'dark') errors.push(`${lang}: an explicit theme followed the system scheme`)
  document.documentElement.dataset.themePref = 'system'

  light.checked = true
  light.dispatchEvent(new window.Event('change', { bubbles: true }))
  if (document.documentElement.dataset.theme !== 'light' || mq.size !== 0) {
    errors.push(`${lang}: choosing light did not drop the scheme listener`)
  }
  mq.dispatch(false)
  if (document.documentElement.dataset.theme !== 'light') errors.push(`${lang}: light mode changed after the listener should have been gone`)
  const announced = zh ? '主题：浅色' : 'Theme: Light'
  if (!live || live.textContent !== announced) errors.push(`${lang}: live region said ${JSON.stringify(live && live.textContent)}`)

  system.checked = true
  system.dispatchEvent(new window.Event('change', { bubbles: true }))
  if (mq.size !== 1) errors.push(`${lang}: returning to system did not resubscribe`)
  mq.dispatch(true)
  if (document.documentElement.dataset.theme !== 'light') errors.push(`${lang}: system mode did not apply after resubscribe`)

  toggle.click()
  if (toggle.getAttribute('aria-label') !== (zh ? '主题：浅色。切换到深色。' : 'Theme: Light. Switch to Dark.')) {
    errors.push(`${lang}: aria-label was not updated (${toggle.getAttribute('aria-label')})`)
  }
  if (!live || live.textContent !== announced) errors.push(`${lang}: toggle did not announce the new theme`)
  return errors
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

function focusables(root) {
  return [...root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled])')]
}

function key(window, name, extra = {}) {
  const event = new window.KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...extra })
  window.document.dispatchEvent(event)
  return event
}
