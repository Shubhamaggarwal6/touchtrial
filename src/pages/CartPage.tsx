import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';

const CartPage = () => {
  const { items, removeFromCart, clearCart, experienceFee, convenienceFee, totalAmount } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Add some phones to experience them at home
            </p>
            <Button asChild variant="hero">
              <Link to="/phones">Browse Phones</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Experience Cart</h1>
            <p className="text-muted-foreground">
              {items.length} phone{items.length > 1 ? 's' : ''} selected for home experience
            </p>
          </div>
          {items.length > 0 && (
            <Button variant="ghost" onClick={clearCart} className="text-destructive">
              Clear All
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ phone }) => (
              <Card key={phone.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex gap-4 p-4">
                    {/* Image */}
                    <Link to={`/phones/${phone.id}`} className="shrink-0">
                      <div className="w-24 h-24 rounded-xl bg-secondary overflow-hidden">
                        <img
                          src={phone.image}
                          alt={`${phone.brand} ${phone.model}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/phones/${phone.id}`}>
                        <h3 className="font-semibold hover:text-primary transition-colors">
                          {phone.brand} {phone.model}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {phone.ram} RAM • {phone.storage}
                      </p>
                      <p className="text-lg font-bold text-primary mt-2">
                        {formatPrice(phone.price)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Experience fee: ₹50
                      </p>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(phone.id)}
                      className="text-destructive shrink-0"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Experience Fee ({items.length} phone{items.length > 1 ? 's' : ''} × ₹50)
                    </span>
                    <span>{formatPrice(experienceFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Convenience Fee</span>
                    <span>{formatPrice(convenienceFee)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                {/* Refund Notice */}
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    💰 Experience fee of {formatPrice(experienceFee)} will be refunded if you purchase any of these phones.
                  </p>
                </div>

                <Button variant="hero" size="lg" className="w-full mt-6">
                  Proceed to Checkout
                  <ArrowRight className="h-5 w-5" />
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Secure checkout with UPI, Cards & Wallets
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
