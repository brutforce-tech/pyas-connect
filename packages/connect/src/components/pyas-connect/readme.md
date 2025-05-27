# pyas-connect



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute           | Description                               | Type                | Default                |
| ------------------ | ------------------- | ----------------------------------------- | ------------------- | ---------------------- |
| `appName`          | `app-name`          |                                           | `string`            | `'This app'`           |
| `autoOpen`         | `auto-open`         | Optional: Automatically open modal        | `boolean`           | `false`                |
| `clientId`         | `client-id`         | Required: OAuth Client ID  and Token Name | `string`            | `undefined`            |
| `formDescription`  | `form-description`  |                                           | `string`            | `''`                   |
| `formTitle`        | `form-title`        |                                           | `string`            | `'Enter Your Details'` |
| `googleIcon`       | `google-icon`       |                                           | `string`            | `undefined`            |
| `icloudIcon`       | `icloud-icon`       |                                           | `string`            | `undefined`            |
| `modalDescription` | `modal-description` |                                           | `string`            | `''`                   |
| `modalTitle`       | `modal-title`       |                                           | `string`            | `'Connect an Account'` |
| `outlookIcon`      | `outlook-icon`      |                                           | `string`            | `undefined`            |
| `showDisclaimer`   | `show-disclaimer`   |                                           | `boolean`           | `true`                 |
| `showGoogle`       | `show-google`       |                                           | `boolean`           | `true`                 |
| `showIcloud`       | `show-icloud`       |                                           | `boolean`           | `false`                |
| `showLabels`       | `show-labels`       | Optional: Show provider labels            | `boolean`           | `true`                 |
| `showOutlook`      | `show-outlook`      |                                           | `boolean`           | `true`                 |
| `showZoom`         | `show-zoom`         |                                           | `boolean`           | `true`                 |
| `state`            | `state`             |                                           | `string`            | `''`                   |
| `theme`            | `theme`             | Optional: Theme (light/dark)              | `"dark" \| "light"` | `'light'`              |
| `tokenName`        | `token-name`        |                                           | `string`            | `undefined`            |
| `userEmail`        | `user-email`        |                                           | `string`            | `undefined`            |
| `userName`         | `user-name`         |                                           | `string`            | `undefined`            |
| `zoomIcon`         | `zoom-icon`         |                                           | `string`            | `undefined`            |


## Events

| Event              | Description            | Type                                                        |
| ------------------ | ---------------------- | ----------------------------------------------------------- |
| `accountConnected` | Emit connection result | `CustomEvent<{ provider: string; user: any; }>`             |
| `connectError`     | Emit error result      | `CustomEvent<{ message: string; code: string \| number; }>` |


## Shadow Parts

| Part        | Description |
| ----------- | ----------- |
| `"spinner"` |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
