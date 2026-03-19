import { Component, useRef, type ErrorInfo, type ReactNode } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MagneticButton } from './MagneticButton';
import { Burger3D } from './Burger3D';

// Error boundary so a WebGL failure doesn't nuke the whole page
class Tree3DErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('3D model failed to render:', error, info);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    // Text entrance stagger
    gsap.fromTo(".hero-text",
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: "power3.out", delay: 0.2 }
    );

    // Tree entrance (keeping same class names just in case they're used elsewhere)
    gsap.fromTo(".hero-tree",
      { opacity: 0, scale: 0.92, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 1.8, ease: "power3.out", delay: 0.6 }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full h-[100dvh] flex items-center overflow-hidden bg-gradient-to-b from-[#FAF8F3] via-[#EBE4D6] to-[#D6CEBA]">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row h-full">

        {/* Text anchors bottom-left */}
        <div className="w-full md:w-1/2 h-full flex flex-col justify-end pb-16 md:pb-32 z-10">
          <p className="hero-text font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-carbon mb-4 md:mb-6 small-caps">Welcome to</p>
          <h1 className="hero-text font-baskerville italic text-carbon leading-[0.9] text-[clamp(48px,10vw,120px)] mb-6 md:mb-8">
            lunch<br />at riivo.
          </h1>
          <p className="hero-text font-mono text-carbon/70 text-sm md:text-base font-medium max-w-md mb-8 md:mb-12">
            Est. every Friday at noon. Serving riivo since 2024.
          </p>
          <div className="hero-text">
            <MagneticButton onClick={() => document.getElementById('selection')?.scrollIntoView({ behavior: 'smooth' })}>
              Join the Table
            </MagneticButton>
          </div>
        </div>

        {/* 3D Burger */}
        <div className="hidden md:flex w-full md:w-1/2 h-full items-center justify-center relative">
          <div className="hero-tree relative" style={{ width: '100%', height: '80%', maxHeight: 600, minHeight: 400 }}>
            <Tree3DErrorBoundary>
              <Burger3D />
            </Tree3DErrorBoundary>
          </div>
        </div>

      </div>
    </section>
  );
}
