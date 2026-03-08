import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, FileText, ArrowRight, LogOut } from 'lucide-react';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect('/login');
    }

    // Fetch user's resumes
    const { data: resumes } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-[#050505] selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none mix-blend-screen z-0"></div>
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[150px] pointer-events-none mix-blend-screen z-0"></div>

            <nav className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl relative z-10 sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 p-2 rounded-lg shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_25px_-3px_rgba(168,85,247,0.6)] transition-all duration-300">
                                <FileText className="text-white w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">Workspace</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link
                            href="/ats-checker"
                            className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 hover:from-indigo-300 hover:to-pink-300 transition-colors flex items-center gap-1"
                        >
                            ATS Checker
                        </Link>
                        <span className="text-sm font-medium text-gray-400 border border-white/10 px-3 py-1.5 rounded-full bg-white/5">{user.email}</span>
                        <form action="/auth/signout" method="post">
                            <button className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-black text-white tracking-tight">Your Resumes</h1>
                    <Link
                        href="/resume-builder"
                        className="group relative inline-flex items-center px-6 py-2.5 text-sm font-bold text-white bg-black rounded-xl focus:outline-none transition-all hover:scale-105 active:scale-[0.98] duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl opacity-100 transition-opacity duration-300 z-0"></div>
                        <div className="absolute inset-[1.5px] bg-[#0a0a0a] rounded-[10px] group-hover:bg-opacity-0 transition-all duration-300 z-0"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-40 blur-lg transition-opacity duration-500 z-0"></div>
                        <span className="relative z-10 flex items-center text-white">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Create New
                        </span>
                    </Link>
                </div>

                {(!resumes || resumes.length === 0) ? (
                    <div className="bg-[#0a0a0a]/50 backdrop-blur-xl border border-white/5 rounded-[2rem] p-16 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
                        <div className="inline-flex justify-center items-center w-20 h-20 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-6 border border-indigo-500/20 shadow-[0_0_30px_-5px_rgba(99,102,241,0.2)]">
                            <FileText className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">No resumes yet</h3>
                        <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                            You haven't created any resumes yet. Start by creating your first AI-powered resume.
                        </p>
                        <Link
                            href="/resume-builder"
                            className="group relative inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold text-white bg-black rounded-xl focus:outline-none transition-all hover:scale-105 active:scale-[0.98] duration-300 shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)] border border-transparent hover:border-white/10 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)]"
                        >
                            <span className="relative z-10 flex items-center text-white">
                                <PlusCircle className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
                                Create Resume
                            </span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resumes.map((resume) => (
                            <div key={resume.id} className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-[1.5rem] p-6 hover:border-indigo-500/30 transition-all duration-500 relative group overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.1)] hover:-translate-y-1">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-500 mix-blend-screen"></div>
                                <div className="flex justify-between items-start mb-5 relative z-10">
                                    <div className="p-3.5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl text-indigo-400 border border-indigo-500/20 shadow-inner">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                                        {new Date(resume.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-white mb-1.5 tracking-tight relative z-10">
                                    {resume.resume_input_data?.personalInfo?.fullName || "Untitled Resume"}
                                </h3>
                                <p className="text-sm text-gray-400 line-clamp-2 relative z-10">
                                    {resume.resume_input_data?.personalInfo?.title || "No title provided"}
                                </p>
                                <div className="mt-8 pt-5 border-t border-white/5 relative z-10 flex justify-end">
                                    <Link
                                        href={`/resume-builder?id=${resume.id}`}
                                        className="group/link inline-flex items-center text-sm font-bold text-indigo-400 hover:text-pink-400 transition-colors bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/20 hover:border-pink-500/40"
                                    >
                                        View / Edit <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/link:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
