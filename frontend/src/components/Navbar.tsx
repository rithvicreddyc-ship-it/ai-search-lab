import React, { useEffect, useState } from 'react';
import {
  Compass,
  Cpu,
  GraduationCap,
  Layers,
  PlayCircle,
  BarChart3,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  BookOpen
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

  return (
    <header className="sticky top-0 z-50 bg-[#0d121d]/90 backdrop-blur-md border-b border-lab-border/70 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Course Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange('landing')}
              className="flex items-center gap-2.5 text-left group transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-white tracking-tight">AI Search Lab</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                    AI Foundations
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">Interactive Algorithm Visualiser</p>
              </div>
            </button>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#131926]/90 p-1 rounded-xl border border-lab-border/50">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions & Health Status */}
          <div className="flex items-center gap-2.5">
            {onExportConfig && (
              <button
                onClick={onExportConfig}
                title="Export current problem configuration (JSON)"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            )}

            {onImportConfig && (
              <button
                onClick={onImportConfig}
                title="Import saved problem configuration (JSON)"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import</span>
              </button>
            )}

            {/* Health status pill */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                backendHealthy === true
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : backendHealthy === false
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
              title={
                backendHealthy === true
                  ? 'AI Search Engine is online and ready'
                  : backendHealthy === false
                  ? 'Connecting to AI Engine...'
                  : 'Initializing AI Engine...'
              }
            >
              {backendHealthy === true ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="hidden sm:inline">AI Engine Live</span>
                </>
              ) : backendHealthy === false ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="hidden sm:inline">AI Engine Live</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span className="hidden sm:inline">Connecting...</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-lab-border/40 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
