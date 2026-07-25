export default function PrivacyContent() {
  return (
    <div className="terms-modal__content">
      <p className="terms-modal__effective">Effective Date: July 2025</p>

      <section className="terms-modal__section">
        <h3>1. Information We Collect</h3>
        <p>Burner collects minimal information to provide the Service:</p>
        <ul>
          <li><strong>Uploaded Files:</strong> Video files submitted for subtitle processing</li>
          <li><strong>Processing Data:</strong> Metadata such as file size, duration, and format</li>
          <li><strong>Usage Data:</strong> Anonymous analytics to improve the Service</li>
        </ul>
      </section>

      <section className="terms-modal__section">
        <h3>2. How We Use Your Information</h3>
        <p>Your uploaded content is used exclusively to:</p>
        <ul>
          <li>Generate subtitles using AI processing</li>
          <li>Burn subtitles into your video</li>
          <li>Provide downloadable output files</li>
        </ul>
      </section>

      <section className="terms-modal__section">
        <h3>3. Data Storage &amp; Security</h3>
        <p>
          All uploaded and processed files are stored securely and automatically deleted within 2 hours
          of processing completion. We use industry-standard security measures to protect your data
          during transit and processing.
        </p>
      </section>

      <section className="terms-modal__section">
        <h3>4. Third-Party Services</h3>
        <p>
          Burner uses Google Gemini AI for subtitle generation. Your video content is processed through
          Google's API for the sole purpose of generating subtitles. We encourage you to review Google's
          privacy policy for details on how they handle processed data.
        </p>
      </section>

      <section className="terms-modal__section">
        <h3>5. Cookies &amp; Tracking</h3>
        <p>
          Burner uses essential cookies for Service functionality. We do not use tracking cookies or
          sell any data to third parties.
        </p>
      </section>

      <section className="terms-modal__section">
        <h3>6. Data Sharing</h3>
        <p>
          We do not sell, trade, or share your personal information or uploaded content with third
          parties except as necessary to provide the Service (e.g., Google Gemini AI processing).
        </p>
      </section>

      <section className="terms-modal__section">
        <h3>7. Your Rights</h3>
        <p>You have the right to:</p>
        <ul>
          <li>Request deletion of any personal data we may hold</li>
          <li>Know what data we collect and how it is used</li>
          <li>Opt out of optional analytics collection</li>
        </ul>
      </section>

      <section className="terms-modal__section">
        <h3>8. Changes to This Policy</h3>
        <p>
          We may update this Privacy Policy from time to time. Changes will be reflected on this page
          with an updated effective date.
        </p>
      </section>

      <section className="terms-modal__section">
        <h3>9. Contact</h3>
        <p>
          For privacy-related inquiries, contact us at{' '}
          <a href="mailto:info@akovolabs.co.za">info@akovolabs.co.za</a>.
        </p>
      </section>
    </div>
  )
}
