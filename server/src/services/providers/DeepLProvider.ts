import { TranslationProvider } from '../../types';

export class DeepLProvider implements TranslationProvider {
    name = 'deepl';

    constructor(apiKey: string) { }

    async translate(texts: string[], targetLang: string): Promise<string[]> {
        // TODO: Implement DeepL API
        throw new Error("DeepL Provider not yet implemented");
    }
}
