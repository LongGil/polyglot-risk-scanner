import { RiskWarning, ProcessedEntry } from '../types';

interface RiskProfile {
  // Expansion ratio limits (Translated / Original)
  minExpansion?: number;
  maxExpansion?: number;
  // Terms that might indicate compliance issues (in English or target)
  sensitiveTerms?: string[];
  // Regex to detect formatting issues
  formattingChecks?: { regex: RegExp; message: string }[];
}

const RISK_PROFILES: Record<string, RiskProfile> = {
  // Germanic
  'de-DE': { maxExpansion: 1.35 },

  // Romance (High expansion)
  'fr-FR': { maxExpansion: 1.25 },
  'it-IT': { maxExpansion: 1.3 },
  'es-ES': { maxExpansion: 1.3 },
  'es-MX': { maxExpansion: 1.3 },
  'pt-BR': { maxExpansion: 1.3 },
  'pt-PT': { maxExpansion: 1.3 },

  // Slavic (High expansion + declension risks)
  'ru-RU': {
    maxExpansion: 1.3,
    sensitiveTerms: ['gay', 'lesbian', 'queer', 'lgbt', 'rainbow'] // Propaganda laws
  },
  'pl-PL': { maxExpansion: 1.3 },

  // Turkish (Agglutination, Dotted I, Religion)
  'tr-TR': {
    maxExpansion: 1.3,
    sensitiveTerms: ['god', 'allah', 'mosque', 'pork', 'pig', 'wine'],
    formattingChecks: [
      { regex: /\d+\s+\w+s\b/i, message: 'Turkish: Do not pluralize nouns after numbers (e.g., "3 lives" -> "3 can").' }
    ]
  },

  // Arabic (RTL, Religion)
  'ar-SA': {
    maxExpansion: 1.25,
    sensitiveTerms: ['alcohol', 'wine', 'beer', 'pork', 'pig', 'god', 'prophet', 'gamble', 'bet']
  },

  // Vietnamese (Diacritics vertical space)
  'vi-VN': {
    maxExpansion: 1.2,
    formattingChecks: [
      { regex: /[A-ZÀ-Ỹ]/, message: 'Vietnamese: Ensure UI line-height supports stacked diacritics (e.g., ệ, ộ).' }
    ]
  },

  // CJK (Contraction, but specific censorship for CN)
  'zh-CN': {
    maxExpansion: 1.0, // Should strictly NOT expand much, usually contracts
    sensitiveTerms: ['kill', 'death', 'blood', 'skeleton', 'skull', 'corpse', 'ghost'] // High censorship
  },
  'zh-TW': { maxExpansion: 1.0 },
  'ja-JP': { maxExpansion: 1.0 },
  'ko-KR': { maxExpansion: 1.0 },
};

export const scanForRisks = (original: string, translated: string, targetLang: string): RiskWarning[] => {
  const risks: RiskWarning[] = [];
  const profile = RISK_PROFILES[targetLang];

  if (!original || !translated) return risks;

  const lenRatio = translated.length / Math.max(1, original.length);

  // 1. Expansion / Contraction Check
  if (profile?.maxExpansion && original.length > 5) {
    if (lenRatio > profile.maxExpansion) {
      risks.push({
        type: 'UI_EXPANSION_RISK',
        message: `[EXPANSION] Text expanded by ${Math.round((lenRatio - 1) * 100)}% (Limit: ${Math.round((profile.maxExpansion - 1) * 100)}%). Check UI bounds.`
      });
    }
  }

  // 2. Cultural & Compliance Check
  if (profile?.sensitiveTerms) {
    const combinedText = (original + ' ' + translated).toLowerCase();
    const foundTerms = profile.sensitiveTerms.filter(term => combinedText.includes(term));
    if (foundTerms.length > 0) {
      risks.push({
        type: 'CULTURAL_ERROR',
        message: `[CULTURAL] Contains sensitive term(s): "${foundTerms.join(', ')}". Verify compliance for ${targetLang}.`
      });
    }
  }

  // 3. Formatting & Logic Check (Profile specific)
  if (profile?.formattingChecks) {
    profile.formattingChecks.forEach(check => {
      if (check.regex.test(original) || check.regex.test(translated)) {
        risks.push({
          type: 'FORMATTING_ERROR',
          message: `[FORMATTING] ${check.message}`
        });
      }
    });
  }

  // 4. General Formatting Checks (All langs)
  // Detect concatenation patterns: ending with " " or string + var
  if (/['"]\s*\+\s*\w/.test(original) || /\w\s*\+\s*['"]/.test(original)) {
    risks.push({
      type: 'FORMATTING_ERROR',
      message: '[CONCATENATION] String concatenation detected. Use ICU patterns to handle grammar/declension.'
    });
  }

  // 5. RTL Check
  if (targetLang.startsWith('ar')) {
    risks.push({
      type: 'RTL_ALERT',
      message: '[RTL] Ensure UI mirroring (Right-to-Left) and neutral icons.'
    });
  }

  // 6. CJK Font Check
  if (['zh', 'ja', 'ko'].some(l => targetLang.startsWith(l))) {
    risks.push({
      type: 'CJK_FONT_ALERT',
      message: '[FONT] Use distinct fonts to avoid "Han Unification" errors (e.g., different glyphs for same code point).'
    });
  }

  return risks;
};

export const generateCsvReport = (entries: ProcessedEntry[]): string => {
  const header = ['Language', 'StringKey', 'Original Text', 'Translated Text', 'Risk Type', 'Risk Message'];
  const rows = entries.flatMap(entry => {
    if (entry.risks.length === 0) {
      const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
      return [[
        escape(entry.languageCode),
        escape(entry.stringKey),
        escape(entry.originalValue),
        escape(entry.translatedValue),
        'PASS',
        ''
      ].join(',')];
    }

    return entry.risks.map(risk => {
      const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
      return [
        escape(entry.languageCode),
        escape(entry.stringKey),
        escape(entry.originalValue),
        escape(entry.translatedValue),
        escape(risk.type),
        escape(risk.message)
      ].join(',');
    });
  });

  return [header.join(','), ...rows].join('\n');
};