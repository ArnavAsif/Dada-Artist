'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  HardDrive,
  Shield,
  Key,
  ExternalLink,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [status, setStatus] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const checkStatus = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/admin/status');
      const data = await res.json();
      setStatus(data.status);
    } catch (err: any) {
      setStatus({ connected: false, message: err?.message });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSeedResult(data.message);
        checkStatus();
      } else {
        setSeedResult(`Error: ${data.message}`);
      }
    } catch (err: any) {
      setSeedResult(`Seeding error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const sqlSnippet = `-- Create Tables & Storage in Supabase SQL Editor:
-- Run contents of supabase/schema.sql or copy this:
CREATE TABLE IF NOT EXISTS hero_settings (
  id SERIAL PRIMARY KEY,
  hero_image_url TEXT NOT NULL DEFAULT '/images/hero-room.png',
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid() NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  category TEXT DEFAULT 'Curated Decor',
  description TEXT NOT NULL,
  story TEXT DEFAULT '',
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  original_price NUMERIC(10, 2),
  currency TEXT DEFAULT 'USD',
  image_url TEXT NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  hotspot_x NUMERIC(6, 2) DEFAULT 50.00 NOT NULL,
  hotspot_y NUMERIC(6, 2) DEFAULT 50.00 NOT NULL,
  hotspot_width NUMERIC(6, 2) DEFAULT 10.00 NOT NULL,
  hotspot_height NUMERIC(6, 2) DEFAULT 10.00 NOT NULL,
  z_index INTEGER DEFAULT 10,
  dimensions TEXT DEFAULT '',
  stock INTEGER DEFAULT 1,
  lead_time TEXT DEFAULT 'In Stock • Ready to Dispatch',
  badge TEXT DEFAULT '',
  spatial_tag TEXT DEFAULT 'Living Salon',
  specs JSONB DEFAULT '[]'::jsonb,
  materials JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <h1 className="text-2xl font-light text-white tracking-tight">System & Backend Settings</h1>
        <p className="text-xs text-stone-400 mt-1">
          Monitor Supabase PostgreSQL connection, storage buckets, and seed migration routines.
        </p>
      </div>

      {/* Supabase Connection Status Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-stone-950/70 border border-white/10 backdrop-blur-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                status?.connected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
              }`}
            >
              <Database size={20} />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white flex items-center gap-2">
                <span>Supabase PostgreSQL Integration</span>
                {status?.connected ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Live Connected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    Local Store Mode
                  </span>
                )}
              </h2>
              <p className="text-xs text-stone-400 font-light mt-0.5">
                {status?.message || 'Checking database handshake...'}
              </p>
            </div>
          </div>

          <button
            onClick={checkStatus}
            disabled={testing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-white/10 text-stone-300 hover:text-white text-xs font-medium transition-colors self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw size={13} className={testing ? 'animate-spin' : ''} />
            <span>Test Handshake</span>
          </button>
        </div>

        {/* Diagnostic details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5 text-xs font-mono">
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="text-[10px] text-stone-500 uppercase">Configuration</div>
            <div className="text-stone-200 mt-0.5">
              {status?.configured ? 'Keys Present in .env' : 'Using Local Fallback'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="text-[10px] text-stone-500 uppercase">Products In Supabase</div>
            <div className="text-amber-300 mt-0.5 font-semibold">
              {status?.productCount !== undefined ? `${status.productCount} Rows` : 'Local Store'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="text-[10px] text-stone-500 uppercase">Storage Buckets</div>
            <div className="text-stone-200 mt-0.5">product-images, hero-images</div>
          </div>
        </div>

        {/* Database Seed Action */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-medium text-stone-200 uppercase tracking-wider font-mono">
              Database Sync & Seed
            </h3>
            <p className="text-[11px] text-stone-400 font-light mt-0.5">
              Push all 12 initial curated products and default room render to your Supabase tables.
            </p>
          </div>

          <button
            onClick={handleSeed}
            disabled={seeding || !status?.connected}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-amber-400/30 text-amber-300 text-xs font-medium transition-colors flex items-center gap-2 self-start sm:self-auto disabled:opacity-40"
          >
            <HardDrive size={14} />
            <span>{seeding ? 'Seeding Database...' : 'Sync Catalog to Supabase'}</span>
          </button>
        </div>

        {seedResult && (
          <div className="p-3 rounded-lg bg-white/5 text-xs text-amber-200 font-mono border border-white/10">
            {seedResult}
          </div>
        )}
      </div>

      {/* SQL Migration Quick Reference */}
      <div className="p-6 sm:p-8 rounded-2xl bg-stone-950/70 border border-white/10 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key size={16} className="text-amber-400" />
            <h2 className="text-sm font-medium text-white uppercase tracking-wider font-mono">
              Supabase SQL Schema Script
            </h2>
          </div>

          <button
            onClick={copySql}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-white/10 text-stone-300 hover:text-white text-xs transition-colors"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
          </button>
        </div>

        <p className="text-xs text-stone-400 font-light leading-relaxed">
          To set up a fresh Supabase project, navigate to the{' '}
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 hover:underline inline-flex items-center gap-1"
          >
            Supabase Dashboard <ExternalLink size={11} />
          </a>
          , open the <strong>SQL Editor</strong>, and run{' '}
          <code className="bg-stone-900 text-amber-200 px-1.5 py-0.5 rounded font-mono text-[11px]">
            supabase/schema.sql
          </code>
          .
        </p>

        <div className="p-4 rounded-xl bg-stone-900/90 border border-white/10 font-mono text-[11px] text-stone-300 overflow-x-auto max-h-48">
          <pre>{sqlSnippet}</pre>
        </div>
      </div>

      {/* Admin Authentication Info */}
      <div className="p-6 sm:p-8 rounded-2xl bg-stone-950/70 border border-white/10 backdrop-blur-md space-y-3">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-amber-400" />
          <h2 className="text-sm font-medium text-white uppercase tracking-wider font-mono">
            Security & Authentication
          </h2>
        </div>
        <p className="text-xs text-stone-400 font-light leading-relaxed">
          Admin routes are protected server-side with HTTP-only session cookies and Supabase Auth. Public
          users cannot create, update, or delete products. Service-role keys are strictly kept server-side and never exposed to client browsers.
        </p>
      </div>
    </div>
  );
}
