import { LanguageOption } from './types';

export const TARGET_LANGUAGES: LanguageOption[] = [
  { label: 'English (US)', code: 'en-US' },
  { label: 'English (UK)', code: 'en-GB' },
  { label: 'Deutsch', code: 'de-DE' },
  { label: 'Français', code: 'fr-FR' },
  { label: 'Español (España)', code: 'es-ES' },
  { label: 'Español (LatAm)', code: 'es-419' },
  { label: 'Português (Brasil)', code: 'pt-BR' },
  { label: 'Português (Portugal)', code: 'pt-PT' },
  { label: 'Русский', code: 'ru-RU' },
  { label: 'Polski', code: 'pl-PL' },
  { label: 'Türkçe', code: 'tr-TR' },
  { label: 'Italiano', code: 'it-IT' },
  { label: 'Tiếng Việt', code: 'vi-VN' },
  { label: '中文 (简体)', code: 'zh-CN' },
  { label: '中文 (繁体)', code: 'zh-TW' },
  { label: '日本語', code: 'ja-JP' },
  { label: '한국어', code: 'ko-KR' },
  { label: 'العربية', code: 'ar-SA' },
];

export const MOCK_INITIAL_TEXT = `[LanguageID] en-US
[TableID] HUD_Main

* Common Actions
[StringKey] BTN_ACCEPT
[Value] Accept
[StringKey] BTN_CANCEL
[Value] Cancel

* Inventory Strings
[StringKey] ITEM_SWORD_DESC
[Value] A sharp blade forged in the depths of the mountain.
[StringKey] ITEM_POTION_HEAL
[Value] Restores 50 HP.
`;