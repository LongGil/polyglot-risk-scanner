import { TranslationProvider, SupportedProvider } from '../types';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { MockProvider } from './providers/MockProvider';
import { GoogleProvider } from './providers/GoogleProvider';
import { DeepLProvider } from './providers/DeepLProvider';
import { LMStudioProvider } from './providers/LMStudioProvider';

export class TranslationService {
    private providers: Map<string, TranslationProvider> = new Map();

    constructor() {
        this.initializeProviders();
    }

    private initializeProviders() {
        // Check for API Keys in environment variables
        const openAIKey = process.env.OPENAI_API_KEY;
        const googleKey = process.env.GOOGLE_API_KEY;
        const deepLKey = process.env.DEEPL_API_KEY;
        const lmStudioUrl = process.env.LM_STUDIO_URL || 'http://localhost:1234/v1';

        // Always register Mock
        this.providers.set('mock', new MockProvider());

        // Always register LM Studio (local)
        this.providers.set('lmstudio', new LMStudioProvider(lmStudioUrl));

        if (openAIKey) {
            this.providers.set('openai', new OpenAIProvider(openAIKey));
        }

        if (googleKey) {
            this.providers.set('google', new GoogleProvider(googleKey));
        }

        if (deepLKey) {
            this.providers.set('deepl', new DeepLProvider(deepLKey));
        }
    }

    public getProvider(name: SupportedProvider, options?: { customUrl?: string }): TranslationProvider {
        // dynamic override for lmstudio
        if (name === 'lmstudio' && options?.customUrl) {
            return new LMStudioProvider(options.customUrl);
        }

        const provider = this.providers.get(name);

        if (!provider) {
            // If requested provider is not configured (e.g. key missing), fall back to Mock?
            // Or throw error? Let's throw error to notify user on frontend.
            if (['openai', 'google', 'deepl'].includes(name) && !provider) {
                throw new Error(`Provider '${name}' is not configured (Missing API Key).`);
            }
            return this.providers.get('mock')!;
        }

        return provider;
    }
}
