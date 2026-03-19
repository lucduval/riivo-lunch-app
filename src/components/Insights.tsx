import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { SectionTransition } from './SectionTransition';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

type ItemStat = { name: string; order_count: number };

const FUN_FACTS = [
  {
    title: "Newton's real lunch break",
    body: "Legend says Isaac Newton discovered gravity when an apple fell on his head around 1666. What they don't tell you — he was probably just hungry and sitting under that tree waiting for lunch.",
  },
  {
    title: "The birth of the lunch hour",
    body: "The word 'lunch' only entered common English in the 1820s. Before that, people called the midday meal 'nuncheon' — a quick bite between breakfast and dinner. The formal lunch hour was born during the Industrial Revolution.",
  },
  {
    title: "Pizza wasn't always Italian",
    body: "Flatbreads with toppings date back to ancient Persia and Greece. The Margherita pizza was only named in 1889, crafted to honour Queen Margherita of Italy with tomato, mozzarella, and basil — the colours of the Italian flag.",
  },
  {
    title: "Friday lunch, a global ritual",
    body: "In Japan, Friday office lunches are called 'Hana-kin' — flower Friday. In Spain, the midday meal lasts two hours. At riivo, it lasts exactly the right amount of time.",
  },
  {
    title: "The most ordered meal in history",
    body: "The humble sandwich, invented by John Montagu, the 4th Earl of Sandwich, in 1762. He wanted to eat without leaving the card table. Laziness: the mother of all innovation.",
  },
];

function BarChart({ data }: { data: ItemStat[] }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const max = Math.max(...data.map(d => d.order_count), 1);

  useGSAP(() => {
    if (!chartRef.current) return;
    const bars = chartRef.current.querySelectorAll('.insight-bar');
    gsap.fromTo(bars,
      { scaleX: 0, transformOrigin: 'left center' },
      {
        scaleX: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: chartRef.current,
          start: 'top 80%',
        },
      }
    );
  }, { scope: chartRef, dependencies: [data] });

  return (
    <div ref={chartRef} className="space-y-4">
      {data.map((item, i) => {
        const pct = (item.order_count / max) * 100;
        const isTop = i === 0;
        return (
          <div key={item.name} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <span className={`font-mono text-xs uppercase tracking-widest ${isTop ? 'text-carbon font-semibold' : 'text-carbon/70'}`}>
                {isTop && <span className="text-mustard mr-1.5">#1</span>}
                {item.name}
              </span>
              <span className="font-mono text-[11px] text-carbon/50 tabular-nums">
                {item.order_count}
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-carbon/5 overflow-hidden">
              <div
                className={`insight-bar h-full rounded-full transition-colors duration-300 ${
                  isTop ? 'bg-mustard' : 'bg-carbon/20 group-hover:bg-carbon/30'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FunFactCarousel() {
  const [active, setActive] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setExiting(true);
      setTimeout(() => {
        setActive(prev => (prev + 1) % FUN_FACTS.length);
        setExiting(false);
      }, 400);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const fact = FUN_FACTS[active];

  return (
    <div className="flex flex-col h-full">
      {/* Fact display */}
      <div className="flex-1 relative overflow-hidden">
        <div className={`transition-all duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${exiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          <p className="font-mono text-[10px] uppercase tracking-widest text-mustard mb-4">Did you know?</p>
          <h4 className="font-baskerville italic text-xl md:text-2xl text-carbon mb-4 leading-snug">
            {fact.title}
          </h4>
          <p className="font-mono text-sm text-carbon/70 leading-relaxed">
            {fact.body}
          </p>
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center gap-2 pt-6">
        {FUN_FACTS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setExiting(true); setTimeout(() => { setActive(i); setExiting(false); }, 400); }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? 'w-6 bg-mustard' : 'w-1.5 bg-carbon/20 hover:bg-carbon/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-baskerville italic text-3xl md:text-4xl text-carbon mb-1">{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-carbon/50">{label}</div>
    </div>
  );
}

export function Insights() {
  const [topItems, setTopItems] = useState<ItemStat[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [uniqueItems, setUniqueItems] = useState(0);

  useEffect(() => {
    const MOCK: ItemStat[] = [
      { name: 'Posticino', order_count: 200 },
      { name: 'Foccaccia', order_count: 150 },
      { name: 'Margherita', order_count: 120 },
      { name: 'Aglio Olio', order_count: 95 },
      { name: 'Regina', order_count: 85 },
      { name: 'Puttanesca', order_count: 45 },
    ];

    function applyData(data: ItemStat[]) {
      setTopItems(data);
      setTotalOrders(data.reduce((sum, i) => sum + (i.order_count || 0), 0));
      setUniqueItems(data.length);
    }

    async function fetchInsights() {
      try {
        const { data: items, error } = await supabase
          .from('menu_items')
          .select('name, order_count')
          .order('order_count', { ascending: false })
          .limit(6);

        const hasData = !error && items && items.length > 0 && items.some(i => (i.order_count ?? 0) > 0);
        applyData(hasData ? items : MOCK);
      } catch {
        applyData(MOCK);
      }
    }
    fetchInsights();
  }, []);

  return (
    <SectionTransition id="insights" className="bg-parchment py-16 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Section header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-carbon/50 mb-3">Community Pulse</p>
            <h2 className="font-baskerville text-[2rem] md:text-[3rem] text-carbon leading-none">The Table Talks.</h2>
          </div>
          <p className="font-mono text-sm text-carbon/50 max-w-sm text-right hidden md:block">
            What your colleagues have been ordering, and a few things worth knowing about the meal that brings us together.
          </p>
        </div>

        {/* Stats row */}
        <div className="flex justify-center gap-6 md:gap-20 mb-10 md:mb-16 py-6 md:py-8 border-y border-carbon/10">
          <StatCard value={totalOrders.toLocaleString()} label="Items ordered" />
          <StatCard value={uniqueItems.toString()} label="On the menu" />
          <StatCard value="52+" label="Fridays served" />
        </div>

        {/* Two-column layout: chart + fun facts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Most ordered chart */}
          <div className="bg-smoke rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 border border-carbon/10">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h3 className="font-baskerville text-2xl text-carbon">Most Ordered.</h3>
              <span className="font-mono text-[10px] uppercase tracking-widest text-carbon/40">All time</span>
            </div>
            {topItems.length > 0 && <BarChart data={topItems} />}
          </div>

          {/* Fun facts carousel */}
          <div className="bg-smoke rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 border border-carbon/10 flex flex-col min-h-[300px] md:min-h-[400px]">
            <FunFactCarousel />
          </div>
        </div>
      </div>
    </SectionTransition>
  );
}
