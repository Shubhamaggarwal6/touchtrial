import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { PhoneCard } from '@/components/phones/PhoneCard';
import { PhoneFilters } from '@/components/phones/PhoneFilters';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { phones } from '@/data/phones';

interface FiltersState {
  brands: string[];
  os: string[];
  priceRange: [number, number];
  ram: string[];
  storage: string[];
}

const defaultFilters: FiltersState = {
  brands: [],
  os: [],
  priceRange: [0, 200000],
  ram: [],
  storage: [],
};

const PhonesPage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredPhones = useMemo(() => {
    return phones.filter(phone => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          phone.brand.toLowerCase().includes(query) ||
          phone.model.toLowerCase().includes(query) ||
          phone.highlights.some(h => h.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(phone.brand)) {
        return false;
      }

      // OS filter
      if (filters.os.length > 0 && !filters.os.includes(phone.os)) {
        return false;
      }

      // Price filter
      if (phone.price < filters.priceRange[0] || phone.price > filters.priceRange[1]) {
        return false;
      }

      // RAM filter
      if (filters.ram.length > 0 && !filters.ram.includes(phone.ram)) {
        return false;
      }

      // Storage filter
      if (filters.storage.length > 0 && !filters.storage.includes(phone.storage)) {
        return false;
      }

      return true;
    });
  }, [searchQuery, filters]);

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {searchQuery ? `Search: "${searchQuery}"` : 'All Phones'}
          </h1>
          <p className="text-muted-foreground">
            {filteredPhones.length} phones available for home experience
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-card rounded-2xl border border-border/50 p-6">
              <PhoneFilters
                filters={filters}
                onChange={setFilters}
                onClear={clearFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <PhoneFilters
                      filters={filters}
                      onChange={setFilters}
                      onClear={clearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Active Filters */}
            {(filters.brands.length > 0 || filters.os.length > 0 || filters.ram.length > 0 || filters.storage.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.brands.map(brand => (
                  <Button
                    key={brand}
                    variant="secondary"
                    size="sm"
                    onClick={() => setFilters(f => ({ ...f, brands: f.brands.filter(b => b !== brand) }))}
                  >
                    {brand}
                    <X className="h-3 w-3 ml-1" />
                  </Button>
                ))}
                {filters.os.map(os => (
                  <Button
                    key={os}
                    variant="secondary"
                    size="sm"
                    onClick={() => setFilters(f => ({ ...f, os: f.os.filter(o => o !== os) }))}
                  >
                    {os}
                    <X className="h-3 w-3 ml-1" />
                  </Button>
                ))}
                {filters.ram.map(ram => (
                  <Button
                    key={ram}
                    variant="secondary"
                    size="sm"
                    onClick={() => setFilters(f => ({ ...f, ram: f.ram.filter(r => r !== ram) }))}
                  >
                    {ram}
                    <X className="h-3 w-3 ml-1" />
                  </Button>
                ))}
                {filters.storage.map(storage => (
                  <Button
                    key={storage}
                    variant="secondary"
                    size="sm"
                    onClick={() => setFilters(f => ({ ...f, storage: f.storage.filter(s => s !== storage) }))}
                  >
                    {storage}
                    <X className="h-3 w-3 ml-1" />
                  </Button>
                ))}
              </div>
            )}

            {/* Phone Grid */}
            {filteredPhones.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredPhones.map(phone => (
                  <PhoneCard key={phone.id} phone={phone} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground mb-4">No phones found</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PhonesPage;
