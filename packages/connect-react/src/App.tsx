import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { PyasConnect } from './components/PyasConnect';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        <div>
            <a href="https://vite.dev" target="_blank">
                <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
                <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
        </div>
        <h1>Vite + React</h1>
        <div className="card">
            <button onClick={() => setCount((count) => count + 1)}>
                count is {count}
            </button>
            <p>
            Edit <code>src/App.tsx</code> and save to test HMR
            </p>
        </div>
        <p className="read-the-docs">
            Click on the Vite and React logos to learn more
        </p>
        <PyasConnect
            clientId="pyas_cffitdg..."
            tokenName="DEV KEY"
            productName="Skyline AI"
            userName="Jimmy"
            userEmail="jimmy.test@example.com"
            onAccountConnected={acct => console.log('Connected!', acct)}
            onConnectError={err => console.error('Uh oh:', err)}

        />
    </>
  )
}

export default App
