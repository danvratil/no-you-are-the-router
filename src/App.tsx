import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          No, YOU Are the Router!
        </h1>
        <p className="text-gray-600 mb-8">
          An educational game about networking fundamentals
        </p>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setCount((count) => count + 1)}
        >
          Count: {count}
        </button>
        <p className="text-sm text-gray-500 mt-4">
          Game implementation coming soon...
        </p>
      </div>
    </div>
  )
}

export default App
