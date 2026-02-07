import { Search, Package, CreditCard, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Browse & Select',
    description: 'Explore our catalog and add phones you want to experience to your cart.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Package,
    title: 'Specialist Visit',
    description: 'Pay ₹499 (₹400 deposit + ₹99 convenience). Our specialist delivers up to 5 phones and showcases them at your home.',
    color: 'bg-accent/10 text-accent',
  },
  {
    icon: CreditCard,
    title: '3-Day Trial & Decide',
    description: 'Try the phones for 3 days. Love it? Buy and get your deposit refunded. Not for you? Simply return.',
    color: 'bg-primary/10 text-primary',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience phones before committing to a purchase. It's simple, risk-free, and designed around you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 h-full">
                <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center mb-4`}>
                  <step.icon className="h-7 w-7" />
                </div>
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-6 w-6 text-muted-foreground/30" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Refund Notice */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-primary font-semibold">💰 Your deposit is refunded when you purchase any phone</span>
          </div>
        </div>
      </div>
    </section>
  );
}
