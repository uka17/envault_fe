# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## General coding rules

- Follow the rules in [`CODING_RULES.MD`](../CODING_RULES.MD) in every task. They apply to all agents and subagents. If a rule there conflicts with a project-specific rule below, surface the conflict instead of silently picking one.
- This repo is the frontend half of envault.me; the backend lives in `../envault`. When a task spans both, `../CLAUDE.md` is the source of truth.

## Code Style

- Add JSDoc comments in English for all methods and functions except arrow functions and tests. Include `@param` for each parameter and `@returns` for the return value.
- With every change check if e2e and unit tests should be updated or new tests should be added. Add or update existing tests if needed. Run tests to make sure all of them work.
- While developing new functionality with text (e.g. button, error message, text) do it via creating new locale. Add always russian and english translations.

## Commands

```sh
npm run dev                 # Vite dev server; /api is proxied to VITE_API_HOST
npm run build               # type-check + vite build (in parallel)
npm run type-check          # vue-tsc --build
npm run lint                # eslint . --fix (writes changes)
npm run format              # prettier --write src/
npm run test:unit           # vitest --run (jsdom)
npm run test:unit:coverage  # enforces 80% lines/functions/branches/statements
npm run test:e2e            # Playwright, chromium only; starts its own dev server on :4173
```

Single tests:

```sh
npx vitest --run src/stores/__tests__/auth.spec.ts
npx vitest --run -t "name of test"
npx playwright test tests/playwright/login.spec.ts
npx playwright test -g "logs in successfully"
```

Env (`.env`, never commit real values): `VITE_API` (axios base URL for the authenticated API, `/api/v1`), `VITE_API_HOST` (dev proxy target), `WEB_HOST`.

## Architecture

- **Bootstrap (`src/main.ts`)**: Pinia and i18n are installed first, then `auth.init()` restores the session *before* the router is installed and the app mounted, so route guards see the correct auth state. `setSessionExpiredHandler` wires the router into `api/http.ts` without a circular import.
- **Two axios instances**:
  - `api/http.ts` (`http`): authenticated `/api/v1` client. Access token is kept in memory only (Pinia `auth` store); the refresh token is an HttpOnly cookie. On 401 the response interceptor performs a single shared refresh (`refreshPromise`) and retries; login/refresh/verify/confirm URLs are in `skipRefreshUrls` and must be added there if a new unauthenticated endpoint can return 401.
  - `api/publicHttp.ts` (`publicHttp`): no auth, targets unversioned `/api/public/*` (e.g. stash unlock links).
- **API layer**: `src/api/*Api.ts` are thin typed wrappers; stores in `src/stores/` call them and own state. Views call stores, not axios.
- **Backend error localization**: the backend returns English text plus a stable `code`. `src/i18n/apiErrorCodes.ts` maps codes to `apiErrors.*` keys; `api/apiError.ts` (`getApiErrorMessage`, `extractApiFieldErrors`, `getApiErrorCode`, `getApiErrorRetryAfter`) is how views turn errors into messages. A new backend error code needs an entry in the map plus `locales/{en,ru}/apiErrors.json`.
- **i18n**: locales are split per namespace (`common`, `auth`, `validation`, `profile`, `stash`, `home`, `apiErrors`) in `src/locales/{en,ru}/*.json`, each registered in `src/i18n/index.ts` (a new namespace file must be imported there for both languages). Russian uses a custom 3-form plural rule. Locale is persisted in `localStorage` under `envault-locale`.
- **Client-side encryption (`utils/stashCrypto.ts`)**: stashes are encrypted in the browser with PBKDF2-SHA256 (210k iterations) + AES-GCM; the server never sees plaintext or passphrase. Ciphertext format is `v1.<salt>.<iv>.<ciphertext>` (base64). Requires a secure context (`CryptoUnavailableError` otherwise). Changing the format needs a new version prefix to keep old stashes decryptable.
- **Routing**: routes with `meta.requiresAuth` are guarded by `requireAuth` (exported, and `routes` is exported for tests).
- **UI**: Naive UI with theme overrides in `src/theme/naiveTheme.ts`. See the Design Context section before visual changes.

## Testing

- Unit tests live in `__tests__/` next to the code. Use `src/test/mountWithProviders.ts` to mount views with Pinia, i18n, a memory router and `NMessageProvider`. `src/test/setup.ts` polyfills `ResizeObserver` and `matchMedia` for jsdom.
- E2E tests (`tests/playwright/`) run against the Vite dev server with **all API calls mocked via `page.route("**/api/v1/...")`**; no backend is needed. Select text through `tests/playwright/i18n.ts` (`t.auth.login.submit`, `unescape(...)`) instead of hardcoding English strings, so copy changes don't break tests.
- CI (`.github/workflows/deploy.yml`) runs unit and e2e tests on PRs and pushes to `master`; pushes to `master` then build the Docker image (nginx, see `nginx.conf`) and deploy to EC2.

## Design Context

- [`PRODUCT.md`](PRODUCT.md): strategic brief (register: product, platform: web, audience, positioning, brand personality, anti-references).
- [`DESIGN.md`](DESIGN.md): visual system, "The Ember Vault" (amber-to-crimson gradient on near-black, replacing the current purple accent). Colors, typography, components, and named rules for any new UI work.
- Every `/impeccable` command reads both files first; consult them before making visual or strategic product decisions.
