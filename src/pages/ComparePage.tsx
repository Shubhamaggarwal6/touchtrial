import { Link } from 'react-router-dom';
import { X, Plus, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCompare } from '@/context/CompareContext';
import { useCart } from '@/context/CartContext';
import { Phone } from '@/data/phones';

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart, isInCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const specs: Array<{ label: string; key: keyof Phone; format?: (v: any) => string }> = [
    { label: 'Price', key: 'price', format: (v: number) => formatPrice(v) },
    { label: 'Display', key: 'display' },
    { label: 'Processor', key: 'processor' },
    { label: 'RAM', key: 'ram' },
    { label: 'Storage', key: 'storage' },
    { label: 'Camera', key: 'camera' },
    { label: 'Battery', key: 'battery' },
    { label: 'OS', key: 'os' },
  ];

  if (compareList.length === 0) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Compare Phones</h1>
          <p className="text-muted-foreground mb-8">
            Add phones to compare their specifications side by side.
          </p>
          <Link to="/phones">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Phones
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Compare Phones</h1>
            <p className="text-muted-foreground mt-1">
              Comparing {compareList.length} phone{compareList.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/phones">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add More
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={clearCompare}>
              Clear All
            </Button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Phone Cards Header */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${compareList.length}, minmax(200px, 1fr))` }}>
              {compareList.map((phone) => (
                <Card key={phone.id} className="relative overflow-hidden">
                  <button
                    onClick={() => removeFromCompare(phone.id)}
                    className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <CardContent className="p-4">
                    <Link to={`/phones/${phone.id}`}>
                      <div className="aspect-square bg-secondary/50 rounded-lg overflow-hidden mb-4">
                        <img
                          src={phone.image}
                          alt={`${phone.brand} ${phone.model}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                      <h3 className="font-semibold text-sm">{phone.brand}</h3>
                      <p className="font-bold text-lg">{phone.model}</p>
                    </Link>
                    <Button
                      variant={isInCart(phone.id) ? "outline" : "accent"}
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => addToCart(phone)}
                      disabled={isInCart(phone.id)}
                    >
                      {isInCart(phone.id) ? 'Added' : 'Add to Experience'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Specs Table */}
            <Card>
              <CardContent className="p-0">
                {specs.map((spec, index) => (
                  <div
                    key={spec.key as string}
                    className={`grid gap-4 p-4 ${index !== specs.length - 1 ? 'border-b border-border/50' : ''} ${index % 2 === 0 ? 'bg-secondary/30' : ''}`}
                    style={{ gridTemplateColumns: `repeat(${compareList.length}, minmax(200px, 1fr))` }}
                  >
                    {compareList.map((phone, phoneIndex) => (
                      <div key={phone.id}>
                        {phoneIndex === 0 && (
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                            {spec.label}
                          </p>
                        )}
                        {phoneIndex !== 0 && (
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1 md:hidden">
                            {spec.label}
                          </p>
                        )}
                        <p className="text-sm font-medium">
                          {spec.format 
                            ? spec.format(phone[spec.key] as number)
                            : String(phone[spec.key])
                          }
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
