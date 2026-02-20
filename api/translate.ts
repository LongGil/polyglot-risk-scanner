import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// ─── Types ────────────────────────────────────────────────────────────────────

type SupportedProvider = 'openai' | 'google' | 'deepl' | 'mock' | 'lmstudio';

// ─── Mock Provider ────────────────────────────────────────────────────────────

async function translateMock(texts: string[], targetLang: string): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return texts.map(text => `[MOCK-${targetLang}] ${text}`);
}

// ─── OpenAI Provider ─────────────────────────────────────────────────────────

async function translateOpenAI(
    texts: string[],
    targetLang: string,
    context?: string
): Promise<string[]> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Provider 'openai' is not configured (Missing OPENAI_API_KEY).");

    const client = new OpenAI({ apiKey });

    let prompt = `Translate the following texts to ${targetLang}. Return a JSON array of strings. Maintain the original order.`;
    if (context?.trim()) {
        prompt += `\n\nContext: ${context}`;
    }

    const response = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: 'You are a helpful translator. You must return valid JSON.' },
            { role: 'user', content: `${prompt}\n\n${JSON.stringify(texts)}` },
        ],
        response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No content received from OpenAI');

    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed;
    if (parsed.translations && Array.isArray(parsed.translations)) return parsed.translations;
    return Object.values(parsed).flat() as string[];
}

// ─── LM Studio Provider ───────────────────────────────────────────────────────
// LM Studio is a LOCAL application. It cannot be accessed from Vercel servers
// unless you expose it publicly (e.g. via ngrok, Cloudflare Tunnel, or a VPS).
// To use LM Studio:
//   - In Vercel: set LM_STUDIO_URL=https://your-public-lmstudio-url/v1
//   - In local dev (via Express server): set LM_STUDIO_URL=http://localhost:1234/v1

async function translateLMStudio(
    texts: string[],
    targetLang: string,
    customUrl?: string,
    context?: string
): Promise<string[]> {
    // Priority: customUrl (from UI) > LM_STUDIO_URL env var > localhost fallback
    const baseURL = customUrl?.trim() || process.env.LM_STUDIO_URL || 'http://localhost:1234/v1';

    // Validate that the URL is not a localhost URL when running on Vercel (serverless)
    const isVercel = !!process.env.VERCEL;
    const isLocalUrl = baseURL.includes('localhost') || baseURL.includes('127.0.0.1');
    if (isVercel && isLocalUrl) {
        throw new Error(
            'LM Studio URL is set to localhost, which cannot be reached from Vercel servers. ' +
            'Please provide a publicly accessible URL in the "Custom LM Studio URL" field ' +
            '(e.g. via ngrok: https://xxxx.ngrok-free.app/v1), ' +
            'or set LM_STUDIO_URL in your Vercel environment variables.'
        );
    }

    console.log(`[API] Connecting to LM Studio at: ${baseURL}`);

    const client = new OpenAI({ baseURL, apiKey: 'lm-studio' });

    let prompt = `You are a professional translator. Translate the following array of texts into ${targetLang}. 
Return ONLY a raw JSON array of strings. 
IMPORTANT: The output array MUST have exactly the same number of items as the input array.
Translate every single item, even if it looks like a symbol or code. Do not skip any items.
Do not include markdown formatting or keys like "translations".`;

    if (context?.trim()) {
        prompt += `\n\nContext for translation: ${context}`;
    }

    prompt += `\n\nSource Texts (${texts.length} items):\n${JSON.stringify(texts)}`;

    try {
        const response = await client.chat.completions.create({
            model: 'local-model',
            messages: [
                { role: 'system', content: 'You are a helpful translator. RESTRICTION: output strictly valid JSON array. Length MUST match input.' },
                { role: 'user', content: prompt },
            ],
            temperature: 0.1,
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error('No content received from LM Studio');

        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();

        let parsed;
        try {
            parsed = JSON.parse(cleanContent);
        } catch {
            throw new Error('Model failed to return valid JSON array.');
        }

        if (Array.isArray(parsed)) return parsed as string[];
        if (parsed.translations && Array.isArray(parsed.translations)) return parsed.translations;
        return Object.values(parsed).flat() as string[];

    } catch (error: any) {
        // Distinguish connection errors from other errors
        const msg: string = error?.message || '';
        const isConnectionError =
            msg.includes('ECONNREFUSED') ||
            msg.includes('ENOTFOUND') ||
            msg.includes('fetch failed') ||
            msg.includes('Connection error') ||
            msg.includes('connect') ||
            error?.cause?.code === 'ECONNREFUSED';

        if (isConnectionError) {
            throw new Error(
                `Cannot connect to LM Studio at "${baseURL}". ` +
                `Make sure LM Studio is running and the server is started. ` +
                (isVercel
                    ? 'On Vercel, use a publicly accessible URL (e.g. ngrok).'
                    : 'On local dev, ensure LM Studio is running on port 1234.')
            );
        }
        throw error;
    }
}

// ─── Google Provider ──────────────────────────────────────────────────────────

async function translateGoogle(texts: string[], targetLang: string): Promise<string[]> {
    throw new Error("Provider 'google' is not yet implemented.");
}

// ─── DeepL Provider ───────────────────────────────────────────────────────────

async function translateDeepL(texts: string[], targetLang: string): Promise<string[]> {
    throw new Error("Provider 'deepl' is not yet implemented.");
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { texts, targetLang, provider, customUrl, context } = req.body;

        if (!texts || !Array.isArray(texts)) {
            return res.status(400).json({ error: 'Invalid input: "texts" must be an array of strings.' });
        }

        if (!targetLang) {
            return res.status(400).json({ error: 'Invalid input: "targetLang" is required.' });
        }

        const selectedProvider: SupportedProvider = provider || 'mock';
        console.log(`[API] Translation request: ${texts.length} items to ${targetLang} via ${selectedProvider}`);

        let translated: string[];

        switch (selectedProvider) {
            case 'mock':
                translated = await translateMock(texts, targetLang);
                break;
            case 'openai':
                translated = await translateOpenAI(texts, targetLang, context);
                break;
            case 'lmstudio':
                translated = await translateLMStudio(texts, targetLang, customUrl, context);
                break;
            case 'google':
                translated = await translateGoogle(texts, targetLang);
                break;
            case 'deepl':
                translated = await translateDeepL(texts, targetLang);
                break;
            default:
                return res.status(400).json({ error: `Unknown provider: ${selectedProvider}` });
        }

        return res.status(200).json({ translations: translated });

    } catch (error: any) {
        console.error('[API] Translation error:', error.message);
        return res.status(500).json({
            error: 'Translation failed',
            details: error.message,
        });
    }
}
