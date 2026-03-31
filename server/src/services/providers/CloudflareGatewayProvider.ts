import { TranslationProvider } from '../../types';
import OpenAI from 'openai';

export class CloudflareGatewayProvider implements TranslationProvider {
    name = 'gptoss';
    private client: OpenAI;
    private model: string;

    constructor(gatewayUrl: string, apiKey: string, model: string = "workers-ai/@cf/openai/gpt-oss-120b") {
        this.client = new OpenAI({ 
            baseURL: gatewayUrl,
            apiKey: apiKey,
            // Cloudflare AI Gateway requires these settings
            defaultHeaders: {
                'cf-aig-token': apiKey,
            },
            timeout: 60000, // 60s timeout for large models
        });
        this.model = model;
        console.log(`[CloudflareGateway] Initialized with baseURL: ${gatewayUrl}, model: ${model}`);
    }

    async translate(texts: string[], targetLang: string, context?: string): Promise<string[]> {
        if (!texts.length) return [];

        let prompt = `Translate the following texts to ${targetLang}. Return a valid JSON array of strings and NOTHING ELSE. Maintain the original order.`;
        if (context && context.trim()) {
            prompt += `\n\nContext: ${context}`;
        }

        try {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    { role: "system", content: "You are a helpful translator. Your output must be purely valid JSON object or array." },
                    { role: "user", content: `${prompt}\n\n${JSON.stringify(texts)}` }
                ],
                // We don't enforce response_format here because some OSS models fail if response_format is provided
                // Instead, we prompted the model to only return valid JSON.
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error("No content received from Cloudflare Gateway Provider");

            // Robust JSON parsing in case model adds Markdown blocks
            let cleanedContent = content.trim();
            if (cleanedContent.startsWith('```json')) {
                cleanedContent = cleanedContent.replace(/^```json/, '').replace(/```$/, '').trim();
            } else if (cleanedContent.startsWith('```')) {
                cleanedContent = cleanedContent.replace(/^```/, '').replace(/```$/, '').trim();
            }

            const parsed = JSON.parse(cleanedContent);

            if (Array.isArray(parsed)) return parsed;
            if (parsed.translations && Array.isArray(parsed.translations)) return parsed.translations;
            return Object.values(parsed).flat() as string[];

        } catch (error: any) {
            // Log full error details for easier debugging
            console.error("[CloudflareGateway] Translation Error:", {
                message: error.message,
                status: error.status,
                code: error.code,
                type: error.type,
                cause: error.cause,
                stack: error.stack,
            });
            const errorMessage = error.message || error.cause?.message || "Unknown Cloudflare Gateway error";
            throw new Error(`GPT-OSS Error: ${errorMessage}`);
        }
    }
}
