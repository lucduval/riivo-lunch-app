import { useCart } from '../lib/CartContext';
import { ShoppingBag } from 'lucide-react';

export function CartButton() {
  const { items, setIsCartOpen } = useCart();
  
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (itemCount === 0) return null;

  return (
    <button 
      onClick={() => setIsCartOpen(true)}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 bg-carbon text-parchment rounded-full p-3.5 md:p-4 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex items-center justify-center group"
    >
      <ShoppingBag size={24} strokeWidth={1.5} />
      <div className="absolute -top-2 -right-2 bg-mustard text-carbon font-mono text-[10px] w-6 h-6 rounded-full flex items-center justify-center border-2 border-parchment transition-transform duration-300 group-hover:scale-110">
        {itemCount}
      </div>
    </button>
  );
}
