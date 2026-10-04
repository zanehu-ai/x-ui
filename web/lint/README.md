# x-ui lint kit

Zero-dependency checks for a site that consumes `x-ui.css`. A site holds content and brand-token overrides. It does not copy component CSS.

```bash
node web/lint/check-tbc.mjs dist
node web/lint/check-consumer.mjs --tokens web/tokens.json site.css
```

`check-tbc.mjs` fails if `xui-tbc`, `to confirm`, `待确认`, or `mockup-only.css` appears in `.html`, `.css`, `.js`, `.json`, `.xml`, or `.txt` files.

`check-consumer.mjs` flags:

- a class that is not `.xui-*`
- a custom property that is not `--xui-*`
- a component or element rule that sets a property other than a token (duplicated library CSS)
- a raw hex colour that already has an `--xui-*` token

Brand overrides are a custom-property block, for example:

```css
[data-brand="zane"] {
  --xui-radius-component: 0;
}
```

`npm run build:web:dev` copies this directory to `web/dist-dev/lint/`. That folder is gitignored and is not uploaded.
