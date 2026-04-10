import { useState } from 'react';
import { Tag, ChevronDown, ChevronUp, CreditCard, BadgeCheck } from 'lucide-react';
import { BankOffer } from '@/data/phones';

interface BankOffersSectionProps {
  offers: BankOffer[];
}

export function BankOffersSection({ offers }: BankOffersSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleOffers = expanded ? offers : offers.slice(0, 2);

  return (
    <div className="space-y-3">
      {/* Price Match Banner */}
      <div className="flex items-center gap-2.5 p-3 rounded-lg bg-accent/10 border border-accent/30">
        <BadgeCheck className="h-5 w-5 text-accent-foreground shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-accent-foreground">Same Price as Flipkart & Amazon</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            We offer prices matching top online platforms — plus you get to try before you buy!
          </p>
        </div>
      </div>

      {offers.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Bank & Card Offers
            </h2>
            <span className="text-xs text-muted-foreground">{offers.length} offers</span>
          </div>

          <div className="space-y-2">
            {visibleOffers.map((offer, index) => (
              <div key={index} className="flex items-start gap-2.5 p-3 rounded-lg border border-border/50 bg-secondary/30">
                <Tag className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold">{offer.discount} — {offer.bank}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{offer.description}</p>
                </div>
              </div>
            ))}
          </div>

          {offers.length > 2 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {expanded ? (
                <>Show less <ChevronUp className="h-3.5 w-3.5" /></>
              ) : (
                <>View all {offers.length} offers <ChevronDown className="h-3.5 w-3.5" /></>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
