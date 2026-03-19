import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export type Role = 'admin' | 'user' | null;

interface AuthContextType {
  user: User | null;
  role: Role;
  loading: boolean;
  signInWithMicrosoft: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let initialised = false;

    // Safety timeout — never stay on loading screen forever
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn("Auth init timed out after 8s, forcing load complete");
        setLoading(false);
      }
    }, 8000);

    // Use onAuthStateChange as the single source of truth.
    // Supabase fires INITIAL_SESSION on startup which covers the reload case.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session: Session | null) => {
      console.log("Auth state event:", event, session?.user?.id);
      if (!mounted) return;

      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchRole(session.user);
      } else {
        setRole(null);
        setLoading(false);
      }
      initialised = true;
    });

    // Fallback: if onAuthStateChange doesn't fire within 3s, init manually
    const fallback = setTimeout(async () => {
      if (!mounted || initialised) return;
      console.log("Auth fallback: onAuthStateChange did not fire, calling getSession");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchRole(session.user);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth fallback error:", err);
        if (mounted) setLoading(false);
      }
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      clearTimeout(fallback);
      subscription.unsubscribe();
    };
  }, []);

  async function fetchRole(authUser: User) {
    try {
      console.log("Calling database for role...");

      // Use a SECURITY DEFINER RPC so the lookup always succeeds
      // regardless of RLS or JWT email claim quirks.
      const { data, error } = await supabase.rpc('get_my_role');

      console.log("Role fetch result:", data, error);
      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        setRole(row.role as Role);
        // Backfill user_id if the trigger didn't link it
        if (!row.user_id) {
          await supabase
            .from('user_roles')
            .update({ user_id: authUser.id, updated_at: new Date().toISOString() })
            .ilike('email', authUser.email?.toLowerCase() ?? '');
        }
      } else {
        setRole(null);
      }
    } catch (err) {
      console.error("Exception in fetchRole:", err);
      setRole(null);
    } finally {
      console.log("Setting loading state to false");
      setLoading(false);
    }
  }

  async function signInWithMicrosoft() {
    await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'email',
        redirectTo: window.location.origin,
      }
    });
  }

  async function signOut() {
    console.log("Signing out...");
    try {
      // Race against a timeout so a hanging request doesn't block the UI
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Sign-out timed out')), 3000)),
      ]);
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      // Force reset local states just in case Supabase's network request fails
      setUser(null);
      setRole(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, signInWithMicrosoft, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
