export const translateBatch = async (texts: string[], targetLocale: string, provider: string, customUrl?: string, context?: string, apiKey?: string): Promise<string[]> => {
  console.log('🚀 Translation API Request:', {
    textCount: texts.length,
    targetLocale,
    provider,
    customUrl: customUrl || 'N/A',
    context: context || 'None'
  });
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts,
        targetLang: targetLocale,
        provider,
        customUrl,
        context,
        apiKey
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || errorData.error || 'Translation request failed');
    }

    const data = await response.json();
    return data.translations;
  } catch (error) {
    console.error("Translation API Error:", error);
    // Fallback or rethrow? 
    // Rethrow so UI knows it failed.
    throw error;
  }
};