'use client';

import React from 'react';

interface ScrubberBarProps {
  currentStage?: number; // 0 to totalStages - 1
  totalStages?: number;
  onScrub?: (stageIndex: number) => void;
  className?: string;
  labels?: string[];
}

export function ScrubberBar({
  currentStage = 3,
  totalStages = 5,
  onScrub,
  className = '',
  labels = ['Upload', 'Analyze', 'Adapt', 'Review', 'Publish'],
}: ScrubberBarProps) {
  const percentage = (currentStage / (totalStages - 1)) * 100;

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[90%] ${className}`}>
      {/* Dark pill scrubber bar */}
      <div className="bg-[#111110] border border-[#E5F23A]/30 text-white rounded-full px-6 py-3 shadow-2xl flex items-center gap-4 backdrop-blur-md">
        <div className="text-[11px] font-bold text-[#E5F23A] font-space tracking-wider uppercase shrink-0">
          Scrubber
        </div>

        {/* Timeline Bar Track */}
        <div className="relative flex-1 h-2 bg-[#3A3936] rounded-full overflow-hidden cursor-pointer group">
          {/* Progress fill */}
          <div
            className="absolute top-0 left-0 bottom-0 bg-[#E5F23A] transition-all duration-300 ease-out rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Lime Dot Markers */}
        <div className="flex items-center gap-3 shrink-0">
          {Array.from({ length: totalStages }).map((_, idx) => {
            const isActive = idx === currentStage;
            const isPassed = idx < currentStage;

            return (
              <button
                key={idx}
                onClick={() => onScrub && onScrub(idx)}
                className={`relative group/dot flex items-center justify-center p-1 rounded-full transition-all focus:outline-none`}
                title={labels[idx] || `Stage ${idx + 1}`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full transition-all ${
                    isActive
                      ? 'bg-[#E5F23A] ring-4 ring-[#E5F23A]/40 scale-125'
                      : isPassed
                      ? 'bg-[#E5F23A]'
                      : 'bg-[#4A4945] hover:bg-white/50'
                  }`}
                />

                {/* Tooltip on hover */}
                <span className="absolute bottom-full mb-2 hidden group-hover/dot:block bg-[#2A2926] text-white text-[10px] font-medium px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-50 border border-white/10">
                  {labels[idx] || `Stage ${idx + 1}`}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs font-semibold text-white/70 shrink-0 font-space min-w-[50px] text-right">
          {currentStage + 1} / {totalStages}
        </div>
      </div>
    </div>
  );
}
