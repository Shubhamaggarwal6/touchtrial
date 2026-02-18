import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Phone } from '@/data/phones';

// Map DB row to Phone type
const mapDbPhone = (row: Record<string, unknown>): Phone => ({
  id: row.id as string,
  brand: row.brand as string,
  model: row.model as string,
  price: row.price as number,
  image: row.image as string,
  ram: row.ram as string,
  storage: row.storage as string,
  os: row.os as 'Android' | 'iOS',
  display: row.display as string,
  processor: row.processor as string,
  camera: row.camera as string,
  battery: row.battery as string,
  description: row.description as string,
  highlights: (row.highlights as string[]) || [],
  gallery: (row.gallery as string[]) || [],
  variants: (row.variants as Phone['variants']) || [],
  colors: (row.colors as Phone['colors']) || [],
  bankOffers: (row.bank_offers as Phone['bankOffers']) || [],
});

export function usePhones() {
  return useQuery({
    queryKey: ['phones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phones')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapDbPhone);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useAllPhonesAdmin() {
  return useQuery({
    queryKey: ['phones-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phones')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export { mapDbPhone };
