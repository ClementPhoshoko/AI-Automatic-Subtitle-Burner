import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/burner_logo_with_no_bg.png'
import TermsModal from '../terms-modal/TermsModal'
import TermsContent from './terms.jsx'
import PrivacyContent from './privacy.jsx'
import './Footer.css'

function Footer() {
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  return (
    <>
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
            <button className="footer__link" onClick={() => setPrivacyOpen(true)}>Privacy Notice</button>
            <span className="footer__sep">/</span>
            <button className="footer__link" onClick={() => setTermsOpen(true)}>Terms &amp; Conditions</button>
          </div>
        </div>
      </footer>

      <TermsModal open={termsOpen} title="Terms of Service" onClose={() => setTermsOpen(false)}>
        <TermsContent />
      </TermsModal>

      <TermsModal open={privacyOpen} title="Privacy Policy" onClose={() => setPrivacyOpen(false)}>
        <PrivacyContent />
      </TermsModal>
    </>
  )
}

export default Footer
