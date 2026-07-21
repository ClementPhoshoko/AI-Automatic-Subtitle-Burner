import { Link } from 'react-router-dom'
import logo from '../../assets/burner_logo_with_no_bg.png'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__col footer__col--left">
          <Link to="/" className="footer__brand">
            <img className="footer__logo" src={logo} alt="Burner" />
            <span className="footer__title">u r n e r</span>
          </Link>
        </div>

        <div className="footer__col footer__col--middle">
          <p className="footer__tagline">Product of AkovoLabs</p>
        </div>

        <div className="footer__col footer__col--right">
          <Link to="/privacy" className="footer__link">Privacy Notice</Link>
          <span className="footer__sep">/</span>
          <Link to="/terms" className="footer__link">Terms &amp; Conditions</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
