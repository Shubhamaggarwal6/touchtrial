import { Link } from 'react-router-dom';
import { Phone } from '@/data/phones';

interface SimilarProductsProps {
  phones: Phone[];
  currentId: string;
}

export function SimilarProducts({ phones, currentId }: SimilarProductsProps) {
  const similar = phones.filter(p => p.id !== currentId).slice(0, 6);

  if (similar.length === 0) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-base">Similar Products</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {similar.map(phone => (
          <Link
            key={phone.id}
            to={`/phones/${phone.id}`}
            className="shrink-0 w-36 rounded-xl border border-border/50 bg-background overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-secondary/50 overflow-hidden">
              <img src={phone.image} alt={phone.model} className="w-full h-full object-cover" />
            </div>
            <div className="p-2.5 space-y-1">
              <p className="text-xs text-muted-foreground">{phone.brand}</p>
              <p className="text-xs font-semibold line-clamp-2 leading-tight">{phone.model}</p>
              <p className="text-sm font-bold text-primary">{formatPrice(phone.price)}</p>
              <p className="text-[10px] text-muted-foreground">{phone.ram} | {phone.storage}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
