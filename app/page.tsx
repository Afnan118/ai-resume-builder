import Link from 'next/link';
import { ArrowRight, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/djp3rpxv9/image/upload/v1709191024/grid-pattern_nqzlkx.svg')] bg-[length:60px_60px] opacity-[0.15] pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-fuchsia-600/15 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* Navigation */}
      <nav className="border-b border-white/5 bg-[#050505]/50 backdrop-blur-xl relative z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-2.5 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <FileText className="text-white w-6 h-6" />
            </div>
            <span className="font-black tracking-tight text-2xl text-white">AI Resume Builder</span>
          </div>
          <div className="flex items-center gap-8">
            <Link
              href="/ats-checker"
              className="text-sm font-semibold text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-1 group"
            >
              ATS Checker
              <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-indigo-400" />
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-white hover:text-indigo-400 transition-colors duration-300"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-2.5 text-sm font-bold text-white bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white transition-all duration-300 backdrop-blur-md active:scale-95"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10">
        <div className="text-center md:max-w-5xl md:mx-auto">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-10 shadow-[0_0_20px_rgba(99,102,241,0.2)] backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Next-Gen AI</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-8 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            Land your dream job with an <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 inline-block mt-2">AI-crafted resume</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            Generate professional, ATS-friendly resumes in minutes. Simply fill in your details and let our AI assemble the perfect profile for your next role.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mt-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-indigo-500 transition-all hover:scale-105 active:scale-[0.98] duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-[2px] bg-black rounded-[14px]"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>

              <span className="relative z-10 flex items-center shadow-black drop-shadow-md">
                Get Started for Free
                <ArrowRight className="ml-3 w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-40 grid md:grid-cols-3 gap-8 pt-16 border-t border-white/5 animate-in fade-in duration-1000 delay-700">
          <div className="flex flex-col items-start p-8 rounded-3xl bg-[#0a0a0a]/80 backdrop-blur-md border border-white/5 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-2 group hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-6 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">AI-Powered Writing</h3>
            <p className="text-gray-400 leading-relaxed font-medium">Our cutting-edge AI structures your experience into high-impact, professional summaries that perfectly highlight your achievements.</p>
          </div>

          <div className="flex flex-col items-start p-8 rounded-3xl bg-[#0a0a0a]/80 backdrop-blur-md border border-white/5 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-2 group hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.2)]">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 mb-6 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">ATS-Optimized format</h3>
            <p className="text-gray-400 leading-relaxed font-medium">Resumes formatted perfectly to parse through Applicant Tracking Systems effortlessly. Never get blocked by automatic filters again.</p>
          </div>

          <div className="flex flex-col items-start p-8 rounded-3xl bg-[#0a0a0a]/80 backdrop-blur-md border border-white/5 hover:border-pink-500/30 transition-all duration-300 hover:-translate-y-2 group hover:shadow-[0_20px_40px_-15px_rgba(236,72,153,0.2)]">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-pink-500/10 text-pink-400 mb-6 border border-pink-500/20 group-hover:bg-pink-500 group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-[0_0_20px_rgba(236,72,153,0.5)]">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">Instant PDF Export</h3>
            <p className="text-gray-400 leading-relaxed font-medium">Preview in real-time and download your finished resume as a sleek, professional PDF directly from your browser.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
