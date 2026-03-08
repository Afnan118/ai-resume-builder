'use client';

import { useRef, useState } from 'react';
import { Download, Edit3, Loader2, Target, Sparkles, CheckCircle2, AlertCircle, LayoutTemplate } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Link from 'next/link';

const TEMPLATES = {
    classic: {
        name: 'Classic',
        pageStyle: 'font-family: "Times New Roman", Times, serif; color: #000; font-size: 11pt; line-height: 1.5;',
        h1: 'font-size: 24pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #000; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 12px; text-align: center;',
        h2: 'font-size: 14pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.02em; color: #222; margin-top: 16px; margin-bottom: 8px; border-bottom: 1px solid #ccc; padding-bottom: 2px;',
        h3: 'font-size: 12pt; font-weight: bold; color: #000; margin-top: 12px; margin-bottom: 4px;',
        p: 'margin-bottom: 6px;',
        li: 'margin-left: 20px; list-style-type: square; color: #222; margin-bottom: 4px; line-height: 1.5;',
        strong: 'font-weight: bold; color: #000;',
        em: 'font-style: italic; color: #444;',
        a: 'color: #000; text-decoration: none;'
    },
    modern: {
        name: 'Modern',
        pageStyle: 'font-family: "Inter", "Roboto", "Helvetica Neue", sans-serif; color: #333; font-size: 10pt; line-height: 1.6;',
        h1: 'font-size: 28pt; font-weight: 800; letter-spacing: -0.02em; color: #0f766e; margin-bottom: 16px; text-align: left;',
        h2: 'font-size: 14pt; font-weight: 700; color: #0f766e; margin-top: 20px; margin-bottom: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;',
        h3: 'font-size: 12pt; font-weight: 600; color: #1e293b; margin-top: 12px; margin-bottom: 4px;',
        p: 'margin-bottom: 8px;',
        li: 'margin-left: 20px; list-style-type: disc; color: #475569; margin-bottom: 4px; line-height: 1.6;',
        strong: 'font-weight: 600; color: #0f766e;',
        em: 'font-style: italic; color: #64748b;',
        a: 'color: #0ea5e9; text-decoration: none;'
    },
    minimalist: {
        name: 'Minimalist',
        pageStyle: 'font-family: "Helvetica", "Arial", sans-serif; color: #444; font-size: 10pt; line-height: 1.5;',
        h1: 'font-size: 20pt; font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase; color: #111; margin-bottom: 16px; text-align: center;',
        h2: 'font-size: 12pt; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase; color: #555; margin-top: 24px; margin-bottom: 12px; text-align: left; border-bottom: 1px solid #eee; padding-bottom: 4px;',
        h3: 'font-size: 11pt; font-weight: bold; color: #222; margin-top: 8px; margin-bottom: 4px;',
        p: 'margin-bottom: 8px;',
        li: 'margin-left: 20px; list-style-type: circle; color: #555; margin-bottom: 6px; line-height: 1.5;',
        strong: 'font-weight: bold; color: #111;',
        em: 'font-style: italic; color: #777;',
        a: 'color: #111; text-decoration: underline;'
    },
    executive: {
        name: 'Executive',
        pageStyle: 'font-family: "Georgia", serif; color: #1f2937; font-size: 10.5pt; line-height: 1.6;',
        h1: 'font-size: 26pt; font-weight: bold; color: #1e3a8a; border-bottom: 3px solid #1e3a8a; padding-bottom: 6px; margin-bottom: 16px; text-align: center;',
        h2: 'font-size: 14pt; font-weight: bold; color: #1e3a8a; margin-top: 20px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em;',
        h3: 'font-size: 12pt; font-weight: bold; font-style: italic; color: #374151; margin-top: 12px; margin-bottom: 4px;',
        p: 'margin-bottom: 8px;',
        li: 'margin-left: 20px; list-style-type: square; color: #374151; margin-bottom: 4px; line-height: 1.6;',
        strong: 'font-weight: bold; color: #111827;',
        em: 'font-style: italic; color: #4b5563;',
        a: 'color: #1e3a8a; text-decoration: none;'
    },
    creative: {
        name: 'Creative',
        pageStyle: 'font-family: system-ui, -apple-system, sans-serif; color: #3f3f46; font-size: 10.5pt; line-height: 1.6;',
        h1: 'font-size: 32pt; font-weight: 900; color: #4f46e5; margin-bottom: 12px; text-align: left; letter-spacing: -0.03em;',
        h2: 'font-size: 15pt; font-weight: 800; color: #ffffff; background-color: #4f46e5; display: inline-block; padding: 4px 12px; border-radius: 4px; margin-top: 20px; margin-bottom: 12px;',
        h3: 'font-size: 13pt; font-weight: 700; color: #312e81; margin-top: 12px; margin-bottom: 6px;',
        p: 'margin-bottom: 8px;',
        li: 'margin-left: 20px; list-style-type: disc; color: #52525b; margin-bottom: 6px; line-height: 1.6;',
        strong: 'font-weight: 800; color: #4f46e5;',
        em: 'font-style: italic; color: #71717a;',
        a: 'color: #6366f1; text-decoration: underline;'
    },
    tech: {
        name: 'Tech',
        pageStyle: 'font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif; color: #d1d5db; font-size: 10pt; line-height: 1.6;',
        h1: 'font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 24pt; font-weight: bold; color: #38bdf8; margin-bottom: 16px; text-align: left; text-transform: lowercase;',
        h2: 'font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 14pt; font-weight: bold; color: #818cf8; margin-top: 20px; margin-bottom: 12px; border-bottom: 1px solid #334155; padding-bottom: 4px;',
        h3: 'font-size: 12pt; font-weight: 600; color: #f8fafc; margin-top: 12px; margin-bottom: 4px;',
        p: 'margin-bottom: 8px;',
        li: 'margin-left: 20px; list-style-type: square; color: #cbd5e1; margin-bottom: 4px; line-height: 1.6;',
        strong: 'font-weight: 600; color: #38bdf8;',
        em: 'font-style: italic; color: #94a3b8;',
        a: 'color: #38bdf8; text-decoration: none;'
    },
    elegant: {
        name: 'Elegant',
        pageStyle: 'font-family: "Georgia", serif; color: #4a4a4a; font-size: 10.5pt; line-height: 1.7;',
        h1: 'font-size: 28pt; font-weight: normal; color: #8b7355; margin-bottom: 16px; text-align: center; font-style: italic;',
        h2: 'font-size: 14pt; font-weight: bold; color: #695945; margin-top: 24px; margin-bottom: 12px; text-align: center; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; padding: 4px 0;',
        h3: 'font-size: 12pt; font-weight: bold; color: #4a4a4a; margin-top: 12px; margin-bottom: 4px;',
        p: 'margin-bottom: 8px;',
        li: 'margin-left: 20px; list-style-type: circle; color: #5a5a5a; margin-bottom: 6px; line-height: 1.7;',
        strong: 'font-weight: bold; color: #2a2a2a;',
        em: 'font-style: italic; color: #8b7355;',
        a: 'color: #8b7355; text-decoration: none;'
    },
    bold: {
        name: 'Bold',
        pageStyle: 'font-family: "Arial Black", "Impact", sans-serif; color: #000; font-size: 10pt; line-height: 1.5;',
        h1: 'font-size: 36pt; font-weight: 900; color: #000; text-transform: uppercase; margin-bottom: 12px; text-align: left; line-height: 1;',
        h2: 'font-size: 18pt; font-weight: 900; color: #fff; background-color: #000; padding: 6px 12px; margin-top: 24px; margin-bottom: 12px; text-transform: uppercase; display: inline-block;',
        h3: 'font-family: "Arial", sans-serif; font-size: 14pt; font-weight: bold; color: #000; margin-top: 12px; margin-bottom: 4px;',
        p: 'font-family: "Arial", sans-serif; margin-bottom: 8px; font-weight: 500;',
        li: 'font-family: "Arial", sans-serif; margin-left: 20px; list-style-type: square; color: #000; margin-bottom: 4px; font-weight: 500; line-height: 1.5;',
        strong: 'font-weight: 900; color: #000;',
        em: 'font-style: italic; color: #333;',
        a: 'color: #000; text-decoration: underline; font-weight: 900;'
    }
};

