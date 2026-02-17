import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, Package, CheckCircle, XCircle } from 'lucide-react';
import type { Booking } from './BookingCard';

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

interface UserHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  userBookings: Booking[];
}

export const UserHistoryDialog = ({ open, onOpenChange, userName, userBookings }: UserHistoryDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{userName}'s Booking History ({userBookings.length} bookings)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {userBookings.map((booking, index) => (
            <Card key={booking.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Booking #{index + 1}</span>
                    {getStatusBadge(booking.status)}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(booking.created_at), 'PPp')}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium">Phones</p>
                    <ul className="text-muted-foreground">
                      {booking.phone_names.map((name, i) => (
                        <li key={i}>
                          • {name}
                          {booking.phone_variants?.[i] && <span className="text-xs"> ({booking.phone_variants[i]})</span>}
                          {booking.phone_colors?.[i] && <span className="text-xs italic"> — {booking.phone_colors[i]}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">Delivery</p>
                    <p className="text-muted-foreground">
                      {booking.delivery_date ? format(new Date(booking.delivery_date), 'PPP') : 'Not set'}
                      {booking.time_slot ? ` • ${booking.time_slot}` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-muted-foreground">{booking.delivery_address}</p>
                  </div>
                  <div>
                    <p className="font-medium">Amount</p>
                    <p className="font-bold text-primary">{formatPrice(booking.total_amount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
