import React from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  FileSearch, 
  FlaskConical, 
  BarChart3, 
  Plus,
  Zap
} from 'lucide-react';

export default function Layout({ currentView, setCurrentView, children }) {
  const navItems = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'Verify', icon: FileSearch, label: 'Verify Artefact' },
    { id: 'Scenarios', icon: FlaskConical, label: 'Test Scenarios' },
    { id: 'Evaluation', icon: BarChart3, label: 'Evaluation Metrics' },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#09090b] text-zinc-100 selection:bg-rose-500/30">
      
      {/* Sidebar Navigation */}
      <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-zinc-800/60 bg-[#0c0c0e]">
        
        <div className="flex flex-col">
          {/* App Brand */}
          <div className="flex h-16 items-center gap-3 border-b border-zinc-800/60 px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-rose-600 shadow-md shadow-rose-500/10">
              <ShieldCheck className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-bold tracking-wide text-zinc-100">
              Hallushield
            </span>
          </div>

          {/* Primary CTA */}
          <div className="px-4 pt-6 pb-4">
            <button 
              onClick={() => setCurrentView('Verify')}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 font-semibold text-zinc-950 transition-all duration-200 hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
              <span className="text-sm">New Verification</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-3 mt-2">
            <div className="px-3 pb-2 text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
              Main Menu
            </div>
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-zinc-800/80 text-white shadow-sm ring-1 ring-zinc-700/50' 
                      : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                  {/* Subtle active indicator dot */}
                  {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="flex flex-col border-t border-zinc-800/60 p-4">
          
          {/* User Profile Hook */}
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-zinc-900/50 p-2 ring-1 ring-zinc-800">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-900 to-rose-900 border border-zinc-700">
              <span className="text-xs font-bold text-white">SR</span>
            </div>
            <div className="flex flex-col overflow-hidden text-left">
              <span className="truncate text-xs font-bold text-zinc-200">Sonikaa R B</span>
              <span className="truncate text-[10px] font-medium text-zinc-500">Team Aivigo</span>
            </div>
          </div>

          {/* Hackathon Badge */}
          <div className="flex items-center justify-center gap-1.5 rounded-md border border-indigo-500/20 bg-indigo-500/10 py-1.5 text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
            <Zap className="h-3 w-3" />
            Stateless Hackathon MVP
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="relative flex-1 overflow-y-auto bg-[#09090b]">
        {/* Subtle Ambient Glow for the main area */}
        <div className="pointer-events-none absolute -top-[20%] left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/5 blur-[120px]"></div>
        
        <div className="relative mx-auto h-full w-full max-w-[1600px] p-6 lg:p-10">
          {children}
        </div>
      </main>

    </div>
  );
}