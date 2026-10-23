import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { ArchitecturalModal, ModalType } from './ArchitecturalModal';

interface ArchitecturalFooterProps {
  onNavigateToLab?: () => void;
}

export const ArchitecturalFooter: React.FC<ArchitecturalFooterProps> = ({
  onNavigateToLab,
}) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  return (
    <>
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-8 relative z-20 print:hidden select-none">
        {/* Main Architectural Island Container */}
        <div className="bg-[#FAF8F3] border border-[#EBE4D5] rounded-[2.25rem] p-6 sm:p-8 shadow-sm transition-all hover:shadow-md relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            
            {/* Left Brand Identity: AI Search Lab Visualiser Header */}
            <div className="flex items-start gap-4">
              {/* Modular Pixel SVG Logo - Stepped Search Graph Nodes & Core Blocks */}
              <div className="shrink-0 w-12 h-12 flex items-center justify-center p-1 rounded-2xl bg-white/70 border border-[#E6E0D2] shadow-2xs">
                <svg
                  viewBox="0 0 32 32"
                  className="w-10 h-10 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Purple Outer Node Exploration Pixels */}
                  <rect x="2" y="6" width="6" height="6" rx="1" fill="#8B5CF6" />
                  <rect x="8" y="2" width="6" height="6" rx="1" fill="#8B5CF6" />
                  <rect x="18" y="2" width="6" height="6" rx="1" fill="#8B5CF6" />
                  <rect x="24" y="6" width="6" height="6" rx="1" fill="#8B5CF6" />
                  
                  {/* Side frontier pixels */}
                  <rect x="2" y="14" width="6" height="6" rx="1" fill="#8B5CF6" />
                  <rect x="24" y="14" width="6" height="6" rx="1" fill="#8B5CF6" />
                  
                  {/* Bottom frontier pixels */}
                  <rect x="2" y="22" width="6" height="6" rx="1" fill="#8B5CF6" />
                  <rect x="8" y="26" width="6" height="6" rx="1" fill="#8B5CF6" />
                  <rect x="18" y="26" width="6" height="6" rx="1" fill="#8B5CF6" />
                  <rect x="24" y="22" width="6" height="6" rx="1" fill="#8B5CF6" />

                  {/* Golden Yellow Search State Core */}
                  <rect x="8" y="8" width="16" height="16" rx="2" fill="#FBBF24" />
                </svg>
              </div>

              {/* Text Information */}
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                  AI Search Lab
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Artificial Intelligence Foundations • Developed by{' '}
                  <a
                    href="https://www.linkedin.com/in/rithvic-reddy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
                  >
                    Rithvic Reddy
                  </a>{' '}
                  (
                  <a
                    href="mailto:rithvicreddyc@gmail.com"
                    className="hover:underline text-slate-600 hover:text-slate-900"
                  >
                    rithvicreddyc@gmail.com
                  </a>
                  )
                </p>
                <div className="pt-2 text-[11px] font-mono text-slate-400">
                  © 2026 AI Search Lab • 100% Free Open Educational Tool
                </div>
              </div>
            </div>

            {/* Right Architectural Interactive Pill Badges & Whimsical Shape */}
            <div className="flex flex-col items-start md:items-end gap-5 w-full md:w-auto">
              
              <div className="flex items-center gap-3 relative">
                {/* Floating Indigo Dot */}
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse absolute -top-5 left-1/4 hidden sm:block" />

                {/* Organic Peach Decorative Blob with Asterisk */}
                <div
                  title="AI Builder Spark"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.75rem] bg-[#FCE8DC] flex items-center justify-center relative shadow-inner shrink-0 group hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => setActiveModal('perks')}
                >
                  <span className="text-[#C05621] text-2xl font-light transform group-hover:rotate-45 transition-transform duration-300">
                    ✳
                  </span>
                </div>

                {/* 4 Pastel Pill Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Events Pill */}
                  <button
                    type="button"
                    onClick={() => setActiveModal('events')}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#FCE7A2] hover:bg-[#FCD34D] text-[#78350F] transition-all duration-150 hover-lift active:scale-95 shadow-2xs"
                  >
                    Events
                  </button>

                  {/* Projects Pill */}
                  <button
                    type="button"
                    onClick={() => setActiveModal('projects')}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#E2D9F3] hover:bg-[#D5C6F0] text-[#4C1D95] transition-all duration-150 hover-lift active:scale-95 shadow-2xs"
                  >
                    Projects
                  </button>

                  {/* Community Pill */}
                  <button
                    type="button"
                    onClick={() => setActiveModal('community')}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#D1F4E0] hover:bg-[#B8ECD0] text-[#065F46] transition-all duration-150 hover-lift active:scale-95 shadow-2xs"
                  >
                    Community
                  </button>

                  {/* Perks Pill */}
                  <button
                    type="button"
                    onClick={() => setActiveModal('perks')}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#FFD8C2] hover:bg-[#FFC6A5] text-[#9A3412] transition-all duration-150 hover-lift active:scale-95 shadow-2xs"
                  >
                    Perks
                  </button>
                </div>
              </div>

              {/* Find us around the web + Social Pill Buttons with Arrow */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs pt-1">
                <span className="text-slate-500 font-medium">Connect & Repository</span>

                {/* LinkedIn ↗ */}
                <a
                  href="https://www.linkedin.com/in/rithvic-reddy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 font-medium text-xs shadow-2xs transition-all hover-lift flex items-center gap-1 active:scale-95"
                >
                  <span>LinkedIn</span>
                  <span className="text-slate-400 font-mono text-[10px]">↗</span>
                </a>

                {/* Email ↗ */}
                <a
                  href="mailto:rithvicreddyc@gmail.com"
                  className="px-3.5 py-1 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 font-medium text-xs shadow-2xs transition-all hover-lift flex items-center gap-1 active:scale-95"
                >
                  <span>Email</span>
                  <span className="text-slate-400 font-mono text-[10px]">↗</span>
                </a>

                {/* GitHub ↗ */}
                <a
                  href="https://github.com/rithvicreddyc-ship-it/ai-search-lab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 font-medium text-xs shadow-2xs transition-all hover-lift flex items-center gap-1 active:scale-95"
                >
                  <span>GitHub</span>
                  <span className="text-slate-400 font-mono text-[10px]">↗</span>
                </a>

                {/* Documentation / Tutorial */}
                <button
                  type="button"
                  onClick={() => setActiveModal('projects')}
                  className="px-3.5 py-1 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 font-medium text-xs shadow-2xs transition-all hover-lift flex items-center gap-1 active:scale-95"
                >
                  <span>Docs</span>
                  <span className="text-slate-400 font-mono text-[10px]">↗</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </footer>

      {/* Interactive Modal Drawer for Pill Buttons */}
      <ArchitecturalModal
        type={activeModal}
        onClose={() => setActiveModal(null)}
        onNavigateToLab={onNavigateToLab}
      />
    </>
  );
};
