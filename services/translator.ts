export const translateBatch = async (texts: string[], targetLocale: string, provider: string, customUrl?: string): Promise<string[]> => {
  console.log(`[Frontend] Preparing to send request to http://localhost:3001/api/translate`, { texts: texts.length, provider, customUrl });
  try {
    const response = await fetch('http://localhost:3001/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts,
        targetLang: targetLocale,
        provider,
        customUrl
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