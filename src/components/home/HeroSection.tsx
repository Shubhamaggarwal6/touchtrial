import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Search, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function HeroSection() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/phones?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/phones');
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero opacity-5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
      
      <div className="container relative py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-fade-up">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Experience Before You Buy</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Try Smartphones at Home{' '}
            <span className="text-primary">Before You Buy</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Skip the crowded stores. Our specialist brings up to 5 phones to your home for a personalized hands-on demo. Deposit refunded on purchase. Pay for the phone at delivery!
          </p>

          {/* Search Bar */}
          <form 
            onSubmit={handleSearch} 
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto animate-fade-up"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by brand, model, or feature..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base bg-card border-border/50 shadow-lg focus-visible:ring-primary/30"
              />
            </div>
            <Button type="submit" variant="hero" size="xl" className="shrink-0">
              Search Phones
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">50+</p>
              <p className="text-sm text-muted-foreground">Phones Available</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">Expert</p>
              <p className="text-sm text-muted-foreground">Home Demo</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">100%</p>
              <p className="text-sm text-muted-foreground">Refund on Purchase</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
