import React from 'react';
import { Globe2, Github } from 'lucide-react';

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
        <div className="flex items-center gap-3">
          <a
            href="https://ko-fi.com/longgilstudio"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs text-white bg-[#FF5E5B] hover:bg-[#ff4542] transition-colors px-3 py-1.5 rounded-full border border-[#ff4542] font-medium"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 2.692.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" />
            </svg>
            <span>Donate</span>
          </a>
          <a
            href="https://github.com/LongGil/polyglot-risk-scanner"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors px-3 py-1.5 rounded-full border border-slate-700"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;