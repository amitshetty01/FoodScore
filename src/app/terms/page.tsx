import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service — FoodScore' };

export default function TermsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing or using FoodScore, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.',
    },
    {
      title: '2. Description of Service',
      content: 'FoodScore provides nutritional health scores and information for food products sourced from public databases. Scores are algorithmic estimates for informational purposes only and should not be considered medical or dietary advice.',
    },
    {
      title: '3. User Accounts',
      content: 'You are responsible for maintaining the security of your account credentials. You must not share your account with others or use another person\'s account. We reserve the right to suspend accounts that violate these terms.',
    },
    {
      title: '4. Accuracy of Information',
      content: 'Product data is sourced from public food databases. While we strive for accuracy, we cannot guarantee that all nutritional information is complete or up to date. Always verify important nutritional information on the actual product label.',
    },
    {
      title: '5. Not Medical Advice',
      content: 'FoodScore health scores are for general informational purposes only. They are not medical advice, dietary recommendations, or a substitute for professional nutritional guidance. Consult a qualified healthcare professional before making significant dietary changes.',
    },
    {
      title: '6. Intellectual Property',
      content: 'The FoodScore application, brand, and original content are owned by FoodScore. You may not reproduce or redistribute our proprietary content without permission.',
    },
    {
      title: '7. Limitation of Liability',
      content: 'FoodScore is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of, or inability to use, the service, including decisions made based on health scores or nutritional information displayed.',
    },
    {
      title: '8. Termination',
      content: 'We reserve the right to suspend or terminate your access to FoodScore at any time for violation of these terms or for any other reason at our discretion. You may delete your account at any time from your dashboard settings.',
    },
    {
      title: '9. Governing Law',
      content: 'These terms are governed by applicable law. Any disputes will be resolved in the courts of the jurisdiction in which FoodScore operates.',
    },
    {
      title: '10. Changes to Terms',
      content: 'We may modify these terms at any time. Continued use of FoodScore after changes are posted constitutes your acceptance of the revised terms.',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-syne font-extrabold text-4xl text-zinc-900 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-zinc-400 mb-10">Last updated: June 2025</p>

        <div className="space-y-6">
          {sections.map(s => (
            <div key={s.title} className="glass rounded-2xl p-6">
              <h2 className="font-syne font-bold text-base text-zinc-900 dark:text-white mb-2">{s.title}</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 glass rounded-2xl p-6 text-center">
          <p className="text-sm text-zinc-500">
            Questions?{' '}
            <a href="mailto:hello@foodscore.app" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
              hello@foodscore.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
