import React, { useState } from 'react';
import {
  Activity,
  ChevronDown,
  Shield,
  Clock,
  Coffee,
  CheckCircle2,
  Calendar,
  Sparkles,
  Download,
  Info
} from 'lucide-react';

interface ArchitecturalStatusDashboardProps {
  onOpenHistoryModal?: () => void;
}

export const ArchitecturalStatusDashboard: React.FC<ArchitecturalStatusDashboardProps> = ({
  onOpenHistoryModal,
}) => {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState<boolean>(false);

  // Formatted date matching the screenshot
  const sessionDate = '23 Oct 2026, 12:39 pm';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 my-8 space-y-5 select-none animate-fade-in">
      {/* Top Rounded Card containing 3 Pastel Metric Cards & Expandable History */}
      <div className="bg-white/95 rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
        
        {/* 3 Pastel Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: Very Soft Lavender */}
          <div className="bg-[#F0F2FD] border border-[#E2E6FA] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 transition-all hover-lift">
            <div className="flex items-center justify-between text-indigo-700">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Session Started
              </span>
              <Clock className="w-4 h-4 opacity-75" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-extrabold text-slate-800">
                {sessionDate}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Free Academic Session Active
              </p>
            </div>
          </div>

          {/* Card 2: Very Soft Warm Cream */}
          <div className="bg-[#FFF9EE] border border-[#FEEACD] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 transition-all hover-lift">
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Breaks Taken
              </span>
              <Coffee className="w-4 h-4 opacity-75" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-extrabold text-slate-800">
                0 breaks
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Unbounded execution • No rate limits
              </p>
            </div>
          </div>

          {/* Card 3: Very Soft Mint Sage */}
          <div className="bg-[#EFF8F2] border border-[#DCF1E2] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 transition-all hover-lift">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Checked in
              </span>
              <CheckCircle2 className="w-4 h-4 opacity-75" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-extrabold text-slate-800">
                {sessionDate}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                AI Search Engine Synchronized
              </p>
            </div>
          </div>

        </div>

        {/* Expandable Attendance & Algorithm History Trigger */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className="w-full flex items-center justify-between py-2 text-indigo-700 hover:text-indigo-900 group transition-colors"
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <Activity className="w-4 h-4 text-indigo-600 transition-transform group-hover:scale-110" />
              <span>View attendance history (1)</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-indigo-500 transition-transform duration-200 ${
                isHistoryExpanded ? 'rotate-180 text-indigo-700' : ''
              }`}
            />
          </button>

          {/* Collapsible Session History Drawer */}
          {isHistoryExpanded && (
            <div className="mt-4 p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-3 animate-fade-in text-xs text-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                <span className="font-bold text-slate-900">
                  Registered Session Event #LPU-AI-2026-01
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px]">
                  100% Verified Attendance
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">Academic Course</span>
                  <span className="font-semibold text-slate-800">Artificial Intelligence Foundations</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Host Chapter</span>
                  <span className="font-semibold text-slate-800">AWS Student Builder Group (LPU)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Web Platform Tier</span>
                  <span className="font-semibold text-emerald-700">Free Open-Access Tier</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                Your attendance and laboratory milestones are tracked locally in this session. All algorithmic benchmark results, step counts, and telemetry remain your property and can be exported at any time.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Spacious Centered Indicator */}
      <div className="py-2 text-center text-xs text-slate-400 font-medium">
        Showing 1 of 1 event.
      </div>

      {/* Purple Shield Banner - Exactly matching the screenshot */}
      <div className="rounded-2xl bg-[#F7F5FE] border border-[#E9E4FC] p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
        {/* Shield Icon Badge */}
        <div className="w-8 h-8 rounded-xl bg-[#EDE8FD] border border-[#DDD6FE] flex items-center justify-center text-[#6D28D9] shrink-0 mt-0.5">
          <Shield className="w-4 h-4" />
        </div>

        {/* Text Content */}
        <div className="space-y-1">
          <h4 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
            Your attendance records
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            This page shows attendance associated with your signed-in account. Break time is excluded from attended time. If a record appears incorrect, contact the event organisers. AI Search Lab is a 100% free to use web tool with zero paywalls.
          </p>
        </div>
      </div>

    </div>
  );
};
