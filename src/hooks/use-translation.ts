// hooks/use-translation.ts
import { useState } from 'react';

export function useTranslation() {
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const translate = async (
        text: string,
        targetLanguage: string,
        sourceLanguage?: string
    ): Promise<string> => {
        setIsTranslating(true);
        setError(null);

        try {
            console.log(`Translating to ${targetLanguage}...`);

            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    targetLanguage,
                    sourceLanguage,
                }),
            });

            console.log('Translation response status:', response.status);

            if (!response.ok) {
                let errorMessage = 'Translation failed';
                try {
                    const errorData = await response.json();
                    console.error('Translation API Error:', errorData);
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    console.error('Could not parse error response');
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Translation successful');

            if (!data.translatedText) {
                throw new Error('No translation returned from API');
            }

            return data.translatedText;
        } catch (err) {
            console.error('Translation error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Translation failed';
            setError(errorMessage);
            throw err;
        } finally {
            setIsTranslating(false);
        }
    };

    return {
        translate,
        isTranslating,
        error,
    };
}