import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const sections = [
  {
    title: '1. Eligibility',
    points: [
      'You must be at least 18 years old to place an order.',
      'All account details, delivery information, and payment details must be accurate.',
    ],
  },
  {
    title: '2. Home Experience Service',
    points: [
      'Our home experience allows you to test selected devices before final purchase.',
      'Availability of specific devices, slots, and cities may change without prior notice.',
      'A refundable deposit and service fees may apply at checkout.',
    ],
  },
  {
    title: '3. Orders, Pricing, and Payments',
    points: [
      'Prices shown on the platform are in INR and may change over time.',
      'Discounts, coupons, and offers are subject to eligibility and validity rules.',
      'Orders are confirmed only after successful verification and payment authorization where applicable.',
    ],
  },
  {
    title: '4. Cancellations and Refunds',
    points: [
      'Refund timelines can vary based on payment method and banking partner processing.',
      'Refunds may be reduced or denied in case of device damage, missing accessories, or policy abuse.',
    ],
  },
  {
    title: '5. User Conduct',
    points: [
      'Do not misuse, tamper with, or attempt unauthorized access to the app or service.',
      'Abusive, fraudulent, or illegal activity may result in account suspension or legal action.',
    ],
  },
  {
    title: '6. Liability',
    points: [
      'Service interruptions may occur due to maintenance, network issues, or third-party dependencies.',
      'To the extent permitted by law, we are not liable for indirect or consequential losses.',
    ],
  },
  {
    title: '7. Policy Updates',
    points: [
      'We may update these Terms & Conditions from time to time.',
      'Continued use of the platform after updates means you accept the revised terms.',
    ],
  },
  {
    title: '8. Contact',
    points: ['For support, reach us at support@touchtrial.in.'],
  },
];

const TermsAndConditionsPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container py-16">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 gap-1 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <header className="max-w-3xl mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms &amp; Conditions</h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Please read these terms carefully before using TouchTrial services.
          </p>
          <p className="text-sm text-muted-foreground mt-2">Last updated: March 2026</p>
        </header>

        <section className="max-w-4xl space-y-6" aria-label="Terms and conditions sections">
          {sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-border/60 bg-card p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-semibold mb-4">{section.title}</h2>
              <ul className="space-y-2 text-muted-foreground">
                {section.points.map((point) => (
                  <li key={point} className="leading-relaxed">
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </div>
    </Layout>
  );
};

export default TermsAndConditionsPage;
