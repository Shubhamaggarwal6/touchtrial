import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Coupon {
  id: string;
  code: string;
  discount_amount: number;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  first_order_only: boolean;
  created_at: string;
}

export function CouponsManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [firstOrderOnly, setFirstOrderOnly] = useState(false);

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setCoupons((data as Coupon[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async () => {
    if (!code.trim() || !discountAmount || !maxUses) {
      toast({ title: 'Fill all fields', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('coupons').insert({
      code: code.toUpperCase().trim(),
      discount_amount: parseInt(discountAmount),
      max_uses: parseInt(maxUses),
      first_order_only: firstOrderOnly,
    } as any);

    if (error) {
      toast({ title: 'Failed to create coupon', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Coupon created!' });
      setCode('');
      setDiscountAmount('');
      setMaxUses('');
      setFirstOrderOnly(false);
      setDialogOpen(false);
      fetchCoupons();
    }
    setSaving(false);
  };

  const toggleActive = async (coupon: Coupon) => {
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: !coupon.is_active } as any)
      .eq('id', coupon.id);

    if (!error) {
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c));
    }
  };

  const deleteCoupon = async (id: string) => {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (!error) {
      setCoupons(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Coupon deleted' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Coupon Codes</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Create Coupon</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Coupon Code</Label>
                <Input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. WELCOME100" />
              </div>
              <div className="space-y-2">
                <Label>Discount Amount (₹)</Label>
                <Input type="number" value={discountAmount} onChange={e => setDiscountAmount(e.target.value)} placeholder="e.g. 100" />
              </div>
              <div className="space-y-2">
                <Label>Max Uses (how many times it can be used)</Label>
                <Input type="number" value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="e.g. 50" />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={firstOrderOnly} onCheckedChange={setFirstOrderOnly} />
                <Label>First order only</Label>
              </div>
              <Button onClick={handleCreate} disabled={saving} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Coupon
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {coupons.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No coupons yet. Create your first one!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {coupons.map(coupon => (
            <Card key={coupon.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Tag className="h-5 w-5 text-primary" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{coupon.code}</span>
                      <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {coupon.first_order_only && (
                        <Badge variant="outline">First Order</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ₹{coupon.discount_amount} off · Used {coupon.current_uses}/{coupon.max_uses} times
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={coupon.is_active} onCheckedChange={() => toggleActive(coupon)} />
                  <Button variant="ghost" size="icon" onClick={() => deleteCoupon(coupon.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
