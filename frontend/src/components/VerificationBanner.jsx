import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, ShieldAlert, ShieldCheck } from 'lucide-react';

// Helper component to render individual signal pills
const SignalPill = ({ label, status }) => {
  // Map statuses to appropriate accessible icons and color combinations
  const config = {
    pass: {
      icon: CheckCircle,
      colors: 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50',
    },
    warning: {
      icon: AlertTriangle,
      colors: 'bg-amber-950/30 text-amber-400 border-amber-900/50',
    },
    fail: {
      icon: XCircle,
      colors: 'bg-rose-950/30 text-rose-400 border-rose-900/50',
    }
  };

  const { icon: Icon, colors } = config[status] || config.warning;

  return (
    <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${colors}`}>
      <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
      <span>{label}</span>
    </div>
  );
};

export default function VerificationBanner({ result }) {
  // For the MVP, we fallback to defaults if result is not provided
  const {
    isDivergent = true,
    confidence = 'High',
    signals = { structural: 'pass', semantic: 'fail', behavioural: 'warning' }
  } = result || {};

  const BannerIcon = isDivergent ? ShieldAlert : ShieldCheck;
  const bannerColors = isDivergent 
    ? 'border-rose-500/30 bg-rose-950/20 text-rose-500' 
    : 'border-emerald-500/30 bg-emerald-950/20 text-emerald-500';

  return (
    <div className={`mb-6 flex flex-col gap-4 rounded-xl border p-4 shadow-sm md:flex-row md:items-center md:justify-between ${bannerColors}`}>
      
      {/* Left Side: Verdict & Confidence */}
      <div className="flex items-center gap-4">
        <div className={`rounded-full p-2 ${isDivergent ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
          <BannerIcon className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            {isDivergent ? '✗ DIVERGENCE DETECTED' : '✓ VERIFIED'}
          </h2>
          <div className="mt-0.5 flex items-center gap-2 text-xs font-medium opacity-80">
            <span>Confidence:</span>
            <span className="rounded bg-black/20 px-1.5 py-0.5 tracking-wider">
              {confidence.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Right Side: Signal Pills */}
      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <div className="mr-2 hidden text-xs font-semibold tracking-wider opacity-60 md:block text-zinc-400">
          SIGNALS:
        </div>
        <SignalPill label="Structural" status={signals.structural} />
        <SignalPill label="Semantic" status={signals.semantic} />
        <SignalPill label="Behavioural" status={signals.behavioural} />
      </div>
      
    </div>
  );
}