export interface TranslationProvider {
    name: string;
    translate(texts: string[], targetLang: string): Promise<string[]>;
}

export type SupportedProvider = 'openai' | 'google' | 'deepl' | 'mock' | 'lmstudio';
