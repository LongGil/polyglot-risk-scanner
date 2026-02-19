import { TranslationProvider } from '../../types';
import OpenAI from 'openai';

export class OpenAIProvider implements TranslationProvider {
    name = 'openai';
    private client: OpenAI;

    constructor(apiKey: string) {
        this.client = new OpenAI({ apiKey });
    }

    async translate(texts: string[], targetLang: string): Promise<string[]> {
        if (!texts.length) return [];

        const prompt = `Translate the following texts to ${targetLang}. Return a JSON array of strings. Maintain the original order.`;

        try {
            const response = await this.client.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful translator. You must return valid JSON." },
                    { role: "user", content: `${prompt}\n\n${JSON.stringify(texts)}` }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error("No content received from OpenAI");

            const parsed = JSON.parse(content);
            // Depending on how GPT returns it, it might be { "translations": [...] } or just [...]
            // We'll try to find an array in the object or use the object itself if it's an array

            if (Array.isArray(parsed)) return parsed;
            if (parsed.translations && Array.isArray(parsed.translations)) return parsed.translations;
            // Fallback: expect a key called "results" or similar, or just try Object.values
            return Object.values(parsed).flat() as string[];

        } catch (error: any) {
            console.error("OpenAI Translation Error:", error);
            const errorMessage = error.message || "Unknown OpenAI error";
            throw new Error(`OpenAI Error: ${errorMessage}`);
        }
    }
}
