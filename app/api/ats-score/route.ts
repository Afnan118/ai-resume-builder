import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import groq from '@/lib/groq';
import 'pdf-parse/worker'; // Required for Next.js serverless environments
import { PDFParse } from 'pdf-parse';

export async function POST(request: Request) {
    try {

        // Handle multipart/form-data for PDF uploads or direct JSON payload
        let resumeText = '';
        let jobDescription = '';

        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            jobDescription = formData.get('jobDescription') as string || '';

            const file = formData.get('file') as File;
            if (file) {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const parser = new PDFParse({ data: buffer });
                const pdfData = await parser.getText();
                await parser.destroy();
                resumeText = pdfData.text;
            } else {
                resumeText = formData.get('resumeText') as string || '';
            }
        } else {
            // Assume JSON payload
            const body = await request.json();
            resumeText = body.resumeText || '';
            jobDescription = body.jobDescription || '';
        }

        if (!resumeText || resumeText.trim().length < 50) {
            return NextResponse.json({
                error: `Extracted text length: ${resumeText.length}. Snippet: "${resumeText.slice(0, 50)}". It looks like you uploaded a PDF that was generated BEFORE we fixed the "Enter Key" bug. That old PDF is permanently blank. Please go back to the "Resume Builder", generate a brand NEW resume from scratch, and download it again to use here!`
            }, { status: 400 });
        }

        const prompt = `
You are an expert ATS (Applicant Tracking System) built by top Fortune 500 recruiters. 
Your task is to analyze the provided resume text and score it. 
${jobDescription ? `You must also compare it against the provided Job Description to evaluate the match rate.` : `Since no Job Description is provided, evaluate it based on standard best practices (action verbs, quantifiable metrics, clear sections).`}

Respond ONLY with a valid JSON object matching this exact structure, nothing else:
{
  "score": <number between 0 and 100>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "keywordSuggestions": ["<keyword 1>", "<keyword 2>"]
}

RESUME TEXT:
"""
${resumeText}
"""

${jobDescription ? `JOB DESCRIPTION:\n"""\n${jobDescription}\n"""` : ''}
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1, // Low temperature for consistent JSON output
            response_format: { type: 'json_object' }
        });

        const jsonResponse = completion.choices[0]?.message?.content || '{}';
        const parsedResponse = JSON.parse(jsonResponse);

        return NextResponse.json({ success: true, analysis: parsedResponse });
    } catch (error: any) {
        console.error('ATS Score Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate ATS score' },
            { status: 500 }
        );
    }
}
