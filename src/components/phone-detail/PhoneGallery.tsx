import { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface PhoneGalleryProps {
  images: string[];
  brand: string;
  model: string;
}

export function PhoneGallery({ images, brand, model }: PhoneGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goToImage = useCallback((index: number) => {
    setSelectedImage(Math.max(0, Math.min(index, images.length - 1)));
  }, [images.length]);

  const goToFullscreen = useCallback((index: number) => {
    setFullscreenIndex(Math.max(0, Math.min(index, images.length - 1)));
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent, isFullscreen = false) => {
    const diff = (touchStartX.current ?? 0) - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (isFullscreen) {
        goToFullscreen(diff > 0 ? fullscreenIndex + 1 : fullscreenIndex - 1);
      } else {
        goToImage(diff > 0 ? selectedImage + 1 : selectedImage - 1);
      }
    }
  };

  return (
    <>
      {/* Fullscreen Overlay */}
      {fullscreenOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setFullscreenOpen(false)}>
          <button className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" onClick={() => setFullscreenOpen(false)}>
            <X className="h-6 w-6" />
          </button>
          {fullscreenIndex > 0 && (
            <button className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" onClick={(e) => { e.stopPropagation(); goToFullscreen(fullscreenIndex - 1); }}>
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {fullscreenIndex < images.length - 1 && (
            <button className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" onClick={(e) => { e.stopPropagation(); goToFullscreen(fullscreenIndex + 1); }}>
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
          <div className="relative w-full h-full flex items-center justify-center px-4 md:px-16" onTouchStart={handleTouchStart} onTouchEnd={(e) => handleTouchEnd(e, true)} onClick={(e) => e.stopPropagation()}>
            <img src={images[fullscreenIndex]} alt={`${brand} ${model} - ${fullscreenIndex + 1}`} className="max-w-full max-h-full object-contain select-none" draggable={false} />
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); goToFullscreen(i); }} className={`h-2 rounded-full transition-all ${i === fullscreenIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'}`} />
              ))}
            </div>
          )}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">{fullscreenIndex + 1} / {images.length}</div>
        </div>
      )}

      {/* Main Gallery */}
      <div className="space-y-3">
        <div className="relative aspect-square bg-gradient-to-b from-secondary/50 to-secondary rounded-2xl overflow-hidden group">
          <div className="w-full h-full" onTouchStart={handleTouchStart} onTouchEnd={(e) => handleTouchEnd(e)}>
            <img src={images[selectedImage]} alt={`${brand} ${model}`} className="w-full h-full object-cover cursor-zoom-in" onClick={() => { setFullscreenIndex(selectedImage); setFullscreenOpen(true); }} draggable={false} />
          </div>
          <div className="absolute top-3 right-3 p-2 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ZoomIn className="h-4 w-4" />
          </div>
          {selectedImage > 0 && (
            <button className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors opacity-0 group-hover:opacity-100" onClick={() => goToImage(selectedImage - 1)}>
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {selectedImage < images.length - 1 && (
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors opacity-0 group-hover:opacity-100" onClick={() => goToImage(selectedImage + 1)}>
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={() => goToImage(i)} className={`h-1.5 rounded-full transition-all ${i === selectedImage ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button key={index} onClick={() => setSelectedImage(index)} className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-border'}`}>
              <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
