# Changelog

All notable changes to `@zanehu-ai/x-ui` will be documented here. Historical
entries retain the package identity under which they were released.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - Unreleased

Stable version prepared for the first public publish. This commit does not
create a tag and does not publish. After approval, tag `v0.2.0` to publish
to `registry.npmjs.org` with dist-tag `latest`, so `npm i @zanehu-ai/x-ui`
installs this version without a token.

Show HN is scheduled for 2026-10-20. A prerelease published only as `next`
would not satisfy a plain `npm i`, which resolves `latest`.

### Changed
- Publish target is the public npm registry (`https://registry.npmjs.org`)
  with `access: public`. The repository `.npmrc` no longer sends the
  `@zanehu-ai` scope to GitHub Packages.
- GitHub Packages is not a forward publish destination. The existing
  `0.2.0-rc.0` artifact on `npm.pkg.github.com` (`next`, 2026-10-14) stays
  where it is and still requires a GitHub token.
- Public package metadata: `description`, `homepage`, `bugs`, `keywords`,
  `repository`, `sideEffects`, and an `exports` map for the root entry,
  `package.json`, the theme stylesheet, and existing `dist/*` paths.
- `v*` tags publish with `npm publish --provenance --access public`.
  Prerelease versions use dist-tag `next`; every other version uses `latest`.
  The workflow reads the `NPM_TOKEN` Actions secret.

### Promoted
- 0.2.0 promotes the `0.2.0-rc.0` candidate to the default channel. Theme,
  feedback, and `presentation` behavior is the candidate's; see that entry.

## [0.2.0-rc.0] - 2026-10-13

Release candidate for consumer validation. Tagged `v0.2.0-rc.0` and published
to GitHub Packages (`npm.pkg.github.com`) under the `next` dist-tag; installing
it requires npm authentication with a GitHub token that has `read:packages`.
It is not on the public npm registry. A stable consumer release remains a
separate approval checkpoint.

### Added
- Opt-in `UIThemeProvider` / `useUITheme` with Light, Dark and System appearance,
  saved or controlled preferences, and theme propagation to library portals.
- Optional `dist/theme/styles.css` with scoped animation and reduced-motion
  support. Consumer Tailwind scanning of `dist/**/*.js` remains required.
- `Skeleton`, `Spinner`, `Progress`, `Popover`, `Tooltip`, `SegmentedControl`
  and their composition parts.
- The `presentation` namespace for retained detail and configuration components.

### Changed
- The package identity is `@zanehu-ai/x-ui`; historical `synapse-ui` releases
  remain unchanged. The RC publishes to the `next` channel after its matching
  tag is created; stable versions use `latest`.
- Shared primitives, forms, navigation, chat and presentation blocks use scoped
  monochrome tokens while retaining legacy palette fallbacks outside a provider.
- Loading buttons keep their visible dimensions and accessible name and prevent
  repeat activation, including when rendering a single child link.

### Migration and validation
- Install the local `npm pack` artifact only for preview validation. Do not
  commit a machine-specific `file:` dependency; use an explicitly approved
  published version for a reproducible release installation.
- Keep Cargo product content outside the provider in both the React tree and
  the DOM. A plain nested wrapper does not reset inherited palette variables,
  dark selectors, motion rules or portal context. Theme shell regions with
  sibling providers that share controlled appearance state.
- Existing dialog initial-focus defaults and substring-based status mapping
  are preserved. Consumers must validate focus and status meaning in the
  workflows they adopt; this candidate does not establish production acceptance.

## [0.1.8] - 2026-05-22

First release under the `@zanehu-ai/synapse-ui` npm name after the package
rename from `@techfitmaster/synapse-ui` (the latter remains at 0.1.6 and will
not see further releases).

### Added
- Console shared components surface (`feat(ui): expose console shared components`).
- Opcorbit platform primitives (`feat(ui): expose opcorbit platform primitives`).
- `Pagination` component supports `pageSize` switcher.

### Changed
- `Tabs` variant declarations made portable: `tabsListVariants` now returns
  a typed function signature; `TabsListVariant` / `TabsListVariantProps` /
  `TabsListVariantsProps` exported. This unblocks downstream consumers (such
  as opcorbit/console) that were previously pinned to commit `394f067` to
  pick up this fix.
- `SelectField` listbox testability + label association improvements.
- Dialog / AlertDialog / Button styling consistency fixes.
- Package renamed to `@zanehu-ai/synapse-ui` (was `@techfitmaster/synapse-ui`).

### Fixed
- Dist entrypoints node-resolvable.
- String table column width support.

## [0.1.6]

Last release under `@techfitmaster/synapse-ui`; no further updates planned.

[0.2.0]: https://github.com/zanehu-ai/x-ui/releases/tag/v0.2.0
[0.1.8]: https://github.com/zanehu-ai/synapse-ui/releases/tag/v0.1.8
[0.1.6]: https://github.com/zanehu-ai/synapse-ui/releases/tag/v0.1.6
