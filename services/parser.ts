import { LocalizationEntry, ParseResult, ProcessedEntry } from '../types';

/**
 * Parses the custom TXT format.
 * Format assumptions:
 * - [Tag] Value
 * - Lines starting with * are comments
 * - [StringKey] starts a new entry
 * - [Value] follows [StringKey]
 */
// Fallback UUID generator for non-secure contexts
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const parseCustomTxt = (content: string): ParseResult => {
  const lines = content.split(/\r?\n/);
  const entries: LocalizationEntry[] = [];
  const metadata: ParseResult['metadata'] = {
    rawHeader: []
  };

  let currentEntry: Partial<LocalizationEntry> = {};
  let currentTableId = '';

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (trimmed.startsWith('*')) return; // Ignore comments

    // Regex to capture [Tag] Value
    // Matches "[Tag] Value" or "[Tag]Value"
    const match = trimmed.match(/^\[(.*?)]\s*(.*)$/);

    if (match) {
      const tag = match[1];
      const value = match[2];

      switch (tag) {
        case 'LanguageID':
          metadata.languageId = value;
          break;
        case 'TableID':
          currentTableId = value;
          metadata.tableId = value;
          break;
        case 'StringKey':
          // If we were building an entry and hit a new key, save the previous one if complete
          // (Though typically [Value] comes after [StringKey], so we save on the next Key or End)
          if (currentEntry.stringKey && currentEntry.originalValue !== undefined) {
            // Push previous
            entries.push({
              id: generateUUID(),
              stringKey: currentEntry.stringKey,
              originalValue: currentEntry.originalValue,
              tableId: currentEntry.tableId || currentTableId
            });
            currentEntry = {};
          }

          currentEntry.stringKey = value;
          currentEntry.tableId = currentTableId;
          break;
        case 'Value':
          if (currentEntry.stringKey) {
            currentEntry.originalValue = value;
          }
          break;
        default:
          metadata.rawHeader?.push(line);
          break;
      }
    }
  });

  // Push the last entry if valid
  if (currentEntry.stringKey && currentEntry.originalValue !== undefined) {
    entries.push({
      id: generateUUID(),
      stringKey: currentEntry.stringKey,
      originalValue: currentEntry.originalValue,
      tableId: currentEntry.tableId || currentTableId
    });
  }

  return { entries, metadata };
};

export const serializeToTxt = (entries: ProcessedEntry[], targetLang: string, originalMetadata: ParseResult['metadata']): string => {
  let output = '';

  // Reconstruct Header
  output += `[LanguageID] ${targetLang}\n`;
  if (originalMetadata.tableId) {
    output += `[TableID] ${originalMetadata.tableId}\n`;
  }

  // Add entries
  entries.forEach(entry => {
    output += `\n[StringKey] ${entry.stringKey}\n`;

    // Remove the mock translation prefix [Code] if present, to keep the file clean
    let valueToWrite = entry.translatedValue;
    const prefix = `[${targetLang}] `;
    if (valueToWrite.startsWith(prefix)) {
      valueToWrite = valueToWrite.slice(prefix.length);
    }

    output += `[Value] ${valueToWrite}\n`;
  });

  return output;
};