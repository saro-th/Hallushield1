import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, ShieldAlert, ShieldCheck, HelpCircle } from 'lucide-react';

const SignalPill = ({ label, status }) => {
  const norm = (status || 'SKIPPED').toLowerCase();
  const config = {
    pass: { icon: CheckCircle, colors: 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' },
    warning: { icon: AlertTriangle, colors: 'bg-amber-950/30 text-amber-400 border-amber-900/50' },
    fail: { icon: XCircle, colors: 'bg-rose-950/30 text-rose-400 border-rose-900/50' },
    skipped: { icon: HelpCircle, colors: 'bg-zinc-900/50 text-zinc-500 border-zinc-800' }
  };

  const { icon: Icon, colors } = config[norm] || config.warning;

  return (
    <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${colors}`}>
      <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
      <span>{label}</span>
    </div>
  );
};

export default function VerificationBanner({ result }) {
  const verdict = result?.verdict || 'DIVERGENCE_DETECTED';
  const confidence = result?.confidence || 'HIGH';
  const signals = result?.verification_signals || { structural: 'PASS', semantic: 'FAIL', behavioural: 'FAIL' };

  const isVerified = verdict === 'VERIFIED';
  const isDivergent = verdict === 'DIVERGENCE_DETECTED';

  const BannerIcon = isVerified ? ShieldCheck : ShieldAlert;
  const bannerColors = isVerified
    ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
    : 'border-rose-500/30 bg-rose-950/20 text-rose-400';

  return (
    <div className={`mb-2 flex flex-col gap-4 rounded-xl border p-5 shadow-sm md:flex-row md:items-center md:justify-between ${bannerColors}`}>
      <div className="flex items-center gap-4">
        <div className={`rounded-full p-2.5 ${isVerified ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
          <BannerIcon className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            {verdict.replace('_', ' ')}
          </h2>
          <div className="mt-0.5 flex items-center gap-2 text-xs font-medium opacity-80">
            <span>Confidence:</span>
            <span className="rounded bg-black/30 px-2 py-0.5 tracking-wider font-mono">
              {confidence.toUpperCase()}
            </span>
            {result?.verification_id && (
              <span className="text-zinc-500 font-mono ml-2">[{result.verification_id}]</span>
            )}
          </div>
        </div>
      </div>

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