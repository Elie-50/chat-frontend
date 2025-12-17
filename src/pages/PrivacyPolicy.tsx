const PrivacyPolicy = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-zinc-800 dark:text-zinc-200">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
        Last updated: 12/15/2025 12:30 PM (GMT +2)
      </p>

      <section className="space-y-6">
        <p>
          This Privacy Policy explains how <strong>WhatsKenoun</strong> collects,
          uses, and protects your information.
        </p>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            1. Information We Collect
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Account information (email, username)</li>
            <li>Messages and chat metadata</li>
            <li>Technical and usage data</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Operate and maintain the service</li>
            <li>Authenticate users</li>
            <li>Improve performance and security</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            3. Data Storage & Security
          </h2>
          <p>
            We store data only as long as necessary and use reasonable security
            measures to protect it.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            4. Sharing of Information
          </h2>
          <p>
            We do not sell your personal data. Information is shared only when
            legally required or necessary to operate the service.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            5. Messaging & User Content
          </h2>
          <p>
            Messages are stored to provide chat functionality. We do not read
            private messages except when required for moderation or legal
            reasons.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">6. Cookies</h2>
          <p>
            We use cookies or local storage for authentication and user
            preferences.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">7. Your Rights</h2>
          <p>
            You may request access, correction, or deletion of your data by
            contacting us.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">8. Children’s Privacy</h2>
          <p>
            The service is not intended for children under the age of 13.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">9. Contact</h2>
          <p>
            If you have questions, keep it for yourself! 
          </p>
        </div>
      </section>
    </div>
  )
}

export default PrivacyPolicy
