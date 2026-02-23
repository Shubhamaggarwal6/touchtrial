import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Download, Upload, Loader2, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PhoneRow {
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
  highlights: string;
  gallery: string;
  variants: string;
  colors: string;
  bank_offers: string;
  is_active: boolean;
}

const TEMPLATE_COLUMNS = [
  'id', 'brand', 'model', 'price', 'image', 'ram', 'storage', 'os',
  'display', 'processor', 'camera', 'battery', 'description',
  'highlights', 'gallery', 'variants', 'colors', 'bank_offers', 'is_active'
];

const SAMPLE_ROW: PhoneRow = {
  id: 'samsung-galaxy-a55',
  brand: 'Samsung',
  model: 'Galaxy A55',
  price: 29999,
  image: 'https://example.com/image.jpg',
  ram: '8GB',
  storage: '128GB',
  os: 'Android',
  display: '6.6-inch Super AMOLED, 120Hz',
  processor: 'Exynos 1480',
  camera: '50MP Main + 12MP Ultra Wide + 5MP Macro',
  battery: '5000 mAh with 25W fast charging',
  description: 'A great mid-range phone with flagship features.',
  highlights: 'Super AMOLED, 120Hz, IP67, 5000mAh',
  gallery: 'https://img1.jpg, https://img2.jpg, https://img3.jpg',
  variants: '8GB/128GB/29999, 8GB/256GB/32999',
  colors: 'Awesome Iceblue/#A8D8EA, Awesome Navy/#1B2A4A',
  bank_offers: 'HDFC Bank/₹2000 off/On EMI transactions, SBI/₹1500 off/On credit card',
  is_active: true,
};

