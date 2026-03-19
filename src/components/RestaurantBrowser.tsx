import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { SectionTransition } from './SectionTransition';
import { MenuDrawer } from './MenuDrawer';

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  delivery_time: string;
  image_url: string | null;
  coming_soon?: boolean;
}

const mockRestaurants: Restaurant[] = [
  { id: '22222222-2222-4222-8222-222222222222', name: "Posticino's", cuisine: 'Italian', delivery_time: '35 mins', image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=800' },
  { id: '44444444-4444-4444-8444-444444444444', name: 'The Lebanese Bakery', cuisine: 'Lebanese', delivery_time: '30 mins', image_url: 'https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&q=80&w=800' },
  { id: '11111111-1111-4111-8111-111111111111', name: 'La Colombe', cuisine: 'Fine Dining', delivery_time: 'N/A', image_url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=800', coming_soon: true },
  { id: '33333333-3333-4333-8333-333333333333', name: 'Chefs Warehouse', cuisine: 'Fine Dining', delivery_time: 'N/A', image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800', coming_soon: true },
];

export function RestaurantBrowser() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const { data } = await supabase.from('restaurants').select('*');
        if (data && data.length > 0) {
          const preferredOrder = ['Posticino\'s', 'The Lebanese Bakery', 'La Colombe', 'Chefs Warehouse'];
          const sorted = [...data].sort((a, b) => {
            const ai = preferredOrder.indexOf(a.name);
            const bi = preferredOrder.indexOf(b.name);
            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
          });
          setRestaurants(sorted);
        } else {
          setRestaurants(mockRestaurants);
        }
      } catch (e) {
        setRestaurants(mockRestaurants);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurants();
  }, []);

  const openMenu = (r: Restaurant) => {
    setSelectedRestaurant(r);
  };

  return (
    <>
      <SectionTransition id="selection" className="bg-smoke py-16 pb-24 md:py-32 md:pb-44 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-10 md:mb-16">
            <h2 className="font-baskerville text-[2rem] md:text-[3rem] text-carbon leading-none">Today's Selection.</h2>
            <div className="font-mono text-carbon/60 uppercase tracking-widest text-sm hidden md:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-parchment/50 border border-carbon/10 rounded-[2rem] h-[400px]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {restaurants.map(r => (
                <div 
                  key={r.id} 
                  onClick={() => !r.coming_soon && openMenu(r)}
                  className={`group relative bg-parchment rounded-[1.5rem] md:rounded-[2rem] border border-carbon overflow-hidden ${r.coming_soon ? 'cursor-not-allowed opacity-70' : 'cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-[4px] hover:shadow-xl'} flex flex-col h-[320px] md:h-[400px]`}
                >
                  {!r.coming_soon && <div className="absolute top-0 left-0 w-[4px] h-full bg-mustard -translate-x-full transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-x-0 z-20" />}
                  
                  <div className="h-2/3 w-full bg-carbon/10 overflow-hidden relative">
                    {r.image_url ? (
                      <img src={r.image_url} alt={r.name} className={`object-cover w-full h-full ${r.coming_soon ? 'grayscale opacity-80' : 'transition-all duration-700 scale-100 group-hover:scale-105 group-hover:brightness-110'}`} />
                    ) : (
                      <div className="w-full h-full bg-carbon flex items-center justify-center font-mono opacity-10">NO IMAGE</div>
                    )}
                    {r.coming_soon && (
                      <div className="absolute inset-0 flex items-center justify-center bg-carbon/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                         <span className="font-mono text-carbon font-bold uppercase tracking-widest bg-parchment px-4 py-2 rounded-full border border-carbon/20 shadow-sm">Coming Soon</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col justify-center">
                    <h3 className={`font-baskerville text-2xl text-carbon mb-2 ${r.coming_soon ? '' : 'group-hover:text-mustard transition-colors duration-300'}`}>{r.name}</h3>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="font-mono text-xs text-carbon/60 uppercase tracking-wider">{r.cuisine}</span>
                      <span className="font-mono text-xs text-carbon/60 uppercase tracking-wider">{r.delivery_time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </SectionTransition>

      {/* Renders drawer. Null-safe internally. */}
      <MenuDrawer restaurant={selectedRestaurant} onClose={() => setSelectedRestaurant(null)} />
    </>
  );
}
