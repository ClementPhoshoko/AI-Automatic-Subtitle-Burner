import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Nav from './components/nav/Nav'
import Footer from './components/footer/Footer'
import Home from './pages/home/Home'
import Jobs from './pages/jobs/Jobs'
import IntroOverlay from './components/intro/IntroOverlay'
import ElectricityOverlay from './components/electricity/ElectricityOverlay'
import StormClouds from './components/electricity/StormClouds'
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
          <Route path="/jobs" element={<Jobs />} />
        </Routes>
      </main>
      <StormClouds />
      <ElectricityOverlay />
      <Footer />
    </div>
  )
}

export default App
