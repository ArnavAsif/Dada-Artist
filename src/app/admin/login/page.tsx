'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('admin@fea-atelier.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0908] text-[#f4efe6] flex flex-col justify-center items-center p-4 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 bg-radial from-amber-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-md p-8 sm:p-10 rounded-2xl bg-stone-950/90 border border-amber-500/20 shadow-2xl backdrop-blur-xl">
        {/* Monogram / Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-full border border-amber-400/40 bg-amber-400/10 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/10">
            <ShieldCheck size={22} className="text-amber-300" />
          </div>
          <h1 className="text-xl font-light tracking-[0.2em] uppercase text-white">
            FEA <span className="text-amber-300">ATELIER</span>
          </h1>
          <p className="text-xs tracking-wider uppercase text-stone-400 mt-1 font-mono">
            Spatial Showroom Admin Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-300 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fea-atelier.com"
                className="w-full h-11 px-4 pl-10 rounded-xl bg-stone-900/80 border border-white/10 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-amber-400/60 transition-colors font-mono"
              />
              <Mail size={15} className="absolute left-3.5 top-3.5 text-stone-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 pl-10 rounded-xl bg-stone-900/80 border border-white/10 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-amber-400/60 transition-colors font-mono"
              />
              <Lock size={15} className="absolute left-3.5 top-3.5 text-stone-400 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative overflow-hidden h-11 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-medium text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" />
                <span>Authenticating...</span>
              </div>
            ) : (
              <>
                <span>Enter Admin Console</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Credentials hint for local setup */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-[11px] text-stone-400">
            Testing credentials:{' '}
            <code className="text-amber-300/90 font-mono bg-white/5 px-1.5 py-0.5 rounded">
              admin123
            </code>
          </p>
          <div className="mt-4">
            <Link
              href="/"
              className="text-xs text-stone-400 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              ← Return to Public Spatial Showroom
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#0a0908] flex items-center justify-center text-xs text-stone-400 font-mono">
          <span className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mr-3" />
          <span>Loading Admin Portal...</span>
        </div>
      }
    >
      <LoginFormContent />
    </React.Suspense>
  );
}
