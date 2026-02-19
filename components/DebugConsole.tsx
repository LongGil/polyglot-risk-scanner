import React, { useState, useEffect, useRef } from 'react';
import { Terminal, XCircle, AlertTriangle, Info, ChevronDown, ChevronUp, Trash2, X } from 'lucide-react';

export type LogType = 'log' | 'warn' | 'error';

export interface LogEntry {
    id: string;
    timestamp: string;
    type: LogType;
    message: string;
    details?: any[];
}

const DebugConsole: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [hasNewError, setHasNewError] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of logs
    useEffect(() => {
        if (isOpen && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, isOpen]);

    // Intercept console methods
    useEffect(() => {
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        const addLog = (type: LogType, args: any[]) => {
            const message = args.map(arg => {
                // 1. Handle standard Error objects
                if (arg instanceof Error) {
                    return `${arg.name}: ${arg.message}`;
                }

                // 2. Handle objects (check for error-like structure or JSON)
                if (typeof arg === 'object' && arg !== null) {
                    // Check if it looks like an error (has message attribute)
                    if (typeof arg.message === 'string') {
                        return `${arg.name || 'Error'}: ${arg.message}`;
                    }

                    try {
                        return JSON.stringify(arg, null, 2);
                    } catch (e) {
                        return '[Circular Object]';
                    }
                }

                // 3. Primitives
                return String(arg);
            }).join(' ');

            const newLog: LogEntry = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toLocaleTimeString(),
                type,
                message,
                details: args
            };

            setLogs(prev => {
                const next = [...prev, newLog];
                if (next.length > 100) next.shift(); // Keep last 100
                return next;
            });

            if (type === 'error') {
                setHasNewError(true);
                setIsOpen(true); // Auto-open on error
            }
        };

        console.log = (...args) => {
            originalLog(...args);
            addLog('log', args);
        };

        console.warn = (...args) => {
            originalWarn(...args);
            addLog('warn', args);
        };

        console.error = (...args) => {
            originalError(...args);
            addLog('error', args);
        };

        // Global error handler for uncaught exceptions
        const handleGlobalError = (event: ErrorEvent) => {
            addLog('error', [event.message]);
        };

        // Promise rejection handler
        const handleRejection = (event: PromiseRejectionEvent) => {
            addLog('error', ['Unhandled Promise Rejection:', event.reason]);
        };

        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleRejection);

        return () => {
            console.log = originalLog;
            console.warn = originalWarn;
            console.error = originalError;
            window.removeEventListener('error', handleGlobalError);
            window.removeEventListener('unhandledrejection', handleRejection);
        };
    }, []);

    const clearLogs = () => {
        setLogs([]);
        setHasNewError(false);
    };

    const getIcon = (type: LogType) => {
        switch (type) {
            case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'warn': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            default: return <Info className="w-4 h-4 text-blue-400" />;
        }
    };

    const getBgColor = (type: LogType) => {
        switch (type) {
            case 'error': return 'bg-red-500/10 border-red-500/20';
            case 'warn': return 'bg-amber-500/10 border-amber-500/20';
            default: return 'hover:bg-slate-800/50 border-transparent';
        }
    };

    return (
        <div className={`fixed bottom-4 right-4 z-[100] transition-all duration-300 flex flex-col items-end ${isOpen ? 'w-[92vw] sm:w-[500px] md:w-[600px]' : 'w-auto'}`}>

            {/* Trigger Button (when closed) */}
            {!isOpen && (
                <button
                    onClick={() => { setIsOpen(true); setHasNewError(false); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg border backdrop-blur-md transition-all ${hasNewError
                        ? 'bg-red-500/90 text-white border-red-400 animate-pulse'
                        : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white'
                        }`}
                >
                    <Terminal className="w-4 h-4" />
                    <span className="font-mono text-sm font-medium">Console</span>
                    {logs.length > 0 && (
                        <span className="bg-slate-800 text-xs px-1.5 py-0.5 rounded-full ml-1">
                            {logs.length}
                        </span>
                    )}
                </button>
            )}

            {/* Main Window (when open) */}
            {isOpen && (
                <div className="w-full bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[50vh] sm:h-[400px] max-h-[80vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-accent-500" />
                            <span className="text-sm font-medium text-slate-200">Debug Console</span>
                            <span className="text-xs text-slate-500">
                                {logs.length} events
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={clearLogs}
                                title="Clear Console"
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                title="Minimize"
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Logs Area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs custom-scrollbar"
                    >
                        {logs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                                <Terminal className="w-8 h-8 opacity-20" />
                                <p>No logs recorded yet...</p>
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div
                                    key={log.id}
                                    className={`p-2 rounded border flex gap-2 items-start ${getBgColor(log.type)}`}
                                >
                                    <span className="mt-0.5 shrink-0">{getIcon(log.type)}</span>
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                        <div className="flex items-baseline gap-2 mb-0.5">
                                            <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                                        </div>
                                        <pre className="whitespace-pre-wrap break-words text-slate-300">
                                            {log.message}
                                        </pre>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DebugConsole;
