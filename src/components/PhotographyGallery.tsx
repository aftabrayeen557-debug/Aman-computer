import { useState, useEffect } from 'react';
import { Camera, X, Maximize2, MapPin } from 'lucide-react';
import { PHOTOS } from '../data/portfolioData';
import { PhotoItem } from '../types';

export default function PhotographyGallery() {
  const [activePhoto, setActivePhoto] = useState<PhotoItem | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePhoto(null);
    };
    if (activePhoto) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePhoto]);

  return (
    <section id="photography" className="py-24 md:py-32 bg-neutral-100/40 dark:bg-neutral-900/20 border-t border-neutral-200/80 dark:border-neutral-800/80 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 mb-2">
              <Camera className="w-3.5 h-3.5" />
              <span>Through The Lens</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neutral-950 dark:text-neutral-50 tracking-tight">
              Visual Stories & Geometry
            </h2>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md">
            Personal documentary photography exploring architectural lines, atmospheric natural lighting, and urban rhythm. Shot primarily on 35mm and 50mm primes.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PHOTOS.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setActivePhoto(photo)}
              className="group relative rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 cursor-pointer shadow-xs hover:shadow-lg transition-all"
            >
              <div className="aspect-4/5 overflow-hidden">
                <img
                  src={photo.image}
                  alt={photo.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter saturate-[0.9] group-hover:scale-104 transition-transform duration-500 ease-out"
                />
              </div>

              {/* Scrim & Caption */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity flex flex-col justify-end p-5 text-white">
                <div className="flex items-center justify-between text-xs text-neutral-300 mb-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-neutral-400" />
                    <span>{photo.location}</span>
                  </div>
                  <span className="font-mono">{photo.year}</span>
                </div>
                <h3 className="text-sm font-semibold text-neutral-100 font-display">
                  {photo.title}
                </h3>

                {/* EXIF Quick Strip */}
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>{photo.exif.lens.split(' ')[1] || '35mm'}</span>
                  <span>{photo.exif.aperture}</span>
                  <span>{photo.exif.shutter}</span>
                  <span>ISO {photo.exif.iso}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-neutral-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="fixed inset-0 -z-10" onClick={() => setActivePhoto(null)} />

          <div className="relative max-w-5xl w-full max-h-[92vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 text-neutral-200">
              <div className="flex items-center gap-3">
                <Camera className="w-4 h-4 text-neutral-400" />
                <span className="text-sm font-medium">{activePhoto.title}</span>
                <span className="text-xs text-neutral-500">· {activePhoto.location}</span>
              </div>
              <button
                onClick={() => setActivePhoto(null)}
                aria-label="Close photo lightbox"
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo View */}
            <div className="relative flex-1 bg-neutral-950 flex items-center justify-center overflow-hidden p-2 sm:p-4 min-h-[350px]">
              <img
                src={activePhoto.image}
                alt={activePhoto.title}
                referrerPolicy="no-referrer"
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Bottom EXIF Telemetry */}
            <div className="px-6 py-4 bg-neutral-900 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-neutral-500">Camera: </span>
                  <span className="text-neutral-200">{activePhoto.exif.camera}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Lens: </span>
                  <span className="text-neutral-200">{activePhoto.exif.lens}</span>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div>
                  <span className="text-neutral-500">Shutter: </span>
                  <span className="text-neutral-200">{activePhoto.exif.shutter}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Aperture: </span>
                  <span className="text-neutral-200">{activePhoto.exif.aperture}</span>
                </div>
                <div>
                  <span className="text-neutral-500">ISO: </span>
                  <span className="text-neutral-200">{activePhoto.exif.iso}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
