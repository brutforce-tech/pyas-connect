# `@pyas/connect-react`

> A React plugin wrapper around the Pyas Connect Web Component <https://www.npmjs.com/package/@pyas/connect>, exposing PyasConnect as a first-class React component

## Usage

```bash
npm install @pyas/connect-react # core (@pyas/connect) auto-installed
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
    ></PyasConnect>
  );
}
```
## Full Documentation
Full usage documentation can be found on the core component on npm: <https://www.npmjs.com/package/@pyas/connect>
And also on GitHub: <https://github.com/brutforce-tech/pyas-connect>
