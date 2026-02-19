export interface TranslationProvider {
    name: string;
    translate(texts: string[], targetLang: string, context?: string): Promise<string[]>;
}

export type SupportedProvider = 'openai' | 'google' | 'deepl' | 'mock' | 'lmstudio';
