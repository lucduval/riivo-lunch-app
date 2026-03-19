import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, UserPlus, ShieldAlert } from 'lucide-react';

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const { error } = await supabase
      .from('user_roles')
      .insert([{ email, role }]);

    if (error) {
      if (error.code === '23505') {
        setStatus({ type: 'error', msg: 'User already invited.' });
      } else {
        setStatus({ type: 'error', msg: error.message });
      }
    } else {
      setStatus({ type: 'success', msg: `Successfully invited ${email} as ${role}.` });
      setEmail('');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#FDFBF7] border border-gray-200 w-full max-w-md rounded-2xl p-6 shadow-xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-serif text-[#1F2937] mb-6 flex items-center gap-2">
          <ShieldAlert size={24} /> Admin Access
        </h2>
        
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-carbon"
              placeholder="colleague@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-carbon"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          {status && (
            <div className={`p-3 rounded-lg text-sm ${status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {status.msg}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#1F2937] text-white py-2.5 px-4 rounded-lg hover:bg-[#111827] transition-colors disabled:opacity-70"
          >
            <UserPlus size={18} />
            {loading ? 'Inviting...' : 'Invite User'}
          </button>
        </form>
      </div>
    </div>
  );
}
