import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { supabase } from '../lib/supabase';
import type { Restaurant } from './RestaurantBrowser';
import { useCart } from '../lib/CartContext';
import { MagneticButton } from './MagneticButton';
import { MealAdvisor } from './MealAdvisor';
import { SnarkyComment } from './SnarkyComment';
import { getSnarkyComment } from '../lib/snarkyComments';
import { useAuth } from '../lib/AuthContext';
import { X, Search, Sparkles, ChevronLeft, Check, Minus, Plus, StickyNote, Wine } from 'lucide-react';

interface MenuDrawerProps {
  restaurant: Restaurant | null;
  onClose: () => void;
}

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

type Recommendation = {
  id: string;
  rationale: string;
}

type Step = 'MENU' | 'REVIEW' | 'EXTRAS' | 'CONFIRM' | 'SUCCESS';

const mockDrinks = [
  { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', name: 'Sparkling Water', price: 35.0, category: 'Drinks' },
  { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', name: 'Cold Brew Coffee', price: 45.0, category: 'Drinks' },
  { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', name: 'Fresh Orange Juice', price: 40.0, category: 'Drinks' },
  { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4', name: 'Still Water', price: 25.0, category: 'Drinks' },
];

export function MenuDrawer({ restaurant, onClose }: MenuDrawerProps) {
  const { items, addItem, updateQuantity, clearCart, total, specialNote, setSpecialNote } = useCart();
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [step, setStep] = useState<Step>('MENU');
  const [drinks, setDrinks] = useState<any[]>([]);
  const [orderStatus, setOrderStatus] = useState<'IDLE' | 'SUBMITTING'>('IDLE');
  const [orderId, setOrderId] = useState('');

  const [snarkyComment, setSnarkyComment] = useState('');
  const [commentKey, setCommentKey] = useState(0);
  const [lastAddedItem, setLastAddedItem] = useState<any>(null);

  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<SVGSVGElement>(null);

  // Generate snarky comment when item added
  useEffect(() => {
    if (lastAddedItem && step === 'MENU') {
      updateComment(getSnarkyComment({ step: 'MENU', items, total, lastAddedItem }));
    }
    if (lastAddedItem && step === 'EXTRAS') {
      updateComment(getSnarkyComment({ step: 'EXTRAS', items, total, specialNote }));
    }
  }, [lastAddedItem, items.length]);

  // Animate step transitions
  useEffect(() => {
    if (contentRef.current && restaurant) {
      gsap.fromTo(contentRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' });
    }
  }, [step, restaurant]);

  // Animate success checkmark
  useEffect(() => {
    if (step === 'SUCCESS' && checkRef.current) {
      gsap.fromTo(checkRef.current.querySelector('path'),
        { strokeDasharray: 100, strokeDashoffset: 100 },
        { strokeDashoffset: 0, duration: 1, ease: 'power2.out', delay: 0.2 }
      );
    }
  }, [step]);

  useEffect(() => {
    if (restaurant) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.4, display: 'block' });
      gsap.to(drawerRef.current, { x: '0%', duration: 0.6, ease: 'power3.out' });

      const fetchMenu = async () => {
        setLoading(true);
        const { data } = await supabase.from('menu_items').select('*').eq('restaurant_id', restaurant.id);
        if (data && data.length > 0) setMenuItems(data);

        try {
          const { data: recData } = await supabase.functions.invoke('recommendations', {
            body: { user_id: null, restaurant_id: restaurant.id }
          });
          if (recData) setRecommendations(recData);
        } catch (e) {}
        setLoading(false);
      };
      fetchMenu();

      // Fetch drinks for the extras step
      const fetchDrinks = async () => {
        const { data } = await supabase.from('drinks').select('*');
        if (data && data.length > 0) {
          setDrinks(data.map(d => ({ ...d, category: 'Drinks' })));
        } else {
          setDrinks(mockDrinks);
        }
      };
      fetchDrinks();
    } else {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, display: 'none' });
      gsap.to(drawerRef.current, { x: '100%', duration: 0.6, ease: 'power3.in' });
      setTimeout(() => {
        setMenuItems([]);
        setRecommendations([]);
        setSearchQuery('');
        setStep('MENU');
        setOrderStatus('IDLE');
        setOrderId('');
      }, 600);
    }
  }, [restaurant]);

  const handleClose = () => {
    if (step === 'SUCCESS') {
      clearCart();
    }
    onClose();
  };

  const categories = ['Antipasti', 'Pasta', 'Baked Pasta', 'Panini', 'Pizza', 'Mains', 'Salads'];

  const filteredItems = searchQuery.trim()
    ? menuItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : menuItems;

  const foodItems = items.filter(i => i.category !== 'Drinks');
  const drinkItems = items.filter(i => i.category === 'Drinks');
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const updateComment = useCallback((comment: string) => {
    setSnarkyComment(comment);
    setCommentKey(k => k + 1);
  }, []);

  // Wrap addItem to track last added and generate comment
  const handleAddItem = useCallback((item: any) => {
    addItem(item);
    setLastAddedItem(item);
  }, [addItem]);

  const goToStep = (s: Step) => {
    setStep(s);
    // Generate comment for the new step
    setTimeout(() => {
      updateComment(getSnarkyComment({ step: s, items, total, specialNote }));
    }, 100);
  };

  const submitOrder = async () => {
    setOrderStatus('SUBMITTING');
    try {
      const userMeta = user?.user_metadata;
      const { data } = await supabase.from('orders').insert({
        user_id: user?.id,
        items,
        total,
        special_note: specialNote || null,
        restaurant_id: restaurant?.id,
        restaurant_name: restaurant?.name,
        user_email: user?.email,
        user_name: userMeta?.full_name || userMeta?.name || user?.email,
      }).select('id').single();
      setOrderId(data?.id?.split('-')[0] || Math.floor(Math.random() * 10000).toString());
    } catch (e) {
      setOrderId(Math.floor(Math.random() * 10000).toString());
    }
    setOrderStatus('IDLE');
    goToStep('SUCCESS');
  };

  const stepLabels: Record<Step, string> = {
    MENU: 'Menu',
    REVIEW: 'Review',
    EXTRAS: 'Extras',
    CONFIRM: 'Confirm',
    SUCCESS: 'Done',
  };

  const stepOrder: Step[] = ['MENU', 'REVIEW', 'EXTRAS', 'CONFIRM', 'SUCCESS'];
  const currentStepIdx = stepOrder.indexOf(step);

  return createPortal(
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-carbon/20 backdrop-blur-sm z-[100] hidden opacity-0 cursor-pointer"
        onClick={handleClose}
      />
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-[100dvh] w-full md:w-[600px] bg-parchment border-l border-carbon z-[110] translate-x-[100%] flex flex-col"
      >
        {restaurant && (
          <>
            {/* Header */}
            <div className="shrink-0 p-5 md:p-8 pb-0">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {step !== 'MENU' && step !== 'SUCCESS' && (
                    <button
                      onClick={() => {
                        const prev = stepOrder[currentStepIdx - 1];
                        if (prev) goToStep(prev);
                      }}
                      className="text-carbon hover:opacity-50 transition-opacity -ml-1"
                    >
                      <ChevronLeft size={24} strokeWidth={1.5} />
                    </button>
                  )}
                  <div>
                    <h2 className="font-baskerville text-[2rem] leading-none text-carbon">{restaurant.name}</h2>
                    <p className="font-mono text-xs uppercase tracking-widest text-carbon/60 mt-1">{restaurant.cuisine}</p>
                  </div>
                </div>
                <button onClick={handleClose} className="text-carbon hover:opacity-50 transition-opacity">
                  <X size={28} strokeWidth={1} />
                </button>
              </div>

              {/* Step indicator */}
              {step !== 'SUCCESS' && (
                <div className="flex items-center gap-1 mb-6 mt-2">
                  {stepOrder.slice(0, 4).map((s, i) => (
                    <div key={s} className="flex items-center gap-1 flex-1">
                      <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                        i <= currentStepIdx ? 'bg-mustard' : 'bg-carbon/10'
                      }`} />
                    </div>
                  ))}
                </div>
              )}

              {step !== 'SUCCESS' && (
                <div className="border-b border-carbon/10 pb-4 mb-0">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-carbon/40">
                    Step {currentStepIdx + 1} of 4 — {stepLabels[step]}
                  </span>
                </div>
              )}
            </div>

            {/* Scrollable content */}
            <div ref={contentRef} className="flex-1 overflow-y-auto p-5 md:p-8 pt-4 md:pt-6">

              {/* ─── STEP 1: MENU ─── */}
              {step === 'MENU' && (
                <>
                  {/* Help Me Choose Button */}
                  <button
                    onClick={() => setIsAdvisorOpen(true)}
                    className="w-full mb-8 bg-carbon text-parchment rounded-[1.5rem] p-5 flex items-center justify-between group hover:bg-mustard hover:text-carbon transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <Sparkles size={20} />
                      <div className="text-left">
                        <span className="font-baskerville text-lg block leading-tight">Not sure what to order?</span>
                        <span className="font-mono text-[10px] uppercase tracking-widest opacity-60">Let AI pick for you</span>
                      </div>
                    </div>
                    <span className="font-mono text-xs uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">Start →</span>
                  </button>

                  {/* Search Bar */}
                  <div className="relative mb-10">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-carbon/30" />
                    <input
                      ref={searchRef}
                      type="text"
                      placeholder="Search the menu..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-smoke border border-carbon/10 rounded-full py-3.5 pl-12 pr-4 font-mono text-sm text-carbon placeholder:text-carbon/30 focus:outline-none focus:border-mustard/50 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-carbon/30 hover:text-carbon transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {/* Snarky AI comment */}
                  {snarkyComment && items.length > 0 && (
                    <div className="mb-6">
                      <SnarkyComment key={commentKey} comment={snarkyComment} />
                    </div>
                  )}

                  {loading ? (
                    <div className="space-y-8 animate-pulse">
                      {[1,2,3].map(i => <div key={i} className="h-24 bg-carbon/5 rounded-[1rem] w-full" />)}
                    </div>
                  ) : searchQuery.trim() && filteredItems.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="font-baskerville text-xl text-carbon/40 mb-2">No matches found.</p>
                      <p className="font-mono text-xs text-carbon/30 uppercase tracking-wider">Try a different search term</p>
                    </div>
                  ) : (
                    categories.map(category => {
                      const categoryItems = filteredItems.filter(i => i.category === category);
                      if (categoryItems.length === 0) return null;
                      return (
                        <div key={category} className="mb-12">
                          <h3 className="font-mono text-sm uppercase tracking-widest text-carbon mb-6 flex items-center gap-4">
                            {category} <div className="h-[1px] flex-1 bg-carbon/20" />
                          </h3>
                          <div className="space-y-6">
                            {categoryItems.map(item => {
                              const rec = recommendations.find(r => r.id === item.id);
                              const cartItem = items.find(ci => ci.id === item.id);
                              return (
                                <div key={item.id} className="flex justify-between items-start gap-3 md:gap-4 group bg-smoke p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-carbon/10 hover:border-mustard/50 transition-colors duration-300">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-baskerville text-lg md:text-xl text-carbon mb-1 md:mb-2">{item.name}</h4>
                                    <p className="font-mono text-[11px] md:text-xs text-carbon/70 mb-3 md:mb-4 leading-relaxed">{item.description}</p>
                                    {rec && (
                                      <div className="inline-block bg-mustard/20 text-carbon font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border border-mustard/30">
                                        Recommended — {rec.rationale}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right flex flex-col items-end justify-between h-full gap-6 shrink-0 pt-1">
                                    <span className="font-mono text-carbon text-lg">R{item.price.toFixed(2)}</span>
                                    {cartItem ? (
                                      <div className="flex items-center gap-2 bg-parchment rounded-full px-2 py-1 border border-carbon/20">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center text-carbon hover:bg-carbon/10 rounded-full transition-colors">
                                          <Minus size={14} />
                                        </button>
                                        <span className="font-mono text-sm w-4 text-center">{cartItem.quantity}</span>
                                        <button onClick={() => handleAddItem(item)} className="w-7 h-7 flex items-center justify-center text-carbon hover:bg-carbon/10 rounded-full transition-colors">
                                          <Plus size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      <MagneticButton onClick={() => handleAddItem(item)} className="!py-2 !px-4 !text-[10px]">
                                        Add
                                      </MagneticButton>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })
                  )}
                </>
              )}

              {/* ─── STEP 2: REVIEW ─── */}
              {step === 'REVIEW' && (
                <div>
                  <h3 className="font-baskerville text-2xl text-carbon mb-2">Review your selection.</h3>
                  <p className="font-mono text-xs text-carbon/50 uppercase tracking-wider mb-4">Adjust quantities or go back to add more</p>
                  <SnarkyComment key={'review-' + commentKey} comment={snarkyComment} />

                  {items.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="font-baskerville text-xl text-carbon/40 italic mb-4">Nothing here yet.</p>
                      <button onClick={() => goToStep('MENU')} className="font-mono text-xs uppercase tracking-wider text-mustard hover:text-carbon transition-colors">
                        ← Back to menu
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-smoke p-5 rounded-[1.5rem] border border-carbon/10">
                          <div className="flex-1 pr-4">
                            <span className="font-baskerville text-lg block mb-1">{item.name}</span>
                            <span className="font-mono text-xs text-carbon/60">R{item.price.toFixed(2)} each</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-2 bg-parchment rounded-full px-2 py-1 border border-carbon/20">
                              <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-carbon hover:bg-carbon/10 rounded-full font-mono transition-colors">
                                <Minus size={14} />
                              </button>
                              <span className="font-mono text-sm w-5 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-carbon hover:bg-carbon/10 rounded-full font-mono transition-colors">
                                <Plus size={14} />
                              </button>
                            </div>
                            <span className="font-mono text-sm text-carbon w-20 text-right">R{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-between items-end pt-6 border-t border-carbon/10 mt-6">
                        <span className="font-mono text-xs uppercase tracking-widest text-carbon/60">Subtotal</span>
                        <span className="font-baskerville text-2xl">R{total.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── STEP 3: EXTRAS ─── */}
              {step === 'EXTRAS' && (
                <div>
                  <h3 className="font-baskerville text-2xl text-carbon mb-2">Anything else?</h3>
                  <p className="font-mono text-xs text-carbon/50 uppercase tracking-wider mb-4">Add drinks or leave a note for the kitchen</p>
                  <SnarkyComment key={'extras-' + commentKey} comment={snarkyComment} />

                  {/* Drinks section */}
                  <div className="mb-10">
                    <div className="flex items-center gap-3 mb-5">
                      <Wine size={18} className="text-carbon/40" />
                      <h4 className="font-mono text-sm uppercase tracking-widest text-carbon">Drinks</h4>
                      <div className="h-[1px] flex-1 bg-carbon/20" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {drinks.map(drink => {
                        const inCart = items.find(i => i.id === drink.id);
                        return (
                          <div key={drink.id} className={`bg-smoke border rounded-[1.5rem] p-4 transition-all duration-300 ${inCart ? 'border-mustard/50 bg-mustard/5' : 'border-carbon/10 hover:border-mustard/30'}`}>
                            <span className="font-baskerville text-base leading-tight block mb-2">{drink.name}</span>
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-sm text-carbon/60">R{drink.price.toFixed(2)}</span>
                              {inCart ? (
                                <div className="flex items-center gap-1 bg-parchment rounded-full px-1.5 py-0.5 border border-carbon/20">
                                  <button onClick={() => updateQuantity(drink.id, -1)} className="w-6 h-6 flex items-center justify-center text-carbon hover:bg-carbon/10 rounded-full transition-colors">
                                    <Minus size={12} />
                                  </button>
                                  <span className="font-mono text-xs w-4 text-center">{inCart.quantity}</span>
                                  <button onClick={() => handleAddItem(drink)} className="w-6 h-6 flex items-center justify-center text-carbon hover:bg-carbon/10 rounded-full transition-colors">
                                    <Plus size={12} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleAddItem(drink)}
                                  className="w-8 h-8 bg-parchment border border-carbon/20 rounded-full flex items-center justify-center hover:bg-mustard hover:border-mustard transition-colors"
                                >
                                  <Plus size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Special note */}
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <StickyNote size={18} className="text-carbon/40" />
                      <h4 className="font-mono text-sm uppercase tracking-widest text-carbon">Special Note</h4>
                      <div className="h-[1px] flex-1 bg-carbon/20" />
                    </div>
                    <textarea
                      value={specialNote}
                      onChange={(e) => setSpecialNote(e.target.value)}
                      placeholder="Allergies, preferences, special requests..."
                      rows={3}
                      className="w-full bg-smoke border border-carbon/10 rounded-[1rem] p-4 font-mono text-sm text-carbon placeholder:text-carbon/30 focus:outline-none focus:border-mustard/50 transition-colors resize-none"
                    />
                  </div>
                </div>
              )}

              {/* ─── STEP 4: CONFIRM ─── */}
              {step === 'CONFIRM' && (
                <div>
                  <h3 className="font-baskerville text-2xl text-carbon mb-2">Final check.</h3>
                  <p className="font-mono text-xs text-carbon/50 uppercase tracking-wider mb-4">Everything look good? Confirm to place your order</p>
                  <SnarkyComment key={'confirm-' + commentKey} comment={snarkyComment} />

                  {/* Food items */}
                  {foodItems.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-mono text-[10px] uppercase tracking-widest text-carbon/40 mb-3">Food</h4>
                      <div className="space-y-2">
                        {foodItems.map(item => (
                          <div key={item.id} className="flex justify-between items-center py-2">
                            <span className="font-baskerville text-base text-carbon">
                              {item.name} <span className="font-mono text-xs text-carbon/40">×{item.quantity}</span>
                            </span>
                            <span className="font-mono text-sm text-carbon">R{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drink items */}
                  {drinkItems.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-mono text-[10px] uppercase tracking-widest text-carbon/40 mb-3">Drinks</h4>
                      <div className="space-y-2">
                        {drinkItems.map(item => (
                          <div key={item.id} className="flex justify-between items-center py-2">
                            <span className="font-baskerville text-base text-carbon">
                              {item.name} <span className="font-mono text-xs text-carbon/40">×{item.quantity}</span>
                            </span>
                            <span className="font-mono text-sm text-carbon">R{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Special note display */}
                  {specialNote && (
                    <div className="mb-6 bg-smoke rounded-[1rem] p-4 border border-carbon/10">
                      <h4 className="font-mono text-[10px] uppercase tracking-widest text-carbon/40 mb-2">Note</h4>
                      <p className="font-mono text-sm text-carbon/70">{specialNote}</p>
                    </div>
                  )}

                  <div className="border-t border-carbon/20 pt-4 mt-4">
                    <div className="flex justify-between items-end">
                      <span className="font-mono text-sm uppercase tracking-widest text-carbon/60">Total</span>
                      <span className="font-baskerville text-3xl">R{total.toFixed(2)}</span>
                    </div>
                    <p className="font-mono text-[10px] text-carbon/40 uppercase tracking-wider mt-2">Est. arrival: noon</p>
                  </div>
                </div>
              )}

              {/* ─── STEP 5: SUCCESS ─── */}
              {step === 'SUCCESS' && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg ref={checkRef} width="80" height="80" viewBox="0 0 80 80" fill="none" className="mb-8">
                    <circle cx="40" cy="40" r="38" stroke="#1A1917" strokeWidth="2" />
                    <path d="M25 40 L35 50 L55 30" stroke="#1A1917" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h3 className="font-baskerville italic text-[2rem] text-carbon mb-4">Order #{orderId} received.</h3>
                  <p className="font-mono text-sm text-carbon/70 mb-4">The kitchen has been notified. Est. arrival: noon.</p>
                  <div className="mb-6 max-w-xs">
                    <SnarkyComment key={'success-' + commentKey} comment={snarkyComment} delay={800} />
                  </div>
                  <button
                    onClick={handleClose}
                    className="font-mono text-xs uppercase tracking-wider text-carbon/50 hover:text-carbon transition-colors underline underline-offset-4"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

            {/* Bottom bar */}
            {step === 'MENU' && items.length > 0 && (
              <div className="shrink-0 p-4 md:p-6 bg-smoke border-t border-carbon/20 z-20">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-xs uppercase tracking-widest text-carbon/60">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                  <span className="font-baskerville text-xl">R{total.toFixed(2)}</span>
                </div>
                <MagneticButton onClick={() => goToStep('REVIEW')} className="w-full !rounded-[2rem] flex justify-center py-5">
                  <span className="font-bold text-sm">REVIEW ORDER</span>
                </MagneticButton>
              </div>
            )}

            {step === 'REVIEW' && items.length > 0 && (
              <div className="shrink-0 p-4 md:p-6 bg-smoke border-t border-carbon/20 z-20">
                <MagneticButton onClick={() => goToStep('EXTRAS')} className="w-full !rounded-[2rem] flex justify-center py-5">
                  <span className="font-bold text-sm">CONTINUE</span>
                </MagneticButton>
              </div>
            )}

            {step === 'EXTRAS' && (
              <div className="shrink-0 p-4 md:p-6 bg-smoke border-t border-carbon/20 z-20">
                <MagneticButton onClick={() => goToStep('CONFIRM')} className="w-full !rounded-[2rem] flex justify-center py-5">
                  <span className="font-bold text-sm">REVIEW FINAL ORDER</span>
                </MagneticButton>
              </div>
            )}

            {step === 'CONFIRM' && (
              <div className="shrink-0 p-4 md:p-6 bg-smoke border-t border-carbon/20 z-20">
                <MagneticButton
                  onClick={submitOrder}
                  disabled={orderStatus === 'SUBMITTING'}
                  className="w-full !rounded-[2rem] flex justify-center py-5"
                >
                  <span className="font-bold text-sm">
                    {orderStatus === 'SUBMITTING' ? 'TRANSMITTING...' : 'PLACE ORDER'}
                  </span>
                </MagneticButton>
              </div>
            )}
          </>
        )}
      </div>

      {/* Meal Advisor Modal */}
      {restaurant && (
        <MealAdvisor
          restaurantId={restaurant.id}
          isOpen={isAdvisorOpen}
          onClose={() => setIsAdvisorOpen(false)}
        />
      )}
    </>,
    document.body
  );
}
