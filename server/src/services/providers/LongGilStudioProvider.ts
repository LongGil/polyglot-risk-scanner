import axios from 'axios';
import { TranslationProvider } from '../../types';

export class LongGilStudioProvider implements TranslationProvider {
    name = 'longgilstudio';
    private workerUrl: string;
    private token?: string;

    constructor(workerUrl: string, token?: string) {
        this.workerUrl = workerUrl;
        this.token = token;
    }

    async translate(texts: string[], targetLang: string, context?: string): Promise<string[]> {
        if (!texts.length) return [];
        
        try {
            const promises = texts.map(async (text) => {
                const response = await axios.post(
                    this.workerUrl,
                    {
                        text: text,
                        target_lang: targetLang,
                        context: context || ""
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${this.token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.data || typeof response.data.translated !== 'string') {
                    throw new Error('Invalid response from LongGilStudio Worker');
                }
                return response.data.translated;
            });

            return await Promise.all(promises);
        } catch (error: any) {
            console.error("LongGilStudio Translation Error:", error.response?.data || error.message);
            const data = error.response?.data;
            const errorMessage = data?.details || data?.error || error.message || "Unknown error from Worker";
            throw new Error(`LongGilStudio Error: ${errorMessage}`);
        }
    }
}
