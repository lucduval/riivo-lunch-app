import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function MagneticButton({ children, variant = 'primary', className = '', ...props }: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const button = buttonRef.current;
    if (!button) return;

    const xTo = gsap.quickTo(button, "x", { duration: 1, ease: "power3.out" });
    const yTo = gsap.quickTo(button, "y", { duration: 1, ease: "power3.out" });

    const mouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = button.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      xTo(x * 0.2);
      yTo(y * 0.2);
    };

    const mouseEnter = () => {
      gsap.to(button, { scale: 1.03, duration: 0.4, ease: "power2.out" });
      button.addEventListener("mousemove", mouseMove);
    };

    const mouseLeave = () => {
      button.removeEventListener("mousemove", mouseMove);
      xTo(0);
      yTo(0);
      gsap.to(button, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.3)" });
    };

    button.addEventListener("mouseenter", mouseEnter);
    button.addEventListener("mouseleave", mouseLeave);

    return () => {
      button.removeEventListener("mouseenter", mouseEnter);
      button.removeEventListener("mouseleave", mouseLeave);
      button.removeEventListener("mousemove", mouseMove);
    };
  }, { scope: buttonRef });

  const isPrimary = variant === 'primary';

  return (
    <button
      ref={buttonRef}
      className={`group relative overflow-hidden rounded-full font-mono text-sm tracking-widest transition-shadow hover:shadow-lg ${
        isPrimary ? 'bg-mustard text-carbon px-8 py-4' : 'bg-smoke border border-carbon/20 text-carbon px-6 py-3'
      } ${className}`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
      {...props}
    >
      <span
        className={`absolute inset-0 block h-full w-full translate-y-[101%] rounded-full transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-y-0 ${
          isPrimary ? 'bg-carbon' : 'bg-parchment'
        }`}
      />
      <span ref={textRef} className={`relative z-10 block transition-colors duration-500 ${isPrimary ? 'group-hover:text-parchment' : 'group-hover:text-carbon'}`}>
        {children}
      </span>
    </button>
  );
}
