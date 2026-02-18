import { TranslationProvider } from '../../types';

export class GoogleProvider implements TranslationProvider {
    name = 'google';

    constructor(apiKey: string) { }

    async translate(texts: string[], targetLang: string): Promise<string[]> {
        // TODO: Implement Google Translate API
        throw new Error("Google Provider not yet implemented");
    }
}
