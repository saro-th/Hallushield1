import React from 'react';
import { X, FileJson, ShieldCheck } from 'lucide-react';

export default function AuditModal({ isOpen, onClose, auditData }) {
  if (!isOpen) return null;

  // Mock JSON payload if none provided
  const payload = auditData || {
    audit_id: "ver_98f4a2b1_00x",
    timestamp: new Date().toISOString(),
    engine: "HallucinationHunter-Core v1.0",
    hashes: {
      source_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      artefact_sha256: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"
    },
    reproducibility_score: 1.0,
    attestation: "Verified by cryptographically secure behavioural sandbox."
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Dimmed Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl transform overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl transition-all animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-indigo-500" />
            <h2 className="text-sm font-semibold tracking-wide text-zinc-100">
              Cryptographic Audit Record
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Read-Only JSON Payload */}
        <div className="p-6">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <FileJson className="h-4 w-4" />
            <span>RAW PAYLOAD (JSON)</span>
          </div>
          <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-zinc-800 bg-[#0d0d0d] p-4 shadow-inner">
            <pre className="font-mono text-xs leading-relaxed text-zinc-300 sm:text-sm">
              <code>{JSON.stringify(payload, null, 2)}</code>
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-zinc-800 bg-zinc-950/50 px-6 py-4 text-right">
          <button 
            onClick={onClose}
            className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-600"
          >
            Close Record
          </button>
        </div>
      </div>
    </div>
  );
}