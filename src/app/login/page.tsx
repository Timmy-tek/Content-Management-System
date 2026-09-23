'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { supabaseBrowser as supabase } from '@/lib/supabase-browser';

type Mode = 'signin' | 'signup';

function safeNext(raw: string | null) {
    return raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';
}

function LoginForm() {
    const params = useSearchParams();
    const next = safeNext(params.get('next'));

    const [mode, setMode] = useState<Mode>('signin');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(
        params.get('error') ? 'That confirmation link is invalid or has expired. Please try again.' : null
    );
    const [notice, setNotice] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setNotice(null);

        if (mode === 'signin') {
            const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
            if (authError) {
                setError(authError.message);
                setLoading(false);
                return;
            }
            // hard navigation so the whole app remounts with the new session
            window.location.href = next;
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            setLoading(false);
            return;
        }

        const { data, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName.trim() },
                emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
            },
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        // With email confirmation on, an already-registered email returns a user with no identities and no error
        if (data.user && data.user.identities?.length === 0) {
            setError('An account with this email already exists. Try signing in instead.');
            setLoading(false);
            return;
        }

        // Confirmation off: a session comes back immediately
        if (data.session) {
            window.location.href = next;
            return;
        }

        setNotice('Check your email for a confirmation link to finish creating your account.');
        setLoading(false);
    };

    const isSignup = mode === 'signup';

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md space-y-6">
                <div className="flex items-center justify-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#E5F23A] text-[#111111] flex items-center justify-center font-bold font-space shadow-md">
                        CE
                    </div>
                    <span className="text-xl font-bold font-space text-[#111111]">Content Engine</span>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-black/5 border border-black/5 space-y-5"
                >
                    {/* Sign in / Create account toggle */}
                    <div className="bg-[#F2F1EF] p-1 rounded-full flex items-center gap-1 border border-black/5">
                        {(['signin', 'signup'] as Mode[]).map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => {
                                    setMode(m);
                                    setError(null);
                                    setNotice(null);
                                }}
                                className={`flex-1 px-3 py-2 rounded-full text-xs font-bold font-space transition-all cursor-pointer ${
                                    mode === m ? 'bg-[#111111] text-white shadow-sm' : 'text-[#666666] hover:text-[#111111]'
                                }`}
                            >
                                {m === 'signin' ? 'Sign in' : 'Create account'}
                            </button>
                        ))}
                    </div>

                    {isSignup && (
                        <div>
                            <label className="block text-xs font-bold font-space text-[#111111] uppercase tracking-wider mb-2">
                                Full name
                            </label>
                            <input
                                type="text"
                                required
                                autoComplete="name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-[#F2F1EF] border border-black/10 rounded-2xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111] font-inter"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold font-space text-[#111111] uppercase tracking-wider mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#F2F1EF] border border-black/10 rounded-2xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111] font-inter"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold font-space text-[#111111] uppercase tracking-wider mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            autoComplete={isSignup ? 'new-password' : 'current-password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#F2F1EF] border border-black/10 rounded-2xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111] font-inter"
                        />
                        {isSignup && (
                            <p className="text-[11px] text-[#666666] font-inter mt-1.5">At least 8 characters.</p>
                        )}
                    </div>

                    {error && (
                        <div className="bg-[#F5A9A9]/20 border border-[#F5A9A9] rounded-2xl px-4 py-3 text-sm text-[#8B2C2C] font-inter">
                            {error}
                        </div>
                    )}
                    {notice && (
                        <div className="bg-[#A9F5A0]/20 border border-[#A9F5A0] rounded-2xl px-4 py-3 text-sm text-[#0B4F07] font-inter">
                            {notice}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#111111] text-white hover:bg-[#222222] disabled:opacity-50 font-bold text-sm px-8 py-3.5 rounded-full shadow-lg transition-all cursor-pointer font-space"
                    >
                        <Sparkles className="w-4 h-4 text-[#E5F23A]" />
                        <span>{loading ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
}

// useSearchParams needs a Suspense boundary or `next build` fails
export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginForm />
        </Suspense>
    );
}