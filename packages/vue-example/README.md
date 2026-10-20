# PyasConnect: Vue example

`<PyasConnect>` on a product's settings page, built on the workspace's own
packages (run `npm run build` at the root first). The end-to-end suite
(`npm run e2e` at the root) runs its journeys in this app.

What the widget is given comes from the page's address (`src/setup.ts`):

| Query | Gives the widget |
|---|---|
| `token=pcs_...` | A connect session's token (your server makes it: `POST /v2/connect/sessions`) |
| `fresh=1` | A new session per attempt, from `POST /api/pyas-session` |
| `api=http://localhost:3998` | The Pyas API to use |
| `theme`, `display`, `mode`, `providers` | The same-named properties |
| `hideTrigger=1` | The page's own "Add a calendar" button instead of the widget's |
| `clientId`, `tokenName` | PyasConnect 1.x's keys instead of a session |

Every event the widget sends is listed under **Events** on the page.
