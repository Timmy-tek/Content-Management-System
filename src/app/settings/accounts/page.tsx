'use client';

import React from 'react';
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

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {connections.map((conn) => {
          const isExpiringSoon = conn.status === 'expiring';
          const isDisconnected = conn.status === 'disconnected';

          return (
            <div
              key={conn.platform}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-black/5 border border-black/5 flex flex-col justify-between space-y-6 hover:shadow-xl transition-all"
            >
              {/* Top Row: Account & Badge */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PlatformBadge platform={conn.platform} size="lg" />
                    <div>
                      <h3 className="text-base font-bold font-space text-[#111111]">
                        {conn.accountName}
                      </h3>
                      <span className="text-xs text-[#666666] font-inter font-medium block">
                        {conn.handle}
                      </span>
                    </div>
                  </div>

                  <StatusCapsule status={conn.status} size="sm" />
                </div>

                {/* Account details */}
                <div className="bg-[#F2F1EF] rounded-2xl p-4 space-y-2 text-xs font-inter">
                  <div className="flex items-center justify-between text-[#333333]">
                    <span className="flex items-center gap-1.5 text-[#666666]">
                      <Users className="w-3.5 h-3.5" />
                      Follower Count:
                    </span>
                    <span className="font-bold font-space text-[#111111] tabular-nums">
                      {conn.followers.toLocaleString()}
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

                {/* Token Expiry Banner */}
                {isExpiringSoon && (
                  <div className="flex items-center gap-2 text-xs text-[#574300] bg-[#F5E6A3]/40 p-3 rounded-2xl border border-[#F5E6A3]">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      Token expires in 3 days. Refresh authorization now to prevent publishing disruption.
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-black/5 flex items-center justify-between gap-3">
                {conn.connected ? (
                  <>
                    <button
                      onClick={() => handleRefreshToken(conn.platform)}
                      className="inline-flex items-center gap-1.5 bg-[#F2F1EF] hover:bg-[#E2E1DF] text-[#111111] font-bold text-xs px-4 py-2 rounded-full font-space transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#111111]" />
                      <span>Refresh Token</span>
                    </button>

                    <button
                      onClick={() => handleToggleConnection(conn.platform, true)}
                      className="inline-flex items-center gap-1.5 text-[#5C0A0A] hover:bg-[#F5A9A9]/20 font-bold text-xs px-4 py-2 rounded-full font-space transition-colors cursor-pointer"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </button>
                  </>
                ) : conn.platform === 'linkedin' ? (

                        href="/api/auth/linkedin/start"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#111111] text-white hover:bg-[#222222] font-bold text-xs px-6 py-2.5 rounded-full font-space transition-all cursor-pointer shadow-md"
                        >
                        <Link2 className="w-4 h-4 text-[#E5F23A]" />
                  <span>Connect with LinkedIn</span>
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
                  onClick={() => handleSaveToken(conn.platform)}
                  className="w-full bg-[#111111] text-white font-bold text-xs px-4 py-2 rounded-full font-space"
              >
                Save Connection
              </button>
            </div>
        ) : (
          <button
              onClick={() => setShowTokenForm(conn.platform)}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#111111] text-white hover:bg-[#222222] font-bold text-xs px-6 py-2.5 rounded-full font-space transition-all cursor-pointer shadow-md"
          >
            <Link2 className="w-4 h-4 text-[#E5F23A]" />
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
