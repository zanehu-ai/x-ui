# Releasing x-ui

One-time setup for the `x-ui-v*` release workflow. The workflow file is `.github/workflows/publish.yml`. It runs only on tags matching `x-ui-v*`. It does not rewrite `package.json`.

The tag, with the `x-ui-v` prefix removed, must equal the committed version and match `^20[0-9]{2}\.(1[0-2]|[1-9])\.[1-9][0-9]*$`. That is years 2000–2099, a month without a leading zero, and a counter that starts at 1. `2026.09.1` is rejected because npm rejects it. The first tag is `x-ui-v2026.10.1`.

Do not push a release tag until the steps below are done and Zane says so.

## Controls

These three are the access boundary. Each one is required, and each one is there for a specific reason.

### Tag ruleset

Add a ruleset on `refs/tags/x-ui-v*` that limits create, update, and delete to Zane. Only Zane can bypass it.

This is the real control. The tag-on-main check lives in the tagged commit's own workflow, so a tag that points at a commit without that check can bypass it.

### `release` environment

Create a GitHub environment named `release`. Its deployment policy must allow only `x-ui-v*` tags, and Zane is a required reviewer.

`r2-preflight`, `publish`, and `deploy-web` use this environment. Without the tag deployment rule, any branch can name the `release` environment and read the Cloudflare secrets.

On each release, including the first, those three jobs each wait for their own environment approval. One approval does not cover the other two.

### Cloudflare secrets

Set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` on the `release` environment only. Remove any repository-level copies.

Jobs that use an environment can still read repository secrets. A copy at repo level would stay available even when the environment policy is what is supposed to gate them.

## R2

1. Create the bucket and attach the custom domain `ui.zanehu.ai`.
2. Set the GitHub variable `R2_BUCKET` to that bucket name. It can be a repository variable or a variable on the `release` environment. An environment variable overrides a repository variable of the same name. The workflow reads `vars.R2_BUCKET` in `r2-preflight` and `deploy-web`. If the value is empty, those jobs fail before they upload. There is no bucket name in the workflow file.
3. Create an API token scoped to that one bucket with object write. R2 write permission also includes delete, so a no-delete token is not possible. This workflow never issues a delete.
4. Create the sentinel object `_xui-sentinel.txt` at the bucket root, outside any `x-ui-v*` prefix. The name is `SENTINEL_KEY` in `scripts/r2-web-release.sh`.

   Wrangler 4.147.0 turns every HTTP 404 into `The specified key does not exist.` A mistyped `R2_BUCKET` or a wrong `CLOUDFLARE_ACCOUNT_ID` (including account id `0`) looks the same as a missing release object. Preflight, and the start of the upload, GET this sentinel first and fail unless that read succeeds. Only after that does a 404 on a release key count as missing. The object's contents are not checked.

   From a checkout, after `npm ci` (wrangler `4.147.0` is an exact devDependency):

   ```bash
   printf 'x-ui release sentinel\n' > _xui-sentinel.txt
   npx --no-install wrangler r2 object put "<bucket>/_xui-sentinel.txt" \
     --file _xui-sentinel.txt \
     --content-type "text/plain; charset=utf-8" \
     --remote
   ```

   `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` must be in the environment for that command. Do not put the object under a version prefix.

5. Apply `infra/r2-cors.json` out of band. The workflow does not set CORS. Origins are `https://zanehu.ai`, `https://www.zanehu.ai`, `https://opcorbit.com`, and `https://www.opcorbit.com`. Methods are `GET` and `HEAD` only.

   ```bash
   npx --no-install wrangler r2 bucket cors set "<bucket>" --file infra/r2-cors.json
   ```

6. Optional: add an R2 bucket lock on the prefix `x-ui-v*`. That is the only way published versions are truly undeletable. The workflow never deletes, but the token can.

## Cutting a release

After the version on `main` matches the tag you want, push `x-ui-vYYYY.M.N` on a commit that is on `main`. Consumers should pin the exact version. `^2026.10.1` matches every later `2026.x` release.
