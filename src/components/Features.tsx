import { useState, useEffect } from 'react';
import { SectionTransition } from './SectionTransition';

function ShufflerCard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const labels = ["Today's Mains", "Street Food", "Light Bites"];
  const colorMap = [
    { bg: '#C8962A', text: '#1A1917' },     // Mains → mustard bg, carbon text
    { bg: '#B83232', text: '#F4EFE4' },     // Street Food → scarlet bg, parchment text
    { bg: '#1A1917', text: '#F4EFE4' },     // Light Bites → carbon bg, parchment text
  ];

  useEffect(() => {
    const int = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="flex flex-col">
      <div className="relative h-[180px] mb-8">
        {labels.map((label, idx) => {
          const offset = (idx - activeIndex + 3) % 3;
          const y = offset * 25;
          const scale = 1 - offset * 0.05;
          const zIndex = 10 - offset;
          const opacity = offset === 2 ? 0 : 1;
          const isFront = offset === 0;

          return (
             <div
               key={idx}
               className="absolute top-4 left-0 w-full border border-carbon rounded-[1rem] p-5 shadow-sm"
               style={{
                 transform: `translateY(${y}px) scale(${scale})`,
                 zIndex,
                 opacity,
                 backgroundColor: isFront ? colorMap[idx].bg : '#F4EFE4',
                 transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
               }}
             >
               <span
                 className="font-mono text-sm tracking-widest uppercase"
                 style={{
                   color: isFront ? colorMap[idx].text : '#1A1917',
                   transition: 'color 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                 }}
               >
                 {label}
               </span>
             </div>
          )
        })}
      </div>
      <h3 className="font-baskerville text-[1.75rem] md:text-[2rem] mb-3 text-carbon leading-tight">Today's Selection.</h3>
      <p className="font-sans text-sm text-carbon/60 leading-relaxed">A curated rotation of what's available. Finite. Deliberate. Ready at noon.</p>
    </div>
  )
}

const TYPEWRITER_MESSAGES = [
  "James just completed his order",
  "Anastasia added 'Mushroom Risotto' to her cart",
  "Posticino's is confirming 3 active orders",
  "Oli joined the table for Friday noon",
  "Order #0042 — FULFILLED",
  "Jen removed 'Sparkling Water'",
  "The admin invited a new colleague"
];

function TypewriterCard() {
  const [text, setText] = useState("");
  
  useEffect(() => {
    let currentMsgIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeout: ReturnType<typeof setTimeout>;
    
    const type = () => {
      const currentMsg = TYPEWRITER_MESSAGES[currentMsgIdx];
      
      if (isDeleting) {
        setText(currentMsg.substring(0, charIdx - 1));
        charIdx--;
      } else {
        setText(currentMsg.substring(0, charIdx + 1));
        charIdx++;
      }
      
      if (!isDeleting && charIdx === currentMsg.length) {
        timeout = setTimeout(() => { isDeleting = true; type(); }, 2000);
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        currentMsgIdx = (currentMsgIdx + 1) % TYPEWRITER_MESSAGES.length;
        timeout = setTimeout(type, 500);
      } else {
        timeout = setTimeout(type, isDeleting ? 30 : 60);
      }
    };
    
    timeout = setTimeout(type, 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col justify-center mb-8">
        <div className="bg-carbon rounded-[1rem] p-6 text-parchment font-mono text-sm h-[120px] flex items-center shadow-inner relative overflow-hidden">
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-parchment animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest opacity-60">Live Feed</span>
          </div>
          <div className="mt-4 w-full">
            <span className="text-mustard inline-block mr-2">{'>'}</span>
            <span className="break-all">{text}</span>
            <span className="inline-block w-2 h-4 bg-mustard ml-1 -mb-0.5 animate-[pulse_1s_step-end_infinite]" />
          </div>
        </div>
      </div>
      <h3 className="font-baskerville text-[1.75rem] md:text-[2rem] mb-3 text-carbon leading-tight">The Archive.</h3>
      <p className="font-sans text-sm text-carbon/60 leading-relaxed">Every order. Every noon. Logged without ceremony.</p>
    </div>
  )
}

function IntelligenceFeedCard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const recommendations = [
    { meal: "Grilled Octopus Line", rationale: "Popular with 9 colleagues. Ordered twice by you. Statistically sound." },
    { meal: "Mushroom Risotto", rationale: "High compliance with your dietary tags. Trending today." },
    { meal: "Steak Frites", rationale: "High protein. Historical preference detected." }
  ];

  useEffect(() => {
    const int = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % recommendations.length);
    }, 4000);
    return () => clearInterval(int);
  }, [recommendations.length]);

  return (
    <div className="flex flex-col">
      <div className="relative overflow-hidden rounded-[1rem] bg-smoke border border-carbon/30 h-[180px] flex items-center mb-8">
        {recommendations.map((rec, idx) => (
          <div 
            key={idx}
            className={`absolute inset-0 p-6 flex flex-col justify-center transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
              idx === activeIndex ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
          >
            <div className="overflow-hidden mb-4 inline-block">
              <span className="inline-block font-mono text-[10px] uppercase tracking-widest text-carbon relative pb-1">
                Recommended for you
                <div className={`absolute bottom-0 left-0 h-[2px] bg-mustard transition-all duration-700 delay-300 ${idx === activeIndex ? 'w-full' : 'w-0'}`} />
              </span>
            </div>
            <h4 className="font-baskerville italic text-2xl text-carbon mb-2 leading-tight">{rec.meal}</h4>
            <p className="font-mono text-[11px] text-carbon/70 leading-relaxed">{rec.rationale}</p>
          </div>
        ))}
      </div>
      <h3 className="font-baskerville text-[1.75rem] md:text-[2rem] mb-3 text-carbon leading-tight">The Intelligence Layer.</h3>
      <p className="font-sans text-sm text-carbon/60 leading-relaxed">Informed by what you've ordered, what your colleagues prefer, and what the data suggests.</p>
    </div>
  )
}

export function Features() {
  return (
    <SectionTransition className="bg-parchment pt-12 md:pt-20 pb-16 md:pb-32 border-t border-carbon/10">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-carbon/40 mb-8 block">How it works</span>
      </div>
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        <ShufflerCard />
        <TypewriterCard />
        <IntelligenceFeedCard />
      </div>
    </SectionTransition>
  )
}
