# pyas-connect



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute           | Description | Type                | Default                |
| ------------------ | ------------------- | ----------- | ------------------- | ---------------------- |
| `clientId`         | `client-id`         |             | `string`            | `undefined`            |
| `formDescription`  | `form-description`  |             | `string`            | `''`                   |
| `formTitle`        | `form-title`        |             | `string`            | `'Enter Your Details'` |
| `modalDescription` | `modal-description` |             | `string`            | `''`                   |
| `modalTitle`       | `modal-title`       |             | `string`            | `'Connect an Account'` |
| `productName`      | `product-name`      |             | `string`            | `'This app'`           |
| `showDisclaimer`   | `show-disclaimer`   |             | `boolean`           | `true`                 |
| `showGoogle`       | `show-google`       |             | `boolean`           | `true`                 |
| `showIcloud`       | `show-icloud`       |             | `boolean`           | `false`                |
| `showLabels`       | `show-labels`       |             | `boolean`           | `true`                 |
| `showOutlook`      | `show-outlook`      |             | `boolean`           | `true`                 |
| `showZoom`         | `show-zoom`         |             | `boolean`           | `true`                 |
| `state`            | `state`             |             | `string`            | `''`                   |
| `theme`            | `theme`             |             | `"dark" \| "light"` | `'light'`              |
| `tokenName`        | `token-name`        |             | `string`            | `undefined`            |
| `userEmail`        | `user-email`        |             | `string`            | `undefined`            |
| `userName`         | `user-name`         |             | `string`            | `undefined`            |


## Events

| Event              | Description            | Type                                                                                                                   |
| ------------------ | ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `accountConnected` | Emit connection result | `CustomEvent<{ provider: string; accountId: string; name: string; email: string; scopes: string[]; status: string; }>` |
| `connectError`     | Emit error result      | `CustomEvent<{ message: string; code: string \| number; error?: any; }>`                                               |


## Shadow Parts

| Part        | Description |
| ----------- | ----------- |
| `"spinner"` |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
