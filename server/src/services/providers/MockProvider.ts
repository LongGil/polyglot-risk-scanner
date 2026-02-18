import { TranslationProvider } from '../../types';

export class MockProvider implements TranslationProvider {
    name = 'mock';

    async translate(texts: string[], targetLang: string): Promise<string[]> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return texts.map(text => `[MOCK-${targetLang}] ${text}`);
    }
}
