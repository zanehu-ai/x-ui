# x-ui / OpcOrbit website

Official website source for **ui.opcorbit.com**. The website introduces x-ui, provides a searchable component explorer, and documents installation, appearance, motion, and desktop/mobile integration.

The documentation identifies **@zanehu-ai/x-ui@0.2.0-rc.0** as the published
GitHub Packages prerelease on the **next** channel, released on October 14, 2026.
Building or deploying this website does not publish another npm package version.

## Local development

Use Node 22. Install both the library's source dependencies and the website's dependencies from the repository root:

```sh
npm ci --ignore-scripts
npm --prefix website ci --ignore-scripts
npm --prefix website run dev
```

The preview serves at `http://127.0.0.1:8880/`.

| Path | Content |
| --- | --- |
| `/` | Landing page and interactive workspace example |
| `/components` | 7 collections, 46 composed examples, 123 indexed visual exports and aliases |
| `/docs` | Installation, theme, motion, responsive integration, and release availability |
| `/motion` | Interactive motion examples and persistent motion preference |

The component index includes compound parts and aliases; it does not represent 123 independent widgets. Example actions use browser state and synthetic data. No account, backend, or customer data is connected.

## Production build

```sh
npm --prefix website run build
```

Output is `website/dist`, separate from the library's package `dist`. Documentation and example collections load on demand. The Vite alias resolves the library's source inside this repository; no sibling application checkout or absolute machine path is required.

## Vercel configuration

Use the **x-ui repository root** as the Vercel project root. The repository-root `vercel.json` installs both dependency sets, builds the website, serves `website/dist`, and supports its browser routes. Leave the Vercel Root Directory field empty. Do not select `website/` alone: source dependencies also live in the parent library.

After deploying a dedicated x-ui project in the OpcOrbit team, attach `ui.opcorbit.com`. Use the project-specific DNS/ownership records returned by Vercel at the authoritative Alibaba DNS provider. Verify DNS and HTTPS before calling the domain live.

The original design session kept the website local after a **403** from the
Vercel connector; its DNS observation is historical. The October 14 library
release published the package independently of this site. Verify the current
Vercel deployment, DNS and HTTPS before calling `ui.opcorbit.com` live.
Existing component responsiveness gaps remain documented under `/docs#docs-responsive`.

## Component navigation

Component and compound-part links carry an exact `component` query parameter
alongside the existing example anchor. Refresh and browser history preserve the
chosen part, and historical anchor-only URLs continue to resolve. Search renders
only matching composed examples; its automatically expanded groups have disabled
collapse controls. The sidebar count describes indexed exports, including parts.

Run the navigation contracts with `node --test website/component-navigation.test.mjs`.

## Verification

The production build passed. Browser checks covered the landing page at desktop and mobile widths; workspace save, Select, Switch, code copy, theme persistence; all 46 examples and seven collections; compound component search; cold component/documentation links; the mobile drawer's Escape and desktop-resize behavior; and motion-off behavior. Detailed observations are in `verification.json`.

Real-phone touch, mobile keyboard, Chinese IME, Safari/Firefox, and a full accessibility audit remain unverified. Website responsive wrappers do not establish responsive defaults for every library component.

### Screenshot review fixes

The site appearance menu now uses the shared themed Select, including keyboard navigation and mobile-size options. Detail/configuration specimens use their own container width for column selection; the website does not change the library presentation implementations. Documentation navigation follows visible headings during manual scrolling and handles deep links below the sticky header. See the `screenshotFixes` observations in `verification.json`.

### Typography

The wordmarks share weight and baseline, with optical sizing for uppercase OPCORBIT. Desktop uses 23px x-ui and 18px OPCORBIT; smaller desktop uses 22px/17.2px, phones 20px/15.6px, and narrow phones 17px/13.3px. Equal font sizes made the capital letters look larger than lowercase x/u; reducing OPCORBIT to approximately 78% balances their appearance. `typography.css` applies a reading scale informed by https://www.anthropic.com/: approximately 58px desktop/40px mobile primary headings, 24px lead paragraphs, 18px desktop/16px mobile reading text, 16px interface text, and 14px code/captions. It remains scoped to the website. Responsive layout checks covered 1280, 810, 390, and 320px; narrow cards, code, docs, and Select remain within their own bounds. Detailed values are in `verification.json`; the latest brand checks are under `wordmarkOpticalSizing`.
