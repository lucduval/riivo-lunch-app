import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function Burger3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const layers = gsap.utils.toArray('.burger-layer') as HTMLElement[];

    // Gentle floating — keep it straight, no rotationZ drift
    layers.forEach((layer, i) => {
      gsap.to(layer, {
        y: `-=${6 + i * 1.5}`,
        duration: 2.8 + i * 0.15,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: i * 0.12
      });
    });

    // Entrance stagger
    gsap.from('.burger-layer', {
      opacity: 0,
      y: "+=60",
      scale: 0.9,
      duration: 1.4,
      stagger: 0.08,
      ease: "power3.out"
    });

    // Subtle mouse-tracking tilt
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 12;
      const yPos = (clientY / window.innerHeight - 0.5) * 12;

      gsap.to('.burger-container', {
        rotationY: xPos,
        rotationX: -yPos,
        duration: 1.2,
        ease: "power2.out"
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);

  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[400px] flex items-center justify-center pointer-events-none"
      style={{ perspective: "1200px" }}
    >
      <div
        className="burger-container relative w-72 h-72"
        style={{ transformStyle: "preserve-3d", transform: "rotateX(-5deg)" }}
      >
        {/* Top Bun — domed with egg wash sheen */}
        <div
          className="burger-layer absolute w-full rounded-t-[5rem] top-0"
          style={{ height: '5.5rem', transform: "translateZ(0px)" }}
        >
          <div className="absolute inset-0 rounded-t-[5rem] bg-gradient-to-b from-[#D4943C] via-[#E0A54E] to-[#C8882F] shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_-6px_12px_rgba(0,0,0,0.08)]" />
          {/* Glossy highlight */}
          <div className="absolute inset-x-[15%] top-[10%] h-[40%] rounded-full bg-gradient-to-b from-white/25 to-transparent" />
          {/* Sesame Seeds */}
          {[
             { top: '18%', left: '22%', rot: '15deg' }, { top: '28%', left: '48%', rot: '-20deg' },
             { top: '22%', left: '72%', rot: '30deg' }, { top: '42%', left: '32%', rot: '-8deg' },
             { top: '48%', left: '62%', rot: '22deg' }, { top: '38%', left: '82%', rot: '-25deg' },
             { top: '55%', left: '18%', rot: '10deg' }, { top: '60%', left: '42%', rot: '-15deg' },
             { top: '52%', left: '88%', rot: '28deg' }, { top: '35%', left: '55%', rot: '-12deg' },
             { top: '45%', left: '15%', rot: '5deg' },  { top: '30%', left: '35%', rot: '18deg' }
          ].map((seed, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                top: seed.top, left: seed.left,
                transform: `rotate(${seed.rot})`,
                width: '8px', height: '4px',
                background: 'linear-gradient(to bottom, #FFF8E7, #F0E0B8)',
                boxShadow: '0 1px 1px rgba(0,0,0,0.15)'
              }}
            />
          ))}
        </div>

        {/* Lettuce — realistic frilly edges */}
        <div
          className="burger-layer absolute w-[108%] -left-[4%] top-[5rem]"
          style={{ height: '2rem', transform: "translateZ(0px)" }}
        >
          <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="absolute w-full" style={{ height: '2.5rem', top: '-0.8rem' }}>
            <defs>
              <linearGradient id="lettuceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5B9A3A" />
                <stop offset="100%" stopColor="#3D7A22" />
              </linearGradient>
            </defs>
            <path d="M0,25 Q8,8 16,22 Q24,36 32,18 Q40,4 48,22 Q56,38 64,16 Q72,2 80,20 Q88,36 96,14 Q104,0 112,22 Q120,38 128,16 Q136,2 144,24 Q152,38 160,18 Q168,4 176,22 Q184,36 192,14 L200,20 L200,40 L0,40 Z" fill="url(#lettuceGrad)" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-b from-[#6AAF42] to-[#4A8E2A] rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.12)]" />
        </div>

        {/* Tomato — single thick slice with visible seeds */}
        <div
          className="burger-layer absolute w-[98%] left-[1%] top-[7rem]"
          style={{ height: '1.2rem', transform: "translateZ(0px)" }}
        >
          <div className="absolute inset-0 rounded-sm bg-gradient-to-b from-[#E23B3B] via-[#D42F2F] to-[#B82020] shadow-[0_2px_6px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.15)]" />
          {/* Seed/membrane texture */}
          <div className="absolute top-[30%] left-[15%] w-[70%] h-[40%] rounded-full border border-[#FF6B6B]/20" />
          <div className="absolute top-[25%] left-[30%] w-[40%] h-[50%] rounded-full border border-[#FF6B6B]/15" />
        </div>

        {/* Cheese — melted American with realistic drips */}
        <div
          className="burger-layer absolute w-[102%] -left-[1%] top-[8.2rem]"
          style={{ height: '0.6rem', transform: "translateZ(0px)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#FFBA08] to-[#F0A500] shadow-[0_1px_3px_rgba(0,0,0,0.1)]" />
          {/* Melted drips */}
          <div className="absolute -bottom-5 left-4 w-5 h-6 bg-gradient-to-b from-[#FFBA08] to-[#F0A500] rounded-b-full shadow-sm" />
          <div className="absolute -bottom-7 left-[30%] w-4 h-8 bg-gradient-to-b from-[#FFBA08] to-[#E89E00] rounded-b-full shadow-sm" />
          <div className="absolute -bottom-4 right-6 w-6 h-5 bg-gradient-to-b from-[#FFBA08] to-[#F0A500] rounded-b-full shadow-sm" />
        </div>

        {/* Patty — thick, charbroiled */}
        <div
          className="burger-layer absolute w-[100%] left-[0%] top-[9rem]"
          style={{ height: '3.2rem', transform: "translateZ(0px)" }}
        >
          <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-b from-[#5C3A2E] via-[#4A2E22] to-[#3A2018] shadow-[0_6px_16px_rgba(0,0,0,0.3),inset_0_2px_0_rgba(255,255,255,0.05)]" />
          {/* Charred texture lines */}
          {[20, 35, 50, 65, 80].map((left) => (
            <div key={left} className="absolute top-[20%] h-[60%] w-[2px] bg-[#2A1810]/40 rounded-full" style={{ left: `${left}%` }} />
          ))}
          {/* Slight crust edges */}
          <div className="absolute bottom-0 inset-x-0 h-[30%] rounded-b-[1.5rem] bg-gradient-to-t from-[#301810]/30 to-transparent" />
        </div>

        {/* Bottom Bun */}
        <div
          className="burger-layer absolute w-[98%] left-[1%] top-[12.2rem]"
          style={{ height: '3.2rem', transform: "translateZ(0px)" }}
        >
          <div className="absolute inset-0 rounded-b-[2.5rem] rounded-t-lg bg-gradient-to-b from-[#DDA04A] via-[#D09540] to-[#C08535] shadow-[0_10px_20px_rgba(0,0,0,0.18),inset_0_2px_0_rgba(255,255,255,0.1)]" />
          {/* Flat top edge highlight */}
          <div className="absolute top-0 inset-x-[5%] h-[3px] bg-gradient-to-r from-transparent via-[#E8B86A] to-transparent rounded-full" />
        </div>

        {/* Shadow beneath burger */}
        <div
          className="absolute w-[85%] left-[7.5%] bottom-[-1.5rem] h-4 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.18) 0%, transparent 70%)' }}
        />

      </div>
    </div>
  );
}
