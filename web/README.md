# x-ui for static sites

Opt-in stylesheet and scripts for static sites. zanehu.ai uses it now. opcorbit.com can use the same files later.

This entry does not change `@zanehu-ai/synapse-ui` React components. Cargo portal and the x-core console keep importing the React package as they do today.

A site holds **content** and **brand-token overrides**. Component CSS lives in `x-ui.css`.

## Install on a page

Set the brand on `<html>`: `zane` or `opcorbit`.

Put the theme script in `<head>` **before** the stylesheet, with no `defer` and no `async`, so the theme is set before first paint. Load `xui.js` with `defer` at the end of `<body>`.

Read `integrity` from `manifest.json` after `npm run build:web` (fields `sri.x-ui.css`, `sri.theme-script.js`, `sri.xui.js`). The public URL uses the calendar release, `x-ui-vYYYY.MM.N`. The first planned tag is `x-ui-v2026.10.1`. This package’s `version` stays `0.1.8` until that release PR.

```html
<!doctype html>
<html lang="en" data-brand="zane">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="color-scheme" content="dark light">
    <script
      src="https://ui.zanehu.ai/x-ui-vYYYY.MM.N/theme-script.js"
      integrity="sha384-…"
      crossorigin="anonymous"
    ></script>
    <link
      rel="stylesheet"
      href="https://ui.zanehu.ai/x-ui-vYYYY.MM.N/x-ui.css"
      integrity="sha384-…"
      crossorigin="anonymous"
    >
  </head>
  <body>
    <script
      src="https://ui.zanehu.ai/x-ui-vYYYY.MM.N/xui.js"
      integrity="sha384-…"
      crossorigin="anonymous"
      defer
    ></script>
  </body>
</html>
```

`opcorbit` is the same page with `data-brand="opcorbit"`.

## Theme

`data-theme` is `light` or `dark`. The theme button cycles system → light → dark. System is the default: `theme-script.js` reads `localStorage` key `theme` and, when the value is missing, follows `prefers-color-scheme`. `xui.js` listens to `prefers-color-scheme: light` for the whole page. While the preference is `system`, that listener updates `data-theme`. Light or dark leaves the listener in place and ignores it. An operating-system change does not announce.

With JavaScript, `data-theme` is set before paint. Choosing a theme writes a visually hidden `span.xui-live` (`role="status"`, `aria-live="polite"`). English: “Theme: Light”, “Theme: Dark”, or “Theme: System (Dark)” when system resolves to dark. Chinese (`lang` starting with `zh`): “主题：浅色”, “主题：深色”, or “主题：跟随系统（深色）”.

The brand CSS also includes a `prefers-color-scheme: light` block for a page that has no `data-theme`. That block is what a no-JS visitor on a light OS gets. A no-JS visitor on a dark OS gets the dark tokens.

## What a site may override

Override tokens under `[data-brand="…"]`. Do not copy component rules.

```css
[data-brand="zane"] {
  --xui-radius-component: 0;
}
```

Both brands share the black-and-white palette. They differ in type, wordmark, heading case and radius (zane 2px, opcorbit 4px), plus content.

| | zane | opcorbit |
|---|---|---|
| Display / wordmark | Barlow Condensed | Geist |
| Body | Inter | Geist |
| Mono | JetBrains Mono | Geist Mono |
| Headings | uppercase | none |
| Radius | 2px | 4px |

Dark surfaces are `#000000`. Light surfaces are `#FFFFFF`. Raised surfaces use the same colour as the page; cards are separated by borders. Secondary and tertiary text, and borders, are the only greys. Accent, action and inverse colours equal the foreground. `accent-on` is the opposite colour. Highlight is transparent. Emphasis on the email link is a 3px underline.

Add `xui-on-image` with `xui-hero--island` when a block must stay black in both themes.

The footer legal slot is `<div class="xui-footer__legal"></div>`. It renders nothing until the site puts the company legal name and ICP filing in it.

## Behaviour in `xui.js`

- Theme toggle (button and the `data-xui-theme-radio` group), including the live announcement above
- Phone menu. Opening sets that burger's `aria-expanded` to `"true"` and moves focus to `.xui-drawer__close`. Tab stays inside the drawer. Escape and the close button set every burger's `aria-expanded` to `"false"` and return focus to the burger that opened it.
- Copy button (hidden until JavaScript runs, with a `document.execCommand("copy")` fallback)

Language switching is plain links. It has no script.

## Tokens in the npm package

`web/tokens.json` is the source of truth and is build-time only. It is not in the published tarball.

```ts
import { tokens, type WebBrand } from '@zanehu-ai/synapse-ui/web/tokens.js'
```

`npm run build:web` refreshes `web/tokens.ts`, `web/tokens.js` and `web/tokens.d.ts`.

## Fonts

`build:web` writes Latin `woff2` subsets for Inter, Barlow Condensed, JetBrains Mono, Geist and Geist Mono, at the weights the CSS uses. `@font-face` urls are relative (`fonts/...`). CJK text uses the system stack in `--xui-font-cjk` and is not self-hosted.

Each family’s SIL Open Font License text is appended to `x-ui.css` as a `/*! ... */` comment after minification, so a later legal-comment pass keeps it. `manifest.json` lists the same families under `licenses` (`id`, `family`, `license`, `copyright`). The release allowlist does not accept a sibling `.txt` file under `fonts/`.

Font files and the `@font-face` block are produced only by `web/fonts.mjs`. Dropping that block and `web/dist/fonts/` switches the sites to system fonts. The family names in the token stacks stay, so text falls through to `system-ui` and the CJK list.

## Scripts

```bash
npm run build:web      # web/dist only: css, theme-script.js, xui.js, manifest.json, fonts/**/*.woff2
npm run build:web:dev  # also writes the catalog and lint kit to web/dist-dev/
npm run check:web      # rebuilds and checks the allowlist, SRI, font urls, contrast, markers
```

`web/dist/` and `web/dist-dev/` are gitignored. The dev catalog is `web/dist-dev/demo/index.html` (`?brand=zane|opcorbit&theme=light|dark`). The orbit drawing is only in that demo folder.

## Lint kit

`web/lint/check-tbc.mjs` fails the build if a mockup marker ships. `web/lint/check-consumer.mjs` flags non-prefixed classes and custom properties, duplicated component CSS, and raw hex colours that already have a token. `build:web:dev` copies the kit to `web/dist-dev/lint/`.
