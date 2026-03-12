import React, { useState } from 'react';
import { X, Settings2 } from 'lucide-react';

interface SettingsDialogProps {
    onClose: () => void;
    // Provider Settings
    provider: string;
    setProvider: (val: string) => void;
    lmStudioUrl: string;
    setLmStudioUrl: (val: string) => void;
    apiKey: string;
    setApiKey: (val: string) => void;
    // Batch Settings
    batchSize: number;
    setBatchSize: (val: number) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
    onClose,
    provider,
    setProvider,
    lmStudioUrl,
    setLmStudioUrl,
    apiKey,
    setApiKey,
    batchSize,
    setBatchSize,
}) => {
    const [showApiKey, setShowApiKey] = useState<boolean>(false);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-accent-500" />
                        <h2 className="text-lg font-semibold text-white">Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    {/* Translation Service */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Translation Service</label>
                        <div className="relative">
                            <select
                                value={provider}
                                onChange={(e) => setProvider(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-accent-500 focus:border-accent-500 block p-2.5 appearance-none shadow-sm"
                            >
                                <option value="mock">Mock (Local Simulation)</option>
                                <option value="openai">OpenAI (Requires API Key)</option>
                                <option value="lmstudio">LM Studio (Local Host:1234)</option>
                                <option value="google">Google (Gemini)</option>
                                <option value="deepl">DeepL</option>
                                <option value="longgilstudio">LongGilStudio</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Custom URL */}
                    {provider === 'lmstudio' && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                LM Studio URL
                            </label>
                            <input
                                type="text"
                                value={lmStudioUrl}
                                onChange={(e) => setLmStudioUrl(e.target.value)}
                                placeholder="http://localhost:1234/v1"
                                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-accent-500 focus:border-accent-500 block p-2.5 shadow-sm"
                            />
                            <p className="text-xs text-slate-500 mt-1.5">
                                Standard local server URL. Ensure CORS is enabled if needed.
                            </p>
                        </div>
                    )}

                    {/* API Key */}
                    {['openai', 'google', 'deepl'].includes(provider) && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                API Key
                                <span className="ml-1 text-slate-500 font-normal">(optional, use your own when server is busy)</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showApiKey ? 'text' : 'password'}
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder={provider === 'openai' ? 'sk-...' : provider === 'deepl' ? 'xxxxxxxx-xxxx-...' : 'AIzaSy...'}
                                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-accent-500 focus:border-accent-500 block p-2.5 pr-10 shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowApiKey(v => !v)}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-white transition-colors"
                                    title={showApiKey ? 'Hide key' : 'Show key'}
                                >
                                    {showApiKey ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-1.5">
                                Used directly from your browser and never stored.
                            </p>
                        </div>
                    )}

                    {/* Batch Size */}
                    <div className="pt-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Batch Size</label>
                        <div className="flex gap-1.5 mb-2 bg-slate-800 rounded-lg p-1.5 shadow-inner">
                            {[1, 10, 50, 0].map((size) => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setBatchSize(size)}
                                    className={`flex-1 text-xs py-2 px-2 rounded-md transition-all font-medium ${batchSize === size
                                        ? 'bg-accent-600 text-white shadow-md transform scale-[1.02]'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                        }`}
                                >
                                    {size === 0 ? 'All' : size}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 min-h-[16px]">
                            {batchSize === 1 && '🐌 Slowest, most reliable (Sequential).'}
                            {batchSize === 10 && '⚖️ Balanced reliability & speed.'}
                            {batchSize === 50 && '⚡ Standard batch speed.'}
                            {batchSize === 0 && '🚀 Fastest. Warning: May hit token limits.'}
                        </p>
                    </div>

                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-white bg-accent-600 hover:bg-accent-500 rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                        Save & Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsDialog;
