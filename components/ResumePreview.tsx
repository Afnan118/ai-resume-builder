'use client';

import { useRef, useState } from 'react';
import { Download, Edit3, Loader2, Target, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Link from 'next/link';

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
    const formattedHTML = generatedText
        .replace(/^# (.*$)/gim, '<h1 style="font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #000; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 12px; text-align: center;">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; color: #222; margin-top: 16px; margin-bottom: 8px; border-bottom: 1px solid #ccc; padding-bottom: 2px;">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 style="font-size: 14px; font-weight: 700; color: #000; margin-top: 12px; margin-bottom: 4px;">$1</h3>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong style="font-weight: 700; color: #000;">$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em style="font-style: italic; color: #444;">$1</em>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #000; text-decoration: none;">$1</a>')
        .replace(/^- (.*$)/gim, '<li style="margin-left: 20px; list-style-type: square; color: #222; margin-bottom: 4px; line-height: 1.5;">$1</li>')
        .replace(/\n\n/gim, '<div style="height: 6px;"></div>');

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start print:block print:w-full print:m-0 print:p-0 bg-black print:bg-white text-white print:text-black">
            {/* Sidebar Controls */}
            <div className="w-full lg:w-64 shrink-0 bg-white/[0.02] p-6 rounded-2xl shadow-sm border border-white/10 sticky top-24 print:hidden">
                <h3 className="font-bold text-white mb-6">Resume Actions</h3>

                <div className="space-y-3">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-[0_0_15px_-3px_rgba(234,179,8,0.3)] text-sm font-bold text-black bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 transition-all"
                    >
                        {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                        Standard PDF (Visual)
                    </button>

                    <button
                        onClick={handleDownloadATSPDF}
                        disabled={isDownloading}
                        className="w-full flex items-center justify-center px-4 py-3 border border-yellow-400/30 rounded-lg text-sm font-bold text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 disabled:opacity-50 transition-all"
                    >
                        {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                        Pure Text PDF (100% ATS)
                    </button>

                    <button
                        onClick={handleAnalyzeATS}
                        disabled={isAnalyzing}
                        className="w-full flex items-center justify-center px-4 py-3 border border-white/20 rounded-lg shadow-[0_0_10px_-2px_rgba(255,255,255,0.1)] text-sm font-bold text-white bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-50 transition-all"
                    >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Target className="w-4 h-4 mr-2" />}
                        Evaluate ATS Score
                    </button>

                    <Link
                        href={`/resume-builder?id=${id}&edit=true`}
                        className="w-full flex items-center justify-center px-4 py-3 border border-white/10 rounded-lg shadow-sm text-sm font-bold text-gray-400 bg-transparent hover:bg-white/[0.05] hover:text-white transition-all"
                    >
                        <Edit3 className="w-4 h-4 mr-2" />
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
                                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-4 shadow-lg ${atsResult.score >= 80 ? 'border-green-400 text-green-400 bg-green-400/10' : atsResult.score >= 60 ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' : 'border-red-400 text-red-400 bg-red-400/10'}`}>
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
            <div className="flex-1 w-full overflow-x-auto pb-10 print:p-0 print:m-0 print:w-full print:overflow-visible flex justify-center">
                <div
                    className="mx-auto shadow-xl print:shadow-none print:w-full print:max-w-none print:p-0 print:m-0 bg-white"
                    style={{ width: '210mm', minHeight: '297mm', padding: '15mm', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                >
                    {/* We render the formatted markdown here */}
                    <div
                        ref={resumeRef}
                        style={{ fontFamily: 'Arial, Helvetica, sans-serif', color: '#1f2937', fontSize: '0.875rem', lineHeight: '1.5' }}
                        dangerouslySetInnerHTML={{ __html: formattedHTML }}
                    />
                </div>
            </div>
        </div>
    );
}
