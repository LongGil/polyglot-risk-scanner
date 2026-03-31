import { TranslationProvider, SupportedProvider } from '../types';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { MockProvider } from './providers/MockProvider';
import { GoogleProvider } from './providers/GoogleProvider';
import { DeepLProvider } from './providers/DeepLProvider';
import { LMStudioProvider } from './providers/LMStudioProvider';
import { LongGilStudioProvider } from './providers/LongGilStudioProvider';
import { CloudflareGatewayProvider } from './providers/CloudflareGatewayProvider';

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

        const longGilStudioUrl = process.env.LONGGILSTUDIO_URL?.replace(/"/g, '').trim();
        const longGilStudioSecret = process.env.LOCALIZATION_SECRET?.replace(/"/g, '').trim();
        if (longGilStudioUrl && longGilStudioSecret) {
            this.providers.set('longgilstudio', new LongGilStudioProvider(longGilStudioUrl, longGilStudioSecret));
        }

        const cloudflareGatewayUrl = process.env.CLOUDFLARE_GATEWAY_URL;
        const cloudflareApiKey = process.env.CLOUDFLARE_API_KEY;
        if (cloudflareGatewayUrl && cloudflareApiKey) {
            this.providers.set('gptoss', new CloudflareGatewayProvider(cloudflareGatewayUrl, cloudflareApiKey));
        }
    }

    public getProvider(name: SupportedProvider, options?: { customUrl?: string, apiKey?: string }): TranslationProvider {

        // ── LM Studio ──────────────────────────────────────────────────────────
        // Override with user-provided URL if given; otherwise use env-registered provider
        if (name === 'lmstudio') {
            const lmUrl = options?.customUrl?.trim();
            return lmUrl ? new LMStudioProvider(lmUrl) : this.providers.get('lmstudio')!;
        }

        // ── Standard cloud providers (Google / OpenAI / DeepL) ─────────────────
        // Override with user-provided API key if given
        const dynamicApiKey = options?.apiKey?.trim();
        if (dynamicApiKey) {
            if (name === 'google') return new GoogleProvider(dynamicApiKey);
            if (name === 'openai') return new OpenAIProvider(dynamicApiKey);
            if (name === 'deepl') return new DeepLProvider(dynamicApiKey);
        }

        // ── GPT-OSS 120B (Cloudflare AI Gateway) ───────────────────────────────
        // ONLY use user credentials when BOTH a custom URL and API Key are provided.
        // Any partial input (only URL, only key, or neither) → use env-registered provider.
        if (name === 'gptoss') {
            const cfUrl = options?.customUrl?.trim();
            const cfKey = options?.apiKey?.trim();
            if (cfUrl && cfKey) {
                console.log(`[CloudflareGateway] User override — URL: ${cfUrl}`);
                return new CloudflareGatewayProvider(cfUrl, cfKey);
            }
            // Fall through to env-registered provider below
        }

        // ── Default: env-registered provider ───────────────────────────────────
        const provider = this.providers.get(name);

        if (!provider) {
            if (['openai', 'google', 'deepl', 'gptoss'].includes(name)) {
                throw new Error(`Provider '${name}' is not configured (Missing API Key or URL).`);
            }
            return this.providers.get('mock')!;
        }

        return provider;
    }
}
