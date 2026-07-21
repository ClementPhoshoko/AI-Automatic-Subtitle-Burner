import { Link } from 'react-router-dom'
import { FiSun } from 'react-icons/fi'
import { useTheme } from '../../contexts/ThemeContext'
import logo from '../../assets/burner_logo_with_no_bg.png'
import './Nav.css'

function Nav() {
  const { toggle } = useTheme()

  return (
    <nav className="nav">
      <Link to="/" className="nav__left">
        <img className="nav__logo" src={logo} alt="Burner" />
        <span className="nav__title">u r n e r</span>
      </Link>
      <div className="nav__right">
        <button className="nav__theme-btn" onClick={toggle} title="Toggle theme">
          <FiSun size={18} />
        </button>
      </div>
    </nav>
  )
}

export default Nav
