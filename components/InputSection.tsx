import React, { useRef, useState } from 'react';
import { InputMode } from '../types';
import { FileText, Upload, X } from 'lucide-react';

interface InputSectionProps {
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  rawText: string;
  setRawText: (text: string) => void;
  fileName: string | null;
  setFileName: (name: string | null) => void;
}

const InputSection: React.FC<InputSectionProps> = ({
  inputMode,
  setInputMode,
  rawText,
  setRawText,
  fileName,
  setFileName
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | undefined) => {
    if (!file) return;
    
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = () => {
    setFileName(null);
    setRawText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg w-fit border border-slate-700">
        <button
          onClick={() => setInputMode('file')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            inputMode === 'file'
              ? 'bg-slate-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          File Upload
        </button>
        <button
          onClick={() => setInputMode('text')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            inputMode === 'text'
              ? 'bg-slate-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Direct Input
        </button>
      </div>

      <div className="relative group">
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-accent-600 to-indigo-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur`}></div>
        <div className="relative bg-slate-900 rounded-xl border border-slate-700 p-1">
          {inputMode === 'file' ? (
            <div
              className={`h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${
                isDragging
                  ? 'border-accent-500 bg-accent-500/5'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt"
                className="hidden"
              />
              
              {fileName ? (
                <div className="flex flex-col items-center gap-3">
                   <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-green-500" />
                   </div>
                   <div className="text-center">
                     <p className="text-white font-medium">{fileName}</p>
                     <p className="text-sm text-slate-400 mt-1">{(rawText.length / 1024).toFixed(2)} KB loaded</p>
                   </div>
                   <button 
                    onClick={removeFile}
                    className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 mt-2 hover:underline"
                   >
                     <X className="w-3 h-3" /> Remove File
                   </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-slate-200 font-medium text-lg">Drag & drop your .txt file here</p>
                    <p className="text-slate-500 text-sm mt-1">or click to browse</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm transition-colors"
                  >
                    Select File
                  </button>
                </div>
              )}
            </div>
          ) : (
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste your localization text here...&#10;[StringKey] KEY_NAME&#10;[Value] Value text"
              className="w-full h-64 bg-slate-800/50 text-slate-200 p-4 rounded-lg focus:outline-none focus:ring-0 resize-none font-mono text-sm leading-relaxed"
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InputSection;