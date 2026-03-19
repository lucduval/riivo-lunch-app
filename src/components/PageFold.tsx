import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface CardStackItemProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  index: number;
  isLast?: boolean;
}

export function CardStackItem({ children, className = '', id, index, isLast = false }: CardStackItemProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!wrapperRef.current || !contentRef.current || !shadowRef.current) return;

    // Last card doesn't need the scale-down effect — nothing stacks on top of it
    if (isLast) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        pin: contentRef.current,
        pinSpacing: false,
      },
    });

    // Scale down and round corners as next card stacks on top
    tl.to(contentRef.current, {
      scale: 0.93,
      borderRadius: '24px',
      ease: 'none',
    }, 0);

    // Darken overlay as card recedes
    tl.to(shadowRef.current, {
      opacity: 0.35,
      ease: 'none',
    }, 0);
  }, { scope: wrapperRef });

  return (
    <div
      ref={wrapperRef}
      className="relative"
      style={{ zIndex: index }}
    >
      <div
        ref={contentRef}
        id={id}
        className={`relative w-full ${className}`}
        style={{
          transformOrigin: 'center top',
          willChange: 'transform',
        }}
      >
        {children}

        {/* Darkening overlay as card goes behind the stack */}
        <div
          ref={shadowRef}
          className="pointer-events-none absolute inset-0 z-10 bg-carbon"
          style={{ opacity: 0 }}
        />
      </div>
    </div>
  );
}
