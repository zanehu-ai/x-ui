# x-ui

Shared React components, frontend utilities and OpcOrbit API primitives. The repository is `x-ui`; the npm package is now **`@zanehu-ai/x-ui`**.

[package.json](package.json) defines dependencies and build scripts; [src/index.ts](src/index.ts) defines the root API. Source lives in `src/` and the package ships compiled JavaScript and declarations in `dist/`. This library has no standalone application or development server.

## Local package-name migration

The new `@zanehu-ai/x-ui` identity is unpublished. Console uses the local `0.2.0-rc.0` candidate. Core and Cargo retain the released `0.1.8` implementation through an identity-only compatibility repack; this does not upgrade their UI or API behavior.

```bash
node scripts/prepare-compat-package.mjs --destination /path/to/consumer/.local-packages
# Offline alternative, using an intact installed original package:
node scripts/prepare-compat-package.mjs --destination /path/to/consumer/.local-packages --source /path/to/original/synapse-ui
```

Without `--source`, the script fetches original `@zanehu-ai/synapse-ui@0.1.8` using existing npm credentials and validates its recorded registry integrity. With an explicit directory, provenance records that archive integrity was not independently verified. Both paths copy all `dist` files unchanged, rename only package metadata, and write a local provenance file with every dist hash and the new artifact integrity. Consumers must prepare these ignored artifacts before frozen installation. Registry publication and replacement of local overrides remain a separate authorized release.

## Install in an application

Configure the package scope in the application's `.npmrc`:

```ini
@zanehu-ai:registry=https://npm.pkg.github.com
```

Use authorized GitHub Packages access through private user or CI configuration. Keep credentials out of repository files and browser environment variables. Select a reviewed release rather than assuming that every API in this checkout is available from the registry:

```bash
# Replace <reviewed-version> with the release your application will use.
npm install @zanehu-ai/x-ui@<reviewed-version>
```

