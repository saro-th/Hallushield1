import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import { ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';

export default function SignupView({ onReturnToDashboard }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');
    
    // Simulate a network request to an auth backend
    setTimeout(() => {
      setStatus('success');
    }, 1200);
  };

  return (
    <AuthLayout>
      <div className="animate-in fade-in zoom-in-95 duration-500">
        
        {status === 'success' ? (
          // --- SUCCESS STATE ---
          <div className="flex flex-col items-center text-center rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10 shadow-2xl backdrop-blur-md">
            <CheckCircle2 className="mb-6 h-16 w-16 text-emerald-500 animate-in zoom-in duration-500" />
            <h2 className="mb-3 text-2xl font-bold text-white">You're on the list.</h2>
            <p className="mb-8 text-zinc-400">
              We will notify you the moment enterprise verification opens.
            </p>
            <button
              onClick={onReturnToDashboard}
              className="w-full rounded-xl bg-white px-4 py-3.5 font-semibold text-zinc-900 transition-all hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          // --- SIGN UP FORM ---
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-md">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700 shadow-inner">
                <ShieldAlert className="h-6 w-6 text-zinc-300" />
              </div>
              <h2 className="text-2xl font-bold text-white">Request Early Access</h2>
              <p className="mt-2 text-sm text-zinc-400">Join the exclusive waitlist for Hallucination Hunter.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-zinc-300">Full Name</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. Jane Doe"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950/50 px-4 py-3 text-sm text-white placeholder-zinc-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-zinc-300">Work Email</label>
                <input 
                  required 
                  type="email" 
                  placeholder="name@company.com"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950/50 px-4 py-3 text-sm text-white placeholder-zinc-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-zinc-300">Primary Use Case</label>
                <div className="relative">
                  <select 
                    required 
                    defaultValue=""
                    className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-950/50 px-4 py-3 text-sm text-white transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="" disabled>Select a use case...</option>
                    <option value="translation">Code Translation Verification</option>
                    <option value="refactoring">Legacy Refactoring Analysis</option>
                    <option value="prs">Automated PR Auditing</option>
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3.5 font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] disabled:pointer-events-none disabled:opacity-70"
              >
                {status === 'loading' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Join Waitlist'
                )}
              </button>
              
            </form>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}