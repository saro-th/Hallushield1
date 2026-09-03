import React from 'react';
import { Bug, GitCommit, FileCode2, ChevronRight } from 'lucide-react';

const BADGE_CONFIG = {
  BEHAVIOURAL_MISMATCH: {
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    icon: Bug,
    label: 'Behavioural'
  },
  STRUCTURAL_DRIFT: {
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: GitCommit,
    label: 'Structural'
  },
  SEMANTIC_ERROR: {
    color: 'bg-violet-100 text-violet-700 border-violet-200',
    icon: FileCode2,
    label: 'Semantic'
  }
};

export default function DivergenceList({ divergences, activeId, onCardClick }) {
  if (!divergences || divergences.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
        <span className="text-sm font-medium text-slate-500">No divergences detected.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[12px] font-bold tracking-widest text-slate-500 uppercase">
        Detected Divergences
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {divergences.map((issue) => {
          const config = BADGE_CONFIG[issue.type] || BADGE_CONFIG.STRUCTURAL_DRIFT;
          const Icon = config.icon;
          const isActive = activeId === issue.id;

          return (
            <div
              key={issue.id}
              onClick={() => onCardClick(issue)}
              className={`group cursor-pointer rounded-xl border p-5 transition-all duration-200 ${
                isActive 
                  ? 'border-blue-400 bg-blue-50/50 shadow-md ring-1 ring-blue-400/20' 
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="font-mono text-[14px] font-bold text-slate-800">
                  {issue.functionName}
                </div>
                
                <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${config.color}`}>
                  <Icon className="h-3 w-3" />
                  <span>{config.label}</span>
                </div>
              </div>
              
              <p className="text-[13px] leading-relaxed text-slate-600 line-clamp-2">
                {issue.explanation}
              </p>

              <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                <span>View Forensic Evidence</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}