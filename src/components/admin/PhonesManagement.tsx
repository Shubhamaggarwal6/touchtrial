import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { PhoneFormDialog } from './PhoneFormDialog';
import { ExcelPhoneImport } from './ExcelPhoneImport';
import { useAllPhonesAdmin } from '@/hooks/use-phones';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export function PhonesManagement() {
  const { data: phones = [], isLoading } = useAllPhonesAdmin();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editPhone, setEditPhone] = useState<Record<string, unknown> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditPhone(null);
    setFormOpen(true);
  };

  const handleEdit = (phone: Record<string, unknown>) => {
    setEditPhone(phone);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error } = await supabase.from('phones').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      toast({ title: 'Phone Deleted', description: `${deleteTarget.name} has been removed` });
      await queryClient.invalidateQueries({ queryKey: ['phones'] });
      await queryClient.invalidateQueries({ queryKey: ['phones-admin'] });
    } catch {
      toast({ title: 'Delete Failed', description: 'Could not delete phone', variant: 'destructive' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const toggleActive = async (phone: Record<string, unknown>) => {
    const id = phone.id as string;
    setTogglingId(id);
    try {
      const { error } = await supabase.from('phones').update({ is_active: !phone.is_active }).eq('id', id);
      if (error) throw error;
      toast({
        title: phone.is_active ? 'Phone Hidden' : 'Phone Visible',
        description: `${phone.brand} ${phone.model} is now ${phone.is_active ? 'hidden from' : 'visible to'} users`,
      });
      await queryClient.invalidateQueries({ queryKey: ['phones'] });
      await queryClient.invalidateQueries({ queryKey: ['phones-admin'] });
    } catch {
      toast({ title: 'Error', description: 'Could not update visibility', variant: 'destructive' });
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-muted-foreground">{phones.length} phones in catalogue</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExcelPhoneImport />
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Phone
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {phones.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No phones yet. Add your first phone!
            </CardContent>
          </Card>
        ) : (
          phones.map((phone) => {
            const p = phone as Record<string, unknown>;
            const variants = (p.variants as Array<{ ram: string; storage: string; price: number }>) || [];
            const colors = (p.colors as Array<{ name: string; hex: string }>) || [];
            return (
              <Card key={p.id as string} className={!p.is_active ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={p.image as string}
                      alt={`${p.brand} ${p.model}`}
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{p.brand as string} {p.model as string}</span>
                        <Badge variant="outline" className="text-xs">{p.os as string}</Badge>
                        {!p.is_active && <Badge variant="secondary" className="text-xs">Hidden</Badge>}
                      </div>
                      <p className="text-primary font-bold">{formatPrice(p.price as number)}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                        <span>{variants.length} variant{variants.length !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{colors.length} color{colors.length !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{p.ram as string} / {p.storage as string}</span>
                      </div>
                      {/* Color swatches */}
                      {colors.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {colors.map((c) => (
                            <div
                              key={c.name}
                              className="w-4 h-4 rounded-full border border-border"
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(p)}
                        disabled={togglingId === (p.id as string)}
                        title={p.is_active ? 'Hide from users' : 'Show to users'}
                      >
                        {togglingId === (p.id as string) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : p.is_active ? (
                          <Eye className="h-4 w-4 text-primary" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget({ id: p.id as string, name: `${p.brand} ${p.model}` })}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <PhoneFormDialog open={formOpen} onOpenChange={setFormOpen} editPhone={editPhone} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Phone?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
