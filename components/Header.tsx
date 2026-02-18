import React from 'react';
import { Globe2 } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-600/10 rounded-lg border border-accent-600/20">
            <Globe2 className="w-6 h-6 text-accent-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Polyglot <span className="text-accent-500">Risk Scanner</span></h1>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Game Localization Toolset v1.0</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {/* Placeholder for user profile or extra settings if needed */}
           <div className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
             Internal Build
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;