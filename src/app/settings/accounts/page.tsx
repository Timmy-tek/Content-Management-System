'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Platform } from '@/types';
import { PlatformBadge } from '@/components/PlatformBadge';
import { StatusCapsule } from '@/components/StatusCapsule';
import {
  RefreshCw,
  Unlink,
  Link2,
  Clock,
  Users,
  AlertTriangle
} from 'lucide-react';

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  facebook: 'Facebook',
};

type Notice = { type: 'success' | 'error'; text: string };

export default function ConnectedAccountsPage() {
  const { connections, connectionsLoading, reloadConnections } = useApp();

  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState<Platform | null>(null);
  const [showTokenForm, setShowTokenForm] = useState<Platform | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [accountIdInput, setAccountIdInput] = useState('');

  // Banner after coming back from Facebook / LinkedIn / TikTok
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const error = params.get('error');
    if (connected) {
      const label = PLATFORM_LABELS[connected as Platform] ?? connected;
      setNotice({ type: 'success', text: `${label} connected.` });
    } else if (error) {
      setNotice({ type: 'error', text: `Connection failed (${error}). Please try again.` });
    }
    if (connected || error) window.history.replaceState(null, '', '/settings/accounts');
  }, []);

  const callApi = async (url: string, body: unknown): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, error: data.error || 'Something went wrong' };
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error. Please try again.' };
    }
  };

  const handleDisconnect = async (platform: Platform) => {
    const label = PLATFORM_LABELS[platform];
    if (!window.confirm(`Disconnect ${label}? Any posts scheduled for ${label} will fail until you reconnect.`)) return;

    setBusy(platform);
    const result = await callApi('/api/connections/disconnect', { platform });
    if (result.ok) {
      setNotice({ type: 'success', text: `${label} disconnected.` });
      await reloadConnections();
    } else {
      setNotice({ type: 'error', text: result.error ?? 'Disconnect failed' });
    }
    setBusy(null);
  };

  const handleRefreshToken = async (platform: Platform) => {
    setBusy(platform);
    const result = await callApi('/api/connections/refresh', { platform });
    if (result.ok) {
      setNotice({ type: 'success', text: `${PLATFORM_LABELS[platform]} token refreshed.` });
      await reloadConnections();
    } else {
      setNotice({ type: 'error', text: result.error ?? 'Refresh failed' });
    }
    setBusy(null);
  };

  const handleSaveToken = async (platform: Platform) => {
    setBusy(platform);
    const result = await callApi('/api/connections/instagram', {
      accessToken: tokenInput.trim(),
      accountId: accountIdInput.trim(),
    });
    if (result.ok) {
      setNotice({ type: 'success', text: `${PLATFORM_LABELS[platform]} connected.` });
      setShowTokenForm(null);
      setTokenInput('');
      setAccountIdInput('');
      await reloadConnections();
    } else {
      setNotice({ type: 'error', text: result.error ?? 'Could not save connection' });
    }
    setBusy(null);
  };

  const connectLinkClass =
      'w-full inline-flex items-center justify-center gap-2 bg-[#111111] text-white hover:bg-[#222222] font-bold text-xs px-6 py-2.5 rounded-full font-space transition-all cursor-pointer shadow-md';

  return (
      <div className="max-w-5xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-space text-[#111111]">
            Connected Accounts & API Access
          </h1>
          <p className="text-sm text-[#555555] font-inter mt-1">
            Manage OAuth connections, account authorization tokens, and API sync states.
          </p>
        </div>

        {notice && (
            <div
                className={`rounded-2xl px-4 py-3 text-sm font-inter border ${
                    notice.type === 'success'
                        ? 'bg-[#A9F5A0]/20 border-[#A9F5A0] text-[#0B4F07]'
                        : 'bg-[#F5A9A9]/20 border-[#F5A9A9] text-[#8B2C2C]'
                }`}
            >
              {notice.text}
            </div>
        )}

        {connectionsLoading ? (
            <p className="text-sm text-[#555555] font-inter">Loading your accounts...</p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {connections.map((conn) => {
                const isExpiringSoon = conn.status === 'expiring';
                const isDisconnected = conn.status === 'disconnected';
                const isBusy = busy === conn.platform;

                return (
                    <div
                        key={conn.platform}
                        className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-black/5 border border-black/5 flex flex-col justify-between space-y-6 hover:shadow-xl transition-all"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <PlatformBadge platform={conn.platform} size="lg" />
                            <div>
                              <h3 className="text-base font-bold font-space text-[#111111]">
                                {conn.accountName || PLATFORM_LABELS[conn.platform]}
                              </h3>
                              <span className="text-xs text-[#666666] font-inter font-medium block">
                          {conn.connected ? conn.handle : 'Not connected'}
                        </span>
                            </div>
                          </div>

                          <StatusCapsule status={conn.status} size="sm" />
                        </div>

                        <div className="bg-[#F2F1EF] rounded-2xl p-4 space-y-2 text-xs font-inter">
                          <div className="flex items-center justify-between text-[#333333]">
                      <span className="flex items-center gap-1.5 text-[#666666]">
                        <Users className="w-3.5 h-3.5" />
                        Follower Count:
                      </span>
                            <span className="font-bold font-space text-[#111111] tabular-nums">
                        {conn.connected && conn.followers > 0 ? conn.followers.toLocaleString() : '—'}
                      </span>
                          </div>

                          <div className="flex items-center justify-between text-[#333333]">
                      <span className="flex items-center gap-1.5 text-[#666666]">
                        <Clock className="w-3.5 h-3.5" />
                        OAuth Token Expiration:
                      </span>
                            <span
                                className={`font-semibold font-space ${
                                    isExpiringSoon
                                        ? 'text-[#574300]'
                                        : isDisconnected
                                            ? 'text-[#5C0A0A]'
                                            : 'text-[#0B4F07]'
                                }`}
                            >
                        {conn.tokenExpiresAt}
                      </span>
                          </div>
                        </div>

                        {isExpiringSoon && (
                            <div className="flex items-center gap-2 text-xs text-[#574300] bg-[#F5E6A3]/40 p-3 rounded-2xl border border-[#F5E6A3]">
                              <AlertTriangle className="w-4 h-4 shrink-0" />
                              <span>
                        Token expires on {conn.tokenExpiresAt}. Refresh authorization now to prevent publishing disruption.
                      </span>
                            </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-black/5 flex items-center justify-between gap-3">
                        {conn.connected ? (
                            <>
                              <button
                                  disabled={isBusy}
                                  onClick={() => handleRefreshToken(conn.platform)}
                                  className="inline-flex items-center gap-1.5 bg-[#F2F1EF] hover:bg-[#E2E1DF] disabled:opacity-50 text-[#111111] font-bold text-xs px-4 py-2 rounded-full font-space transition-colors cursor-pointer"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-[#111111]" />
                                <span>{isBusy ? 'Working...' : 'Refresh Token'}</span>
                              </button>

                              <button
                                  disabled={isBusy}
                                  onClick={() => handleDisconnect(conn.platform)}
                                  className="inline-flex items-center gap-1.5 text-[#5C0A0A] hover:bg-[#F5A9A9]/20 disabled:opacity-50 font-bold text-xs px-4 py-2 rounded-full font-space transition-colors cursor-pointer"
                              >
                                <Unlink className="w-3.5 h-3.5" />
                                <span>Disconnect</span>
                              </button>
                            </>
                        ) : conn.platform === 'facebook' ? (
                            <a href="/api/auth/facebook/start" className={connectLinkClass}>
                              <Link2 className="w-4 h-4 text-[#E5F23A]" />
                              <span>Connect with Facebook</span>
                            </a>
                        ) : conn.platform === 'linkedin' ? (
                            <a href="/api/auth/linkedin/start" className={connectLinkClass}>
                              <Link2 className="w-4 h-4 text-[#E5F23A]" />
                              <span>Connect with LinkedIn</span>
                            </a>
                        ) : conn.platform === 'tiktok' ? (
                            <a href="/api/auth/tiktok/start" className={connectLinkClass}>
                              <Link2 className="w-4 h-4 text-[#E5F23A]" />
                              <span>Connect with TikTok</span>
                            </a>
                        ) : showTokenForm === conn.platform ? (
                            <div className="w-full space-y-2">
                              <input
                                  type="text"
                                  placeholder="Access token"
                                  value={tokenInput}
                                  onChange={(e) => setTokenInput(e.target.value)}
                                  className="w-full bg-[#F2F1EF] border border-black/10 rounded-xl px-3 py-2 text-xs font-inter"
                              />
                              <input
                                  type="text"
                                  placeholder="Instagram Business Account ID"
                                  value={accountIdInput}
                                  onChange={(e) => setAccountIdInput(e.target.value)}
                                  className="w-full bg-[#F2F1EF] border border-black/10 rounded-xl px-3 py-2 text-xs font-inter"
                              />
                              <button
                                  disabled={isBusy || !tokenInput.trim() || !accountIdInput.trim()}
                                  onClick={() => handleSaveToken(conn.platform)}
                                  className="w-full bg-[#111111] disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-full font-space"
                              >
                                {isBusy ? 'Checking...' : 'Save Connection'}
                              </button>
                            </div>
                        ) : (
                            <button onClick={() => setShowTokenForm(conn.platform)} className={connectLinkClass}>
                              <Link2 className="w-4 h-4 text-[#E5F23A]" />
                              <span>Connect Channel Account</span>
                            </button>
                        )}
                      </div>
                    </div>
                );
              })}
            </div>
        )}
      </div>
  );
}