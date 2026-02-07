import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Package, Home, ArrowRight } from 'lucide-react';

const BookingSuccessPage = () => {
  return (
    <Layout>
      <div className="container py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Booking Successful!</h1>
          <p className="text-muted-foreground mb-8">
            Your phone experience has been booked successfully. We'll deliver the phones to your doorstep soon.
          </p>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">What's Next?</p>
                    <p className="text-sm text-muted-foreground">
                      Our team will prepare your phones and schedule delivery within 24-48 hours.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">3-Day Home Trial</p>
                    <p className="text-sm text-muted-foreground">
                      Our specialist will showcase the phones. Keep them for 3 days—if you buy, your deposit is refunded!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero">
              <Link to="/dashboard">
                View My Bookings
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/phones">Continue Browsing</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingSuccessPage;
