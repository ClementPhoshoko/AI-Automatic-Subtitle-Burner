export default function TermsContent() {
  return (
    <div className="terms-modal__content">
      <p className="terms-modal__effective">Effective Date: July 2025</p>

      <section className="terms-modal__section">
        <h3>1. Acceptance of Terms</h3>
        <p>
          By accessing or using Burner ("the Service"), you agree to be bound by these Terms of Service.
          If you do not agree, do not use the Service.
        </p>
      </section>

      <section className="terms-modal__section">
        <h3>2. Description of Service</h3>
        <p>
          Burner is an AI-powered subtitle generation tool that processes uploaded video files using
          Google Gemini AI to generate and burn subtitles into videos. The Service is provided "as is"
          without warranties of any kind.
        </p>
      </section>

      <section className="terms-modal__section">
        <h3>3. User Responsibilities</h3>
        <p>You agree to:</p>
        <ul>
          <li>Upload only content you own or have rights to process</li>
          <li>Not use the Service for any unlawful purpose</li>
          <li>Not attempt to exploit or abuse the Service</li>
          <li>Respect processing limits and fair usage guidelines</li>
        </ul>
      </section>

      <section className="terms-modal__section">
        <h3>4. Content &amp; Intellectual Property</h3>
        <p>
          You retain all rights to your uploaded content. By uploading content, you grant Burner a
          temporary, limited license to process your files solely for the purpose of generating subtitles.
          We do not claim ownership over your content.
        </p>
      </section>

      <section className="terms-modal__section">
        <h3>5. Data Retention</h3>
        <p>
          Uploaded videos, generated subtitles, and processed files are automatically deleted from our
          servers within 2 hours of processing completion. We do not store or retain your media files
          beyond this period.
        </p>
      </section>

      <section className="terms-modal__section">
        <h3>6. Limitation of Liability</h3>
        <p>
          Burner and its operators shall not be held liable for any direct, indirect, incidental, or
          consequential damages arising from the use of the Service, including but not limited to loss
          of data, content, or profits.
        </p>
      </section>

      <section className="terms-modal__section">
        <h3>7. Service Availability</h3>
        <p>
          We strive to maintain Service availability but do not guarantee uninterrupted access. We reserve
          the right to modify, suspend, or discontinue the Service at any time without prior notice.
        </p>
      </section>

      <section className="terms-modal__section">
        <h3>8. Changes to Terms</h3>
        <p>
          We may update these Terms of Service from time to time. Continued use of the Service after
          changes constitutes acceptance of the revised terms.
        </p>
      </section>

      <section className="terms-modal__section">
        <h3>9. Contact</h3>
        <p>
          For questions about these Terms, contact us at{' '}
          <a href="mailto:info@akovolabs.co.za">info@akovolabs.co.za</a>.
        </p>
      </section>
    </div>
  )
}
