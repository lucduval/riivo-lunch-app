import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Copy, Check, ChevronDown, ChevronUp, Users, ClipboardList, Wine } from 'lucide-react';

type Order = {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  items: Array<{ name: string; quantity: number; price: number; category?: string }>;
  total: number;
  special_note: string | null;
  restaurant_name: string | null;
  restaurant_id: string | null;
  status: string;
  created_at: string;
};

type UserRole = {
  id: string;
  user_id: string | null;
  email: string;
  role: string;
};

export function AdminOrderDashboard({ onClose }: { onClose: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | false>(false);
  const [showNotSubmitted, setShowNotSubmitted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch orders for the selected date
    const startOfDay = `${selectedDate}T00:00:00.000Z`;
    const endOfDay = `${selectedDate}T23:59:59.999Z`;

    const [ordersRes, usersRes] = await Promise.all([
      supabase
        .from('orders')
        .select('*')
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)
        .order('created_at', { ascending: false }),
      supabase
        .from('user_roles')
        .select('*'),
    ]);

    if (ordersRes.data) setOrders(ordersRes.data);
    if (usersRes.data) setAllUsers(usersRes.data);
    setLoading(false);
  };

  // Users who have submitted orders today
  const submittedUserIds = new Set(orders.map(o => o.user_id));
  const submittedEmails = new Set(orders.map(o => o.user_email?.toLowerCase()));

  // Users who haven't submitted
  const notSubmittedUsers = allUsers.filter(u => {
    if (u.user_id && submittedUserIds.has(u.user_id)) return false;
    if (submittedEmails.has(u.email.toLowerCase())) return false;
    return true;
  });

  // Group orders by restaurant for the message
  const ordersByRestaurant = orders.reduce<Record<string, Order[]>>((acc, order) => {
    const key = order.restaurant_name || 'Unknown Restaurant';
    if (!acc[key]) acc[key] = [];
    acc[key].push(order);
    return acc;
  }, {});

  // Generate the standard restaurant message
  const generateMessage = (restaurantName: string, restaurantOrders: Order[]) => {
    const allItems: Array<{ name: string; quantity: number; note?: string | null }> = [];

    for (const order of restaurantOrders) {
      for (const item of order.items) {
        if (item.category === 'Drinks') continue;
        const existing = allItems.find(i => i.name === item.name && i.note === order.special_note);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          allItems.push({ name: item.name, quantity: item.quantity, note: order.special_note });
        }
      }
    }

    let message = `Hi ${restaurantName}, please can we order the following:\n\n`;

    for (const item of allItems) {
      const qty = item.quantity > 1 ? `${item.quantity}x ` : '';
      const note = item.note ? ` — ${item.note}` : '';
      message += `• ${qty}${item.name}${note}\n`;
    }

    message += '\nThank you.';
    return message;
  };

  const copyMessage = (restaurantName: string, restaurantOrders: Order[]) => {
    const msg = generateMessage(restaurantName, restaurantOrders);
    navigator.clipboard.writeText(msg);
    setCopied(restaurantName);
    setTimeout(() => setCopied(false), 2000);
  };

  // Aggregate all drink items across all orders for Oliver
  const allDrinkItems: Array<{ name: string; quantity: number }> = [];
  for (const order of orders) {
    for (const item of order.items) {
      if (item.category !== 'Drinks') continue;
      const existing = allDrinkItems.find(i => i.name === item.name);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        allDrinkItems.push({ name: item.name, quantity: item.quantity });
      }
    }
  }

  const generateOliverMessage = () => {
    if (allDrinkItems.length === 0) return '';
    let message = `Oliver, drinks order for today:\n\n`;
    for (const item of allDrinkItems) {
      const qty = item.quantity > 1 ? `${item.quantity}x ` : '';
      message += `• ${qty}${item.name}\n`;
    }
    message += '\nCheers.';
    return message;
  };

  const copyOliverMessage = () => {
    navigator.clipboard.writeText(generateOliverMessage());
    setCopied('oliver');
    setTimeout(() => setCopied(false), 2000);
  };

  const displayName = (order: Order) => {
    if (order.user_name) return order.user_name;
    if (order.user_email) return order.user_email.split('@')[0];
    return 'Unknown';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-parchment border border-carbon/20 w-full max-w-2xl max-h-[90vh] md:max-h-[85vh] rounded-xl md:rounded-2xl shadow-xl relative flex flex-col">
        {/* Header */}
        <div className="shrink-0 p-4 md:p-6 pb-3 md:pb-4 border-b border-carbon/10">
          <button onClick={onClose} className="absolute top-4 right-4 text-carbon/50 hover:text-carbon transition-colors">
            <X size={20} />
          </button>
          <h2 className="font-baskerville text-2xl text-carbon mb-3">Order Dashboard</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="font-mono text-xs bg-smoke border border-carbon/10 rounded-lg px-3 py-2 text-carbon focus:outline-none focus:border-mustard/50"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="font-mono text-sm text-carbon/40">Loading orders...</p>
            </div>
          ) : (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-smoke rounded-xl p-4 border border-carbon/10">
                  <div className="flex items-center gap-2 mb-1">
                    <ClipboardList size={14} className="text-carbon/40" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-carbon/40">Submitted</span>
                  </div>
                  <span className="font-baskerville text-2xl text-carbon">{orders.length}</span>
                </div>
                <div className="bg-smoke rounded-xl p-4 border border-carbon/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={14} className="text-carbon/40" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-carbon/40">Not submitted</span>
                  </div>
                  <span className="font-baskerville text-2xl text-carbon">{notSubmittedUsers.length}</span>
                </div>
              </div>

              {/* Not submitted toggle */}
              <button
                onClick={() => setShowNotSubmitted(!showNotSubmitted)}
                className="w-full flex items-center justify-between bg-smoke rounded-xl p-4 border border-carbon/10 mb-6 hover:border-mustard/30 transition-colors"
              >
                <span className="font-mono text-xs uppercase tracking-wider text-carbon/60">
                  Users who haven't ordered ({notSubmittedUsers.length})
                </span>
                {showNotSubmitted ? <ChevronUp size={16} className="text-carbon/40" /> : <ChevronDown size={16} className="text-carbon/40" />}
              </button>

              {showNotSubmitted && notSubmittedUsers.length > 0 && (
                <div className="mb-6 bg-smoke rounded-xl border border-carbon/10 p-4">
                  <div className="space-y-2">
                    {notSubmittedUsers.map(u => (
                      <div key={u.id} className="flex items-center justify-between py-1.5">
                        <span className="font-mono text-sm text-carbon">{u.email}</span>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-carbon/30">{u.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showNotSubmitted && notSubmittedUsers.length === 0 && (
                <div className="mb-6 bg-smoke rounded-xl border border-carbon/10 p-4 text-center">
                  <p className="font-mono text-sm text-carbon/40">Everyone has submitted their order.</p>
                </div>
              )}

              {/* Oliver's Drinks Order */}
              {allDrinkItems.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4 gap-3">
                    <div className="flex items-center gap-2">
                      <Wine size={18} className="text-carbon/40" />
                      <h3 className="font-baskerville text-lg md:text-xl text-carbon">Oliver's Drinks</h3>
                    </div>
                    <button
                      onClick={copyOliverMessage}
                      className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider bg-carbon text-parchment px-4 py-2 rounded-full hover:bg-mustard hover:text-carbon transition-colors"
                    >
                      {copied === 'oliver' ? <Check size={12} /> : <Copy size={12} />}
                      {copied === 'oliver' ? 'Copied' : 'Copy for Oliver'}
                    </button>
                  </div>

                  <div className="bg-smoke rounded-xl border border-carbon/10 p-4 mb-4">
                    <pre className="font-mono text-xs text-carbon/70 whitespace-pre-wrap leading-relaxed">
                      {generateOliverMessage()}
                    </pre>
                  </div>
                </div>
              )}

              {/* Orders by restaurant with copy message */}
              {Object.entries(ordersByRestaurant).map(([restaurantName, restaurantOrders]) => (
                <div key={restaurantName} className="mb-8">
                  <div className="flex items-center justify-between mb-4 gap-3">
                    <h3 className="font-baskerville text-lg md:text-xl text-carbon truncate">{restaurantName}</h3>
                    <button
                      onClick={() => copyMessage(restaurantName, restaurantOrders)}
                      className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider bg-carbon text-parchment px-4 py-2 rounded-full hover:bg-mustard hover:text-carbon transition-colors"
                    >
                      {copied === restaurantName ? <Check size={12} /> : <Copy size={12} />}
                      {copied === restaurantName ? 'Copied' : 'Copy Message'}
                    </button>
                  </div>

                  {/* Preview of the message */}
                  <div className="bg-smoke rounded-xl border border-carbon/10 p-4 mb-4">
                    <pre className="font-mono text-xs text-carbon/70 whitespace-pre-wrap leading-relaxed">
                      {generateMessage(restaurantName, restaurantOrders)}
                    </pre>
                  </div>

                  {/* Individual orders */}
                  <div className="space-y-3">
                    {restaurantOrders.map(order => (
                      <div key={order.id} className="bg-smoke rounded-xl border border-carbon/10 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-baskerville text-base text-carbon">{displayName(order)}</span>
                          <span className="font-mono text-[10px] text-carbon/40">
                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="font-mono text-xs text-carbon/60">
                                {item.quantity > 1 ? `${item.quantity}x ` : ''}{item.name}
                              </span>
                              <span className="font-mono text-xs text-carbon/40">R{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        {order.special_note && (
                          <p className="font-mono text-xs text-mustard mt-2 italic">Note: {order.special_note}</p>
                        )}
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-carbon/5">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-carbon/30">{order.status}</span>
                          <span className="font-mono text-xs text-carbon">R{order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-12">
                  <p className="font-baskerville text-xl text-carbon/30 italic mb-2">No orders yet.</p>
                  <p className="font-mono text-xs text-carbon/20 uppercase tracking-wider">Orders will appear here as users submit them</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
