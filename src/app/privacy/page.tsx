import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy — FoodScore' };

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Information We Collect',
      content: `When you create an account, we collect your name, email address, and a hashed password. If you sign in with Google, we receive your name, email, and profile picture from Google. We also record your product searches and saved (favorited) products to power your personal dashboard.`,
    },
    {
      title: '2. How We Use Your Information',
      content: `We use your information solely to provide and improve FoodScore. Your email is used for authentication only — we do not send marketing emails. Search history is used to provide your recent searches and to improve our platform analytics in aggregate, anonymised form.`,
    },
    {
      title: '3. Data Storage',
      content: `Your data is stored in a secure PostgreSQL database. Passwords are never stored in plain text — they are hashed with SHA-256 before storage. We use industry-standard security practices to protect your data.`,
    },
    {
      title: '4. Third-Party Services',
      content: `FoodScore uses Open Food Facts (openfoodfacts.org) to fetch product data. This is a public, read-only API and no personal data is sent to them. If you use Google sign-in, Google's privacy policy applies to that authentication step. We may display Google AdSense advertisements, which may set cookies according to Google's advertising policies.`,
    },
    {
      title: '5. Cookies',
      content: `We use session cookies to keep you logged in (via NextAuth.js). We do not use tracking cookies beyond what is required for authentication and, if enabled, Google AdSense. You may disable cookies in your browser settings, though this will prevent you from staying logged in.`,
    },
    {
      title: '6. Your Rights',
      content: `You may request deletion of your account and all associated data at any time by contacting us at privacy@foodscore.app. You may also export your saved favorites from your dashboard. We honour GDPR rights for users in the European Union and equivalent rights under other applicable laws.`,
    },
    {
      title: '7. Data Retention',
      content: `We retain your account data for as long as your account is active. Search history is retained for up to 12 months. If you delete your account, all personal data is permanently removed within 30 days.`,
    },
    {
      title: '8. Changes to This Policy',
      content: `We may update this policy from time to time. When we do, we will update the "last updated" date below. Continued use of FoodScore after changes constitutes acceptance of the new policy.`,
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-syne font-extrabold text-4xl text-zinc-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-zinc-400 mb-10">Last updated: June 2025</p>

        <div className="space-y-8">
          {sections.map(s => (
            <div key={s.title} className="glass rounded-2xl p-6">
              <h2 className="font-syne font-bold text-lg text-zinc-900 dark:text-white mb-3">{s.title}</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 glass rounded-2xl p-6 text-center">
          <p className="text-sm text-zinc-500">
            Questions about our privacy practices?{' '}
            <a href="mailto:privacy@foodscore.app" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
              privacy@foodscore.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
