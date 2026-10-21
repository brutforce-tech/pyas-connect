# PyasConnect: Angular example

This app shows `<PyasConnect>` on a product's settings page. It's built on the
workspace's own packages, so run `npm run build` at the root first. The
end-to-end suite (`npm run e2e` at the root) runs its user journeys in this
app.

The page reads the widget's settings from its URL query (`src/setup.ts`):

| Query | Passes to the widget |
|---|---|
| `token=pcs_...` | A connect session's token. Your server creates it with `POST /v2/connect/sessions`. |
| `fresh=1` | A new session for each attempt, from `POST /api/pyas-session` |
| `api=http://localhost:3998` | The Pyas API to use |
| `theme`, `display`, `mode`, `providers` | The properties with the same names |
| `hideTrigger=1` | The page's own "Add a calendar" button, instead of the widget's |
| `clientId`, `tokenName` | PyasConnect 1.x's keys, instead of a session |

The page lists every event the widget sends under **Events**.
