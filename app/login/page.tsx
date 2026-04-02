'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { FileText, Loader2, Chrome } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push('/dashboard');
            }
        };
        checkSession();
    }, [supabase, router]);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage('Check your email for the confirmation link.');
        }
        setIsLoading(false);
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            router.push('/dashboard');
            router.refresh();
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

            <div className="w-full max-w-md space-y-8 bg-[#0a0a0a]/80 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(99,102,241,0.15)] border border-white/5 relative z-10">
                <div className="flex flex-col items-center">
                    <div className="bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 p-4 rounded-2xl mb-5 shadow-[0_0_30px_-5px_rgba(168,85,247,0.5)]">
                        <FileText className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Welcome back</h2>
                    <p className="text-gray-400 mt-2 text-sm">Sign in to your account or create a new one</p>
                </div>

                <form className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300" htmlFor="email">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                suppressHydrationWarning
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-5 py-3.5 bg-black/50 border border-white/10 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder-gray-600 text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 sm:text-sm"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                suppressHydrationWarning
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-5 py-3.5 bg-black/50 border border-white/10 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder-gray-600 text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-400 text-sm text-center bg-red-950/30 p-3 rounded-lg border border-red-900/50">{error}</div>}
                    {message && <div className="text-green-400 text-sm text-center bg-green-950/30 p-3 rounded-lg border border-green-900/50">{message}</div>}

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={handleSignIn}
                            disabled={isLoading}
                            suppressHydrationWarning
                            className="group relative w-full flex justify-center py-3.5 px-4 text-sm font-bold rounded-xl text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white disabled:opacity-50 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)] active:scale-[0.98]"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In Securely'}
                        </button>

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            suppressHydrationWarning
                            className="group relative w-full flex items-center justify-center gap-3 py-3.5 px-4 text-sm font-bold rounded-xl text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white/20 disabled:opacity-50 transition-all active:scale-[0.98]"
                        >
                            <Chrome className="w-5 h-5" />
                            Continue with Google
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-[#0a0a0a] px-2 text-gray-500">Or create a new account</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleSignUp}
                            disabled={isLoading}
                            suppressHydrationWarning
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-white/10 text-sm font-bold rounded-xl text-gray-300 bg-[#050505] hover:border-indigo-500/50 hover:text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-indigo-500 disabled:opacity-50 transition-all active:scale-[0.98]"
                        >
                            Create an Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
