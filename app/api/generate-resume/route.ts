import { NextResponse } from 'next/server';
import groq from '@/lib/groq';

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Construct the prompt for Groq
        const prompt = `
You are an expert resume writer and career coach. Your task is to generate a professional, ATS-friendly resume using the provided details. 
Do not include any introductory or concluding conversational text. Output ONLY the resume content, formatted in clean Markdown.

Structure the resume with the following sections (only include sections that have data):
# [First Name] [Last Name]
[Contact Information: Email | Phone | Location | LinkedIn | Website]
[Target Title]

## Professional Summary
[Generate a compelling 3-4 sentence summary based on their experience and target title]

## Core Competencies & Skills
[Group skills logically and present them as a clean list or categories]

## Professional Experience
[For each job]:
### [Position] | [Company] | [Start Date] - [End Date]
[Generate 3-5 high-impact bullet points focusing on achievements, metrics, and action verbs based on their description]

## Education
### [Degree] in [Field]
[School/University] | [Graduation Date]

## Projects
### [Project Name]
[Brief description of the project and technologies used. Include link if available.]

## Certifications
[Certification Name] - [Issuer] ([Date])

---
USER DATA:
${JSON.stringify(data, null, 2)}
`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile', // Fast and reliable model for text generation
            temperature: 0.5,
            max_tokens: 2048,
        });

        const generatedText = chatCompletion.choices[0]?.message?.content || '';

        return NextResponse.json({ generatedText });
    } catch (error: any) {
        console.error('Error generating resume:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate resume' }, { status: 500 });
    }
}
