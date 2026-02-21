import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Check, ChevronRight, CreditCard, Tag, ChevronLeft, X, ZoomIn } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PhoneVariant } from '@/data/phones';
import { useCart } from '@/context/CartContext';
import { useState, useRef, useCallback } from 'react';
import { usePhones } from '@/hooks/use-phones';

const PhoneDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, removeFromCart, isInCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<number>(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  // Touch/swipe state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const { data: phones = [], isLoading } = usePhones();
  const phone = phones.find(p => p.id === id);

  const updateCartSelection = (variantIdx: number, colorIdx: number) => {
    if (phone && isInCart(phone.id)) {
      const v = phone.variants[variantIdx] || phone.variants[0];
      const variantLabel = `${v.ram} / ${v.storage}`;
      const colorLabel = phone.colors[colorIdx]?.name || '';
      addToCart(phone, variantLabel, colorLabel);
    }
  };

  const goToImage = useCallback((index: number, images: string[]) => {
    const clamped = Math.max(0, Math.min(index, images.length - 1));
    setSelectedImage(clamped);
  }, []);

  const goToFullscreen = useCallback((index: number, images: string[]) => {
    const clamped = Math.max(0, Math.min(index, images.length - 1));
    setFullscreenIndex(clamped);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent, images: string[], isFullscreen = false) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = (touchStartX.current ?? 0) - (touchEndX.current ?? 0);
    if (Math.abs(diff) > 40) {
      if (isFullscreen) {
        const next = diff > 0 ? fullscreenIndex + 1 : fullscreenIndex - 1;
        goToFullscreen(next, images);
      } else {
        const next = diff > 0 ? selectedImage + 1 : selectedImage - 1;
        goToImage(next, images);
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-6 w-40 mb-8" />
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
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
      const variantLabel = `${currentVariant.ram} / ${currentVariant.storage}`;
      const colorLabel = phone.colors[selectedColor]?.name || '';
      addToCart(phone, variantLabel, colorLabel);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const specs = [
    { label: 'Display', value: phone.display },
    { label: 'Processor', value: phone.processor },
    { label: 'Camera', value: phone.camera },
    { label: 'Battery', value: phone.battery },
    { label: 'RAM', value: currentVariant.ram },
    { label: 'Storage', value: currentVariant.storage },
    { label: 'Operating System', value: phone.os },
  ];

  const images = phone.gallery;

  return (
    <Layout>
      {/* Fullscreen Image Overlay */}
      {fullscreenOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setFullscreenOpen(false)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => setFullscreenOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>

          {/* Prev */}
          {fullscreenIndex > 0 && (
            <button
              className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); goToFullscreen(fullscreenIndex - 1, images); }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Next */}
          {fullscreenIndex < images.length - 1 && (
            <button
              className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); goToFullscreen(fullscreenIndex + 1, images); }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative w-full h-full flex items-center justify-center px-16"
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, images, true)}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[fullscreenIndex]}
              alt={`${phone.brand} ${phone.model} - ${fullscreenIndex + 1}`}
              className="max-w-full max-h-full object-contain select-none"
              draggable={false}
            />
          </div>

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); goToFullscreen(i, images); }}
                  className={`h-2 rounded-full transition-all ${i === fullscreenIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                />
              ))}
            </div>
          )}

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {fullscreenIndex + 1} / {images.length}
          </div>
        </div>
      )}

      <div className="container py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/phones" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />All Phones
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{phone.brand} {phone.model}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            {/* Main image with swipe */}
            <div className="relative aspect-square bg-gradient-to-b from-secondary/50 to-secondary rounded-2xl overflow-hidden group">
              <div
                className="w-full h-full"
                onTouchStart={handleTouchStart}
                onTouchEnd={(e) => handleTouchEnd(e, images)}
              >
                <img
                  src={images[selectedImage]}
                  alt={`${phone.brand} ${phone.model}`}
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => { setFullscreenIndex(selectedImage); setFullscreenOpen(true); }}
                  draggable={false}
                />
              </div>

              {/* Zoom hint */}
              <div className="absolute top-3 right-3 p-2 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ZoomIn className="h-4 w-4" />
              </div>

              {/* Prev / Next arrows */}
              {selectedImage > 0 && (
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors opacity-0 group-hover:opacity-100"
                  onClick={() => goToImage(selectedImage - 1, images)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {selectedImage < images.length - 1 && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors opacity-0 group-hover:opacity-100"
                  onClick={() => goToImage(selectedImage + 1, images)}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}

              {/* Dot indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToImage(i, images)}
                      className={`h-1.5 rounded-full transition-all ${i === selectedImage ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-border'}`}
                >
                  <img src={image} alt={`${phone.brand} ${phone.model} view ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">{phone.brand}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{phone.model}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {phone.highlights.map(highlight => (
                  <span key={highlight} className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">{highlight}</span>
                ))}
              </div>
              <p className="text-3xl font-bold text-primary">{formatPrice(currentPrice)}</p>
            </div>

            <Separator />

            {/* Color Selection */}
            {phone.colors.length > 0 && (
              <div>
                <h2 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                  Color — {phone.colors[selectedColor]?.name}
                </h2>
                <div className="flex gap-3">
                  {phone.colors.map((color, index) => (
                    <button
                      key={color.name}
                      onClick={() => { setSelectedColor(index); updateCartSelection(selectedVariant, index); }}
                      className={`relative w-10 h-10 rounded-full border-2 transition-all ${selectedColor === index ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-border hover:border-muted-foreground'}`}
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
                <h2 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">RAM &amp; Storage</h2>
                <div className="flex flex-wrap gap-3">
                  {phone.variants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => { setSelectedVariant(index); updateCartSelection(index, selectedColor); }}
                      className={`px-4 py-3 rounded-xl border-2 text-left transition-all ${selectedVariant === index ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}
                    >
                      <p className="text-sm font-semibold">{variant.ram} / {variant.storage}</p>
                      <p className={`text-xs mt-0.5 ${selectedVariant === index ? 'text-primary' : 'text-muted-foreground'}`}>{formatPrice(variant.price)}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div>
              <h2 className="font-semibold text-lg mb-2">About this phone</h2>
              <p className="text-muted-foreground leading-relaxed">{phone.description}</p>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
              <p className="text-sm">
                <span className="font-semibold text-primary">Book a home experience</span>{' '}
                for up to 5 phones. Our specialist demos them at your doorstep.
              </p>
              <p className="text-sm text-muted-foreground">Love it? Buy it! Pay at delivery &amp; your deposit is refunded.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant={inCart ? "outline" : "accent"} size="lg" onClick={handleCartAction} className="flex-1">
                {inCart ? <><Check className="h-5 w-5" />Added to Experience</> : <><Plus className="h-5 w-5" />Add to Home Experience</>}
              </Button>
            </div>

            <Separator />

            {/* Bank & Card Offers */}
            {phone.bankOffers.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />Bank &amp; Card Offers
                </h2>
                <div className="space-y-3">
                  {phone.bankOffers.map((offer, index) => (
                    <Card key={index} className="border-border/50">
                      <CardContent className="p-4 flex items-start gap-3">
                        <Tag className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">{offer.discount} — {offer.bank}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{offer.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div>
              <h2 className="font-semibold text-lg mb-4">Specifications</h2>
              <div className="space-y-3">
                {specs.map(spec => (
                  <div key={spec.label} className="flex justify-between gap-4 py-2 border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground shrink-0">{spec.label}</span>
                    <span className="text-right font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PhoneDetailPage;
