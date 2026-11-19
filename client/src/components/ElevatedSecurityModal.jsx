import React, { useState } from 'react';
import { X, Lock, ShieldAlert, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

export default function ElevatedSecurityModal({
  isOpen,
  title = 'Master Security Verification',
  description = 'This sensitive action requires Super Admin master password or security PIN authorization.',
  onClose,
  onAuthorized,
}) {
  const { verifyMasterPinOrPassword, isSuperAdmin } = useAuth();
  const { showAlert } = useAlert();

  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isOk = await verifyMasterPinOrPassword(keyInput);
      if (isOk) {
        setKeyInput('');
        onClose();
        if (onAuthorized) onAuthorized();
      } else {
        setError('Invalid master password or security PIN. Authorization failed.');
      }
    } catch (err) {
      setError('Verification failed. Super Admin authority required.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 max-w-sm w-full overflow-hidden shadow-2xl text-xs font-sans">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center space-y-1.5">
            <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center mx-auto">
              <KeyRound className="w-5 h-5 text-slate-200" />
            </div>
            <p className="text-xs text-slate-600 font-mono leading-relaxed">
              {description}
            </p>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 font-mono text-[11px] flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1 font-mono">
              Super Admin Master Password or PIN:
            </label>
            <input
              type="password"
              required
              autoFocus
              placeholder="Enter PIN (e.g. 9900) or password..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 focus:border-slate-900 focus:outline-none font-mono text-center tracking-widest text-sm"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold uppercase text-slate-600 hover:bg-slate-100 border border-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 transition disabled:opacity-50"
            >
              {loading ? 'Authorizing...' : 'Verify Authority'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
