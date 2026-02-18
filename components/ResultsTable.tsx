import React, { useState, useMemo } from 'react';
import { ProcessedEntry, RiskWarning } from '../types';
import { AlertTriangle, AlertOctagon, Maximize2, CheckCircle2, Search, Filter, X } from 'lucide-react';

interface ResultsTableProps {
  entries: ProcessedEntry[];
}

const RiskIcon: React.FC<{ type: RiskWarning['type'] }> = ({ type }) => {
  switch (type) {
    case 'RTL_ALERT':
      return <AlertOctagon className="w-4 h-4 text-orange-500" />;
    case 'CJK_FONT_ALERT':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'UI_EXPANSION_RISK':
      return <Maximize2 className="w-4 h-4 text-red-500" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-slate-500" />;
  }
};

const ResultsTable: React.FC<ResultsTableProps> = ({ entries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // 1. Search Filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        entry.stringKey.toLowerCase().includes(searchLower) ||
        entry.originalValue.toLowerCase().includes(searchLower) ||
        entry.translatedValue.toLowerCase().includes(searchLower) ||
        (entry.tableId && entry.tableId.toLowerCase().includes(searchLower)) ||
        (entry.languageCode && entry.languageCode.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      // 2. Risk Filter
      if (filterRisk === 'all') return true;
      if (filterRisk === 'passed') return entry.risks.length === 0;
      if (filterRisk === 'risks_only') return entry.risks.length > 0;
      
      // Specific risk type
      return entry.risks.some(r => r.type === filterRisk);
    });
  }, [entries, searchTerm, filterRisk]);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-slate-700 rounded-lg bg-slate-900/50 text-slate-500">
        <p>No processed data yet.</p>
        <p className="text-sm">Import text and click Process to see results.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-2.5 border border-slate-700 rounded-lg leading-5 bg-slate-900 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent sm:text-sm transition-all shadow-sm"
            placeholder="Search keys, text, IDs or language..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Filter Dropdown */}
        <div className="relative w-full sm:w-64">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-slate-500" />
          </div>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="block w-full pl-10 pr-10 py-2.5 border border-slate-700 rounded-lg leading-5 bg-slate-900 text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent sm:text-sm appearance-none shadow-sm transition-all"
          >
            <option value="all">All Results</option>
            <option value="passed">Passed (No Risks)</option>
            <option value="risks_only">Has Risks</option>
            <option disabled>──────────</option>
            <option value="RTL_ALERT">RTL Issues</option>
            <option value="CJK_FONT_ALERT">CJK Font Issues</option>
            <option value="UI_EXPANSION_RISK">UI Expansion Issues</option>
          </select>
           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-700 overflow-hidden bg-slate-900 shadow-xl flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700">
                <th className="px-6 py-4 font-medium text-slate-300">Lang</th>
                <th className="px-6 py-4 font-medium text-slate-300">ID / Key</th>
                <th className="px-6 py-4 font-medium text-slate-300 w-1/4">Original</th>
                <th className="px-6 py-4 font-medium text-slate-300 w-1/4">Translated</th>
                <th className="px-6 py-4 font-medium text-slate-300 w-1/4">Risk Scan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-700 text-slate-300 border border-slate-600">
                        {entry.languageCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="font-mono text-xs text-accent-400 bg-accent-500/10 px-2 py-1 rounded w-fit">
                        {entry.stringKey}
                      </div>
                      {entry.tableId && (
                         <div className="text-xs text-slate-600 mt-1">{entry.tableId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top text-slate-300 max-w-xs break-words">
                      {entry.originalValue}
                    </td>
                    <td className="px-6 py-4 align-top text-slate-100 max-w-xs break-words bg-slate-800/30">
                      {entry.translatedValue}
                    </td>
                    <td className="px-6 py-4 align-top">
                      {entry.risks.length === 0 ? (
                        <div className="flex items-center gap-2 text-green-500/70 text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Pass</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {entry.risks.map((risk, idx) => (
                            <div 
                              key={idx} 
                              className={`flex items-start gap-2 text-xs p-2 rounded border ${
                                risk.type === 'UI_EXPANSION_RISK' ? 'bg-red-950/30 border-red-900/50 text-red-200' :
                                risk.type === 'RTL_ALERT' ? 'bg-orange-950/30 border-orange-900/50 text-orange-200' :
                                'bg-yellow-950/30 border-yellow-900/50 text-yellow-200'
                              }`}
                            >
                              <RiskIcon type={risk.type} />
                              <span>{risk.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                       <Search className="w-8 h-8 opacity-20" />
                       <p>No results match your search filters.</p>
                       <button 
                         onClick={() => { setSearchTerm(''); setFilterRisk('all'); }}
                         className="text-accent-500 hover:text-accent-400 text-xs mt-2 font-medium"
                       >
                         Clear filters
                       </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-slate-800 border-t border-slate-700 text-xs text-slate-400 flex justify-between">
          <span>Showing {filteredEntries.length} of {entries.length} entries</span>
          <span className="font-mono">Visible Risks: {filteredEntries.reduce((acc, curr) => acc + curr.risks.length, 0)}</span>
        </div>
      </div>
    </div>
  );
};

export default ResultsTable;