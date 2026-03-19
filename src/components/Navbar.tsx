import { useState, useEffect, useRef } from 'react';
import { MagneticButton } from './MagneticButton';
import { useAuth } from '../lib/AuthContext';
import { AdminPanel } from './AdminPanel';
import { AdminOrderDashboard } from './AdminOrderDashboard';
import { OrderHistory } from './OrderHistory';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showOrderDashboard, setShowOrderDashboard] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const { role, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    if (accountOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [accountOpen]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="fixed top-4 md:top-6 left-1/2 z-50 w-auto -translate-x-1/2 min-w-0 max-w-[calc(100vw-2rem)] md:min-w-[500px]">
        <nav
          className={`flex items-center justify-between rounded-full px-4 py-2 transition-all duration-500 border ${
            isScrolled
              ? 'bg-parchment/70 backdrop-blur-xl border-carbon shadow-md'
              : 'bg-transparent border-transparent'
          }`}
        >
          <div className="flex gap-3 md:gap-6 items-center">
            <div className="font-baskerville italic text-xl md:text-2xl leading-none pl-2 md:pl-4 pr-3 md:pr-6">riivo</div>
            <button onClick={() => scrollToSection('selection')} className="nav-link font-mono text-[10px] md:text-xs uppercase tracking-widest text-carbon transition-opacity hidden sm:block">Today's Selection</button>
            <button onClick={() => scrollToSection('archive')} className="nav-link font-mono text-[10px] md:text-xs uppercase tracking-widest text-carbon transition-opacity hidden md:block">The Archive</button>
            <button onClick={() => scrollToSection('foryou')} className="nav-link font-mono text-[10px] md:text-xs uppercase tracking-widest text-carbon transition-opacity hidden lg:block">For You</button>
          </div>

          <div className="ml-3 md:ml-8 flex items-center gap-2 md:gap-4">
            {/* Account dropdown */}
            <div ref={accountRef} className="relative">
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="nav-link font-mono text-[10px] md:text-xs uppercase tracking-widest text-carbon transition-opacity flex items-center gap-1.5"
              >
                Account
                <svg className={`w-3 h-3 transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-full mt-3 min-w-[180px] rounded-2xl bg-parchment/95 backdrop-blur-xl border border-carbon/10 shadow-lg py-2 z-50">
                  <button
                    onClick={() => { setShowOrderHistory(true); setAccountOpen(false); }}
                    className="w-full text-left px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-carbon hover:bg-carbon/5 transition-colors"
                  >
                    My Orders
                  </button>
                  {role === 'admin' && (
                    <>
                      <button
                        onClick={() => { setShowOrderDashboard(true); setAccountOpen(false); }}
                        className="w-full text-left px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-carbon hover:bg-carbon/5 transition-colors"
                      >
                        Orders
                      </button>
                      <button
                        onClick={() => { setShowAdmin(true); setAccountOpen(false); }}
                        className="w-full text-left px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-carbon hover:bg-carbon/5 transition-colors"
                      >
                        Admin
                      </button>
                    </>
                  )}
                  <div className="mx-4 my-1 h-[1px] bg-carbon/10" />
                  <button
                    onClick={() => { signOut(); setAccountOpen(false); }}
                    className="w-full text-left px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-carbon/60 hover:text-carbon hover:bg-carbon/5 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            <MagneticButton variant="secondary" onClick={() => scrollToSection('selection')} className="!py-2 !px-5 !text-xs !border-carbon/30 hidden md:block">Join the Table</MagneticButton>
          </div>
        </nav>
      </header>

      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      {showOrderDashboard && <AdminOrderDashboard onClose={() => setShowOrderDashboard(false)} />}
      <OrderHistory isOpen={showOrderHistory} onClose={() => setShowOrderHistory(false)} />
    </>
  );
}
