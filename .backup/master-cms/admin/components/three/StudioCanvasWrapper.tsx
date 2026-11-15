import React, { Component, ErrorInfo, ReactNode, Suspense, lazy, useEffect, useState } from 'react';

const LazyStudioAmbientCanvas = lazy(() => import('./StudioAmbientCanvas'));

const StudioFallbackVisual: React.FC = () => (
  <div
    className="relative w-full h-full min-h-[210px] flex items-center justify-center overflow-hidden select-none"
    aria-hidden="true"
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.18),transparent_68%)]" />
    <svg
      viewBox="0 0 220 220"
      className="w-44 h-44 text-[#F97316]"
      fill="none"
    >
      <circle
        cx="110"
        cy="110"
        r="82"
        stroke="currentColor"
        strokeOpacity="0.24"
        strokeWidth="1"
      />
      <ellipse
        cx="110"
        cy="110"
        rx="74"
        ry="28"
        transform="rotate(-26 110 110)"
        stroke="currentColor"
        strokeOpacity="0.68"
        strokeWidth="1.25"
      />
      <ellipse
        cx="110"
        cy="110"
        rx="62"
        ry="22"
        transform="rotate(34 110 110)"
        stroke="#FBBF24"
        strokeOpacity="0.45"
        strokeWidth="1"
      />
      <polygon
        points="110,68 142,110 110,152 78,110"
        fill="#191C22"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <circle cx="176" cy="78" r="3.5" fill="currentColor" />
      <circle cx="44" cy="142" r="3" fill="#FBBF24" fillOpacity="0.85" />
    </svg>
  </div>
);

class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Fallback cleanly to lightweight architectural SVG
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const StudioCanvasWrapper: React.FC = () => {
  const [enable3D, setEnable3D] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isDesktop = window.innerWidth >= 768;
    const lowCores =
      typeof navigator.hardwareConcurrency === 'number' &&
      navigator.hardwareConcurrency <= 2;
    const deviceMem = (navigator as Navigator & { deviceMemory?: number })
      .deviceMemory;
    const lowMemory = typeof deviceMem === 'number' && deviceMem <= 2;

    if (!prefersReducedMotion && isDesktop && !lowCores && !lowMemory) {
      setEnable3D(true);
    }
  }, []);

  if (!enable3D) {
    return <StudioFallbackVisual />;
  }

  return (
    <CanvasErrorBoundary fallback={<StudioFallbackVisual />}>
      <Suspense fallback={<StudioFallbackVisual />}>
        <LazyStudioAmbientCanvas onUnavailable={() => setEnable3D(false)} />
      </Suspense>
    </CanvasErrorBoundary>
  );
};
