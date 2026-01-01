import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PhoneCard } from '@/components/phones/PhoneCard';
import { phones } from '@/data/phones';

export function FeaturedPhones() {
  const featuredPhones = phones.slice(0, 4);

  return (
    <section className="py-20">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Popular Phones</h2>
            <p className="text-muted-foreground">
              Most requested phones for home experience
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/phones">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredPhones.map((phone) => (
            <PhoneCard key={phone.id} phone={phone} />
          ))}
        </div>
      </div>
    </section>
  );
}
