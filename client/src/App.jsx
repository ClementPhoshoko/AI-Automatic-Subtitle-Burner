import { Routes, Route } from 'react-router-dom'
import Nav from './components/nav/Nav'
import './App.css'

function App() {
  return (
    <div className="app">
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
