import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Download, Smartphone, Tag, ArrowUpDown, ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookingCard, type Booking } from '@/components/admin/BookingCard';
import { UserHistoryDialog } from '@/components/admin/UserHistoryDialog';
import { PhonesManagement } from '@/components/admin/PhonesManagement';
import { CouponsManagement } from '@/components/admin/CouponsManagement';
import { format } from 'date-fns';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyUserId, setHistoryUserId] = useState<string | null>(null);
  const [historyUserName, setHistoryUserName] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'timeslot_asc' | 'timeslot_desc'>('newest');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    const checkAdminAndFetch = async () => {
      if (!user) return;

      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (!roleData) {
          toast({ title: 'Access Denied', description: 'You do not have admin privileges', variant: 'destructive' });
          navigate('/dashboard');
          return;
        }

        setIsAdmin(true);

        const { data: bookingsData, error } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const bookingsWithUsers = await Promise.all(
          (bookingsData || []).map(async (booking) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, phone, email')
              .eq('user_id', booking.user_id)
              .maybeSingle();

            return {
              ...booking,
              user_name: profileData?.full_name || 'Unknown User',
              user_phone: profileData?.phone || 'N/A',
              user_email: profileData?.email || 'N/A',
            };
          })
        );

        setBookings(bookingsWithUsers);
      } catch (error) {
        console.error('Error:', error);
        toast({ title: 'Error', description: 'Failed to load bookings', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetch();
  }, [user, authLoading, navigate]);

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId);
      if (error) throw error;
      setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, status: newStatus } : b)));
      toast({ title: 'Status Updated', description: `Booking status changed to ${newStatus}` });
    } catch (error) {
      console.error('Update error:', error);
      toast({ title: 'Update Failed', description: 'Could not update booking status', variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewUserHistory = (userId: string, userName: string) => {
    setHistoryUserId(userId);
    setHistoryUserName(userName);
    setHistoryOpen(true);
  };

  const timeSlotOrder = (slot: string | null) => {
    if (!slot) return 999;
    const slots = ['9:00 AM - 11:00 AM', '11:00 AM - 1:00 PM', '1:00 PM - 3:00 PM', '3:00 PM - 5:00 PM', '5:00 PM - 7:00 PM', '7:00 PM - 9:00 PM'];
    const idx = slots.indexOf(slot);
    return idx === -1 ? 998 : idx;
  };

  const filterBookings = (status: string) => {
    const filtered = status === 'all' ? bookings : bookings.filter(b => b.status === status);
    return filtered.sort((a, b) => {
      if (sortOrder === 'timeslot_asc') return timeSlotOrder(a.time_slot) - timeSlotOrder(b.time_slot);
      if (sortOrder === 'timeslot_desc') return timeSlotOrder(b.time_slot) - timeSlotOrder(a.time_slot);
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };

  const exportCSV = () => {
    const headers = ['Booking ID', 'User Name', 'Email', 'Phone Number', 'Phones', 'Variants', 'Colors', 'Delivery Date', 'Time Slot', 'Delivery Address', 'Payment Method', 'Amount', 'Status', 'Booked On'];
    const rows = bookings.map(b => [
      b.id.slice(0, 8),
      b.user_name || '',
      b.user_email || '',
      b.user_phone || '',
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
    a.download = `bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const userBookings = historyUserId ? bookings.filter(b => b.user_id === historyUserId) : [];

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) return null;

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2 gap-1 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage bookings and phone catalogue</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" />Export CSV
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: bookings.length, color: '' },
            { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: 'text-yellow-600' },
            { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: 'text-blue-600' },
            { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, color: 'text-green-600' },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="bookings">
          <TabsList className="mb-6">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="phones">
              <Smartphone className="h-4 w-4 mr-2" />
              Phones Catalogue
            </TabsTrigger>
            <TabsTrigger value="coupons">
              <Tag className="h-4 w-4 mr-2" />
              Coupons
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'newest' | 'oldest' | 'timeslot_asc' | 'timeslot_desc')}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="timeslot_asc">Time Slot (Early → Late)</SelectItem>
                    <SelectItem value="timeslot_desc">Time Slot (Late → Early)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Tabs defaultValue="all">
              <TabsList className="mb-4 flex-wrap">
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
                      <CardContent className="p-8 text-center text-muted-foreground">No bookings found</CardContent>
                    </Card>
                  ) : (
                    filterBookings(tab).map(booking => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        updatingId={updatingId}
                        onStatusChange={updateBookingStatus}
                        onViewUserHistory={handleViewUserHistory}
                      />
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          {/* Phones Catalogue Tab */}
          <TabsContent value="phones">
            <PhonesManagement />
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons">
            <CouponsManagement />
          </TabsContent>
        </Tabs>

        {/* User History Dialog */}
        <UserHistoryDialog
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          userName={historyUserName}
          userBookings={userBookings}
        />
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;
