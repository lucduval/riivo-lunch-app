import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { X, Receipt } from 'lucide-react';

type Order = {
  id: string;
  items: Array<{ name: string; quantity: number; price: number; category?: string }>;
  total: number;
  special_note: string | null;
  restaurant_name: string | null;
  status: string;
  created_at: string;
};

export function OrderHistory({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.4, display: 'block' });
      gsap.to(drawerRef.current, { x: '0%', duration: 0.6, ease: 'power3.out' });
      fetchOrders();
    } else {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, display: 'none' });
      gsap.to(drawerRef.current, { x: '100%', duration: 0.6, ease: 'power3.in' });
    }
  }, [isOpen]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  // Group orders by date
  const groupedOrders = orders.reduce<Record<string, Order[]>>((acc, order) => {
    const key = new Date(order.created_at).toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(order);
    return acc;
  }, {});

  return createPortal(
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-carbon/20 backdrop-blur-sm z-[100] hidden opacity-0 cursor-pointer"
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-[100dvh] w-full md:w-[500px] bg-parchment border-l border-carbon z-[110] translate-x-[100%] flex flex-col"
      >
        {/* Header */}
        <div className="shrink-0 p-5 md:p-8 pb-4 md:pb-6 border-b border-carbon/10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-baskerville text-[1.5rem] md:text-[2rem] leading-none text-carbon">Order History</h2>
              <p className="font-mono text-xs uppercase tracking-widest text-carbon/40 mt-2">Your past orders</p>
            </div>
            <button onClick={onClose} className="text-carbon hover:opacity-50 transition-opacity">
              <X size={28} strokeWidth={1} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 pt-4 md:pt-6">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-carbon/5 rounded-[1.5rem]" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Receipt size={40} className="text-carbon/15 mb-4" />
              <p className="font-baskerville text-xl text-carbon/30 italic mb-2">No orders yet.</p>
              <p className="font-mono text-xs text-carbon/20 uppercase tracking-wider">Your orders will appear here</p>
            </div>
          ) : (
            Object.entries(groupedOrders).map(([dateKey, dateOrders]) => (
              <div key={dateKey} className="mb-8">
                <h3 className="font-mono text-xs uppercase tracking-widest text-carbon/40 mb-4 flex items-center gap-3">
                  {formatDate(dateOrders[0].created_at)}
                  <div className="h-[1px] flex-1 bg-carbon/10" />
                </h3>

                <div className="space-y-4">
                  {dateOrders.map(order => (
                    <div key={order.id} className="bg-smoke rounded-[1.5rem] border border-carbon/10 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-baskerville text-lg text-carbon">
                          {order.restaurant_name || 'Order'}
                        </span>
                        <span className="font-mono text-xs text-carbon/40">
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="space-y-1 mb-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="font-mono text-xs text-carbon/60">
                              {item.quantity > 1 ? `${item.quantity}x ` : ''}{item.name}
                            </span>
                            <span className="font-mono text-xs text-carbon/40">
                              R{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.special_note && (
                        <p className="font-mono text-xs text-mustard italic mb-2">Note: {order.special_note}</p>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-carbon/5">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-carbon/30">{order.status}</span>
                        <span className="font-mono text-sm text-carbon font-medium">R{order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
