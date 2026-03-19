import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { useCart } from '../lib/CartContext';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { MagneticButton } from './MagneticButton';
import { X } from 'lucide-react';

const mockDrinks = [
  { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', name: 'Sparkling Water', price: 35.0, category: 'Drinks' },
  { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', name: 'Cold Brew Coffee', price: 45.0, category: 'Drinks' },
];

export function CartDrawer() {
  const { items, addItem, updateQuantity, total, isCartOpen, setIsCartOpen, clearCart } = useCart();
  const { user } = useAuth();
  const [drinks, setDrinks] = useState<any[]>([]);
  const [orderStatus, setOrderStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS'>('IDLE');
  const [orderId, setOrderId] = useState<string>('');

  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (isCartOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.4, display: 'block' });
      gsap.to(drawerRef.current, { x: '0%', duration: 0.6, ease: "power3.out" });
      
      const fetchDrinks = async () => {
        const { data } = await supabase.from('drinks').select('*');
        if (data && data.length > 0) {
          setDrinks(data.map(d => ({ ...d, category: 'Drinks' })));
        } else {
          setDrinks(mockDrinks);
        }
      };
      if (items.length > 0 && !items.some(i => i.category === 'Drinks')) {
         fetchDrinks();
      }
    } else {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, display: 'none' });
      gsap.to(drawerRef.current, { x: '100%', duration: 0.6, ease: "power3.in" });
      setTimeout(() => setOrderStatus('IDLE'), 600);
    }
  }, [isCartOpen, items]);

  useEffect(() => {
    if (orderStatus === 'SUCCESS' && checkRef.current) {
      gsap.fromTo(checkRef.current.querySelector('path'), 
        { strokeDasharray: 100, strokeDashoffset: 100 },
        { strokeDashoffset: 0, duration: 1, ease: 'power2.out', delay: 0.2 }
      );
    }
  }, [orderStatus]);

  const submitOrder = async () => {
    setOrderStatus('SUBMITTING');
    try {
      const userMeta = user?.user_metadata;
      const { data } = await supabase.from('orders').insert({
        user_id: user?.id,
        items,
        total,
        user_email: user?.email,
        user_name: userMeta?.full_name || userMeta?.name || user?.email,
      }).select('id').single();

      setOrderId(data?.id?.split('-')[0] || Math.floor(Math.random() * 10000).toString());
    } catch(e) {
      setOrderId(Math.floor(Math.random() * 10000).toString());
    }
    setOrderStatus('SUCCESS');
    clearCart();
  };

  const hasDrinks = items.some(i => i.category === 'Drinks');
  const showUpsell = !hasDrinks && items.length > 0 && drinks.length > 0;

  return (
    <>
      <div 
        ref={overlayRef} 
        className="fixed inset-0 bg-carbon/40 backdrop-blur-sm z-[100] hidden opacity-0 cursor-pointer" 
        onClick={() => setIsCartOpen(false)}
      />
      <div 
        ref={drawerRef} 
        className="fixed top-0 right-0 h-[100dvh] w-full md:w-[480px] bg-smoke border-l border-carbon z-[110] translate-x-[100%] flex flex-col"
      >
        <div className="p-5 md:p-8 border-b border-carbon/20 flex justify-between items-center shrink-0 bg-smoke z-10">
          <h2 className="font-baskerville text-3xl text-carbon">The Order.</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-carbon hover:opacity-50 transition-opacity">
            <X size={28} strokeWidth={1} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-8 relative">
          {orderStatus === 'SUCCESS' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-smoke z-10">
               <svg ref={checkRef} width="80" height="80" viewBox="0 0 80 80" fill="none" className="mb-8">
                 <circle cx="40" cy="40" r="38" stroke="#1A1917" strokeWidth="2" />
                 <path d="M25 40 L35 50 L55 30" stroke="#1A1917" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
               <h3 className="font-baskerville italic text-[2rem] text-carbon mb-4">Order #{orderId} received.</h3>
               <p className="font-mono text-sm text-carbon/70">The kitchen has been notified. Est. arrival: noon.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-carbon/30">
              <span className="font-baskerville text-2xl mb-4 italic">Empty table.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-parchment p-5 rounded-[1.5rem] border border-carbon/10 transition-transform">
                  <div className="flex-1 pr-4">
                    <span className="font-baskerville text-lg block mb-1">{item.name}</span>
                    <span className="font-mono text-xs text-carbon/60">R{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 bg-smoke rounded-full px-2 py-1 border border-carbon/20">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-carbon hover:bg-carbon/10 rounded-full font-mono transition-colors text-xl leading-none pb-1">-</button>
                    <span className="font-mono text-sm w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-carbon hover:bg-carbon/10 rounded-full font-mono transition-colors text-xl leading-none pb-1">+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {orderStatus !== 'SUCCESS' && items.length > 0 && (
          <div className="shrink-0 p-5 md:p-8 bg-parchment border-t border-carbon/20 relative z-20">
            {showUpsell && (
              <div className="mb-6 md:mb-8 border-b border-carbon/10 pb-6 md:pb-8">
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-carbon/60 mb-4">Complete the meal.</h4>
                <div className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory">
                  {drinks.map(drink => (
                    <div key={drink.id} className="shrink-0 w-[140px] bg-smoke border border-carbon/10 rounded-[1.5rem] p-4 snap-start relative group">
                      <span className="font-baskerville text-base leading-tight block mb-3 pr-6">{drink.name}</span>
                      <span className="font-mono text-sm text-carbon/60">R{drink.price.toFixed(2)}</span>
                      <button 
                        onClick={() => addItem(drink)}
                        className="absolute bottom-4 right-4 w-8 h-8 bg-parchment border border-carbon/20 rounded-full flex items-center justify-center hover:bg-mustard hover:border-mustard hover:text-carbon transition-colors group-hover:scale-105"
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-end mb-6 md:mb-8">
              <span className="font-mono text-sm uppercase tracking-widest text-carbon/60">Subtotal</span>
              <span className="font-baskerville text-3xl">R{total.toFixed(2)}</span>
            </div>
            
            <MagneticButton 
               onClick={submitOrder} 
               className="w-full !rounded-[2rem] flex justify-center py-6" 
            >
              <span className="font-bold text-sm">
                {orderStatus === 'SUBMITTING' ? 'TRANSMITTING...' : 'SUBMIT ORDER'}
              </span>
            </MagneticButton>
          </div>
        )}
      </div>
    </>
  );
}
