import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface Variant { ram: string; storage: string; price: number; }
interface Color { name: string; hex: string; }
interface BankOffer { bank: string; discount: string; description: string; }

export interface PhoneFormData {
  id: string;
  brand: string;
  model: string;
  price: number;
  image: string;
  ram: string;
  storage: string;
  os: string;
  display: string;
  processor: string;
  camera: string;
  battery: string;
  description: string;
  highlights: string[];
  gallery: string[];
  variants: Variant[];
  colors: Color[];
  bank_offers: BankOffer[];
  is_active: boolean;
}

const emptyForm: PhoneFormData = {
  id: '', brand: '', model: '', price: 0, image: '', ram: '', storage: '',
  os: 'Android', display: '', processor: '', camera: '', battery: '',
  description: '', highlights: [], gallery: [], variants: [], colors: [],
  bank_offers: [], is_active: true,
};

interface PhoneFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editPhone?: Record<string, unknown> | null;
}

export function PhoneFormDialog({ open, onOpenChange, editPhone }: PhoneFormDialogProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PhoneFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const isEdit = !!editPhone;

  useEffect(() => {
    if (editPhone) {
      setForm({
        id: editPhone.id as string,
        brand: editPhone.brand as string,
        model: editPhone.model as string,
        price: editPhone.price as number,
        image: editPhone.image as string,
        ram: editPhone.ram as string,
        storage: editPhone.storage as string,
        os: editPhone.os as string,
        display: editPhone.display as string,
        processor: editPhone.processor as string,
        camera: editPhone.camera as string,
        battery: editPhone.battery as string,
        description: editPhone.description as string,
        highlights: (editPhone.highlights as string[]) || [],
        gallery: (editPhone.gallery as string[]) || [],
        variants: (editPhone.variants as Variant[]) || [],
        colors: (editPhone.colors as Color[]) || [],
        bank_offers: (editPhone.bank_offers as BankOffer[]) || [],
        is_active: editPhone.is_active as boolean,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editPhone, open]);

  const generateId = (brand: string, model: string) =>
    `${brand}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const setField = <K extends keyof PhoneFormData>(key: K, value: PhoneFormData[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  // Variants
  const addVariant = () => setField('variants', [...form.variants, { ram: '', storage: '', price: 0 }]);
  const updateVariant = (i: number, field: keyof Variant, val: string | number) =>
    setField('variants', form.variants.map((v, idx) => idx === i ? { ...v, [field]: val } : v));
  const removeVariant = (i: number) => setField('variants', form.variants.filter((_, idx) => idx !== i));

  // Colors
  const addColor = () => setField('colors', [...form.colors, { name: '', hex: '#000000' }]);
  const updateColor = (i: number, field: keyof Color, val: string) =>
    setField('colors', form.colors.map((c, idx) => idx === i ? { ...c, [field]: val } : c));
  const removeColor = (i: number) => setField('colors', form.colors.filter((_, idx) => idx !== i));

  // Bank Offers
  const addOffer = () => setField('bank_offers', [...form.bank_offers, { bank: '', discount: '', description: '' }]);
  const updateOffer = (i: number, field: keyof BankOffer, val: string) =>
    setField('bank_offers', form.bank_offers.map((o, idx) => idx === i ? { ...o, [field]: val } : o));
  const removeOffer = (i: number) => setField('bank_offers', form.bank_offers.filter((_, idx) => idx !== i));

  // Highlights
  const updateHighlights = (val: string) => setField('highlights', val.split('\n').map(s => s.trim()).filter(Boolean));
  // Gallery
  const updateGallery = (val: string) => setField('gallery', val.split('\n').map(s => s.trim()).filter(Boolean));

  const handleSave = async () => {
    if (!form.brand || !form.model) {
      toast({ title: 'Validation Error', description: 'Brand and Model are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const phoneId = isEdit ? form.id : generateId(form.brand, form.model);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        ...form,
        id: phoneId,
      };

      if (isEdit) {
        const { error } = await supabase.from('phones').update(payload).eq('id', form.id);
        if (error) throw error;
        toast({ title: 'Phone Updated', description: `${form.brand} ${form.model} updated successfully` });
      } else {
        const { error } = await supabase.from('phones').insert([payload]);
        if (error) throw error;
        toast({ title: 'Phone Added', description: `${form.brand} ${form.model} added successfully` });
      }

      await queryClient.invalidateQueries({ queryKey: ['phones'] });
      await queryClient.invalidateQueries({ queryKey: ['phones-admin'] });
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save phone';
      toast({ title: 'Save Failed', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Phone' : 'Add New Phone'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Brand *</Label>
              <Input value={form.brand} onChange={e => setField('brand', e.target.value)} placeholder="Apple" />
            </div>
            <div>
              <Label>Model *</Label>
              <Input value={form.model} onChange={e => setField('model', e.target.value)} placeholder="iPhone 15 Pro" />
            </div>
            <div>
              <Label>Base Price (₹)</Label>
              <Input type="number" value={form.price} onChange={e => setField('price', Number(e.target.value))} />
            </div>
            <div>
              <Label>OS</Label>
              <Select value={form.os} onValueChange={v => setField('os', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Android">Android</SelectItem>
                  <SelectItem value="iOS">iOS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>RAM</Label>
              <Input value={form.ram} onChange={e => setField('ram', e.target.value)} placeholder="8GB" />
            </div>
            <div>
              <Label>Storage</Label>
              <Input value={form.storage} onChange={e => setField('storage', e.target.value)} placeholder="256GB" />
            </div>
          </div>

          <div>
            <Label>Main Image URL</Label>
            <Input value={form.image} onChange={e => setField('image', e.target.value)} placeholder="https://..." />
          </div>

          <div>
            <Label>Gallery URLs (one per line)</Label>
            <Textarea
              rows={3}
              value={form.gallery.join('\n')}
              onChange={e => updateGallery(e.target.value)}
              placeholder="https://image1.jpg&#10;https://image2.jpg"
            />
          </div>

          <Separator />

          {/* Specs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Display</Label>
              <Input value={form.display} onChange={e => setField('display', e.target.value)} />
            </div>
            <div>
              <Label>Processor</Label>
              <Input value={form.processor} onChange={e => setField('processor', e.target.value)} />
            </div>
            <div>
              <Label>Camera</Label>
              <Input value={form.camera} onChange={e => setField('camera', e.target.value)} />
            </div>
            <div>
              <Label>Battery</Label>
              <Input value={form.battery} onChange={e => setField('battery', e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea rows={3} value={form.description} onChange={e => setField('description', e.target.value)} />
          </div>

          <div>
            <Label>Highlights (one per line)</Label>
            <Textarea
              rows={3}
              value={form.highlights.join('\n')}
              onChange={e => updateHighlights(e.target.value)}
              placeholder="48MP Camera&#10;5x Zoom&#10;Titanium Design"
            />
          </div>

          <Separator />

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Variants (RAM/Storage/Price)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                <Plus className="h-3 w-3 mr-1" />Add Variant
              </Button>
            </div>
            <div className="space-y-2">
              {form.variants.map((v, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-center">
                  <Input placeholder="RAM" value={v.ram} onChange={e => updateVariant(i, 'ram', e.target.value)} />
                  <Input placeholder="Storage" value={v.storage} onChange={e => updateVariant(i, 'storage', e.target.value)} />
                  <Input type="number" placeholder="Price" value={v.price} onChange={e => updateVariant(i, 'price', Number(e.target.value))} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Colors */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Colors</Label>
              <Button type="button" variant="outline" size="sm" onClick={addColor}>
                <Plus className="h-3 w-3 mr-1" />Add Color
              </Button>
            </div>
            <div className="space-y-2">
              {form.colors.map((c, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 items-center">
                  <Input placeholder="Color name" value={c.name} onChange={e => updateColor(i, 'name', e.target.value)} />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={c.hex}
                      onChange={e => updateColor(i, 'hex', e.target.value)}
                      className="h-10 w-14 rounded border border-input cursor-pointer"
                    />
                    <Input placeholder="#hex" value={c.hex} onChange={e => updateColor(i, 'hex', e.target.value)} />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeColor(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Bank Offers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Bank & Card Offers</Label>
              <Button type="button" variant="outline" size="sm" onClick={addOffer}>
                <Plus className="h-3 w-3 mr-1" />Add Offer
              </Button>
            </div>
            <div className="space-y-2">
              {form.bank_offers.map((o, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-center">
                  <Input placeholder="Bank name" value={o.bank} onChange={e => updateOffer(i, 'bank', e.target.value)} />
                  <Input placeholder="Discount" value={o.discount} onChange={e => updateOffer(i, 'discount', e.target.value)} />
                  <Input placeholder="Description" value={o.description} onChange={e => updateOffer(i, 'description', e.target.value)} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeOffer(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <Switch checked={form.is_active} onCheckedChange={v => setField('is_active', v)} />
            <Label>Active (visible to users)</Label>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Add Phone'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
