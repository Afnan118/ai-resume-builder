import Link from 'next/link';
import { ArrowRight, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-yellow-400 selection:text-black">
      {/* Navigation */}
      <nav className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 p-2 rounded-lg">
              <FileText className="text-black w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-white">AI Resume Builder</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/ats-checker"
              className="text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1"
            >
              ATS Checker
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-300 hover:text-yellow-400 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-5 py-2 text-sm font-semibold text-black bg-yellow-400 rounded-md hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-yellow-500 transition-all duration-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center md:max-w-4xl md:mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Groq AI</span>
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-8 leading-tight">
            Land your dream job with an <span className="text-yellow-400">AI-crafted resume</span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Generate professional, ATS-friendly resumes in minutes. Simply fill in your details and let our AI assemble the perfect profile for your next role.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-black bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg hover:from-yellow-300 hover:to-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-yellow-500 transition-all shadow-[0_0_30px_-5px_rgba(234,179,8,0.4)] hover:shadow-[0_0_40px_-5px_rgba(234,179,8,0.6)] hover:scale-105 duration-300"
            >
              Get Started for Free
              <ArrowRight className="ml-2 w-6 h-6" />
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-32 grid md:grid-cols-3 gap-8 pt-16 border-t border-white/5">
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-yellow-400/10 text-yellow-400 mb-6 border border-yellow-400/20">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI-Powered Writing</h3>
            <p className="text-gray-400 leading-relaxed">Our cutting-edge AI structures your experience into high-impact, professional summaries.</p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-yellow-400/10 text-yellow-400 mb-6 border border-yellow-400/20">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">ATS-Optimized</h3>
            <p className="text-gray-400 leading-relaxed">Resumes formatted perfectly to pass through Applicant Tracking Systems effortlessly.</p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-yellow-400/10 text-yellow-400 mb-6 border border-yellow-400/20">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Instant PDF Export</h3>
            <p className="text-gray-400 leading-relaxed">Preview in real-time and download your finished resume as a sleek, professional PDF.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
