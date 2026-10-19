# PyasConnect 2.0: build plan

The decisions are in the API repo's `PYAS_V2_PLAN.md` §59. This file tracks the
build. Epic branch `connect-v2`; one `v2/connect-…` branch per step.

| Step | Branch | What | Status |
|---|---|---|---|
| 1 | `v2/connect-1-core` | `@pyas/connect-core`: the flow as a framework-free state machine (sessions and legacy keys, popup and redirect, every timeout, retry and cleanup), unit tests | Done |
| 2 | `v2/connect-2-component` | `<pyas-connect>` rebuilt on the core: every state designed, dialog or inline, light and dark, WCAG 2.2 AA, component tests | Done |
| 3 | `v2/connect-3-wrappers` | React, Vue and Angular wrappers over the one element; 1.x props and events still work | Done |
| 4 | `v2/connect-4-release` | Release on a version tag (not every push), MIT license, README rewritten, bundle budget (25 KB gzipped) in CI | |
| 5 | `v2/connect-5-e2e` | Playwright against the local API in a React, a Vue and an Angular example; visual regression and axe on every state | |

## How a connection runs

**Sessions (2.0).** The developer's server creates a connect session with its
live key (`POST /v2/connect/sessions`) and hands the page its token. The widget:

1. opens a blank popup on the person's click (a popup opened after an `await`
   is blocked), then asks `POST /v2/connect/authorize { token, provider }` for
   the consent URL and points the popup at it;
2. waits for the callback page's message, accepting it only from the API's
   origin, from the popup it opened, with exactly the state of this attempt;
3. finishes with `POST /v2/connect/complete { token, code, state }`.

Redirect mode sends the whole page to `GET /v2/connect/go?token=…` instead
(popup blockers, mobile Safari); the session must have a `returnUrl`.

**Legacy keys (1.x).** `client-id` + `token-name`: `GET /oauth/init` for the
consent URL, the same popup and message, then `POST /oauth/init/connect`.
Kept so 1.x customers upgrade without changes; sessions are the documented way.

**A popup that seems closed is not a cancel.** Google's sign-in pages set a
Cross-Origin-Opener-Policy, after which `popup.closed` can read true while the
person is still signing in. The core never cancels on it: the flow ends on the
signed message or the person's cancel, and the person can open the popup
again.

## Design

The screens, copy, error table, theming variables and accessibility checklist
are in the *PyasConnect 2.0 Design* doc (claude.ai, 2026-10-11). Where the build
differs, and why:

- **The consent wait is a question, not a failure.** After 60 seconds the
  dialog asks "Still there? The window may be behind this one." and keeps
  waiting; `CONNECT_TIMEOUT` is reported only if the person then gives up
  (WCAG 2.2: no time limit the person cannot extend).
- **"Popup closed before finishing" does not return to the chooser by
  itself.** Google's Cross-Origin-Opener-Policy can make the window read as
  closed while the person is signing in, so an automatic return would abort
  real sign-ins. The waiting screen offers "Open it again" and "Choose another
  calendar" as soon as the window may be closed.
- **One provider still shows its button.** The dialog first reads the app's
  name and icon (`POST /v2/connect/info`), and a sign-in window can only open
  from a click, so it never jumps straight to the provider.

## Step 2 notes

- Size: the element with the core is 14.8 KB gzipped (budget 25 KB); Stencil's
  runtime adds 17 KB, shared by every Stencil component on a page.
- The Zoom mark is drawn to Zoom's camera mark on Zoom blue: check it against
  Zoom's current brand kit before release. Google's G and Microsoft's four
  squares are their published marks.
- Event names `connected` and `error` are the design's; Stencil warns they match
  native DOM event names. Nothing inside the widget can send a native `error`
  out of its shadow root, so a listener only ever gets the widget's.

## Step 3 notes

- **Wrappers are written by hand, not generated.** Stencil's generated React,
  Vue and Angular proxies hand callbacks a `CustomEvent`; 1.x's
  `onAccountConnected` and `@accountConnected` received the account itself, so
  generated proxies would break every 1.x integration. Each wrapper is about a
  hundred lines with no UI: it renders `<pyas-connect>`, sets every prop as a
  property (functions and objects too) and calls each callback with the
  event's data.
- **Server rendering:** each wrapper defines the element with a dynamic
  import in the browser only, so Next.js, Nuxt and Angular SSR never touch
  `customElements`.
- **1.x stylesheets kept:** `@pyas/connect-react/connect-react.css` and
  `@pyas/connect-vue/index.css` still resolve (empty: the element styles
  itself), and 1.x's remaining props (`show-labels`, `show-icloud`,
  `show-disclaimer`, `form-title`, `form-description`) are accepted.
- Angular has no unit tests of its own: it is covered by step 5's end-to-end
  runs in an Angular example.
