import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface SectionTransitionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  hideRule?: boolean;
}

export function SectionTransition({ children, className = '', id, hideRule = false }: SectionTransitionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ruleRef.current || !containerRef.current || hideRule) return;

    gsap.fromTo(ruleRef.current, 
      { scaleX: 0, transformOrigin: "left center" },
      {
        scaleX: 1,
        duration: 0.6,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id={id} className={`relative block w-full ${className}`}>
      {!hideRule && (
        <div 
          ref={ruleRef} 
          className="absolute top-0 left-0 h-[1px] w-full bg-carbon" 
          style={{ transformOrigin: "left center" }} 
        />
      )}
      {children}
    </section>
  );
}
