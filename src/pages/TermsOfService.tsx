const TermsOfService = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-zinc-800 dark:text-zinc-200">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
        Last updated: {/* add date */}
      </p>

      <section className="space-y-6">
        <p>
          Welcome to <strong>WhatsKenoun</strong>. By accessing or using our
          application, you agree to be bound by these Terms of Service.
        </p>

        <div>
          <h2 className="text-xl font-semibold mb-2">1. Eligibility</h2>
          <p>You must be at least 13 years old to use the service.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            2. Account Responsibility
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You are responsible for your account security</li>
            <li>All activity under your account is your responsibility</li>
            <li>Do not share your credentials</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">3. Acceptable Use</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>No illegal activities</li>
            <li>No harassment or abuse</li>
            <li>No spam or malicious content</li>
            <li>No attempts to breach security</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">4. User Content</h2>
          <p>
            You retain ownership of your content. We store and process content
            only to operate the service.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            5. Moderation & Enforcement
          </h2>
          <p>
            We may remove content or suspend accounts that violate these Terms.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">6. Privacy</h2>
          <p>
            Your use of the service is governed by our Privacy Policy.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            7. Limitation of Liability
          </h2>
          <p>
            The service is provided “as is” without warranties of any kind.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">8. Termination</h2>
          <p>
            We may suspend or terminate access at any time for violations of
            these Terms.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">9. Contact</h2>
          <p>
            Questions? Contact us! Or don't, I don't care
          </p>

        </div>
      </section>
    </div>
  )
}

export default TermsOfService
