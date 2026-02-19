import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { TranslationService } from './services/translation';
import { SupportedProvider } from './types';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Debug Middleware: Log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Serve static files from the frontend app build directory
import path from 'path';
const clientBuildPath = path.join(__dirname, '../../dist');
app.use(express.static(clientBuildPath));

const translationService = new TranslationService();

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Translate Endpoint
app.post('/api/translate', async (req: Request, res: Response) => {
    try {
        const { texts, targetLang, provider, customUrl } = req.body;

        if (!texts || !Array.isArray(texts)) {
            return res.status(400).json({ error: 'Invalid input: "texts" must be an array of strings.' });
        }

        if (!targetLang) {
            return res.status(400).json({ error: 'Invalid input: "targetLang" is required.' });
        }

        const selectedProvider = (provider as SupportedProvider) || 'mock';

        console.log(`Received translation request: ${texts.length} items to ${targetLang} via ${selectedProvider}`);

        const translator = translationService.getProvider(selectedProvider, { customUrl });
        const translated = await translator.translate(texts, targetLang);

        res.json({ translations: translated });

    } catch (error: any) {
        console.error('Translation error:', error.message);
        res.status(500).json({
            error: 'Translation failed',
            details: error.message
        });
    }
});


if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

export default app;
