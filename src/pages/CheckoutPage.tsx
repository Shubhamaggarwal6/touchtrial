import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2, CreditCard, Smartphone, Wallet, Clock, CalendarIcon } from 'lucide-react';

const TIME_SLOTS = [
  { value: '9am-12pm', label: '9:00 AM - 12:00 PM' },
  { value: '12pm-3pm', label: '12:00 PM - 3:00 PM' },
  { value: '3pm-6pm', label: '3:00 PM - 6:00 PM' },
  { value: '6pm-9pm', label: '6:00 PM - 9:00 PM' },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart, basePhones, extraPhoneCharge, itemCount, couponCode, couponDiscount, homeExperienceDeposit, convenienceFee } = useCart();
  const { user, loading: authLoading } = useAuth();
  
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Disable dates before tomorrow and after 30 days from now
  const minDate = addDays(new Date(), 1);
  const maxDate = addDays(new Date(), 30);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
    if (items.length === 0 && !authLoading) {
      navigate('/cart');
    }
  }, [user, authLoading, items.length, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('address, phone')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data?.address) setAddress(data.address);
        if (data?.phone) setPhoneNumber(data.phone);
      }
    };
    fetchProfile();
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim() || !/^[6-9]\d{9}$/.test(phoneNumber.trim())) {
      toast({
        title: 'Valid phone number required',
        description: 'Please enter a valid 10-digit mobile number',
        variant: 'destructive',
      });
      return;
    }

    if (!address.trim()) {
      toast({
        title: 'Address required',
        description: 'Please enter your delivery address',
        variant: 'destructive',
      });
      return;
    }

    if (!deliveryDate) {
      toast({
        title: 'Delivery date required',
        description: 'Please select a preferred delivery date',
        variant: 'destructive',
      });
      return;
    }

    if (!timeSlot) {
      toast({
        title: 'Time slot required',
        description: 'Please select a preferred delivery time slot',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Not authenticated',
        description: 'Please log in to complete your booking',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const phoneIds = items.map(item => item.phone.id);
      const phoneNames = items.map(item => `${item.phone.brand} ${item.phone.model}`);
      const phoneVariants = items.map(item => item.selectedVariant || '');
      const phoneColors = items.map(item => item.selectedColor || '');

      // Save phone number to profile
      await supabase
        .from('profiles')
        .update({ phone: phoneNumber.trim(), address: address.trim() })
        .eq('user_id', user.id);

      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        phone_ids: phoneIds,
        phone_names: phoneNames,
        phone_variants: phoneVariants,
        phone_colors: phoneColors,
        total_experience_fee: homeExperienceDeposit,
        convenience_fee: convenienceFee,
        total_amount: totalAmount,
        delivery_address: address,
        delivery_date: format(deliveryDate, 'yyyy-MM-dd'),
        time_slot: timeSlot,
        payment_method: paymentMethod,
        status: 'pending',
      });

      if (error) throw error;

      clearCart();
      navigate('/booking-success');
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact & Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact & Delivery</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter your 10-digit mobile number"
                      required
                      maxLength={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your complete delivery address"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Date & Time Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Delivery Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date Picker */}
                  <div className="space-y-2">
                    <Label>Select delivery date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !deliveryDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {deliveryDate ? format(deliveryDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={deliveryDate}
                          onSelect={setDeliveryDate}
                          disabled={(date) => date < minDate || date > maxDate}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time Slot */}
                  <div className="space-y-2">
                    <Label htmlFor="timeSlot">Select delivery time slot</Label>
                    <Select value={timeSlot} onValueChange={setTimeSlot}>
                      <SelectTrigger id="timeSlot">
                        <SelectValue placeholder="Choose a time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((slot) => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Our team will deliver the phones within the selected time window
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Smartphone className="h-5 w-5 text-primary" />
                        UPI
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer mt-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Credit/Debit Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer mt-2">
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label htmlFor="wallet" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Wallet className="h-5 w-5 text-primary" />
                        Wallet
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map(({ phone, selectedVariant, selectedColor }) => (
                    <div key={phone.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-secondary overflow-hidden">
                        <img
                          src={phone.image}
                          alt={`${phone.brand} ${phone.model}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{phone.brand} {phone.model}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedVariant}{selectedColor ? ` • ${selectedColor}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Home Experience Deposit
                      </span>
                      <span>{formatPrice(homeExperienceDeposit)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Convenience Fee
                      </span>
                      <span>{formatPrice(convenienceFee)}</span>
                    </div>
                    {itemCount > basePhones && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Extra phones ({itemCount - basePhones} × ₹69)
                        </span>
                        <span>{formatPrice(extraPhoneCharge)}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {itemCount} phone{itemCount > 1 ? 's' : ''} selected (up to {basePhones} included)
                    </p>
                    
                    {couponCode && couponDiscount > 0 && (
                      <>
                        <Separator />
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Coupon ({couponCode})</span>
                          <span>-{formatPrice(couponDiscount)}</span>
                        </div>
                      </>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(totalAmount)}</span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    variant="hero" 
                    size="lg" 
                    className="w-full mt-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      `Pay ${formatPrice(totalAmount)}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
