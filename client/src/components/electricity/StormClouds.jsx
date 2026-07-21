import { useEffect, useRef } from 'react'
import './StormClouds.css'

function StormClouds() {
  const flashRef = useRef(null)

  useEffect(() => {
    const el = flashRef.current
    if (!el) return

    const onFlash = () => {
      el.classList.remove('storm-flash-active')
      void el.offsetWidth
      el.classList.add('storm-flash-active')
    }

    window.addEventListener('stormflash', onFlash)
    return () => window.removeEventListener('stormflash', onFlash)
  }, [])

  return (
    <div className="storm" aria-hidden="true">
      {/* Deep background haze */}
      <div className="storm__haze" />

      {/* Cloud puffs — arranged like a storm cloud bank */}
      <div className="storm__puff storm__puff--1" />
      <div className="storm__puff storm__puff--2" />
      <div className="storm__puff storm__puff--3" />
      <div className="storm__puff storm__puff--4" />
      <div className="storm__puff storm__puff--5" />
      <div className="storm__puff storm__puff--6" />

      {/* Drifting wisp layers */}
      <div className="storm__wisp storm__wisp--a" />
      <div className="storm__wisp storm__wisp--b" />

      {/* Atmospheric mist */}
      <div className="storm__mist" />

      {/* Flash overlay */}
      <div ref={flashRef} className="storm__flash" />
    </div>
  )
}

export default StormClouds
