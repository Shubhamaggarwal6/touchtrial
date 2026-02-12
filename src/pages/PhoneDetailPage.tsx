import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Check, ChevronRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { phones } from '@/data/phones';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

const PhoneDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, removeFromCart, isInCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  
  const phone = phones.find(p => p.id === id);

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

  const inCart = isInCart(phone.id);

  const handleCartAction = () => {
    if (inCart) {
      removeFromCart(phone.id);
    } else {
      addToCart(phone);
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
    { label: 'RAM', value: phone.ram },
    { label: 'Storage', value: phone.storage },
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
            {/* Main Image */}
            <div className="aspect-square bg-gradient-to-b from-secondary/50 to-secondary rounded-2xl overflow-hidden">
              <img
                src={phone.gallery[selectedImage]}
                alt={`${phone.brand} ${phone.model}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnails */}
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
                {formatPrice(phone.price)}
              </p>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="font-semibold text-lg mb-2">About this phone</h2>
              <p className="text-muted-foreground leading-relaxed">
                {phone.description}
              </p>
            </div>

            {/* Deposit Notice */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-sm">
                <span className="font-semibold text-primary">₹499 deposit</span>{' '}
                for up to 5 phones, refunded on purchase.
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
