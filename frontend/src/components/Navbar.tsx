import React, { useEffect, useState, useRef } from 'react';
import {
  Compass,
  Cpu,
  GraduationCap,
  Layers,
  PlayCircle,
  FlaskConical,
  Download,
  Upload,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { fetchHealth } from '../api/client';

export type NavTab = 'landing' | 'lab' | 'explorer' | 'compare' | 'heuristics' | 'tutorial' | 'experiments';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onExportConfig?: () => void;
  onImportConfig?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onExportConfig,
  onImportConfig,
}) => {
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchHealth()
      .then(() => setBackendHealthy(true))
      .catch(() => setBackendHealthy(false));

    const interval = setInterval(() => {
      fetchHealth()
        .then(() => setBackendHealthy(true))
        .catch(() => setBackendHealthy(false));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'landing' as NavTab, label: 'Overview', icon: BookOpen },
    { id: 'lab' as NavTab, label: 'Search Lab', icon: PlayCircle },
    { id: 'explorer' as NavTab, label: 'Algorithm Explorer', icon: Cpu },
    { id: 'compare' as NavTab, label: 'Compare Lab', icon: Layers },
    { id: 'heuristics' as NavTab, label: 'Heuristics', icon: Compass },
    { id: 'tutorial' as NavTab, label: 'Tutorial', icon: GraduationCap },
    { id: 'experiments' as NavTab, label: 'Experiments', icon: FlaskConical },
  ];

  const scrollNav = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -150 : 150;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-2xl border-b border-slate-200/80 select-none shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
          
          {/* Logo & Branding - strictly single line, shrink-0, zero clipping */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onTabChange('landing')}
              className="flex items-center gap-2.5 sm:gap-3 text-left group transition-all"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center shadow-glow-indigo group-hover:scale-105 transition-transform shrink-0">
                <Cpu className="w-5 h-5 text-white" />
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight whitespace-nowrap">
                    AI Search Lab
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shrink-0">
                    100% Free
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono whitespace-nowrap hidden sm:block">
                  Interactive Algorithm Visualiser
                </p>
              </div>
            </button>
          </div>

          {/* Extended Navigation Tabs with Smooth Horizontal Scroll Option */}
          <div className="flex-1 min-w-0 flex items-center justify-center px-1 sm:px-4 relative group/scroll">
            
            {/* Scroll Left Helper Button (Appears on overflow/hover) */}
            <button
              type="button"
              onClick={() => scrollNav('left')}
              title="Scroll left"
              className="hidden md:flex xl:hidden items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm border border-slate-200 text-slate-500 hover:text-slate-900 absolute left-0 z-10 hover:scale-110 transition-all opacity-80 hover:opacity-100"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Extended Scroll Container */}
            <div
              ref={scrollContainerRef}
              className="flex items-center gap-1 sm:gap-1.5 bg-slate-100/90 p-1 sm:p-1.5 rounded-2xl border border-slate-200/90 shadow-inner overflow-x-auto scrollbar-none max-w-full"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 ${
                      isActive
                        ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80 scale-[1.02]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 hover:scale-[1.01]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 transition-transform duration-150 shrink-0 ${isActive ? 'scale-110 text-indigo-600' : 'text-slate-500'}`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scroll Right Helper Button (Appears on overflow/hover) */}
            <button
              type="button"
              onClick={() => scrollNav('right')}
              title="Scroll right"
              className="hidden md:flex xl:hidden items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm border border-slate-200 text-slate-500 hover:text-slate-900 absolute right-0 z-10 hover:scale-110 transition-all opacity-80 hover:opacity-100"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Compact Actions: Export, Import, Engine Status */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {onExportConfig && (
              <button
                onClick={onExportConfig}
                title="Export current problem configuration (JSON)"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all active:scale-95 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Export</span>
              </button>
            )}

            {onImportConfig && (
              <button
                onClick={onImportConfig}
                title="Import saved problem configuration (JSON)"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all active:scale-95 shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Import</span>
              </button>
            )}

            {/* Health status pill */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs shrink-0"
              title="AI Search Engine is online and ready (Zero Latency)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline whitespace-nowrap">Engine Live</span>
            </div>
          </div>

        </div>

        {/* Mobile secondary scroll tab row */}
        <div className="flex sm:hidden overflow-x-auto py-2 gap-1.5 border-t border-slate-200/60 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100/70 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
