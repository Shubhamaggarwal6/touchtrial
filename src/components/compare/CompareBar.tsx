import { Link } from 'react-router-dom';
import { X, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompare } from '@/context/CompareContext';

export function CompareBar() {
  const { compareList, removeFromCompare, compareCount } = useCompare();

  if (compareCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border shadow-lg animate-fade-in">
      <div className="container py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto">
            <div className="flex items-center gap-2 shrink-0">
              <Scale className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Compare ({compareCount}/4)</span>
            </div>
            <div className="flex gap-2">
              {compareList.map((phone) => (
                <div
                  key={phone.id}
                  className="relative flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full shrink-0"
                >
                  <img
                    src={phone.image}
                    alt={phone.model}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium max-w-[100px] truncate">
                    {phone.model}
                  </span>
                  <button
                    onClick={() => removeFromCompare(phone.id)}
                    className="ml-1 p-0.5 hover:bg-destructive/20 rounded-full transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <Link to="/compare" className="shrink-0">
            <Button size="sm" disabled={compareCount < 2}>
              Compare Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
