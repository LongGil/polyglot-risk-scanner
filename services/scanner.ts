import { RiskWarning, ProcessedEntry } from '../types';

export const scanForRisks = (original: string, translated: string, targetLang: string): RiskWarning[] => {
  const risks: RiskWarning[] = [];

  // 1. Right-to-Left Check
  if (targetLang === 'ar-SA') {
    risks.push({
      type: 'RTL_ALERT',
      message: '[RTL_ALERT] UI needs Right-to-Left flipping.'
    });
  }

  // 2. CJK Font Check
  const cjkLangs = ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'];
  if (cjkLangs.includes(targetLang)) {
    risks.push({
      type: 'CJK_FONT_ALERT',
      message: '[CJK_FONT_ALERT] Requires separate Fallback Font.'
    });
  }

  // 3. Expansion Risk
  // We check if translated length > original length * 1.3
  // Avoid division by zero or tiny strings noise
  if (original.length > 0 && translated.length > original.length * 1.3) {
    risks.push({
      type: 'UI_EXPANSION_RISK',
      message: `[UI_EXPANSION_RISK] Text is >30% longer (${translated.length} vs ${original.length}), check UI clipping.`
    });
  }

  return risks;
};

export const generateCsvReport = (entries: ProcessedEntry[]): string => {
  const header = ['Language', 'StringKey', 'Original Text', 'Translated Text', 'Risk Warnings'];
  const rows = entries.map(entry => {
    const riskMessages = entry.risks.map(r => r.message).join(' | ');
    // Escape quotes for CSV
    const escape = (str: string) => `"${str.replace(/"/g, '""')}"`;
    return [
      escape(entry.languageCode),
      escape(entry.stringKey),
      escape(entry.originalValue),
      escape(entry.translatedValue),
      escape(riskMessages)
    ].join(',');
  });

  return [header.join(','), ...rows].join('\n');
};