The manifest currently declares the **unpublished `0.2.0-rc.0` release candidate**. The `presentation` namespace in this source is absent from the recorded `v0.1.8` source tag; its adoption requires a release that includes it. See [consumer migration](#consumer-migration-after-release).

The theme and feedback APIs below are included in this **unpublished release candidate**. Their presence in this checkout or a local package build does not make them available in the published `0.1.8` package. A versioned `npm pack` artifact can validate a local consumer preview; shipping adoption requires an approved published release that includes them.

### Application requirements

The consuming app supplies the peer dependencies declared in [package.json](package.json):

| Dependency | Supported range |
| --- | --- |
| React / React DOM | `^18.3.0 \|\| ^19.0.0` |
| TanStack React Query | `^5.0.0` |
| TanStack React Table | `^8.20.0` |
| Axios | `^1.7.0` |
| Zustand | `^5.0.0` |
| Lucide React | `>=0.300.0` |

Components use Tailwind utility classes. Include the installed package's `dist/**/*.js` in the application's Tailwind source scan. The unreleased theme additions provide an optional `dist/theme/styles.css` stylesheet for scoped theme surfaces and motion; it does not replace the Tailwind scan or generated component styles. The package does not automatically configure the host's providers, routing or authentication.

## Usage

```tsx
import { Button, Card, CardContent } from '@zanehu-ai/x-ui'

export function SaveCard() {
  return (
    <Card>
      <CardContent>
        <Button type="submit">Save changes</Button>
      </CardContent>
    </Card>
  )
}
```

Import only APIs present in the release you install. Root exports and existing deep module paths are compatibility contracts; repository moves do not rename them.

## Opt-in theme and motion (unreleased)

Import the optional stylesheet explicitly at the application entry and wrap the
area that should adopt the theme. Existing components retain their legacy
defaults outside `UIThemeProvider`; importing the stylesheet alone does not
enable a theme globally.

```tsx
import { Button, UIThemeProvider, useUITheme } from '@zanehu-ai/x-ui'
import '@zanehu-ai/x-ui/dist/theme/styles.css'

function ThemeControls() {
  const { theme, resolvedTheme, setTheme } = useUITheme()
  return (
    <section>
      <p>Current appearance: {resolvedTheme}</p>
      {(['light', 'dark', 'system'] as const).map(choice => (
        <Button
          key={choice}
          aria-pressed={theme === choice}
          variant={theme === choice ? 'primary' : 'outline'}
          onClick={() => setTheme(choice)}
        >
          {choice}
        </Button>
      ))}
    </section>
  )
}

export function ThemedControls() {
  return (
    <UIThemeProvider defaultTheme="system" motion="auto">
      <ThemeControls />
    </UIThemeProvider>
  )
}
```

`useUITheme()` must run within a provider. It returns the selected `theme`
(`light`, `dark` or `system`), the effective `resolvedTheme` (`light` or `dark`),
and `setTheme`. System mode follows changes to the operating system's color
preference. Valid saved choices take precedence over `defaultTheme`.

| Provider option | Behavior |
| --- | --- |
| `defaultTheme` | Initial uncontrolled choice; defaults to `system`. |
| `theme`, `onThemeChange` | Controlled mode: `setTheme` requests a change through the callback; the owner supplies the updated `theme`. |
| `storageKey` | Defaults to `x-ui-theme` in local storage. Use a separate key for an independent preference, or `storageKey={false}` to disable reading and saving. Blocked storage does not prevent theme changes. |
| `motion="auto"` | Default. Enables the scoped motion styles while honoring the operating system's reduced-motion preference. |
| `motion="off"` | Disables scoped animations, transitions and CSS smooth scrolling, including themed portals. It does not change application-owned JavaScript scrolling. |
| `className`, `style` | Customize the provider wrapper. Override `--x-ui-*` CSS variables through `style` to customize its palette. |

The provider changes its own wrapper, not `<html>` or other application roots.
Library dialog, menu, popover and tooltip portals carry the resolved theme,
palette variables and motion setting even when mounted outside that wrapper.
Wrapper layout styles such as padding are not copied into portals. Arbitrary
application-owned portals are outside this automatic propagation.

Keep legacy product regions such as Cargo outside the provider in both the
React tree and the DOM. A plain nested wrapper does not stop CSS-variable
inheritance, ancestor dark selectors, scoped motion or portal context. Theme
shell regions with sibling providers sharing controlled appearance state; wrap
business content only when that product explicitly adopts the shared theme.

Server rendering and the first client render use the same initial fallback:
an explicit light/dark choice is used immediately, while `system` initially
resolves to light. Saved choices and browser system preferences are applied
after mounting. This avoids a hydration mismatch but can briefly show the
fallback appearance. If the host already knows the desired theme on the
server, pass the same explicit controlled `theme` on server and client.

The optional CSS adds restrained dialog/menu entry and exit motion and loading
animations. `motion="off"` and OS reduced motion stop these animations without
removing content or changing component positioning. The host must still scan
`dist/**/*.js` with Tailwind.

## Feedback and supporting controls (unreleased)

These additive root exports use theme variables when a provider is present and
have fallback styles when it is absent. Use the optional stylesheet above for
the themed loading animations, including skeleton pulse and indeterminate
progress.

| API | Usage |
| --- | --- |
| `Skeleton` | `loading` defaults to `true`; optional `width` and `height` reserve space. Child content stays mounted but is hidden and non-interactive while loading. |
| `Spinner` | Accepts `size="sm" \| "md" \| "lg"` and a translated `label`; announces loading with a status role. Use `decorative` when nearby content already announces the same state. |
| `Progress` | Pass a finite `value` for a percentage, clamped to 0–100. Omitted, `null` or non-finite values are indeterminate. Supply `label`, `aria-label` or `aria-labelledby`. |
| `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverClose` | Compose a Radix popover; `PopoverRoot` aliases `Popover`. Content supports theme propagation through its portal. |
| `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent` | Compose a Radix tooltip with its provider; `TooltipRoot` aliases `Tooltip`. Use `asChild` on the trigger to wrap an existing button. |
| `SegmentedControl`, `SegmentedControlItem` | A single-choice radio group. Give the group a `label`, `aria-label` or `aria-labelledby`; use `value`/`onValueChange` or `defaultValue`. |

```tsx
import { Progress, Skeleton, Spinner } from '@zanehu-ai/x-ui'

export function LoadingFeedback({ loading }: { loading: boolean }) {
  return (
    <section>
      {loading && <Spinner label="Loading workspace" />}
      <Skeleton loading={loading}>
        <p>Workspace summary</p>
      </Skeleton>
      <Progress label="Upload progress" value={loading ? undefined : 100} />
    </section>
  )
}
```

Keep the host's translations, data requests and loading lifecycle in the
application; these controls only display the supplied state.

## Source guide

| Directory | Contents |
| --- | --- |
| [src/ui](src/ui/) | Buttons, inputs, cards, tables and Radix-based dialogs, menus and other primitives |
| [src/components](src/components/) | DataTable, pagination, layouts, navigation, form controls, confirmation and state components |
| [src/api](src/api/), [src/store](src/store/) | Axios client factory and Zustand auth-store factory |
| [src/i18n](src/i18n/), [src/hooks](src/hooks/), [src/utils](src/utils/), [src/types](src/types/) | Translation, pagination, formatting and shared API types |
| [src/chat](src/chat/) | Conversation/message components and chat translations |
| [src/opcorbit](src/opcorbit/) | Control/domain API primitives, query keys, schemas and permission contracts |
| [src/presentation](src/presentation/) | Opt-in compatibility components for detail and configuration screens |
| [src/theme](src/theme/) | Opt-in light/dark/system provider, scoped palette variables and optional motion CSS (unreleased) |
| [tests](tests/) | Built-package export and behavior checks |

`createClient` has two modes: basic options return an Axios instance; supplying both `getToken` and `onUnauthorized` returns a typed wrapper with auth and response-envelope handling. See [the overloads and options](src/api/createClient.ts) before changing a consumer.

## Development

Use **Node 22**, matching [CI](.github/workflows/ci.yml), and npm with the checked-in lockfile. From this repository:

```bash
npm ci             # Installs dependencies and runs the prepare/build script
npm run typecheck
npm test           # Builds dist, then runs the Node test suite
npm run build      # Rebuilds JS/declarations and fixes distribution import paths
```

`make typecheck` is a shortcut for the TypeScript check. Source builds include their own development type dependencies; they do not require sibling application checkouts or type-link scripts.

## Releases

The [publish workflow](.github/workflows/publish.yml) runs for pushed `v*` tags, builds through the npm lifecycle, typechecks and publishes to GitHub Packages. Coordinate version/tag changes and consumer upgrades after verification. A source commit or local package build is not evidence that the corresponding package has been published. See [CHANGELOG.md](CHANGELOG.md) for recorded release history.

For the current local release candidate, create the preview artifact without a
tag or registry write:

```bash
npm run typecheck
npm test
mkdir -p /tmp/x-console-theme-package
npm pack --pack-destination /tmp/x-console-theme-package
```

The output is `zanehu-ai-x-ui-0.2.0-rc.0.tgz`. Consumer previews may install
that tarball temporarily. Do not commit a machine-specific tarball dependency;
replace it with the approved published version before release. Package
publication, tagging, deployment and production acceptance are not implied by
this local verification.

## Opt-in detail and configuration presentation

The `presentation` namespace provides reusable presentation blocks extracted
from the X-core console. Use it for the existing Cargo and Game screen behavior:

```tsx
import { presentation } from '@zanehu-ai/x-ui'

const { SimpleDialog, DescriptionSection, DescriptionItem, ConfigFieldGrid } = presentation

<SimpleDialog
  open={open}
  title="Details"
  onClose={close}
  footer={<button onClick={close}>Close</button>}
>
  <DescriptionSection title="Account">
    <DescriptionItem label="Balance">{presentation.renderMoney(balance, 'USD')}</DescriptionItem>
  </DescriptionSection>
  <ConfigFieldGrid
    fields={[{ key: 'enabled', label: 'Enabled' }]}
    row={{ enabled: true }}
    labels={{ emptyValue: '-', yes: 'Yes', no: 'No' }}
  />
</SimpleDialog>
```

This is an additive API. The existing root `SimpleDialog`, `StatusBadge`,
`Button`, `Badge`, `ToggleChip`, and `format*` functions retain their defaults.
The namespace intentionally preserves the consuming console's behavior:

- `SimpleDialog` has a scrollable body, optional `bodyClassName`, sticky `footer`,
  and `modal` (default `true`). Outside pointer/focus interaction does not close
  the dialog. Escape and the close control still call `onClose`.
- `StatusBadge` supports a custom child label with color chosen from `status`.
  `Badge` uses neutral styling for default/secondary/outline variants; `Button`
  disables itself and displays `Loading...` while loading. `ToggleChip` preserves
  the existing pressed-state callback and explicit button type.
- `DescriptionSection`, `DescriptionItem`, and `DescriptionSummary` render detail
  layouts; empty item values use an em dash while numeric zero stays visible.
- `ConfigFieldGrid` requires explicit `labels` (`emptyValue`, `yes`, `no`) from
  the host locale. It needs no translation provider and retains field renderers,
  hints, and JSON display.
- `renderDateTime` treats timezone-less backend timestamps as UTC and displays
  viewer-local `YYYY-MM-DD HH:mm:ss`. Non-date and invalid values retain their
  former display behavior. `renderMoney` accepts decimal objects, appends an
  optional currency code, and preserves missing/invalid values. These functions
  are deliberately distinct from the existing `formatDateTime`/`formatMoney`.

Consumers must include this package's `dist/**/*.js` in their Tailwind source
scan, as for the existing components. No CSS runtime or additional provider is
introduced.

### Consumer migration after release

The `v0.1.8` source tag does not export `presentation`. The new API must be included
in a verified package release before a consumer commits a dependency on it. A local `npm pack` artifact is for validation
only and must not become a committed file path dependency.

Replace generic implementations with package re-exports. For example:

```tsx
import { presentation } from '@zanehu-ai/x-ui'

export const { Badge, Button, SimpleDialog, StatusBadge, ToggleChip } = presentation
export type BadgeProps = presentation.BadgeProps
export type ButtonProps = presentation.ButtonProps
export type SimpleDialogProps = presentation.SimpleDialogProps
export type StatusBadgeProps = presentation.StatusBadgeProps
```

Keep only the host's locale adapter around `ConfigFieldGrid`; pass the existing
translations rather than changing locale behavior. Preserve optional explicit
host labels for independently hosted product features:

```tsx
import { presentation } from '@zanehu-ai/x-ui'
import { useTranslation } from '../i18n'

export type ConfigField<T> = presentation.ConfigField<T>
type Props<T extends Record<string, unknown>> = Omit<presentation.ConfigFieldGridProps<T>, 'labels'> & { labels?: presentation.ConfigFieldLabels }

export function ConfigFieldGrid<T extends Record<string, unknown>>({ labels, ...props }: Props<T>) {
  const { t } = useTranslation()
  return <presentation.ConfigFieldGrid {...props} labels={labels ?? {
    emptyValue: t('common.empty-value'), yes: t('common.yes'), no: t('common.no'),
  }} />
}
```

When adopting these blocks in Cargo detail or retained Game configuration screens,
keep application auth, tenant selection, permission checks and API transport
with the host.

Run `npm test` to build the published entry and exercise the presentation
contracts, including the unchanged root defaults, with Node's test runner.
