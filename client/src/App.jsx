import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Nav from './components/nav/Nav'
import Footer from './components/footer/Footer'
import Home from './pages/home/Home'
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
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
