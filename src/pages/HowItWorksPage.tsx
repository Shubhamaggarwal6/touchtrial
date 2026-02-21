import { Layout } from '@/components/layout/Layout';
import { Search, Package, CreditCard, CheckCircle2, ArrowRight, Truck } from 'lucide-react';
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
    title: 'Specialist Visits Your Home',
    description: 'Book a home experience for up to 5 phones. Our specialist brings the phones and gives you a personalized hands-on demo at your doorstep.',
    details: [
      'Refundable deposit on purchase',
      'Expert demo at your doorstep',
      'Scheduled within 24-48 hours',
      'Use coupon FIRST200 for ₹200 off your first order'
    ]
  },
  {
    icon: CreditCard,
    number: 3,
    title: 'Experience & Decide',
    description: 'During the demo, test cameras, feel the build quality, check displays, and experience performance hands-on with our specialist guiding you.',
    details: [
      'Hands-on experience with expert',
      'Test all features live',
      'Compare phones side by side',
      'Get answers to all your questions'
    ]
  },
  {
    icon: Truck,
    number: 4,
    title: 'Buy at Delivery or Return',
    description: 'Love a phone? Our specialist delivers it to you — pay at the time of delivery and your deposit is refunded instantly. Not satisfied? Simply return all phones. No questions asked.',
    details: [
      'Pay for the phone at delivery',
      'Full deposit refund on purchase',
      'Free pickup for returns',
      'No hidden charges'
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
                <p className="text-sm text-muted-foreground mb-2">Up to 5 Phones</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Home Experience Deposit</span>
                    <span>₹399</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Convenience Fee</span>
                    <span>₹100</span>
                  </div>
                  <div className="flex justify-between font-bold text-primary pt-2 border-t">
                    <span>Total</span>
                    <span>₹499</span>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">7 Phones Experience</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Home Experience Deposit</span>
                    <span>₹399</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Convenience Fee</span>
                    <span>₹100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2 extra phones × ₹69</span>
                    <span>₹138</span>
                  </div>
                  <div className="flex justify-between font-bold text-primary pt-2 border-t">
                    <span>Total</span>
                    <span>₹637</span>
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