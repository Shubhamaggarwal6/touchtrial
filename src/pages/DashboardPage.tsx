import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { User, Package, Clock, CheckCircle, XCircle, Smartphone, ArrowRight, RefreshCw, Mail, Phone, MapPin, Download, Shield, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  phone_ids: string[];
  phone_names: string[];
  phone_variants: string[] | null;
  phone_colors: string[] | null;
  total_experience_fee: number;
  convenience_fee: number;
  total_amount: number;
  status: string;
  delivery_address: string;
  delivery_date: string | null;
  time_slot: string | null;
  payment_method: string | null;
  created_at: string;
}

interface Profile {
  full_name: string | null;
  phone: string | null;
  address: string | null;
}

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      // Check admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      setIsAdmin(!!roleData);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, phone, address')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch bookings
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(bookingsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Booking ID', 'Phones', 'Variants', 'Colors', 'Delivery Date', 'Time Slot', 'Delivery Address', 'Payment Method', 'Amount', 'Status', 'Booked On'];
    const rows = bookings.map(b => [
      b.id.slice(0, 8),
      (b.phone_names || []).join('; '),
      (b.phone_variants ?? []).join('; '),
      (b.phone_colors ?? []).join('; '),
      b.delivery_date ? format(new Date(b.delivery_date), 'PPP') : '',
      b.time_slot || '',
      b.delivery_address,
      b.payment_method || '',
      b.total_amount,
      b.status,
      format(new Date(b.created_at), 'PPp'),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'confirmed':
        return <Badge className="gap-1 bg-primary"><Package className="h-3 w-3" /> Confirmed</Badge>;
      case 'delivered':
        return <Badge className="gap-1 bg-accent text-accent-foreground"><CheckCircle className="h-3 w-3" /> Delivered</Badge>;
      case 'completed':
        return <Badge className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" /> Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast({
      title: 'Signed out',
      description: 'You have been successfully signed out.',
    });
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container py-16 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const activeBookings = bookings.filter(b => ['pending', 'confirmed', 'delivered'].includes(b.status));
  const pastBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2 gap-1 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name || user.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isAdmin && (
              <Button variant="outline" onClick={() => navigate('/admin')} className="gap-2">
                <Shield className="h-4 w-4" />
                Admin Panel
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/phones')} className="gap-2">
              <Smartphone className="h-4 w-4" />
              Browse Phones
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Bookings</CardDescription>
              <CardTitle className="text-3xl">{bookings.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Experiences</CardDescription>
              <CardTitle className="text-3xl">{activeBookings.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl">{pastBookings.filter(b => b.status === 'completed').length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Profile Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              My Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {(profile?.full_name || user.email || '?').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-lg font-semibold">{profile?.full_name || 'Not set'}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile?.phone || 'Not added'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile?.address || 'Not added'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active ({activeBookings.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active bookings</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your phone experience journey today!
                  </p>
                  <Button onClick={() => navigate('/phones')} className="gap-2">
                    Browse Phones <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              activeBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} getStatusBadge={getStatusBadge} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No past bookings</h3>
                  <p className="text-muted-foreground">
                    Your completed and cancelled bookings will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} getStatusBadge={getStatusBadge} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function BookingCard({ 
  booking, 
  getStatusBadge 
}: { 
  booking: Booking; 
  getStatusBadge: (status: string) => React.ReactNode;
}) {
  const variants = booking.phone_variants ?? [];
  const colors = booking.phone_colors ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <CardTitle className="text-lg">
              Booking #{booking.id.slice(0, 8).toUpperCase()}
            </CardTitle>
            <CardDescription>
              {format(new Date(booking.created_at), 'PPP')}
            </CardDescription>
          </div>
          {getStatusBadge(booking.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Delivery Schedule Highlight */}
          <div className="bg-secondary/50 rounded-lg p-3 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Delivery Date</p>
                <p className="text-sm font-semibold">
                  {booking.delivery_date ? format(new Date(booking.delivery_date), 'PPP') : 'Not set'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Time Slot</p>
                <p className="text-sm font-semibold">{booking.time_slot || 'Not set'}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Phones</p>
            <div className="flex flex-wrap gap-2">
              {booking.phone_names.map((name, idx) => (
                <Badge key={idx} variant="outline">
                  {name}
                  {variants[idx] && ` (${variants[idx]})`}
                  {colors[idx] && ` — ${colors[idx]}`}
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Experience Deposit</p>
              <p className="font-medium">₹{booking.total_experience_fee}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Paid</p>
              <p className="font-semibold text-primary">₹{booking.total_amount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment</p>
              <p className="font-medium capitalize">{booking.payment_method || 'Pending'}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Delivery Address</p>
            <p className="text-sm">{booking.delivery_address}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
