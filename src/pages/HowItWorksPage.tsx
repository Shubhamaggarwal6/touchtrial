import { Layout } from '@/components/layout/Layout';
import { Search, Package, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const steps = [
  {
    icon: Search,
    number: 1,
    title: 'Browse & Select Phones',
    description: 'Explore our catalog of the latest smartphones. Add as many phones as you want to your experience cart. Compare specs, prices, and features all in one place.',
    details: [
      'Access 50+ latest smartphones',
      'Filter by brand, price, RAM, storage',
      'Compare detailed specifications',
      'Read about features and highlights'
    ]
  },
  {
    icon: Package,
    number: 2,
    title: 'Pay Experience Fee & Get Delivered',
    description: 'Pay a small experience fee of ₹50 per phone plus ₹100 convenience fee. Your selected phones will be delivered to your doorstep within 24-48 hours.',
    details: [
      '₹50 per phone experience fee',
      '₹100 one-time convenience fee',
      'Free doorstep delivery',
      'Delivered within 24-48 hours'
    ]
  },
  {
    icon: CreditCard,
    number: 3,
    title: 'Experience at Home',
    description: 'Take your time to explore each phone. Test the camera, feel the build quality, check the display, and experience the performance in your daily routine.',
    details: [
      'Use phones for up to 3 days',
      'Test all features at your pace',
      'Compare phones side by side',
      'No pressure, no salespeople'
    ]
  },
  {
    icon: CheckCircle2,
    number: 4,
    title: 'Buy or Return',
    description: 'Love a phone? Purchase it and your experience fee gets refunded. Not satisfied? Simply return all phones with free pickup. No questions asked.',
    details: [
      'Full experience fee refund on purchase',
      'Free pickup for returns',
      'No hidden charges',
      'Hassle-free process'
    ]
  },
];

const HowItWorksPage = () => {
  return (
    <Layout>
      <div className="container py-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h1>
          <p className="text-xl text-muted-foreground">
            Experience smartphones in the comfort of your home before making a purchase decision. It's simple, transparent, and risk-free.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className="relative bg-card rounded-2xl border border-border/50 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full gradient-hero text-primary-foreground flex items-center justify-center font-bold text-lg">
                {step.number}
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Icon */}
                <div className="shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
                  <p className="text-muted-foreground mb-4">{step.description}</p>
                  
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {step.details.map(detail => (
                      <li key={detail} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute left-8 -bottom-8 h-8 w-0.5 bg-border" />
              )}
            </div>
          ))}
        </div>

        {/* Pricing Example */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-secondary/50 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold mb-4 text-center">Pricing Example</h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-4 border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">3 Phones Experience</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>3 phones × ₹50</span>
                    <span>₹150</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Convenience fee</span>
                    <span>₹100</span>
                  </div>
                  <div className="flex justify-between font-bold text-primary pt-2 border-t">
                    <span>Total</span>
                    <span>₹250</span>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">5 Phones Experience</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>5 phones × ₹50</span>
                    <span>₹250</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Convenience fee</span>
                    <span>₹100</span>
                  </div>
                  <div className="flex justify-between font-bold text-primary pt-2 border-t">
                    <span>Total</span>
                    <span>₹350</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Button asChild variant="hero" size="xl">
            <Link to="/phones">
              Start Browsing Phones
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default HowItWorksPage;