type TemplateId = keyof typeof TEMPLATES;

interface AnalysisResult {
    score: number;
    strengths: string[];
    weaknesses: string[];
    keywordSuggestions: string[];
}

interface ResumePreviewProps {
    id: string;
    generatedText: string;
}

export default function ResumePreview({ id, generatedText }: ResumePreviewProps) {
    const resumeRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [atsResult, setAtsResult] = useState<AnalysisResult | null>(null);
    const [atsError, setAtsError] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('classic');

    const handleAnalyzeATS = async () => {
        setIsAnalyzing(true);
        setAtsError(null);
        setAtsResult(null);

        try {
            const response = await fetch('/api/ats-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText: generatedText })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            setAtsResult(data.analysis);
        } catch (err: any) {
            setAtsError(err.message || 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDownloadPDF = async () => {
        window.print();
    };

    const handleDownloadATSPDF = async () => {
        setIsDownloading(true);
        try {
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const margin = 20;
            const pageWidth = 210;
            const maxWidth = pageWidth - (margin * 2);
            let y = margin;

            const lines = generatedText.split('\n');

            for (let i = 0; i < lines.length; i++) {
                let lineStr = lines[i].trim();
                if (lineStr === '') { y += 4; continue; }

                let isTitle = false, isH2 = false, isList = false;
                doc.setFont("helvetica", "normal");
                let fontSize = 11;
                let textColor = [0, 0, 0];

                if (lineStr.startsWith('# ')) {
                    isTitle = true; fontSize = 20; doc.setFont("helvetica", "bold");
                    lineStr = lineStr.substring(2); y += 4;
                } else if (lineStr.startsWith('## ')) {
                    isH2 = true; fontSize = 14; doc.setFont("helvetica", "bold");
                    lineStr = lineStr.substring(3).toUpperCase(); y += 4;
                } else if (lineStr.startsWith('### ')) {
                    fontSize = 12; doc.setFont("helvetica", "bold");
                    lineStr = lineStr.substring(4); y += 2;
                } else if (lineStr.startsWith('- ')) {
                    isList = true; lineStr = '•  ' + lineStr.substring(2);
                }

                lineStr = lineStr.replace(/\*\*/g, '').replace(/\*/g, '');

                doc.setFontSize(fontSize);
                doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                const textLines = doc.splitTextToSize(lineStr, isList ? maxWidth - 5 : maxWidth);

                if (y + (textLines.length * (fontSize * 0.4)) > 280) { doc.addPage(); y = margin; }

                doc.text(textLines, isList ? margin + 5 : (isTitle ? pageWidth / 2 : margin), y, { align: isTitle ? "center" : "left" });
                y += (textLines.length * (fontSize * 0.35)) + 4;

                if (isH2) { doc.setLineWidth(0.3); doc.line(margin, y - 2, pageWidth - margin, y - 2); y += 2; }
            }
            doc.save('resume-pure-ats.pdf');
        } finally {
            setIsDownloading(false);
        }
    };

    // Convert simple markdown from groq to HTML roughly
    // Using inline styles instead of Tailwind classes to prevent html2canvas crashing from modern CSS format (lab, oklch)
    const t = TEMPLATES[selectedTemplate];

    const formattedHTML = generatedText
        .replace(/^# (.*$)/gim, `<h1 style='${t.h1}'>$1</h1>`)
        .replace(/^## (.*$)/gim, `<h2 style='${t.h2}'>$1</h2>`)
        .replace(/^### (.*$)/gim, `<h3 style='${t.h3}'>$1</h3>`)
        .replace(/^[-*] (.*$)/gim, `<li style='${t.li}'>$1</li>`)
        .replace(/\*\*(.*?)\*\*/gim, `<strong style='${t.strong}'>$1</strong>`)
        .replace(/\*(.*?)\*/gim, `<em style='${t.em}'>$1</em>`)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, `<a href="$2" target="_blank" rel="noopener noreferrer" style='${t.a}'>$1</a>`)
        .replace(/\n\n/gim, `<div style='height: 6px; ${t.p}'></div>`);

    const templateHTML = `<div style='${t.pageStyle}'>${formattedHTML}</div>`;

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start print:block print:w-full print:m-0 print:p-0 text-white print:text-black animate-in fade-in duration-700 w-full max-w-[1400px] mx-auto py-8">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-72 shrink-0 bg-[#0a0a0a]/80 backdrop-blur-3xl p-7 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(99,102,241,0.15)] border border-white/5 sticky top-24 print:hidden flex flex-col gap-6 z-10 transition-all duration-300 hover:border-indigo-500/20">
                <h3 className="font-black text-xl text-white tracking-tight flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-indigo-400" />
                    Resume Actions
                </h3>

                <div className="bg-[#050505]/50 border border-white/5 p-5 rounded-2xl shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-indigo-500/20 transition-colors duration-500 mix-blend-screen"></div>
                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-4 flex items-center">
                        <LayoutTemplate className="w-3.5 h-3.5 mr-2 text-gray-500" />
                        Select Appearance
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5 relative z-10">
                        {(Object.keys(TEMPLATES) as TemplateId[]).map((tId) => (
                            <button
                                key={tId}
                                onClick={() => setSelectedTemplate(tId)}
                                className={`px-3 py-2.5 text-xs font-semibold rounded-xl border transition-all duration-300 transform active:scale-[0.97] flex items-center justify-center ${selectedTemplate === tId
                                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-transparent shadow-[0_0_20px_-3px_rgba(168,85,247,0.4)]'
                                    : 'bg-[#0a0a0a] text-gray-400 border-white/5 hover:bg-white/[0.05] hover:text-white hover:border-white/10'
                                    }`}
                            >
                                {TEMPLATES[tId].name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="group relative w-full flex items-center justify-center px-4 py-3.5 border border-transparent rounded-xl text-sm font-bold text-white bg-black active:scale-[0.98] disabled:opacity-50 transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl opacity-100 transition-opacity duration-300 z-0"></div>
                        <div className="absolute inset-[1.5px] bg-[#0a0a0a] rounded-[10px] group-hover:bg-opacity-0 transition-all duration-300 z-0"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-40 blur-lg transition-opacity duration-500 z-0"></div>

                        <span className="relative z-10 flex items-center text-white">
                            {isDownloading ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Download className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:-translate-y-1" />}
                            Standard PDF (Visual)
                        </span>
                    </button>

                    <button
                        onClick={handleDownloadATSPDF}
                        disabled={isDownloading}
                        className="group w-full flex items-center justify-center px-4 py-3.5 border border-white/10 rounded-xl text-sm font-bold text-gray-300 bg-[#050505] hover:text-white hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] active:scale-[0.98] disabled:opacity-50 transition-all duration-300"
                    >
                        {isDownloading ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Download className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:translate-y-1 text-pink-400" />}
                        Pure Text PDF (ATS)
                    </button>

                    <button
                        onClick={handleAnalyzeATS}
                        disabled={isAnalyzing}
                        className="group w-full flex items-center justify-center px-4 py-3.5 border border-white/10 rounded-xl text-sm font-bold text-white bg-gradient-to-tr from-[#0a0a0a] to-[#1a1a1a] hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] active:scale-[0.98] disabled:opacity-50 transition-all duration-300"
                    >
                        {isAnalyzing ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Target className="w-5 h-5 mr-3 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 text-indigo-400" />}
                        Evaluate ATS Score
                    </button>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-2"></div>

                    <Link
                        href={`/resume-builder?id=${id}&edit=true`}
                        className="group w-full flex items-center justify-center px-4 py-3.5 border border-transparent rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 active:scale-[0.98] transition-all duration-300"
                    >
                        <Edit3 className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                        Edit Profile Data
                    </Link>
                </div>

                {/* Score Result Area */}
                {(atsResult || atsError) && (
                    <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
                        {atsError && (
                            <div className="text-red-400 text-xs p-3 bg-red-950/30 rounded border border-red-900/50">
                                {atsError}
                            </div>
                        )}
                        {atsResult && (
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">ATS Match Score</div>
                                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-4 shadow-lg ${atsResult.score >= 80 ? 'border-indigo-400 text-indigo-400 bg-indigo-400/10' : atsResult.score >= 60 ? 'border-purple-400 text-purple-400 bg-purple-400/10' : 'border-red-400 text-red-400 bg-red-400/10'}`}>
                                        <span className="text-3xl font-black">{atsResult.score}</span>
                                    </div>
                                </div>
                                {atsResult.strengths.length > 0 && (
                                    <div className="text-xs text-gray-300 bg-white/[0.02] p-3 rounded border border-white/5">
                                        <div className="font-bold text-green-400 flex items-center mb-1"><CheckCircle2 className="w-3 h-3 mr-1" /> Strengths</div>
                                        <ul className="list-disc pl-4 space-y-1">
                                            {atsResult.strengths.slice(0, 2).map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {atsResult.weaknesses.length > 0 && (
                                    <div className="text-xs text-gray-300 bg-white/[0.02] p-3 rounded border border-white/5">
                                        <div className="font-bold text-red-400 flex items-center mb-1"><AlertCircle className="w-3 h-3 mr-1" /> Weaknesses</div>
                                        <ul className="list-disc pl-4 space-y-1">
                                            {atsResult.weaknesses.slice(0, 2).map((w, i) => <li key={i}>{w}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-xs text-gray-500">
                        This resume was generated using AI and optimized for ATS systems. Review the content before downloading.
                    </p>
                </div>
            </div>

            {/* A4 Paper Preview */}
            <div className="flex-1 w-full overflow-x-auto pb-10 print:p-0 print:m-0 print:w-full print:overflow-visible flex justify-center perspective-[1000px]">
                <div
                    className={`mx-auto shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] transition-all duration-700 hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,1)] hover:-translate-y-1 transform-gpu ring-1 ring-white/10 print:shadow-none print:w-full print:max-w-none print:p-0 print:m-0 print:ring-0 ${selectedTemplate === 'tech' ? 'bg-slate-900' : 'bg-white'}`}
                    style={{ width: '210mm', minHeight: '297mm', padding: '15mm', backgroundColor: selectedTemplate === 'tech' ? '#0f172a' : '#ffffff', boxSizing: 'border-box' }}
                >
                    {/* We render the formatted markdown here */}
                    <div
                        ref={resumeRef}
                        dangerouslySetInnerHTML={{ __html: templateHTML }}
                    />
                </div>
            </div>
        </div>
    );
}
