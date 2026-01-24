// app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        console.log('✅ Translation API called');

        const body = await request.json();
        const { text, targetLanguage, sourceLanguage } = body;

        if (!text || !targetLanguage) {
            return NextResponse.json(
                { error: 'Text and target language are required' },
                { status: 400 }
            );
        }

        console.log(`📝 Translating to: ${targetLanguage}`);

        const groqKey = process.env.GROQ_API_KEY;

        if (!groqKey) {
            console.error('❌ GROQ_API_KEY not found');
            return NextResponse.json(
                { error: 'Groq API key not configured. Add GROQ_API_KEY to .env.local' },
                { status: 500 }
            );
        }

        const languageNames: Record<string, string> = {
            'en': 'English',
            'ur': 'Urdu'
        };

        const targetLangName = languageNames[targetLanguage] || targetLanguage;
        const sourceLangName = sourceLanguage ? languageNames[sourceLanguage] : 'the source language';

        console.log('🔑 Calling Groq API for translation...');

        const response = await fetch(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${groqKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a professional translator. Translate text from ${sourceLangName} to ${targetLangName}. Provide ONLY the translation, no explanations or additional text. Maintain the original tone and meaning.`
                        },
                        {
                            role: 'user',
                            content: text
                        }
                    ],
                    max_tokens: 1000,
                    temperature: 0.3, // Lower temperature for more accurate translation
                }),
            }
        );

        console.log('📡 Groq response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Groq error:', errorText);

            if (response.status === 401) {
                return NextResponse.json(
                    { error: 'Invalid Groq API key' },
                    { status: 401 }
                );
            }

            if (response.status === 429) {
                return NextResponse.json(
                    { error: 'Rate limit reached. Please wait and try again.' },
                    { status: 429 }
                );
            }

            return NextResponse.json(
                { error: `Translation failed (${response.status})` },
                { status: response.status }
            );
        }

        const data = await response.json();
        const translatedText = data.choices?.[0]?.message?.content?.trim() || '';

        if (!translatedText) {
            console.error('❌ Empty translation');
            return NextResponse.json(
                { error: 'Translation returned empty' },
                { status: 500 }
            );
        }

        console.log('✅ Translation successful');
        return NextResponse.json({ translatedText });

    } catch (error) {
        console.error('❌ Unexpected error:', error);
        return NextResponse.json(
            { error: 'Unexpected error occurred' },
            { status: 500 }
        );
    }
}