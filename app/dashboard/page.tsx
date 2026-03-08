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
        <div className="min-h-screen bg-black selection:bg-yellow-400 selection:text-black">
            <nav className="border-b border-white/10 bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-yellow-400 p-2 rounded-lg">
                                <FileText className="text-black w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl text-white">Workspace</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link
                            href="/ats-checker"
                            className="text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1"
                        >
                            ATS Checker
                        </Link>
                        <span className="text-sm text-gray-400">{user.email}</span>
                        <form action="/auth/signout" method="post">
                            <button className="text-gray-400 hover:text-white transition-colors">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-white">Your Resumes</h1>
                    <Link
                        href="/resume-builder"
                        className="inline-flex items-center px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold rounded-md transition-colors shadow-sm"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Create New
                    </Link>
                </div>

                {(!resumes || resumes.length === 0) ? (
                    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-12 text-center">
                        <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-yellow-400/10 text-yellow-400 mb-4 border border-yellow-400/20">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No resumes yet</h3>
                        <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                            You haven't created any resumes yet. Start by creating your first AI-powered resume.
                        </p>
                        <Link
                            href="/resume-builder"
                            className="inline-flex items-center px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold rounded-md transition-colors"
                        >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Create Resume
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resumes.map((resume) => (
                            <div key={resume.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-6 hover:bg-white/[0.04] transition-all relative group overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-yellow-400/10 rounded-lg text-yellow-400 border border-yellow-400/20">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(resume.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">
                                    {resume.resume_input_data?.personalInfo?.fullName || "Untitled Resume"}
                                </h3>
                                <p className="text-sm text-gray-400 line-clamp-2">
                                    {resume.resume_input_data?.personalInfo?.title || "No title provided"}
                                </p>
                                <div className="mt-6 pt-4 border-t border-white/10">
                                    <Link
                                        href={`/resume-builder?id=${resume.id}`}
                                        className="inline-flex items-center text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
                                    >
                                        View / Edit <ArrowRight className="w-4 h-4 ml-1" />
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
