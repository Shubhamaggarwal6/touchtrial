import { Shield, Truck, RotateCcw, HeadphonesIcon } from 'lucide-react';

const badges = [
  {
    icon: Shield,
    title: 'Secure Experience',
    description: 'All phones are sanitized and quality-checked',
  },
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Delivered to your doorstep within 24-48 hours',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: 'Hassle-free pickup if you decide not to buy',
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    description: 'Our team is always ready to help you',
  },
];

export function TrustBadges() {
  return (
    <section className="py-16 border-t border-border/50">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge) => (
            <div key={badge.title} className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                <badge.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{badge.title}</h3>
              <p className="text-sm text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
