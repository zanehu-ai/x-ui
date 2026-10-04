## Release workflow for `x-ui-v*` tags

This is a release workflow and needs CTO review. It does not bump the package version. `@zanehu-ai/synapse-ui` stays at `0.1.8` here. A separate release PR will bump it to `2026.10.1` before the first calendar tag.

`repository.url` now points at `https://github.com/zanehu-ai/x-ui.git`. The npm name stays `@zanehu-ai/synapse-ui`.

### How to cut a release

After the version PR is on `main`, push a tag `x-ui-vYYYY.MM.N`. The first tag is `x-ui-v2026.10.1`. The workflow does not rewrite `package.json`. The tag with the `x-ui-v` prefix removed must already equal the committed version, or `verify` fails.

Consumers should pin the exact version. `^2026.10.1` matches every later `2026.x` release. `2026.10.1` also jumps past `0.1.8`.

Do not push that tag from this branch.

### Jobs

`concurrency` is `x-ui-release-${{ github.ref }}` with `cancel-in-progress: false`, so a second run of the same tag waits instead of cancelling the first.

1. `verify` checks the tag, runs typecheck, runs `npm test` only when a test script exists, then `npm run build` and `npm run build:web`. It uploads `web/dist` as an artifact. That job has `actions: write`, and the jobs that download the artifact have `actions: read`, so the bytes published to R2 are the bytes `verify` built.
2. `publish` needs `verify`. It publishes the existing package version to GitHub Packages and refuses if that version is already there. Provenance is `actions/attest-build-provenance` on the packed tarball. GitHub Packages does not accept `npm publish --provenance`.
3. `deploy-web` needs `verify` and `publish`, so R2 is unchanged if checks or the npm publish fail. It uploads the verified `web/dist` tree to `x-ui-vYYYY.MM.N/`, keeping relative paths (`web/dist/x-ui.css` becomes `x-ui-vYYYY.MM.N/x-ui.css`).
4. `release-notes` needs `deploy-web`. It records sha384 SRI for `x-ui.css` and `theme-script.js` in the job summary and the GitHub release. `gh release create` uses `--verify-tag`, so this step cannot create a tag. `contents: write` is granted only on this job.

Release notes are their own job so a notes failure can be re-run without treating the upload as unfinished, and so write permission stays off the publish and R2 jobs. The upload is still safe to re-run on its own: see below.

### Re-run after a partial upload

R2 is append-only in this workflow. There is no delete, and there is no Pages-style full-site snapshot.

Before any put, the job compares remote `x-ui.css` and `manifest.json` to the local files:

- both exist and the sha256 matches: idempotent re-run
- either exists and the sha256 differs: fail before uploading anything
- otherwise continue

Each object is then checked the same way. A matching sha256 is skipped. A missing object is uploaded. A different sha256 fails that object. `manifest.json` and `x-ui.css` are uploaded last. Every object is stored with `Cache-Control: public, max-age=31536000, immutable` and a Content-Type for css, js, json, html, svg, woff, woff2, ttf, otf, and source maps.

### Dependency on the tokens PR

`web/` is not on this branch, and no build output is committed. `web/dist/` is gitignored. `verify` runs `npm run build:web`. If that script is missing, the job fails and says it depends on Platform Engineer's tokens PR, which adds the `web/` sources and `build:web`.

Required outputs after that build: `web/dist/x-ui.css`, `web/dist/theme-script.js`, `web/dist/manifest.json`, and at least one file under `web/dist/fonts/`. Other files under `web/dist/` (`tokens.json`, `xui.js`, `lint/**`, `demo/**`, and anything else the build emits) are uploaded when present.

### Prerequisites for Albert

- Create the R2 bucket and replace `R2_BUCKET: TBD` in `.github/workflows/publish.yml` with that bucket name.
- Attach the custom domain `ui.zanehu.ai`.
- Create an API token scoped to that one bucket with object write. R2 write permission also includes delete, so a no-delete token is not possible. This workflow never issues deletes.
- Recommended: add an R2 bucket lock rule on `x-ui-v*`. That is the only way to make published versions truly undeletable.
- Add repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` on `zanehu-ai/x-ui`.
- Apply `infra/r2-cors.json` out of band. The workflow does not set CORS. Origins are `https://zanehu.ai`, `https://www.zanehu.ai`, `https://opcorbit.com`, and `https://www.opcorbit.com`, methods `GET` and `HEAD` only.

```bash
npx wrangler r2 bucket cors set <bucket> --file infra/r2-cors.json
```

Wrangler is pinned in the workflow at `4.147.0` and invoked with `npx --yes wrangler@4.147.0`. Third-party actions are pinned by commit SHA. Checkout uses `persist-credentials: false`.
