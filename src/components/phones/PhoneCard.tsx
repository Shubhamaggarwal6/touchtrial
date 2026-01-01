import { Link } from 'react-router-dom';
import { Plus, Check, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone } from '@/data/phones';
import { useCart } from '@/context/CartContext';
import { useCompare } from '@/context/CompareContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PhoneCardProps {
  phone: Phone;
}

export function PhoneCard({ phone }: PhoneCardProps) {
  const { addToCart, removeFromCart, isInCart } = useCart();
  const { addToCompare, removeFromCompare, isInCompare, compareCount } = useCompare();
  const inCart = isInCart(phone.id);
  const inCompare = isInCompare(phone.id);

  const handleCartAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCart) {
      removeFromCart(phone.id);
    } else {
      addToCart(phone);
    }
  };

  const handleCompareAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(phone.id);
    } else {
      addToCompare(phone);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
      <Link to={`/phones/${phone.id}`}>
        <CardContent className="p-0">
          {/* Image Container */}
          <div className="relative aspect-square bg-gradient-to-b from-secondary/50 to-secondary overflow-hidden">
            <img
              src={phone.image}
              alt={`${phone.brand} ${phone.model}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <Badge 
              variant="secondary" 
              className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm"
            >
              {phone.brand}
            </Badge>
            {/* Compare Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleCompareAction}
                  disabled={!inCompare && compareCount >= 4}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
                    inCompare 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background/90 hover:bg-primary hover:text-primary-foreground'
                  } ${!inCompare && compareCount >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Scale className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {inCompare ? 'Remove from compare' : compareCount >= 4 ? 'Max 4 phones' : 'Add to compare'}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {phone.model}
              </h3>
              <p className="text-lg font-bold text-primary mt-1">
                {formatPrice(phone.price)}
              </p>
            </div>

            {/* Highlights */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs px-2 py-1 bg-secondary rounded-full text-muted-foreground">
                {phone.ram} RAM
              </span>
              <span className="text-xs px-2 py-1 bg-secondary rounded-full text-muted-foreground">
                {phone.storage}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                asChild
              >
                <span>View Details</span>
              </Button>
              <Button
                variant={inCart ? "default" : "accent"}
                size="sm"
                onClick={handleCartAction}
                className="shrink-0"
              >
                {inCart ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