export function ExcelPhoneImport() {
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<PhoneRow[] | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // Instructions sheet
    const instructions = [
      ['📱 Phone Bulk Import Template - Instructions'],
      [''],
      ['Column', 'Description', 'Example'],
      ['id', 'Unique ID (lowercase, hyphens, no spaces)', 'samsung-galaxy-a55'],
      ['brand', 'Brand name', 'Samsung'],
      ['model', 'Model name', 'Galaxy A55'],
      ['price', 'Base price in INR (number only)', '29999'],
      ['image', 'Main image URL', 'https://example.com/img.jpg'],
      ['ram', 'Default RAM', '8GB'],
      ['storage', 'Default storage', '128GB'],
      ['os', 'Operating System (Android or iOS)', 'Android'],
      ['display', 'Display specs', '6.6-inch Super AMOLED, 120Hz'],
      ['processor', 'Processor name', 'Exynos 1480'],
      ['camera', 'Camera specs', '50MP Main + 12MP Ultra Wide'],
      ['battery', 'Battery specs', '5000 mAh with 25W fast charging'],
      ['description', 'Phone description', 'A great mid-range phone...'],
      ['highlights', 'Comma-separated highlights', 'Super AMOLED, 120Hz, IP67'],
      ['gallery', 'Comma-separated image URLs', 'https://img1.jpg, https://img2.jpg'],
      ['variants', 'Format: RAM/Storage/Price separated by comma', '8GB/128GB/29999, 8GB/256GB/32999'],
      ['colors', 'Format: Name/Hex separated by comma', 'Blue/#0000FF, Black/#000000'],
      ['bank_offers', 'Format: Bank/Discount/Description separated by comma', 'HDFC/₹2000 off/On EMI'],
      ['is_active', 'TRUE or FALSE', 'TRUE'],
    ];
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    wsInstructions['!cols'] = [{ wch: 15 }, { wch: 50 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    // Data sheet with headers + sample
    const wsData = XLSX.utils.json_to_sheet([SAMPLE_ROW], { header: TEMPLATE_COLUMNS });
    wsData['!cols'] = TEMPLATE_COLUMNS.map(col => ({
      wch: col === 'description' ? 40 : col === 'gallery' || col === 'variants' || col === 'bank_offers' ? 35 : 20
    }));
    XLSX.utils.book_append_sheet(wb, wsData, 'Phones');

    XLSX.writeFile(wb, 'phone_import_template.xlsx');
    toast({ title: 'Template Downloaded', description: 'Fill in the Phones sheet and import it back.' });
  };

  const parseVariants = (raw: string): Array<{ ram: string; storage: string; price: number }> => {
    if (!raw || !raw.trim()) return [];
    return raw.split(',').map(v => {
      const parts = v.trim().split('/');
      return { ram: parts[0]?.trim() || '', storage: parts[1]?.trim() || '', price: Number(parts[2]?.trim()) || 0 };
    }).filter(v => v.ram && v.storage && v.price > 0);
  };

  const parseColors = (raw: string): Array<{ name: string; hex: string }> => {
    if (!raw || !raw.trim()) return [];
    return raw.split(',').map(c => {
      const parts = c.trim().split('/');
      return { name: parts[0]?.trim() || '', hex: parts[1]?.trim() || '#000000' };
    }).filter(c => c.name);
  };

  const parseBankOffers = (raw: string): Array<{ bank: string; discount: string; description: string }> => {
    if (!raw || !raw.trim()) return [];
    return raw.split(',').map(o => {
      const parts = o.trim().split('/');
      return { bank: parts[0]?.trim() || '', discount: parts[1]?.trim() || '', description: parts[2]?.trim() || '' };
    }).filter(o => o.bank);
  };

  const parseHighlights = (raw: string): string[] => {
    if (!raw || !raw.trim()) return [];
    return raw.split(',').map(h => h.trim()).filter(Boolean);
  };

  const parseGallery = (raw: string): string[] => {
    if (!raw || !raw.trim()) return [];
    return raw.split(',').map(g => g.trim()).filter(Boolean);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });

        // Find the Phones sheet or use first sheet
        const sheetName = wb.SheetNames.find(n => n.toLowerCase() === 'phones') || wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rows: PhoneRow[] = XLSX.utils.sheet_to_json(ws);

        if (rows.length === 0) {
          toast({ title: 'Empty File', description: 'No data rows found in the Excel file.', variant: 'destructive' });
          return;
        }

        // Validate required fields
        const invalid = rows.filter((r, i) => !r.id || !r.brand || !r.model || !r.price);
        if (invalid.length > 0) {
          toast({
            title: 'Validation Error',
            description: `${invalid.length} row(s) missing required fields (id, brand, model, price).`,
            variant: 'destructive',
          });
          return;
        }

        setPreviewData(rows);
        setPreviewOpen(true);
      } catch {
        toast({ title: 'Parse Error', description: 'Could not read the Excel file. Please check the format.', variant: 'destructive' });
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmImport = async () => {
    if (!previewData || previewData.length === 0) return;
    setImporting(true);

    try {
      const phonesToInsert = previewData.map(row => ({
        id: String(row.id).trim(),
        brand: String(row.brand || '').trim(),
        model: String(row.model || '').trim(),
        price: Number(row.price) || 0,
        image: String(row.image || '').trim(),
        ram: String(row.ram || '').trim(),
        storage: String(row.storage || '').trim(),
        os: String(row.os || 'Android').trim(),
        display: String(row.display || '').trim(),
        processor: String(row.processor || '').trim(),
        camera: String(row.camera || '').trim(),
        battery: String(row.battery || '').trim(),
        description: String(row.description || '').trim(),
        highlights: parseHighlights(String(row.highlights || '')),
        gallery: parseGallery(String(row.gallery || '')),
        variants: parseVariants(String(row.variants || '')),
        colors: parseColors(String(row.colors || '')),
        bank_offers: parseBankOffers(String(row.bank_offers || '')),
        is_active: row.is_active === true || String(row.is_active).toLowerCase() === 'true',
      }));

      const { error } = await supabase.from('phones').upsert(phonesToInsert, { onConflict: 'id' });
      if (error) throw error;

      toast({
        title: 'Import Successful! 🎉',
        description: `${phonesToInsert.length} phone(s) have been added/updated.`,
      });

      await queryClient.invalidateQueries({ queryKey: ['phones'] });
      await queryClient.invalidateQueries({ queryKey: ['phones-admin'] });
      setPreviewOpen(false);
      setPreviewData(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Import failed';
      toast({ title: 'Import Failed', description: message, variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          Import Excel
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Import Preview
            </DialogTitle>
            <DialogDescription>
              {previewData?.length} phone(s) will be added or updated. Existing phones with the same ID will be overwritten.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {previewData?.map((row, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{row.brand} {row.model}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>₹{Number(row.price).toLocaleString('en-IN')}</span>
                    <span>{row.ram} / {row.storage}</span>
                    <span>{row.os}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  String(row.is_active).toLowerCase() === 'true' || row.is_active === true
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {String(row.is_active).toLowerCase() === 'true' || row.is_active === true ? 'Active' : 'Hidden'}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setPreviewOpen(false)} disabled={importing}>
              Cancel
            </Button>
            <Button onClick={confirmImport} disabled={importing}>
              {importing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importing...</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" />Confirm Import ({previewData?.length})</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
