// hooks/use-ai-summary.ts
import { useState } from 'react';

interface DiaryData {
    fajrToZuhr: string;
    zuhrToAsar: string;
    asarToMaghrib: string;
    maghribToEsha: string;
    eshaToFajr: string;
    customNotes: string;
}

export function useAiSummary() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateSummary = async (diaryData: DiaryData): Promise<string> => {
        setIsGenerating(true);
        setError(null);

        try {
            console.log('Sending request to generate summary...');

            // Call your backend API route
            const response = await fetch('/api/generate-summary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ diaryData }),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                let errorMessage = 'Failed to generate summary';
                try {
                    const errorData = await response.json();
                    console.error('API Error:', errorData);
                    errorMessage = errorData.error || errorMessage;

                    // If model is loading, provide helpful message
                    if (response.status === 503 && errorData.isLoading) {
                        const waitTime = errorData.estimatedTime || 20;
                        errorMessage = `AI model is warming up (${waitTime}s). Please wait and try again.`;
                    }
                } catch (e) {
                    console.error('Could not parse error response');
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Summary generated successfully');

            if (!data.summary) {
                throw new Error('No summary returned from API');
            }

            return data.summary;
        } catch (err) {
            console.error('Summary generation error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate summary';
            setError(errorMessage);
            throw err;
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        generateSummary,
        isGenerating,
        error,
    };
}