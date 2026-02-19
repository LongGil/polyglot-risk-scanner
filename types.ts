export interface LocalizationEntry {
  id: string; // Unique ID for React keys
  stringKey: string;
  originalValue: string;
  tableId?: string;
}

export interface ProcessedEntry extends LocalizationEntry {
  translatedValue: string;
  risks: RiskWarning[];
  languageCode: string;
}

export interface RiskWarning {
  type: 'RTL_ALERT' | 'CJK_FONT_ALERT' | 'UI_EXPANSION_RISK' | 'CULTURAL_ERROR' | 'FORMATTING_ERROR' | 'INFO';
  message: string;
}

export type InputMode = 'file' | 'text';

export interface LanguageOption {
  label: string;
  code: string;
}

export interface ParseResult {
  entries: LocalizationEntry[];
  metadata: {
    languageId?: string;
    tableId?: string;
    rawHeader?: string[]; // Preserve other headers
  };
}