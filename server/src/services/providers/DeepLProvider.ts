import { TranslationProvider } from '../../types';
import axios from 'axios';

export class DeepLProvider implements TranslationProvider {
    name = 'deepl';
    private apiKey: string;
    private apiUrl: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey.trim();
        this.apiUrl = this.apiKey.endsWith(':fx')
            ? 'https://api-free.deepl.com/v2/translate'
            : 'https://api.deepl.com/v2/translate';
    }

    private getDeepLTargetLang(targetLang: string): string {
        const lang = targetLang.toUpperCase();
        if (lang.startsWith('EN')) {
            return lang === 'EN-GB' ? 'EN-GB' : 'EN-US';
        }
        if (lang.startsWith('PT')) {
            return lang === 'PT-BR' ? 'PT-BR' : 'PT-PT';
        }
        return lang.split('-')[0];
    }

    async translate(texts: string[], targetLang: string, context?: string): Promise<string[]> {
        if (!this.apiKey) {
            throw new Error("DeepL API Key is required. Please check your .env file or settings.");
        }
        if (!texts.length) return [];

        try {
            const data: any = {
                text: texts,
                target_lang: this.getDeepLTargetLang(targetLang),
            };

            if (context && context.trim()) {
                data.context = context.trim();
            }

            const response = await axios.post(
                this.apiUrl,
                data,
                {
                    headers: {
                        'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.data || !response.data.translations) {
                throw new Error('Invalid response from DeepL');
            }

            return response.data.translations.map((t: any) => t.text);
        } catch (error: any) {
            console.error("DeepL Translation Error:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || error.message || "Unknown DeepL error";
            throw new Error(`DeepL Error: ${errorMessage}`);
        }
    }
}
