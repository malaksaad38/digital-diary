// app/api/generate-summary/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        console.log('✅ API route called');

        const body = await request.json();
        const { diaryData } = body;

        if (!diaryData) {
            return NextResponse.json(
                { error: 'Diary data is required' },
                { status: 400 }
            );
        }

        // Combine all diary entries
        const entries = [
            diaryData.fajrToZuhr && `Fajr to Zuhr: ${diaryData.fajrToZuhr}`,
            diaryData.zuhrToAsar && `Zuhr to Asar: ${diaryData.zuhrToAsar}`,
            diaryData.asarToMaghrib && `Asar to Maghrib: ${diaryData.asarToMaghrib}`,
            diaryData.maghribToEsha && `Maghrib to Esha: ${diaryData.maghribToEsha}`,
            diaryData.eshaToFajr && `Esha to Fajr: ${diaryData.eshaToFajr}`,
            diaryData.customNotes && `Additional Notes: ${diaryData.customNotes}`,
        ]
            .filter(Boolean)
            .join('\n\n');

        if (!entries.trim()) {
            return NextResponse.json(
                { error: 'Please fill in at least one diary entry.' },
                { status: 400 }
            );
        }

        console.log('📝 Entries length:', entries.length);

        const groqKey = process.env.GROQ_API_KEY;

        if (!groqKey) {
            console.error('❌ GROQ_API_KEY not found');
            return NextResponse.json(
                { error: 'Groq API key not configured. Add GROQ_API_KEY to .env.local' },
                { status: 500 }
            );
        }

        console.log('🔑 Calling Groq API (FREE & FAST)...');

        const response = await fetch(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${groqKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile', // Free, fast, high-quality model
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful assistant that creates concise 2-3 sentence summaries of diary entries. Only provide the summary text, nothing else.'
                        },
                        {
                            role: 'user',
                            content: `Please summarize these diary entries in 2-3 sentences, highlighting key activities and emotions:\n\n${entries}`
                        }
                    ],
                    max_tokens: 150,
                    temperature: 0.7,
                }),
            }
        );

        console.log('📡 Groq response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Groq error:', errorText);

            if (response.status === 401) {
                return NextResponse.json(
                    { error: 'Invalid Groq API key. Check GROQ_API_KEY in .env.local' },
                    { status: 401 }
                );
            }

            if (response.status === 429) {
                return NextResponse.json(
                    { error: 'Rate limit reached. Wait a moment and try again.' },
                    { status: 429 }
                );
            }

            return NextResponse.json(
                { error: `Groq error (${response.status}). Try again.` },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('✅ Response received');

        const summaryText = data.choices?.[0]?.message?.content?.trim() || '';

        if (!summaryText) {
            console.error('❌ Empty response');
            return NextResponse.json(
                { error: 'Empty response from AI. Try again.' },
                { status: 500 }
            );
        }

        console.log('✅ Summary generated:', summaryText.substring(0, 80) + '...');
        return NextResponse.json({ summary: summaryText });

    } catch (error) {
        console.error('❌ Unexpected error:', error);
        return NextResponse.json(
            { error: 'Unexpected error occurred. Try again.' },
            { status: 500 }
        );
    }
}