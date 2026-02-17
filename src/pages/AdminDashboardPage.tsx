import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Package, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  id: string;
  user_id: string;
  phone_ids: string[];
  phone_names: string[];
  phone_variants: string[];
  phone_colors: string[];
  total_experience_fee: number;
  convenience_fee: number;
  total_amount: number;
  status: string;
  delivery_address: string;
  delivery_date: string | null;
  time_slot: string | null;
  payment_method: string | null;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    const checkAdminAndFetch = async () => {
      if (!user) return;

      try {
        // Check if user is admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (!roleData) {
          toast({
            title: 'Access Denied',
            description: 'You do not have admin privileges',
            variant: 'destructive',
          });
          navigate('/dashboard');
          return;
        }

        setIsAdmin(true);

        // Fetch all bookings
        const { data: bookingsData, error } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch user profiles for each booking
        const bookingsWithUsers = await Promise.all(
          (bookingsData || []).map(async (booking) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', booking.user_id)
              .maybeSingle();

            return {
              ...booking,
              user_name: profileData?.full_name || 'Unknown User',
            };
          })
        );

        setBookings(bookingsWithUsers);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load bookings',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetch();
  }, [user, authLoading, navigate]);

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );

      toast({
        title: 'Status Updated',
        description: `Booking status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: 'Update Failed',
        description: 'Could not update booking status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Package className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Delivered</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filterBookings = (status: string) => {
    if (status === 'all') return bookings;
    return bookings.filter(b => b.status === status);
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage all customer bookings</p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold">{bookings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Confirmed</p>
              <p className="text-2xl font-bold text-blue-600">
                {bookings.filter(b => b.status === 'confirmed').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {bookings.filter(b => b.status === 'completed').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({filterBookings('pending').length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({filterBookings('confirmed').length})</TabsTrigger>
            <TabsTrigger value="delivered">Delivered ({filterBookings('delivered').length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({filterBookings('completed').length})</TabsTrigger>
          </TabsList>

          {['all', 'pending', 'confirmed', 'delivered', 'completed'].map(tab => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {filterBookings(tab).length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No bookings found
                  </CardContent>
                </Card>
              ) : (
                filterBookings(tab).map(booking => (
                  <Card key={booking.id}>
                    <CardHeader className="pb-2">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg">
                            {booking.user_name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Booking #{booking.id.slice(0, 8)} • {format(new Date(booking.created_at), 'PPp')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(booking.status)}
                          <Select
                            value={booking.status}
                            onValueChange={(value) => updateBookingStatus(booking.id, value)}
                            disabled={updatingId === booking.id}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Phones</p>
                          <ul className="text-sm text-muted-foreground">
                            {booking.phone_names.map((name, i) => (
                              <li key={i}>
                                • {name}
                                {booking.phone_variants?.[i] && (
                                  <span className="ml-1 text-xs">({booking.phone_variants[i]})</span>
                                )}
                                {booking.phone_colors?.[i] && (
                                  <span className="ml-1 text-xs italic">— {booking.phone_colors[i]}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Delivery Address</p>
                          <p className="text-sm text-muted-foreground">{booking.delivery_address}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Delivery Schedule</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.delivery_date ? format(new Date(booking.delivery_date), 'PPP') : 'Not set'}
                            {booking.time_slot ? ` • ${booking.time_slot}` : ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Payment</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {booking.payment_method || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Amount</p>
                          <p className="text-sm font-bold text-primary">
                            {formatPrice(booking.total_amount)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;
