# `@pyas/connect-react`

> A React plugin wrapper around the Pyas Connect Web Component, exposing PyasConnect as a first-class React component

## Usage

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
