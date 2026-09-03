import React from 'react';
import { Shield } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full bg-zinc-950 font-sans text-zinc-100 selection:bg-indigo-500/30">
      
      {/* Left Panel - Hidden on mobile, visible on desktop */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-zinc-800 bg-zinc-900/30 p-12 lg:flex">
        
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        
        {/* Logo Area */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-wide">Hallushield</span>
        </div>

        {/* Typographic Value Prop */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
            Stop guessing. <br />
            <span className="text-indigo-400">Start verifying.</span>
          </h1>
          <p className="mt-6 text-lg text-zinc-400">
            Bring inspectable trust to your AI-generated code. Join the waitlist to secure early access to the ultimate forensic verification engine.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 font-mono text-xs tracking-widest text-zinc-600 uppercase">
          © {new Date().getFullYear()} Engineered by Team Aivigo
        </div>
      </div>

      {/* Right Panel - Form Area */}
      <div className="flex w-full flex-col items-center justify-center p-6 lg:w-1/2 relative overflow-hidden">
        {/* Soft ambient glow behind the form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        {/* The actual form card goes here */}
        <div className="w-full max-w-md relative z-10">
          {children}
        </div>
      </div>
      
    </div>
  );
}