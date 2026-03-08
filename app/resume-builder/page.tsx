import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ResumeForm from '@/components/ResumeForm';
import ResumePreview from '@/components/ResumePreview';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default async function ResumeBuilderPage(props: {
    searchParams: Promise<{ id?: string; preview?: string; edit?: string }>;
}) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    const { id, preview, edit } = searchParams;
    let resumeData = null;

    if (id) {
        const { data, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('id', id)
            .eq('user_id', session.user.id)
            .single();

        if (!error && data) {
            resumeData = data;
        }
    }

    const showPreview = preview === 'true' && !edit && resumeData?.generated_resume_text;

    return (
        <div className="min-h-screen bg-black selection:bg-yellow-400 selection:text-black pb-20 print:bg-white print:text-black print:pb-0">
            <nav className="border-b border-white/10 bg-black sticky top-0 z-50 print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="bg-yellow-400 p-1.5 rounded-md">
                                <FileText className="text-black w-4 h-4" />
                            </div>
                            <span className="font-bold text-white hidden sm:block">
                                {showPreview ? 'Resume Preview View' : 'AI Builder Editor'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* additional header actions if needed */}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {showPreview ? (
                    <ResumePreview id={resumeData.id} generatedText={resumeData.generated_resume_text} />
                ) : (
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {resumeData ? 'Edit your details' : 'Build your resume'}
                            </h1>
                            <p className="text-gray-400">
                                Fill out the required information, and our AI will generate a professional profile.
                            </p>
                        </div>
                        <ResumeForm initialData={resumeData?.resume_input_data} resumeId={resumeData?.id} />
                    </div>
                )}
            </main>
        </div>
    );
}
