import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TranslationService } from '../server/src/services/translation';

let translationService: TranslationService | null = null;

function getTranslationService(): TranslationService {
    if (!translationService) {
        translationService = new TranslationService();
    }
    return translationService;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
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

        const selectedProvider = provider || 'mock';

        console.log(`[API] Translation request: ${texts.length} items to ${targetLang} via ${selectedProvider}`);

        const service = getTranslationService();
        const translator = service.getProvider(selectedProvider, { customUrl });
        const translated = await translator.translate(texts, targetLang, context);

        return res.status(200).json({ translations: translated });

    } catch (error: any) {
        console.error('[API] Translation error:', error.message);
        return res.status(500).json({
            error: 'Translation failed',
            details: error.message
        });
    }
}
