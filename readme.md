[![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)](https://stenciljs.com)

# Pyas Connect – Universal OAuth Wizard

Pyas Connect is a Stencil web-component that lets developers who use Pyas for their calendar integrations embed a multi-step OAuth setup wizard for Google, Microsoft 365 (Outlook), and Zoom in minutes.

- **Framework-agnostic**: ships as a standards-based custom element plus thin wrappers for Vue 3, React 18+, and Angular 19+
- **Configurable UI**: light/dark themes, custom copy, optional badge/disclaimer
- **Rich events**: `accountConnected` and `connectError`

> **Need a Pyas account?** Create one free at <https://www.app.pyas.io/auth/register>. Learn more at <https://pyas.io> and see full API docs at <https://docs.pyas.io>.

<br />

## The UI
![image](https://github.com/user-attachments/assets/18b3bab1-aad5-4ccc-812b-fa78a545e9d6)

**Light Mode**

Step 1: 

![image](https://github.com/user-attachments/assets/c33094b9-ee58-45fe-9bb4-1e84c61a4a8d)

Step 2: 

![image](https://github.com/user-attachments/assets/02ad5b5f-2b1c-47c7-b52f-cc868c827f85)

**Dark Mode**

Step 1:

![image](https://github.com/user-attachments/assets/38e3e277-05cd-4f9c-a457-4348ff13fda0)

Step 2:

![image](https://github.com/user-attachments/assets/91384b19-9893-4017-82ef-f8a2c59276ec)


---

## 0 · Get your Pyas credentials (clientId & tokenName)
Follow these quick steps once. Screenshots are in the online docs.

1. **Sign up / Log in** – <https://www.app.pyas.io/auth/register>
2. **Create an App** – Go to **Apps → Create App** (guide: <https://docs.pyas.io/fundamentals/getting-set-up/creating-an-app>). This generates a sandbox project on Pyas. Lean more about Pyas Apps here <https://docs.pyas.io/fundamentals/pyas-apps>.
3. **Set up Authentication** – Pyas Auth is enabled by default for quick testing, but you can switch to Provider/Native Auth later (guide: <https://docs.pyas.io/fundamentals/getting-set-up/setup-authentication>).
4. **Copy your Client ID** – Go to **Apps → [app] → Settings → General Details → Developer Info** (right panel).
5. **Create / copy a Token Name** – Go to **Apps → [app] → Settings → API Keys**. Either copy the name of an existing, unexpired key or click **Generate New API Key** first (guide: <https://docs.pyas.io/rest-api-reference/api-authentication#generate-api-keys>). Make sure to copy just the **name** of the api key and not the actual api key value.
6. **Add Allowed Origins** – Still in Settings → General Details, list every domain you’ll embed Pyas Connect on (e.g. https://your-app.com). Localhost entries (http://localhost:3000) are fine for testing but should be removed in production. You can also supply the list during initial app creation.

You now have:
```
Client ID   →  pyas_9ecf2ab8-…
Token Name  →  Dev Key
```
Both values are required props for `<pyas-connect>`.

---

## 1 · Installation

### npm (recommended)
Install one of the framework wrappers below; each automatically brings in the core @pyas/connect package.
```bash
# Vue 3 – includes the core package automatically
npm install @pyas/connect-vue

# React 18+ – includes the core package automatically (npm ≥ 7 auto‑installs peer deps)
npm install @pyas/connect-react

# Angular 19+ – includes the core package automatically
npm install @pyas/connect-angular

# Vanilla JS / no framework
npm install @pyas/connect
```

### CDN (plain HTML/JS or quick prototyping)
```html
<script type="module" src="https://cdn.pyas.io/pyas-connect/latest/pyas-connect.js"></script>
```
The component auto-registers as `<pyas-connect>` once the script is loaded.

---

## 2 · Quick Start (vanilla JS)
```html
<pyas-connect
  client-id="YOUR_CLIENT_ID"
  token-name="YOUR_TOKEN_NAME"
  user-name="John"
  user-email="Doe"
></pyas-connect>

<script>
  document
    .querySelector('pyas-connect')
    .addEventListener('accountConnected', (e) => {
      // e.detail → { provider, accountId, email, name, status, scopes }
      console.log('OAuth linked!', e.detail);
    });
</script>
```

---

## 3 · Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `client-id` | `string` | **required** | Your Pyas Client ID. |
| `token-name` | `string` | **required** | The *name* (not value) of one of your API keys. Identifies the api key for Pyas Connect. |
| `theme` | `"light" \| "dark"` | `"light"` | Toggle built-in dark or light theme. |
| `modal-title` | `string` | `"Connect an Account"` | Title for the connect modal. |
| `modal-description` | `string` | `undefined` | Short description for the connect modal. Displays under the modal title. |
| `form-title` | `string` | `"Enter Your Details"` | Title for the form section where your users provide their name and email for account connection. |
| `form-description` | `string` | `undefined` | Short description name/email form. Displays under the form title. |
| `user-name` | `string` | `undefined` | Pre-populates the "name" field in the form. |
| `user-email` | `string` | `undefined` | Pre-populates the "email" field in the form. |
| `show-labels` | `boolean` | `true` | Show provider labels. |
| `show-zoom` | `boolean` | `true` | Displays or hides the Zoom integration option. |
| `show-google` | `boolean` | `true` | Displays or hides the Google Calendar integration option. |
| `show-outlook` | `boolean` | `true` | Displays or hides the Microsoft Outlook integration option. |
| `show-disclaimer` | `boolean` | `true` | Shows a " This app or [your app name] uses Pyas to to securely connect your account" text to end users. This is recommended especially when using the Pyas Auth option. See Pyas Auth vs Native Auth here: <https://docs.pyas.io/fundamentals/pyas-auth-vs-native-auth>|
| `product-name` | `string` | `"This app"` | The name of your actual product/app. Not your Pyas app name. This is used in the disclaimer shown to users. (e.g. "Skyboard" as your product-name will result in the following disclaimer shown to your end users: "Skyboard uses Pyas to securely connect your account"  |
| `state` | `string` | `undefined` | Optional application state parameter for OAuth flow. |

---

## 3·5 · Custom Connect Label (default slot)

`<pyas-connect>` itself renders as an accessible `<button>` element. To customize the label or add an icon, supply inline markup in the default slot. Do not nest another `<button>` or you’ll create an invalid button‑in‑button tree.

```html 
<pyas-connect
  client-id="YOUR_CLIENT_ID"
  token-name="YOUR_TOKEN_NAME"
>
  <span class="flex items-center gap-2">
    <img src="icon.svg" alt="" class="w-5 h-5" />
    Link Calendars
  </span>
</pyas-connect>
```

## 4 · Events
| Event | Payload | When it fires |
|-------|---------|--------------|
| `accountConnected` | `{ accountId: string, email: string, name: string, provider: string, scopes: string[], status: string }` | OAuth account connection completed successfully and verified by Pyas. The data returned is the Pyas account for the user. Save the data in your database for reference/later usage. |
| `connectError` | `{ message: string, code: string, error?:object\|string\|undefined }` | The flow failed or was cancelled by the user. |
---

## 5 · Theming & Custom CSS

The component exposes CSS variables on `:host` and auto‑switches to dark via OS or `theme="dark"`.

### 5.1 · Token reference

| Group | Variable | Light | Dark |
|-------|----------|-------|------|
| Surfaces | `--pc-bg-surface` | `#ffffff` | `#212121` |
| Overlay  | `--pc-bg-overlay` | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.65)` |
| **Primary btn** | `--pc-bg-button-primary` | `#2563eb` | `#2563eb` |
|   | `--pc-bg-button-primary-hover` | `#1e4ed8` | `#1450d2` |
| **Subtle btn** | `--pc-bg-button-subtle` | `#f5f6f7` | `#2e3238` |
|   | `--pc-bg-button-subtle-hover` | `#f0f2f5` | `#434a54` |
| **Back btn** | `--pc-bg-button-back` | `#2e3238` | `#434a54` |
|   | `--pc-bg-button-back-hover` | `#17191c` | `#22252a` |
| **Provider** | `--pc-bg-provider-default` | `#f9fafb` | `#2e3238` |
|   | `--pc-bg-provider-hover` | `#f0f2f5` | `#374151` |
| **Input** | `--pc-bg-input` | `#ffffff` | `#2e3238` |
| **Border** | `--pc-border-subtle` | `#e5e7eb` | `#374151` |
| **Text** | `--pc-text-primary` | `#374151` | `#d1d5db` |
|   | `--pc-text-secondary` | `#6b7280` | `#c6cad2` |
|   | `--pc-text-invert` | `#ffffff` | `#ffffff` |
|   | `--pc-text-faded` | `#9ca3af` | `#6b7280` |

Note: The main button text uses the `--pc-text-invert` variable.

### 5.2 · Quick palette override

```css
pyas-connect {
  --pc-bg-button-primary: #10b981;
  --pc-bg-button-primary-hover: #059669;
}
```

### 5.3 · Force dark & tweak

```html
<pyas-connect theme="dark" />
```

```css
pyas-connect[theme='dark'] {
  --pc-bg-surface: #1e1e1e;
}
```

### 5.4 · Tailwind helpers

```css
pyas-connect{
  --pc-bg-button-primary: theme(colors.indigo.600);
}
```

### 5.5 · Reset variables when using utility classes

```css
pyas-connect {
  --pc-bg-button-primary: transparent;
  --pc-bg-button-primary-hover: transparent;
  --pc-text-invert: inherit;
  border: none;
}
```

---

## 6 · SSR & Hydration
The core component lazy-loads its logic; when server-side rendering you may want to dynamically import the script only on the client to avoid hydration warnings.

---

## 7 · Wrapper Guides
Detailed setup for each framework lives below.

### Vue 3 — `@pyas/connect-vue`
```bash
npm install @pyas/connect-vue # core auto‑installed
```
Use the wrapper directly inside any component file. No need to modify main.ts or register a global plugin.

```vue
<script setup>
import { PyasConnect } from '@pyas/connect-vue';

function onSuccess(event) {
  console.log('linked', event.detail);
}
</script>

<template>
  <PyasConnectVue
    client-id="YOUR_CLIENT_ID"
    token-name="YOUR_TOKEN_NAME"
    @account-connected="onSuccess"
  />
</template>
```

---

### React — `@pyas/connect-react`
```bash
npm install @pyas/connect-react # core auto-installed
```
```jsx
import { PyasConnect } from '@pyas/connect-react';

function App() {
  const handleSuccess = (e) => console.log(e.detail);
  return (
    <PyasConnect
      clientId="YOUR_CLIENT_ID"
      tokenName="YOUR_TOKEN_NAME"
      theme="dark"
      onAccountConnected={handleSuccess}
    />
  );
}
```

---

### Angular — `@pyas/connect-angular`
```bash
npm install @pyas/connect-angular # core auto-installed
```
Register the custom pyas-connect element
```ts
  // main.ts
  import { pyasConnectLoader } from '@pyas/connect-angular';
  pyasConnectLoader()
```
Import the Component
```ts
// app.module.ts
...
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PyasConnect } from '@pyas/connect-angular';

@NgModule({
  imports: [
    BrowserModule, 
    PyasConnect
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```
```html
<pyas-connect
    user-name="Jane Doe"
    user-email="jane@gmail.com"
    client-id="some-client-id"
    token-name="token-name"
    (accountConnected)="onSuccess($event)"
    >
</pyas-connect>
```

---

### CDN in Any Framework
Load the component via CDN in your `index.html`:
```html
<script type="module" src="https://cdn.pyas.io/pyas-connect/latest/pyas-connect.js"></script>
```
Then use `<pyas-connect>` or the wrappers as usual.

---

## 8 · Building & Publishing (maintainers)
```bash
npm run build   # builds core + wrappers
npm run release # bumps version & publishes to npm
```

---

## 9 · License
MIT © BrutForce Technologies
