import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import Button from './components/Button';
import ResultsTable from './components/ResultsTable';
import { MOCK_INITIAL_TEXT, TARGET_LANGUAGES } from './constants';
import { InputMode, ProcessedEntry, ParseResult } from './types';
import { parseCustomTxt, serializeToTxt } from './services/parser';
import { translateBatch } from './services/translator';
import { scanForRisks, generateCsvReport } from './services/scanner';
import { Play, Download, RefreshCw, FileDown } from 'lucide-react';
// @ts-ignore
import JSZip from 'jszip';

const App: React.FC = () => {
  // State
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [rawText, setRawText] = useState<string>(MOCK_INITIAL_TEXT);
  const [fileName, setFileName] = useState<string | null>(null);

  const [targetLang, setTargetLang] = useState<string>('de-DE');
  const [selectionMode, setSelectionMode] = useState<'single' | 'all' | 'custom'>('single');
  const [selectedLangs, setSelectedLangs] = useState<Set<string>>(new Set());
  const [isLangPanelOpen, setIsLangPanelOpen] = useState(false);
  const langPanelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langPanelRef.current && !langPanelRef.current.contains(e.target as Node)) {
        setIsLangPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLang = (code: string) => {
    setSelectedLangs(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const selectAllLangs = () => setSelectedLangs(new Set(TARGET_LANGUAGES.map(l => l.code)));
  const deselectAllLangs = () => setSelectedLangs(new Set());

  // Compute which languages to process
  const getLanguagesToProcess = () => {
    if (selectionMode === 'all') return TARGET_LANGUAGES;
    if (selectionMode === 'custom') return TARGET_LANGUAGES.filter(l => selectedLangs.has(l.code));
    return TARGET_LANGUAGES.filter(l => l.code === targetLang);
  };

  const isMultiLang = selectionMode === 'all' || (selectionMode === 'custom' && selectedLangs.size > 1);
  const [provider, setProvider] = useState<string>('mock');
  const [lmStudioUrl, setLmStudioUrl] = useState<string>('http://localhost:1234/v1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ProcessedEntry[]>([]);
  const [originalMetadata, setOriginalMetadata] = useState<ParseResult['metadata'] | null>(null);

  const handleProcess = async () => {
    if (!rawText.trim()) return;

    setIsProcessing(true);
    setResults([]);

    try {
      // 1. Parse
      const { entries, metadata } = parseCustomTxt(rawText);
      setOriginalMetadata(metadata);

      const allResults: ProcessedEntry[] = [];
      const languagesToProcess = getLanguagesToProcess();

      if (languagesToProcess.length === 0) {
        alert('Please select at least one target language.');
        setIsProcessing(false);
        return;
      }

      // Prepare batch data (extract all original values once)
      const textsToTranslate = entries.map(entry => entry.originalValue);

      // 2. Translate & Scan (Batch mode)
      for (const lang of languagesToProcess) {
        try {
          // Send one batch request per language
          const translatedTexts = await translateBatch(
            textsToTranslate,
            lang.code,
            provider,
            provider === 'lmstudio' ? lmStudioUrl : undefined
          );

          // Map results back to entries
          const langResults = entries.map((entry, index) => {
            const translated = translatedTexts[index];
            const risks = scanForRisks(entry.originalValue, translated, lang.code);
            return {
              ...entry,
              id: `${entry.id}-${lang.code}`, // Unique ID for React Key
              translatedValue: translated,
              risks,
              languageCode: lang.code
            };
          });

          allResults.push(...langResults);
        } catch (langError) {
          console.error(`Error processing language ${lang.code}`, langError);
          // Continue with other languages even if one fails
        }
      }

      setResults(allResults);

    } catch (error) {
      console.error("Processing failed", error);
      alert("An error occurred during processing.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTxt = async () => {
    if (!results.length || !originalMetadata) return;

    if (isMultiLang) {
      // Batch Download (ZIP)
      try {
        const zip = new JSZip();

        // Group by language
        const byLang = results.reduce((acc, curr) => {
          (acc[curr.languageCode] = acc[curr.languageCode] || []).push(curr);
          return acc;
        }, {} as Record<string, ProcessedEntry[]>);

        // Fix: Use Object.keys to avoid type inference issues with Object.entries returning unknown/{}
        for (const code of Object.keys(byLang)) {
          const entries = byLang[code];
          const content = serializeToTxt(entries, code, originalMetadata);
          zip.file(`localized_${code}.txt`, content);
        }

        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        triggerDownload(url, 'localized_batch.zip');

      } catch (e) {
        console.error("Zip generation failed", e);
        alert("Failed to generate ZIP file.");
      }
    } else {
      // Single File Download
      const langCode = results[0]?.languageCode || targetLang;
      const content = serializeToTxt(results, langCode, originalMetadata);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `localized_${langCode}.txt`);
    }
  };

  const handleDownloadCsv = () => {
    if (!results.length) return;
    const content = generateCsvReport(results);
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `risk_report_${isMultiLang ? 'batch' : targetLang}.csv`);
  };

  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Configuration & Input */}
          <div className="lg:col-span-4 space-y-6">

            {/* Config Card */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-accent-500 rounded-full"></span>
                Configuration
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Target Language</label>

                  {/* Mode selector tabs */}
                  <div className="flex gap-1 mb-3 bg-slate-800 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setSelectionMode('single')}
                      className={`flex-1 text-xs py-1.5 px-2 rounded-md transition-all font-medium ${selectionMode === 'single'
                        ? 'bg-accent-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      Single
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectionMode('custom')}
                      className={`flex-1 text-xs py-1.5 px-2 rounded-md transition-all font-medium ${selectionMode === 'custom'
                        ? 'bg-accent-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      Custom
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectionMode('all')}
                      className={`flex-1 text-xs py-1.5 px-2 rounded-md transition-all font-medium ${selectionMode === 'all'
                        ? 'bg-accent-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      All
                    </button>
                  </div>

                  {/* Single language dropdown */}
                  {selectionMode === 'single' && (
                    <div className="relative">
                      <select
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-accent-500 focus:border-accent-500 block p-2.5 appearance-none"
                      >
                        {TARGET_LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.label} [{lang.code}]
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                      </div>
                    </div>
                  )}

                  {/* Custom checkbox list */}
                  {selectionMode === 'custom' && (
                    <div ref={langPanelRef}>
                      {/* Summary bar */}
                      <div
                        className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg p-2.5 cursor-pointer flex items-center justify-between hover:border-slate-600 transition-colors"
                        onClick={() => setIsLangPanelOpen(!isLangPanelOpen)}
                      >
                        <span className={selectedLangs.size === 0 ? 'text-slate-500' : ''}>
                          {selectedLangs.size === 0
                            ? 'Select languages...'
                            : `${selectedLangs.size} language${selectedLangs.size > 1 ? 's' : ''} selected`}
                        </span>
                        <svg className={`fill-current h-4 w-4 text-slate-400 transition-transform ${isLangPanelOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                      </div>

                      {/* Dropdown checkbox panel */}
                      {isLangPanelOpen && (
                        <div className="mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                          {/* Select/Deselect all */}
                          <div className="flex items-center justify-between px-3 py-2 bg-slate-750 border-b border-slate-700">
                            <span className="text-xs text-slate-400 font-medium">Quick Actions</span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={selectAllLangs}
                                className="text-xs text-accent-400 hover:text-accent-300 transition-colors font-medium"
                              >
                                Select All
                              </button>
                              <span className="text-slate-600">|</span>
                              <button
                                type="button"
                                onClick={deselectAllLangs}
                                className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium"
                              >
                                Clear
                              </button>
                            </div>
                          </div>

                          {/* Language list */}
                          <div className="max-h-60 overflow-y-auto custom-scrollbar">
                            {TARGET_LANGUAGES.map((lang) => (
                              <label
                                key={lang.code}
                                className="flex items-center gap-3 px-3 py-2 hover:bg-slate-700/50 cursor-pointer transition-colors group"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedLangs.has(lang.code)}
                                  onChange={() => toggleLang(lang.code)}
                                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-accent-500 focus:ring-accent-500 focus:ring-offset-0 cursor-pointer"
                                />
                                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                  {lang.label}
                                  <span className="text-slate-500 ml-1">[{lang.code}]</span>
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Selected tags */}
                      {selectedLangs.size > 0 && !isLangPanelOpen && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {Array.from(selectedLangs).map(code => {
                            const lang = TARGET_LANGUAGES.find(l => l.code === code);
                            return (
                              <span
                                key={code}
                                className="inline-flex items-center gap-1 bg-accent-500/15 text-accent-400 text-xs px-2 py-0.5 rounded-md border border-accent-500/25"
                              >
                                {lang?.label || code}
                                <button
                                  type="button"
                                  onClick={() => toggleLang(code as string)}
                                  className="hover:text-white transition-colors ml-0.5"
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* All languages info */}
                  {selectionMode === 'all' && (
                    <div className="bg-accent-500/10 border border-accent-500/20 rounded-lg p-3">
                      <p className="text-sm text-accent-400">
                        ⚡ Batch mode: Translates to all <strong>{TARGET_LANGUAGES.length}</strong> supported languages.
                      </p>
                    </div>
                  )}

                  {selectionMode === 'custom' && selectedLangs.size > 0 && (
                    <p className="text-xs text-accent-400 mt-2">
                      * Will translate to {selectedLangs.size} selected language{selectedLangs.size > 1 ? 's' : ''}.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Translation Service</label>
                  <div className="relative">
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-accent-500 focus:border-accent-500 block p-2.5 appearance-none"
                    >
                      <option value="mock">Mock (Local Simulation)</option>
                      <option value="openai">OpenAI (Requires API Key)</option>
                      <option value="lmstudio">LM Studio (Local Host:1234)</option>
                      <option value="google">Google Translate</option>
                      <option value="deepl">DeepL</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                  </div>
                </div>

                {provider === 'lmstudio' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">LM Studio URL</label>
                    <input
                      type="text"
                      value={lmStudioUrl}
                      onChange={(e) => setLmStudioUrl(e.target.value)}
                      placeholder="http://localhost:1234/v1"
                      className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-accent-500 focus:border-accent-500 block p-2.5"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Standard local server URL. Ensure CORS is enabled if needed.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Input Card */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-accent-500 rounded-full"></span>
                Source Input
              </h2>
              <InputSection
                inputMode={inputMode}
                setInputMode={setInputMode}
                rawText={rawText}
                setRawText={setRawText}
                fileName={fileName}
                setFileName={setFileName}
              />

              <div className="mt-6">
                <Button
                  onClick={handleProcess}
                  isLoading={isProcessing}
                  className="w-full h-12 text-base shadow-accent-500/20"
                  icon={<Play className="fill-current" />}
                  disabled={!rawText.trim()}
                >
                  {isProcessing ? 'Processing Translation...' : 'Process Localization'}
                </Button>
              </div>
            </div>

            {/* Stats / Info */}
            {results.length > 0 && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-3">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 p-3 rounded border border-slate-800">
                    <div className="text-2xl font-bold text-white">{results.length}</div>
                    <div className="text-xs text-slate-500">Total Strings Processed</div>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded border border-slate-800">
                    <div className="text-2xl font-bold text-red-400">{results.filter(r => r.risks.length > 0).length}</div>
                    <div className="text-xs text-slate-500">Total Risks Detected</div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Output & Actions */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Results Output</h2>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={results.length === 0}
                  onClick={handleDownloadTxt}
                  icon={<FileDown />}
                  title={isMultiLang ? "Download ZIP" : "Download .txt"}
                >
                  {isMultiLang ? 'ZIP Archive' : 'TXT'}
                </Button>
                <Button
                  variant="outline"
                  disabled={results.length === 0}
                  onClick={handleDownloadCsv}
                  icon={<Download />}
                  title="Download .csv"
                >
                  CSV Report
                </Button>
              </div>
            </div>

            <ResultsTable entries={results} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;