import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Package, CheckCircle, XCircle, User, Phone, CalendarDays, MapPin } from 'lucide-react';

export interface Booking {
  id: string;
  user_id: string;
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
  user_email?: string;
  user_name?: string;
  user_phone?: string;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

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

interface BookingCardProps {
  booking: Booking;
  updatingId: string | null;
  onStatusChange: (bookingId: string, newStatus: string) => void;
  onViewUserHistory?: (userId: string, userName: string) => void;
}

export const BookingCard = ({ booking, updatingId, onStatusChange, onViewUserHistory }: BookingCardProps) => {
  const variants = booking.phone_variants ?? [];
  const colors = booking.phone_colors ?? [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{booking.user_name}</CardTitle>
              {onViewUserHistory && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary"
                  onClick={() => onViewUserHistory(booking.user_id, booking.user_name || 'User')}
                >
                  <User className="w-3 h-3 mr-1" />
                  View History
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {booking.user_email}
            </p>
            {/* Prominent phone number */}
            <div className="flex items-center gap-1 mt-1">
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-medium">{booking.user_phone || 'N/A'}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Booking #{booking.id.slice(0, 8)} • {format(new Date(booking.created_at), 'PPp')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(booking.status)}
            <Select
              value={booking.status}
              onValueChange={(value) => onStatusChange(booking.id, value)}
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
        {/* Highlighted Delivery Schedule */}
        <div className="bg-secondary/50 rounded-lg p-3 mb-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
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
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="text-sm font-semibold">{booking.delivery_address}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-1">Phones</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {booking.phone_names.map((name, i) => (
                <li key={i}>
                  • {name}
                  {variants[i] && (
                    <span className="ml-1 text-xs font-medium">({variants[i]})</span>
                  )}
                  {colors[i] && (
                    <span className="ml-1 text-xs italic">— {colors[i]}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
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
        </div>
      </CardContent>
    </Card>
  );
};
