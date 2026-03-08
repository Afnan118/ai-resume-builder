'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { FileText, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

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

    return (
        <div className="flex min-h-screen items-center justify-center bg-black px-4 selection:bg-yellow-400 selection:text-black">
            <div className="w-full max-w-md space-y-8 bg-white/[0.02] p-8 rounded-2xl shadow-2xl border border-white/10">
                <div className="flex flex-col items-center">
                    <div className="bg-yellow-400 p-3 rounded-xl mb-4">
                        <FileText className="text-black w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Welcome back</h2>
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
                                className="mt-1 block w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-lg shadow-sm placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent sm:text-sm transition-all"
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
                                className="mt-1 block w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-lg shadow-sm placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent sm:text-sm transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-400 text-sm text-center bg-red-950/30 p-3 rounded-lg border border-red-900/50">{error}</div>}
                    {message && <div className="text-green-400 text-sm text-center bg-green-950/30 p-3 rounded-lg border border-green-900/50">{message}</div>}

                    <div className="flex gap-4">
                        <button
                            onClick={handleSignIn}
                            disabled={isLoading}
                            suppressHydrationWarning
                            className="group relative w-full flex justify-center py-3 px-4 text-sm font-bold rounded-lg text-black bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-yellow-500 disabled:opacity-50 transition-all shadow-[0_0_15px_-3px_rgba(234,179,8,0.3)]"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                        </button>
                        <button
                            onClick={handleSignUp}
                            disabled={isLoading}
                            suppressHydrationWarning
                            className="group relative w-full flex justify-center py-3 px-4 border border-white/20 text-sm font-bold rounded-lg text-white bg-white/[0.05] hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-yellow-500 disabled:opacity-50 transition-all"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
