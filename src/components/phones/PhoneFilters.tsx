import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { operatingSystems } from '@/data/phones';

interface FiltersState {
  brands: string[];
  os: string[];
  priceRange: [number, number];
  ram: string[];
  storage: string[];
}

interface PhoneFiltersProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  onClear: () => void;
  brands?: string[];
}

const ramOptions = ['4GB', '6GB', '8GB', '12GB', '16GB'];
const storageOptions = ['128GB', '256GB', '512GB', '1TB'];

export function PhoneFilters({ filters, onChange, onClear, brands = [] }: PhoneFiltersProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      notation: 'compact',
    }).format(price);
  };

  const toggleArrayFilter = (
    key: 'brands' | 'os' | 'ram' | 'storage',
    value: string
  ) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: updated });
  };

  const hasActiveFilters =
    filters.brands.length > 0 ||
    filters.os.length > 0 ||
    filters.ram.length > 0 ||
    filters.storage.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 200000;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Price Range</Label>
        <div className="px-2">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) =>
              onChange({ ...filters, priceRange: value as [number, number] })
            }
            min={0}
            max={200000}
            step={5000}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{formatPrice(filters.priceRange[0])}</span>
            <span>{formatPrice(filters.priceRange[1])}</span>
          </div>
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Brand</Label>
        <div className="space-y-2">
          {brands.map(brand => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={filters.brands.includes(brand)}
                onCheckedChange={() => toggleArrayFilter('brands', brand)}
              />
              <label
                htmlFor={`brand-${brand}`}
                className="text-sm cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              >
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Operating System */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Operating System</Label>
        <div className="space-y-2">
          {operatingSystems.map(os => (
            <div key={os} className="flex items-center space-x-2">
              <Checkbox
                id={`os-${os}`}
                checked={filters.os.includes(os)}
                onCheckedChange={() => toggleArrayFilter('os', os)}
              />
              <label
                htmlFor={`os-${os}`}
                className="text-sm cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              >
                {os}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* RAM */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">RAM</Label>
        <div className="flex flex-wrap gap-2">
          {ramOptions.map(ram => (
            <Button
              key={ram}
              variant={filters.ram.includes(ram) ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => toggleArrayFilter('ram', ram)}
            >
              {ram}
            </Button>
          ))}
        </div>
      </div>

      {/* Storage */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Storage</Label>
        <div className="flex flex-wrap gap-2">
          {storageOptions.map(storage => (
            <Button
              key={storage}
              variant={filters.storage.includes(storage) ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => toggleArrayFilter('storage', storage)}
            >
              {storage}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
