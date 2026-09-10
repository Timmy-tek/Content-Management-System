'use client';

import React, { useState } from 'react';
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

export default function ConnectedAccountsPage() {
  const { connections, updateConnection } = useApp();

  const handleToggleConnection = (platform: Platform, currentStatus: boolean) => {
    if (currentStatus) {
      updateConnection(platform, {
        connected: false,
        status: 'disconnected',
        tokenExpiresAt: 'Disconnected',
      });
    } else {
      updateConnection(platform, {
        connected: true,
        status: 'connected',
        tokenExpiresAt: 'in 60 days',
      });
    }
  };

  const handleRefreshToken = (platform: Platform) => {
    updateConnection(platform, {
      connected: true,
      status: 'connected',
      tokenExpiresAt: 'in 90 days',
    });
  };

  const [showTokenForm, setShowTokenForm] = useState<Platform | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [accountIdInput, setAccountIdInput] = useState('');

  const handleSaveToken = (platform: Platform) => {
    updateConnection(platform, {
      connected: true,
      status: 'connected',
      accessToken: tokenInput,
      accountId: accountIdInput,
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    });
    setShowTokenForm(null);
    setTokenInput('');
    setAccountIdInput('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-surface-card rounded-3xl p-5 border border-surface-border card-shadow">
        <span className="text-[10px] font-bold font-sans uppercase tracking-wider text-muted block">
          CHANNEL TOKENS & OAUTH
        </span>
        <h1 className="text-2xl font-bold font-display text-foreground">
          Connected Accounts & API Access
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Manage OAuth connections, account authorization tokens, and API sync states.
        </p>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {connections.map((conn) => {
          const isExpiringSoon = conn.status === 'expiring';

          return (
            <div
              key={conn.platform}
              className="bg-surface-card rounded-3xl p-6 border border-surface-border card-shadow flex flex-col justify-between space-y-6"
            >
              {/* Top Row */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PlatformBadge platform={conn.platform} size="lg" />
                    <div>
                      <h3 className="text-base font-bold font-display text-foreground">
                        {conn.accountName}
                      </h3>
                      <span className="text-xs text-muted font-sans font-medium block">
                        {conn.handle}
                      </span>
                    </div>
                  </div>

                  <StatusCapsule status={conn.status} size="sm" />
                </div>

                {/* Account details */}
                <div className="bg-surface-muted rounded-xl p-4 space-y-2 text-xs font-sans border border-surface-border">
                  <div className="flex items-center justify-between text-foreground">
                    <span className="flex items-center gap-1.5 text-muted">
                      <Users className="w-3.5 h-3.5" />
                      Follower Count:
                    </span>
                    <span className="font-bold font-display tabular-nums">
                      {conn.followers.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-foreground">
                    <span className="flex items-center gap-1.5 text-muted">
                      <Clock className="w-3.5 h-3.5" />
                      OAuth Token Expiration:
                    </span>
                    <span className="font-semibold font-display">
                      {conn.tokenExpiresAt}
                    </span>
                  </div>
                </div>

                {/* Token Expiry Banner */}
                {isExpiringSoon && (
                  <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-100 p-3 rounded-xl border border-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      Token expires in 3 days. Refresh authorization now to prevent publishing disruption.
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-surface-border flex items-center justify-between gap-3">
                {conn.connected ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleRefreshToken(conn.platform)}
                      className="inline-flex items-center gap-1.5 bg-surface-muted hover:bg-surface-border text-foreground font-bold text-xs px-4 py-2 rounded-full font-display border border-surface-border transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-foreground" />
                      <span>Refresh Token</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleConnection(conn.platform, true)}
                      className="inline-flex items-center gap-1.5 text-rose-700 hover:bg-rose-100 font-bold text-xs px-4 py-2 rounded-full font-display transition-colors"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </button>
                  </>
                ) : conn.platform === 'linkedin' ? (
                  <a
                    href="/api/auth/linkedin/start"
                    className="w-full inline-flex items-center justify-center gap-2 bg-header-dark text-white hover:bg-black font-bold text-xs px-6 py-2.5 rounded-full font-display transition-all card-shadow"
                  >
                    <Link2 className="w-4 h-4 text-accent-yellow" />
                    <span>Connect with LinkedIn</span>
                  </a>
                ) : conn.platform === 'tiktok' ? (
                  <a
                    href="/api/auth/tiktok/start"
                    className="w-full inline-flex items-center justify-center gap-2 bg-header-dark text-white hover:bg-black font-bold text-xs px-6 py-2.5 rounded-full font-display transition-all card-shadow"
                  >
                    <Link2 className="w-4 h-4 text-accent-yellow" />
                    <span>Connect with TikTok</span>
                  </a>
                ) : showTokenForm === conn.platform ? (
                  <div className="w-full space-y-2">
                    <input
                      type="text"
                      placeholder="Access token"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      className="w-full bg-surface-muted border border-surface-border rounded-lg px-3 py-1.5 text-xs font-sans"
                    />
                    <input
                      type="text"
                      placeholder="Account ID"
                      value={accountIdInput}
                      onChange={(e) => setAccountIdInput(e.target.value)}
                      className="w-full bg-surface-muted border border-surface-border rounded-lg px-3 py-1.5 text-xs font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveToken(conn.platform)}
                      className="w-full bg-header-dark text-white font-bold text-xs px-4 py-2 rounded-full font-display"
                    >
                      Save Connection
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowTokenForm(conn.platform)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-header-dark text-white hover:bg-black font-bold text-xs px-6 py-2.5 rounded-full font-display transition-all card-shadow"
                  >
                    <Link2 className="w-4 h-4 text-accent-yellow" />
                    <span>Connect Channel Account</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
