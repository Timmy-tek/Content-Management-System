'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ApiSettings } from '@/types';
import { StatusCapsule } from '@/components/StatusCapsule';
import {
  Key,
  Sparkles,
  Check,
  Eye,
  EyeOff,
  X,
  Plus
} from 'lucide-react';

export default function SettingsPage() {
  const { brandSettings, apiSettings, updateBrandSettings, updateApiSettings } = useApp();

  const [toneInput, setToneInput] = useState('');
  const [avoidInput, setAvoidInput] = useState('');
  const [ctaStyle, setCtaStyle] = useState(brandSettings.ctaStyle);
  const [targetAudience, setTargetAudience] = useState(brandSettings.targetAudience);

  const [showKeys, setShowKeys] = useState<Record<keyof ApiSettings, boolean>>({
    geminiApiKey: false,
    instagramClientId: false,
    instagramClientSecret: false,
    linkedinClientId: false,
    linkedinClientSecret: false,
    tiktokClientKey: false,
    tiktokClientSecret: false,
  });

  const [apiValues, setApiValues] = useState<ApiSettings>(apiSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleShowKey = (key: keyof ApiSettings) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApiChange = (key: keyof ApiSettings, value: string) => {
    setApiValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddTone = () => {
    if (toneInput.trim() && !brandSettings.tone.includes(toneInput.trim())) {
      updateBrandSettings({ tone: [...brandSettings.tone, toneInput.trim()] });
      setToneInput('');
    }
  };

  const handleRemoveTone = (tag: string) => {
    updateBrandSettings({ tone: brandSettings.tone.filter((t) => t !== tag) });
  };

  const handleAddAvoid = () => {
    if (avoidInput.trim() && !brandSettings.wordsToAvoid.includes(avoidInput.trim())) {
      updateBrandSettings({ wordsToAvoid: [...brandSettings.wordsToAvoid, avoidInput.trim()] });
      setAvoidInput('');
    }
  };

  const handleRemoveAvoid = (word: string) => {
    updateBrandSettings({ wordsToAvoid: brandSettings.wordsToAvoid.filter((w) => w !== word) });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrandSettings({ ctaStyle, targetAudience });
    updateApiSettings(apiValues);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const apiFields: { key: keyof ApiSettings; label: string; placeholder: string; helperNote: string }[] = [
    {
      key: 'geminiApiKey',
      label: 'Gemini AI API Key (GEMINI_API_KEY)',
      placeholder: 'AI_ZaSyD...',
      helperNote: 'Not connected — wire to backend',
    },
    {
      key: 'instagramClientId',
      label: 'Instagram Client ID (INSTAGRAM_CLIENT_ID)',
      placeholder: 'ig_app_98432...',
      helperNote: 'Not connected — wire to backend',
    },
    {
      key: 'instagramClientSecret',
      label: 'Instagram Client Secret (INSTAGRAM_CLIENT_SECRET)',
      placeholder: 'ig_sec_88321...',
      helperNote: 'Not connected — wire to backend',
    },
    {
      key: 'linkedinClientId',
      label: 'LinkedIn Client ID (LINKEDIN_CLIENT_ID)',
      placeholder: 'li_app_77213...',
      helperNote: 'Not connected — wire to backend',
    },
    {
      key: 'linkedinClientSecret',
      label: 'LinkedIn Client Secret (LINKEDIN_CLIENT_SECRET)',
      placeholder: 'li_sec_66412...',
      helperNote: 'Not connected — wire to backend',
    },
    {
      key: 'tiktokClientKey',
      label: 'TikTok Client Key (TIKTOK_CLIENT_KEY)',
      placeholder: 'tt_key_11223...',
      helperNote: 'Not connected — wire to backend',
    },
    {
      key: 'tiktokClientSecret',
      label: 'TikTok Client Secret (TIKTOK_CLIENT_SECRET)',
      placeholder: 'tt_sec_33445...',
      helperNote: 'Not connected — wire to backend',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="bg-surface-card rounded-3xl p-5 border border-surface-border card-shadow">
        <span className="text-[10px] font-bold font-sans uppercase tracking-wider text-muted block">
          ENGINE GOVERNANCE
        </span>
        <h1 className="text-2xl font-bold font-display text-foreground">
          Engine Settings & Governance
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Configure Brand Voice rules, tone bounds, and developer API endpoint key placeholders.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">

        {/* SECTION 1: BRAND VOICE */}
        <div className="bg-surface-card rounded-3xl p-6 sm:p-8 border border-surface-border card-shadow space-y-6">
          <div className="flex items-center gap-2 border-b border-surface-border pb-4">
            <Sparkles className="w-5 h-5 text-foreground" />
            <h2 className="text-lg font-bold font-display text-foreground">
              Brand Voice & AI Adaptation Rules
            </h2>
          </div>

          {/* Tone Tags */}
          <div>
            <label className="block text-xs font-bold font-display text-foreground uppercase tracking-wider mb-2">
              Approved Brand Tone Attributes
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {brandSettings.tone.map((tag) => (
                <span
                  key={tag}
                  className="bg-surface-muted border border-surface-border text-foreground px-3.5 py-1.5 rounded-full text-xs font-bold font-display flex items-center gap-1.5"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTone(tag)}
                    className="hover:text-rose-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Add tone attribute (e.g. Authoritative)"
                value={toneInput}
                onChange={(e) => setToneInput(e.target.value)}
                className="flex-1 bg-surface-muted border border-surface-border rounded-full px-4 py-1.5 text-xs font-sans text-foreground focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTone}
                className="bg-header-dark text-white p-2 rounded-full hover:bg-black"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Words to Avoid */}
          <div>
            <label className="block text-xs font-bold font-display text-foreground uppercase tracking-wider mb-2">
              Blacklisted Words & Buzzwords
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {brandSettings.wordsToAvoid.map((word) => (
                <span
                  key={word}
                  className="bg-rose-100 text-rose-800 border border-rose-300 px-3.5 py-1.5 rounded-full text-xs font-bold font-display flex items-center gap-1.5"
                >
                  <span>{word}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAvoid(word)}
                    className="hover:text-black p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Add word to avoid (e.g. synergy)"
                value={avoidInput}
                onChange={(e) => setAvoidInput(e.target.value)}
                className="flex-1 bg-surface-muted border border-surface-border rounded-full px-4 py-1.5 text-xs font-sans text-foreground focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddAvoid}
                className="bg-header-dark text-white p-2 rounded-full hover:bg-black"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CTA Style & Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold font-display text-foreground uppercase tracking-wider mb-2">
                CTA Hook Philosophy
              </label>
              <input
                type="text"
                value={ctaStyle}
                onChange={(e) => setCtaStyle(e.target.value)}
                className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-2 text-xs font-sans text-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-display text-foreground uppercase tracking-wider mb-2">
                Target Executive Audience
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-2 text-xs font-sans text-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: DEVELOPER API KEYS */}
        <div className="bg-surface-card rounded-3xl p-6 sm:p-8 border border-surface-border card-shadow space-y-6">
          <div className="flex items-center justify-between border-b border-surface-border pb-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-foreground" />
              <div>
                <h2 className="text-lg font-bold font-display text-foreground">
                  Developer — Wire to Backend
                </h2>
                <p className="text-xs text-muted">
                  API keys and client credentials configured for channel syncing.
                </p>
              </div>
            </div>

            <StatusCapsule status="pending" label="Sandbox Mode" size="sm" />
          </div>

          <div className="space-y-4">
            {apiFields.map((field) => {
              const val = apiValues[field.key] || '';
              const isVisible = showKeys[field.key];

              return (
                <div key={field.key} className="bg-surface-muted p-4 rounded-xl border border-surface-border space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold font-display text-foreground">
                      {field.label}
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted font-sans italic">
                        {field.helperNote}
                      </span>
                      <StatusCapsule status="needs_attention" label="Not set" size="sm" />
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type={isVisible ? 'text' : 'password'}
                      placeholder={field.placeholder}
                      value={val}
                      onChange={(e) => handleApiChange(field.key, e.target.value)}
                      className="w-full bg-surface-card border border-surface-border rounded-lg px-4 py-2 text-xs font-mono text-foreground pr-10 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(field.key)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1"
                    >
                      {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="text-xs font-bold font-display text-emerald-800 bg-emerald-100 px-4 py-2 rounded-full inline-flex items-center gap-1.5 border border-emerald-300">
              <Check className="w-4 h-4" />
              Settings & Governance Saved
            </span>
          ) : (
            <span className="text-xs text-muted font-sans">
              Stored locally for execution.
            </span>
          )}

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 bg-header-dark text-white hover:bg-black font-bold text-xs px-8 py-3 rounded-full card-shadow transition-all font-display"
          >
            <Check className="w-4 h-4 text-accent-yellow" />
            <span>Save Engine Rules</span>
          </button>
        </div>

      </form>
    </div>
  );
}
