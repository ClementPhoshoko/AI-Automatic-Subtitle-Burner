import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Nav from './components/nav/Nav'
import IntroOverlay from './components/intro/IntroOverlay'
import './App.css'

function App() {
  const [showIntro, setShowIntro] = useState(true)

  return (
    <div className="app">
      {showIntro && <IntroOverlay onDone={() => setShowIntro(false)} />}
      <Nav />
      <main className="app__main">
        <Routes>
          <Route path="/" element={null} />
        </Routes>
      </main>
    </div>
  )
}

export default App
