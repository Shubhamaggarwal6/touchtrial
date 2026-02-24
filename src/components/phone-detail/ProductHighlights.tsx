import { Camera, Monitor, Cpu, Battery, HardDrive, Smartphone } from 'lucide-react';

interface ProductHighlightsProps {
  camera: string;
  display: string;
  processor: string;
  battery: string;
  ram: string;
  storage: string;
  os: string;
}

const iconMap: Record<string, React.ElementType> = {
  camera: Camera,
  display: Monitor,
  processor: Cpu,
  battery: Battery,
  ram: HardDrive,
  os: Smartphone,
};

export function ProductHighlights({ camera, display, processor, battery, ram, storage, os }: ProductHighlightsProps) {
  const highlights = [
    { key: 'camera', label: 'Camera', value: camera },
    { key: 'display', label: 'Display', value: display },
    { key: 'processor', label: 'Processor', value: processor },
    { key: 'battery', label: 'Battery', value: battery },
    { key: 'ram', label: 'RAM & Storage', value: `${ram} | ${storage}` },
    { key: 'os', label: 'OS', value: os },
  ];

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-base">Product Highlights</h2>
      <div className="grid grid-cols-2 gap-2">
        {highlights.map(({ key, label, value }) => {
          const Icon = iconMap[key] || Smartphone;
          return (
            <div key={key} className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/50 border border-border/50">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-xs font-medium leading-tight mt-0.5 break-words">{value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
