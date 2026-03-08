'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FileText, Upload, Sparkles, Loader2, Target, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface AnalysisResult {
    score: number;
    strengths: string[];
    weaknesses: string[];
    keywordSuggestions: string[];
}

export default function ATSCheckerPage() {
    const supabase = createClient();
    const [file, setFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setResumeText(''); // Clear text if file is uploaded
        }
    };

    const analyzeResume = async () => {
        if (!file && !resumeText.trim()) {
            setError('Please upload a PDF or paste your resume text.');
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            if (file) {
                formData.append('file', file);
            } else {
                formData.append('resumeText', resumeText);
            }
            if (jobDescription.trim()) {
                formData.append('jobDescription', jobDescription);
            }

            const response = await fetch('/api/ats-score', {
                method: 'POST',
                body: formData, // the browser automatically sets the multipart/form-data boundary
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze resume');
            }

            setResult(data.analysis);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Color logic for score
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400 border-green-400/30 bg-green-400/10';
        if (score >= 60) return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
        return 'text-red-400 border-red-400/30 bg-red-400/10';
    };

    return (
        <div className="min-h-screen bg-[#050505] selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden pb-20">
            {/* Background glowing effects */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none mix-blend-screen z-0"></div>
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[150px] pointer-events-none mix-blend-screen z-0 relative z-0"></div>

            {/* Nav */}
            <nav className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 p-2 rounded-lg shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_25px_-3px_rgba(168,85,247,0.6)] transition-all duration-300">
                                <FileText className="text-white w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">AI ATS Checker</span>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-sm font-bold mb-6 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]">
                        <Sparkles className="w-4 h-4" />
                        <span>Powered by AI</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        Check Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">ATS Score</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Upload your existing resume PDF or paste the text. Compare it against a job description to see how well you match!
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-10 relative z-10">
                    {/* Left Column: Input Form */}
                    <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/5 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.1)] relative overflow-hidden">
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 tracking-tight">
                            <Target className="text-indigo-400 w-6 h-6" />
                            Input Data
                        </h2>

                        <div className="space-y-6">
                            {/* File Upload OR Text Paste */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Option 1: Upload PDF Resume
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/10 border-dashed rounded-2xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-300 bg-white/[0.01]">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-400 justify-center">
                                            <label
                                                htmlFor="file-upload"
                                                className="relative cursor-pointer rounded-md bg-transparent font-medium text-indigo-400 focus-within:outline-none hover:text-indigo-300"
                                            >
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PDF up to 5MB</p>
                                        {file && <p className="text-sm font-bold text-green-400 mt-2">Selected: {file.name}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-[#0a0a0a] px-4 text-sm font-bold text-gray-500 rounded-lg">OR</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Option 2: Paste Resume Text
                                </label>
                                <textarea
                                    disabled={!!file} // disable if file is uploaded
                                    placeholder={file ? "Clear file to type here..." : "Paste your resume text here..."}
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    rows={4}
                                    className="w-full px-5 py-3.5 bg-black/50 border border-white/10 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder-gray-600 text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all duration-300 disabled:opacity-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Job Description (Optional)
                                </label>
                                <textarea
                                    placeholder="Paste the job requirements to evaluate keyword matching..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-5 py-3.5 bg-black/50 border border-white/10 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder-gray-600 text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all duration-300"
                                />
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 flex gap-3 text-red-400 text-sm">
                                    <AlertCircle className="shrink-0 w-5 h-5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    onClick={analyzeResume}
                                    disabled={isAnalyzing || (!file && !resumeText.trim())}
                                    className="group relative w-full flex justify-center py-4 px-4 text-sm shadow-xl font-bold rounded-xl text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white disabled:opacity-50 transition-all hover:scale-105 active:scale-[0.98] duration-300 border border-transparent disabled:hover:scale-100"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl opacity-100 transition-opacity duration-300 z-0"></div>
                                    <div className="absolute inset-[1.5px] bg-[#0a0a0a] rounded-[10px] group-hover:bg-opacity-0 transition-all duration-300 z-0"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-40 blur-lg transition-opacity duration-500 z-0"></div>
                                    <span className="relative z-10 flex items-center text-white">
                                        {isAnalyzing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                                Analyzing Match...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5 mr-3 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                                                Get ATS Score
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Score Display */}
                    <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/5 shadow-[0_20px_60px_-15px_rgba(236,72,153,0.1)] flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
                        {!result && !isAnalyzing && (
                            <div className="text-center text-gray-500">
                                <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="text-lg">Awaiting your resume input...</p>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className="text-center text-indigo-400 flex flex-col items-center relative z-10">
                                <RefreshCw className="w-16 h-16 animate-spin mb-4" />
                                <p className="text-xl font-bold animate-pulse">Running AI Analysis...</p>
                                <p className="text-sm text-gray-400 mt-2">Checking formatting, keywords, and impact.</p>
                            </div>
                        )}

                        {result && !isAnalyzing && (
                            <div className="w-full animate-in fade-in zoom-in duration-500">
                                <div className="flex flex-col items-center mb-8">
                                    <h3 className="text-xl text-gray-400 mb-4 font-bold uppercase tracking-widest text-center">Overall Score</h3>
                                    <div className={`w-40 h-40 rounded-full flex items-center justify-center border-[6px] shadow-2xl ${getScoreColor(result.score)}`}>
                                        <span className="text-6xl font-black">{result.score}</span>
                                    </div>
                                    <p className="mt-4 text-gray-400">Out of 100</p>
                                </div>

                                <div className="space-y-6">
                                    {result.strengths.length > 0 && (
                                        <div className="bg-green-950/20 p-5 rounded-xl border border-green-900/30">
                                            <h4 className="flex items-center gap-2 text-green-400 font-bold mb-3"><CheckCircle2 className="w-5 h-5" /> Strengths</h4>
                                            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                                                {result.strengths.map((str, idx) => <li key={idx}>{str}</li>)}
                                            </ul>
                                        </div>
                                    )}

                                    {result.weaknesses.length > 0 && (
                                        <div className="bg-red-950/20 p-5 rounded-xl border border-red-900/30">
                                            <h4 className="flex items-center gap-2 text-red-400 font-bold mb-3"><AlertCircle className="w-5 h-5" /> Areas to Improve</h4>
                                            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                                                {result.weaknesses.map((weak, idx) => <li key={idx}>{weak}</li>)}
                                            </ul>
                                        </div>
                                    )}

                                    {result.keywordSuggestions.length > 0 && (
                                        <div className="bg-blue-950/20 p-5 rounded-xl border border-blue-900/30">
                                            <h4 className="flex items-center gap-2 text-blue-400 font-bold mb-3"><Target className="w-5 h-5" /> Missing Keywords</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {result.keywordSuggestions.map((kw, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md text-xs text-blue-300">{kw}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
