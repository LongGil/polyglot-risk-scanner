import { TranslationProvider } from '../../types';
import axios from 'axios';

export class GoogleProvider implements TranslationProvider {
    name = 'google';
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async translate(texts: string[], targetLang: string, context?: string): Promise<string[]> {
        if (!texts.length) return [];

        let prompt = `Translate the following texts to ${targetLang}. Return ONLY a JSON array of strings containing the translations, in the exact same order as the input. Do not include markdown formatting or backticks around the JSON array.`;
        if (context && context.trim()) {
            prompt += `\n\nContext: ${context}`;
        }

        prompt += `\n\nInput texts:\n${JSON.stringify(texts)}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${this.apiKey}`;

        try {
            const response = await axios.post(url, {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1
                }
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textResponse) throw new Error("No content received from Gemini");

            // Clean up backticks if Gemini added them
            const cleanText = textResponse.replace(/^```json\n/, '').replace(/\n```$/, '').replace(/^```\n/, '').trim();
            const parsed = JSON.parse(cleanText);

            if (Array.isArray(parsed)) return parsed;
            if (parsed.translations && Array.isArray(parsed.translations)) return parsed.translations;
            return Object.values(parsed).flat() as string[];

        } catch (error: any) {
            console.error("Gemini Translation Error:", error);
            const errorMessage = error.response?.data?.error?.message || error.message || "Unknown Gemini error";
            throw new Error(`Gemini Error: ${errorMessage}`);
        }
    }
}
