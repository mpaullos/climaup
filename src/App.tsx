import { useState } from 'react'

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div>
         
        </div>
        <div>
          <h1>Weather Initial</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 13)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

     
    </>
  )
}

export default App
