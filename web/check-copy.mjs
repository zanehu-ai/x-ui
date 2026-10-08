import fs from 'node:fs'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

const BUTTON = '<button type="button" class="xui-copy-button" data-copy="hello@example.test" data-copied-label="Copied" hidden><svg><path d="M1 1"/></svg><span>Copy</span></button>'
const STATUS = '<span class="xui-copy-button__status" data-copied-msg="Copied address" role="status"></span>'
const UNRELATED = '<section id="next"><h2>Keep this heading</h2><a href="#contact"><strong>Keep this link</strong></a></section>'

// Controlled browser APIs and timers: no OS clipboard, network, or real delay.
export async function checkCopyScript(file) {
  const source = fs.readFileSync(file, 'utf8')
  const errors = []
  const cases = [
    ['clipboard success', 'resolve', true, true, true, 0],
    ['clipboard rejection fallback', 'reject', true, true, true, 1],
    ['insecure fallback', 'resolve', false, true, true, 1],
    ['no clipboard fallback', null, true, true, true, 1],
    ['fallback returns false', null, true, false, false, 1],
    ['rejected clipboard, false fallback', 'reject', true, false, false, 1],
    ['fallback throws', null, true, 'throw', false, 1],
    ['rejected clipboard, throwing fallback', 'reject', true, 'throw', false, 1],
  ]
  for (const sibling of [STATUS, '', UNRELATED]) {
    for (const [name, clipboard, secure, fallback, success, fallbackCalls] of cases) {
      const dom = new JSDOM(`<!doctype html><html lang="en"><body>${BUTTON}${sibling}</body></html>`, { url: 'https://example.test/', runScripts: 'outside-only' })
      try {
        const w = dom.window
        const doc = w.document
        const timers = new Map()
        const copied = []
        let id = 0
        let calls = 0
        w.matchMedia = () => ({ matches: false, addEventListener() {} })
        Object.defineProperty(w, 'isSecureContext', { value: secure })
        if (clipboard) Object.defineProperty(w.navigator, 'clipboard', { value: { writeText(value) {
          copied.push(value)
          return clipboard === 'resolve' ? Promise.resolve() : Promise.reject(new Error('denied'))
        } } })
        doc.execCommand = (command) => {
          assert.equal(command, 'copy')
          assert.equal(doc.querySelector('textarea').value, 'hello@example.test')
          calls++
          if (fallback === 'throw') throw new Error('denied')
          return fallback
        }
        w.setTimeout = (fn, ms) => { const next = ++id; timers.set(next, { fn, ms }); return next }
        w.clearTimeout = (timer) => timers.delete(timer)
        w.eval(source)
        const button = doc.querySelector('button')
        const icon = button.querySelector('svg').innerHTML
        const next = doc.querySelector('#next')
        const originalNext = next?.outerHTML
        const status = doc.querySelector('.xui-copy-button__status')
        assert.equal(button.hidden, false)
        button.click()
        await Promise.resolve()
        await Promise.resolve()
        assert.equal(calls, fallbackCalls)
        assert.deepEqual(copied, clipboard && secure ? ['hello@example.test'] : [])
        assert.equal(doc.querySelectorAll('textarea').length, 0)
        assert.equal(button.hasAttribute('data-copied'), success)
        assert.equal(button.querySelector('span').textContent, success ? 'Copied' : 'Copy')
        assert.equal(status?.textContent, status ? (success ? 'Copied address' : '') : undefined)
        assert.equal(timers.size, success ? 1 : 0)
        if (success) {
          // Repeated copy cancels the previous reset and gives a full new interval.
          const previous = [...timers.keys()][0]
          button.click()
          await Promise.resolve()
          await Promise.resolve()
          assert.equal(timers.has(previous), false)
          assert.equal(timers.size, 1)
          for (const [timer, task] of timers) {
            assert.equal(task.ms, 2000)
            timers.delete(timer)
            task.fn()
          }
        }
        assert.equal(button.hasAttribute('data-copied'), false)
        assert.equal(button.querySelector('span').textContent, 'Copy')
        assert.equal(button.querySelector('svg').innerHTML, icon)
        assert.equal(status?.textContent, status ? '' : undefined)
        assert.equal(next?.outerHTML, originalNext, 'reset must preserve unrelated descendants')
        if (next) {
          assert.equal(doc.querySelector('#next'), next, 'reset must preserve the sibling node')
          assert.equal(next.querySelector('strong').textContent, 'Keep this link')
        }
      } catch (error) {
        errors.push(`copy ${name} (${sibling === STATUS ? 'status' : sibling ? 'unrelated sibling' : 'no sibling'}): ${error.stack || error.message}`)
      } finally {
        dom.window.close()
      }
    }
  }
  return errors
}
