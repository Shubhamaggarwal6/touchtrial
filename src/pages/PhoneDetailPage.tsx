import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Check, ChevronRight, CreditCard, Tag } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { phones, PhoneVariant } from '@/data/phones';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

const PhoneDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, removeFromCart, isInCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);

  const phone = phones.find(p => p.id === id);

  const [selectedVariant, setSelectedVariant] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<number>(0);

  // Update cart when variant/color changes if phone is already in cart
  const updateCartSelection = (variantIdx: number, colorIdx: number) => {
    if (phone && isInCart(phone.id)) {
      const v = phone.variants[variantIdx] || phone.variants[0];
      const variantLabel = `${v.ram} / ${v.storage}`;
      const colorLabel = phone.colors[colorIdx]?.name || '';
      addToCart(phone, variantLabel, colorLabel);
    }
  };

  if (!phone) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Phone not found</h1>
          <Button asChild>
            <Link to="/phones">Browse All Phones</Link>
          </Button>
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const specs = [
    { label: 'Display', value: phone.display },
    { label: 'Processor', value: phone.processor },
    { label: 'Camera', value: phone.camera },
    { label: 'Battery', value: phone.battery },
    { label: 'RAM', value: currentVariant.ram },
    { label: 'Storage', value: currentVariant.storage },
    { label: 'Operating System', value: phone.os },
  ];

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/phones" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            All Phones
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{phone.brand} {phone.model}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-b from-secondary/50 to-secondary rounded-2xl overflow-hidden">
              <img
                src={phone.gallery[selectedImage]}
                alt={`${phone.brand} ${phone.model}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-3">
              {phone.gallery.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent hover:border-border'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${phone.brand} ${phone.model} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">{phone.brand}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{phone.model}</h1>

              {/* Highlights */}
              <div className="flex flex-wrap gap-2 mb-4">
                {phone.highlights.map(highlight => (
                  <span
                    key={highlight}
                    className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full font-medium"
                  >
                    {highlight}
                  </span>
                ))}
              </div>

              <p className="text-3xl font-bold text-primary">
                {formatPrice(currentPrice)}
              </p>
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
                      className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === index
                          ? 'border-primary ring-2 ring-primary/30 scale-110'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Variant Selection (RAM + Storage) */}
            {phone.variants.length > 1 && (
              <div>
                <h2 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                  RAM &amp; Storage
                </h2>
                <div className="flex flex-wrap gap-3">
                  {phone.variants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => { setSelectedVariant(index); updateCartSelection(index, selectedColor); }}
                      className={`px-4 py-3 rounded-xl border-2 text-left transition-all ${
                        selectedVariant === index
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <p className="text-sm font-semibold">{variant.ram} / {variant.storage}</p>
                      <p className={`text-xs mt-0.5 ${selectedVariant === index ? 'text-primary' : 'text-muted-foreground'}`}>
                        {formatPrice(variant.price)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Description */}
            <div>
              <h2 className="font-semibold text-lg mb-2">About this phone</h2>
              <p className="text-muted-foreground leading-relaxed">
                {phone.description}
              </p>
            </div>

            {/* Deposit Notice */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
              <p className="text-sm">
                <span className="font-semibold text-primary">₹299 for home experience</span>{' '}
                (₹199 deposit + ₹100 convenience) for up to 5 phones.
              </p>
              <p className="text-sm text-muted-foreground">
                Love it? Buy it! Pay at delivery &amp; your deposit is refunded.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant={inCart ? "outline" : "accent"}
                size="lg"
                onClick={handleCartAction}
                className="flex-1"
              >
                {inCart ? (
                  <>
                    <Check className="h-5 w-5" />
                    Added to Experience
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Add to Home Experience
                  </>
                )}
              </Button>
            </div>

            <Separator />

            {/* Bank & Card Offers */}
            {phone.bankOffers.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Bank &amp; Card Offers
                </h2>
                <div className="space-y-3">
                  {phone.bankOffers.map((offer, index) => (
                    <Card key={index} className="border-border/50">
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                          <Tag className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {offer.discount} — {offer.bank}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {offer.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Specifications */}
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