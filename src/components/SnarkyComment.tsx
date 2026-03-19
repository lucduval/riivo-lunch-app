import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

interface SnarkyCommentProps {
  comment: string;
  /** Speed in ms per character */
  speed?: number;
  /** Delay before typing starts (ms) */
  delay?: number;
}

export function SnarkyComment({ comment, speed = 35, delay = 400 }: SnarkyCommentProps) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!comment) return;

    setDisplayed('');
    setShowCursor(true);

    let idx = 0;
    let intervalId: ReturnType<typeof setInterval>;
    let cursorTimeout: ReturnType<typeof setTimeout>;

    const startTimeout = setTimeout(() => {
      intervalId = setInterval(() => {
        idx++;
        setDisplayed(comment.slice(0, idx));
        if (idx >= comment.length) {
          clearInterval(intervalId);
          cursorTimeout = setTimeout(() => setShowCursor(false), 1500);
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(intervalId);
      clearTimeout(cursorTimeout);
    };
  }, [comment, speed, delay]);

  useEffect(() => {
    if (containerRef.current && displayed.length === 1) {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
    }
  }, [displayed]);

  if (!comment) return null;

  return (
    <div ref={containerRef} className="opacity-0">
      <div className="bg-carbon/[0.03] border border-carbon/10 rounded-[1rem] px-4 py-3 mt-4 mb-2">
        <p className="font-mono text-xs text-carbon/50 leading-relaxed">
          <span className="text-mustard mr-1.5">AI:</span>
          {displayed}
          {showCursor && <span className="animate-pulse ml-0.5 text-carbon/30">|</span>}
        </p>
      </div>
    </div>
  );
}
