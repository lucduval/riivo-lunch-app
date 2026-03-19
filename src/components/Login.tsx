import { useAuth } from '../lib/AuthContext';
import { Building2 } from 'lucide-react';

export function Login() {
  const { signInWithMicrosoft } = useAuth();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDFBF7]">
      <div className="text-center max-w-sm w-full border border-gray-200 p-8 md:p-12 rounded-2xl shadow-sm bg-white mx-4">
        <h1 className="text-3xl font-serif text-[#1F2937] mb-2">Welcome</h1>
        <p className="text-[#4B5563] text-sm mb-8">Access is invite-only.</p>
        <button
          onClick={signInWithMicrosoft}
          className="w-full flex items-center justify-center gap-3 bg-[#1F2937] text-white py-3 px-4 rounded-lg hover:bg-[#111827] transition-colors"
        >
          <Building2 size={20} />
          Sign in with Microsoft
        </button>
      </div>
    </div>
  );
}
