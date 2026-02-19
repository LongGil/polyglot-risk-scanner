import { TranslationProvider } from '../../types';
import OpenAI from 'openai';

export class LMStudioProvider implements TranslationProvider {
    name = 'lmstudio';
    private client: OpenAI;

    constructor(baseUrl: string = 'http://localhost:1234/v1') {
        this.client = new OpenAI({
            baseURL: baseUrl,
            apiKey: 'lm-studio', // LM Studio often accepts any key, but we pass one just in case
        });
    }

    async translate(texts: string[], targetLang: string, context?: string): Promise<string[]> {
        if (!texts.length) return [];

        // LM Studio models might vary in their ability to handle JSON mode.
        // We will try a structured prompt first.
        let prompt = `You are a professional translator. Translate the following array of texts into ${targetLang}. 
    Return ONLY a raw JSON array of strings. 
    IMPORTANT: The output array MUST have exactly the same number of items as the input array.
    Translate every single item, even if it looks like a symbol or code. Do not skip any items.
    Do not include markdown formatting or keys like "translations".`;

        if (context && context.trim()) {
            prompt += `\n\nContext for translation: ${context}`;
        }

        prompt += `\n\nSource Texts (${texts.length} items):
    ${JSON.stringify(texts)}`;

        try {
            const response = await this.client.chat.completions.create({
                model: "local-model", // LM Studio ignores this usually, uses loaded model
                messages: [
                    { role: "system", content: "You are a helpful translator. RESTRICTION: output strictly valid JSON array. Length MUST match input." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.1,
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error("No content received from LM Studio");

            // Attempt to clean markdown if present (e.g. ```json ... ```)
            const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();

            let parsed;
            try {
                parsed = JSON.parse(cleanContent);
            } catch (e) {
                console.error("Failed to parse LM Studio JSON:", cleanContent);
                // Fallback: splitting by newlines or returning raw mock-like if parsing fails?
                // For now, throw error to let user know model failed to output JSON
                throw new Error("Model failed to return valid JSON array.");
            }

            if (Array.isArray(parsed)) return parsed as string[];
            // If object with 'translations' key
            if (parsed.translations && Array.isArray(parsed.translations)) return parsed.translations;

            return Object.values(parsed).flat() as string[];

        } catch (error) {
            console.error("LM Studio Translation Error:", error);
            throw new Error("Failed to translate with LM Studio. Ensure it is running and server is on.");
        }
    }
}
