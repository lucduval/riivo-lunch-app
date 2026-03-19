import { NoiseOverlay } from './components/NoiseOverlay';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { RestaurantBrowser } from './components/RestaurantBrowser';
import { Footer } from './components/Footer';
import { Insights } from './components/Insights';
import { CardStackItem } from './components/PageFold';
import { CartProvider } from './lib/CartContext';
import { CartButton } from './components/CartButton';
import { CartDrawer } from './components/CartDrawer';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Login } from './components/Login';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useState, useEffect } from 'react';

function AppContent() {
  const { user, role, loading, signOut } = useAuth();
  const [hasEntered, setHasEntered] = useState(false);

  // Reset the welcome screen flow if the user signs out
  useEffect(() => {
    if (!user) setHasEntered(false);
  }, [user]);

  if (loading) {
    return <div className="fixed inset-0 flex items-center justify-center bg-[#FDFBF7] z-50"><p className="text-[#4B5563]">Loading...</p></div>;
  }

  if (!user) {
    return <Login />;
  }

  if (!role) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#FDFBF7] z-50">
         <div className="text-center max-w-sm w-full border border-gray-200 p-12 rounded-2xl shadow-sm bg-white">
            <h1 className="text-2xl font-serif text-red-600 mb-2">Access Denied</h1>
            <p className="text-[#4B5563] text-sm mb-8">You are not invited to access this application. Please contact an administrator.</p>
            <button
               onClick={signOut}
               className="w-full py-3 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
               Sign Out
            </button>
         </div>
      </div>
    );
  }

  if (!hasEntered) {
    return <WelcomeScreen user={user} onEnter={() => setHasEntered(true)} />;
  }

  return (
    <>
      <Navbar />
      <main className="relative z-10 w-full animate-fade-in">
        <CardStackItem index={1}>
          <Hero />
        </CardStackItem>

        {/* Anchor point for "For You" right before RestaurantBrowser */}
        <div id="foryou" className="absolute w-full h-1 -translate-y-[100px]" style={{ zIndex: 2 }} />

        <CardStackItem index={2}>
          <RestaurantBrowser />
        </CardStackItem>

        {/* Anchor point for "The Archive" right before Features */}
        <div id="archive" className="absolute w-full h-1 -translate-y-[100px]" style={{ zIndex: 3 }} />

        <CardStackItem index={3} isLast>
          <Features />
        </CardStackItem>
      </main>
      <div className="relative z-20">
        <Insights />
        <Footer />
      </div>
      <CartButton />
      <CartDrawer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NoiseOverlay />
        <AppContent />
      </CartProvider>
    </AuthProvider>
  )
}
