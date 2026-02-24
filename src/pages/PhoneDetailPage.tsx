import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Check, ChevronRight, Shield, Truck, Star } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { PhoneVariant } from '@/data/phones';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { usePhones } from '@/hooks/use-phones';
import { PhoneGallery } from '@/components/phone-detail/PhoneGallery';
import { ProductHighlights } from '@/components/phone-detail/ProductHighlights';
import { BankOffersSection } from '@/components/phone-detail/BankOffersSection';
import { SpecificationsTable } from '@/components/phone-detail/SpecificationsTable';
import { SimilarProducts } from '@/components/phone-detail/SimilarProducts';

const PhoneDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, removeFromCart, isInCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<number>(0);

  const { data: phones = [], isLoading } = usePhones();
  const phone = phones.find(p => p.id === id);

  const updateCartSelection = (variantIdx: number, colorIdx: number) => {
    if (phone && isInCart(phone.id)) {
      const v = phone.variants[variantIdx] || phone.variants[0];
      addToCart(phone, `${v.ram} / ${v.storage}`, phone.colors[colorIdx]?.name || '');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="aspect-square rounded-2xl" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Layout>
    );
  }

  if (!phone) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Phone not found</h1>
          <Button asChild><Link to="/phones">Browse All Phones</Link></Button>
        </div>
      </Layout>
    );
  }

  const currentVariant: PhoneVariant = phone.variants[selectedVariant] || phone.variants[0];
  const currentPrice = currentVariant?.price ?? phone.price;
  const inCart = isInCart(phone.id);

  const handleCartAction = () => {
    if (inCart) {
      removeFromCart(phone.id);
    } else {
      addToCart(phone, `${currentVariant.ram} / ${currentVariant.storage}`, phone.colors[selectedColor]?.name || '');
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  // Simulate MRP as ~10-15% higher for discount display
  const mrp = Math.round(currentPrice * 1.12);
  const discountPercent = Math.round(((mrp - currentPrice) / mrp) * 100);

  const specs = [
    { label: 'Display', value: phone.display },
    { label: 'Processor', value: phone.processor },
    { label: 'Camera', value: phone.camera },
    { label: 'Battery', value: phone.battery },
    { label: 'RAM', value: currentVariant.ram },
    { label: 'Storage', value: currentVariant.storage },
    { label: 'OS', value: phone.os },
  ];

  // Similar phones from same brand
  const sameBrand = phones.filter(p => p.brand === phone.brand && p.id !== phone.id);
  const similarPhones = sameBrand.length > 0 ? sameBrand : phones.filter(p => p.id !== phone.id);

  return (
    <Layout>
      <div className="container py-4 md:py-8 max-w-full overflow-hidden box-border">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <button onClick={() => navigate(-1)} className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />Back
          </button>
          <ChevronRight className="h-3 w-3" />
          <Link to="/phones" className="hover:text-foreground transition-colors">Phones</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate">{phone.brand} {phone.model}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 min-w-0">
          {/* Left: Gallery (sticky on desktop) */}
          <div className="lg:sticky lg:top-20 lg:self-start min-w-0">
            <PhoneGallery images={phone.gallery} brand={phone.brand} model={phone.model} />
          </div>

          {/* Right: Details */}
          <div className="space-y-5 min-w-0 max-w-full overflow-hidden break-words">
            
            {/* Color Selection */}
            {phone.colors.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Selected Color: <span className="font-semibold text-foreground">{phone.colors[selectedColor]?.name}</span>
                </p>
                <div className="flex gap-2.5">
                  {phone.colors.map((color, index) => (
                    <button
                      key={color.name}
                      onClick={() => { setSelectedColor(index); updateCartSelection(selectedVariant, index); }}
                      className={`relative w-9 h-9 rounded-full border-2 transition-all ${selectedColor === index ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-border hover:border-muted-foreground'}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Variant Selection */}
            {phone.variants.length > 1 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Variant</p>
                <div className="flex flex-wrap gap-2">
                  {phone.variants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => { setSelectedVariant(index); updateCartSelection(index, selectedColor); }}
                      className={`px-3 py-2 rounded-lg border-2 text-left transition-all text-xs ${selectedVariant === index ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}
                    >
                      <p className="font-semibold">{variant.ram} / {variant.storage}</p>
                      <p className={`mt-0.5 ${selectedVariant === index ? 'text-primary' : 'text-muted-foreground'}`}>{formatPrice(variant.price)}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Product Title */}
            <div>
              <p className="text-xs text-muted-foreground">{phone.brand}</p>
              <h1 className="text-lg md:text-2xl font-bold mt-0.5">
                {phone.model}, {currentVariant.ram}, {currentVariant.storage}
              </h1>

              {/* Highlights pills */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {phone.highlights.map(h => (
                  <span key={h} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">{h}</span>
                ))}
              </div>
            </div>

            {/* Price Block */}
            <div className="bg-secondary/50 rounded-xl p-4 space-y-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl md:text-3xl font-bold text-foreground">{formatPrice(currentPrice)}</span>
                <span className="text-sm text-muted-foreground line-through">{formatPrice(mrp)}</span>
                <span className="text-sm font-semibold text-accent-foreground bg-accent/20 px-1.5 py-0.5 rounded">↓{discountPercent}% off</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Inclusive of all taxes</p>
            </div>

            {/* EMI Info */}
            <div className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-background">
              <div className="shrink-0 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">EMI</div>
              <p className="text-xs text-muted-foreground">
                Starting from <span className="font-semibold text-foreground">{formatPrice(Math.round(currentPrice / 12))}/month</span> · No cost EMI available
              </p>
            </div>

            <Separator />

            {/* Bank Offers */}
            <BankOffersSection offers={phone.bankOffers} />

            <Separator />

            {/* Delivery Info */}
            <div className="space-y-3">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />Delivery Details
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 text-center">
                  <Truck className="h-4 w-4 mx-auto text-primary mb-1" />
                  <p className="text-[11px] font-medium">Free Delivery</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 text-center">
                  <Shield className="h-4 w-4 mx-auto text-primary mb-1" />
                  <p className="text-[11px] font-medium">1 Year Warranty</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Product Highlights */}
            <ProductHighlights
              camera={phone.camera}
              display={phone.display}
              processor={phone.processor}
              battery={phone.battery}
              ram={currentVariant.ram}
              storage={currentVariant.storage}
              os={phone.os}
            />

            <Separator />

            {/* About */}
            <div>
              <h2 className="font-semibold text-base mb-2">About this phone</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{phone.description}</p>
            </div>

            <Separator />

            {/* Specifications */}
            <SpecificationsTable specs={specs} />

            <Separator />

            {/* Home Experience CTA */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-primary">📱 Book a Home Experience</p>
              <p className="text-xs text-muted-foreground">
                Try up to 5 phones at your doorstep. Love it? Buy it! Pay at delivery & your deposit is refunded.
              </p>
            </div>

            {/* Sticky Add to Cart */}
            <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border pt-3 pb-4 -mx-4 px-4 md:static md:border-0 md:pt-0 md:pb-0 md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none z-10">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold">{formatPrice(currentPrice)}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{currentVariant.ram} / {currentVariant.storage} · {phone.colors[selectedColor]?.name}</p>
                </div>
                <Button variant={inCart ? "outline" : "accent"} size="lg" onClick={handleCartAction} className="shrink-0">
                  {inCart ? <><Check className="h-5 w-5" />Added</> : <><Plus className="h-5 w-5" />Add to Experience</>}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Similar Products */}
            <SimilarProducts phones={similarPhones} currentId={phone.id} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PhoneDetailPage;
