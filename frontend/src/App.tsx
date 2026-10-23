import React, { useState, useRef } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { SearchLab } from './components/SearchLab/SearchLab';
import { AlgorithmExplorer } from './components/AlgorithmExplorer/AlgorithmExplorer';
import { CompareLab } from './components/CompareLab/CompareLab';
import { HeuristicsLab } from './components/HeuristicsLab/HeuristicsLab';
import { GuidedTutorial } from './components/GuidedTutorial/GuidedTutorial';
import { ExperimentsLab } from './components/ExperimentsLab/ExperimentsLab';
import { WaterBackground } from './components/WaterBackground';
import { SmartCursor } from './components/SmartCursor';
import { AlgorithmType, GraphState, GridState, LabLaunchConfig, ProblemType } from './types';
import { exportToJson } from './utils/export';

import { ArchitecturalFooter } from './components/ArchitecturalFooter';

export const App: React.FC = () => {
  // Initialize to the Overview (Landing) page on start
  const getInitialTab = (): NavTab => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '') as NavTab;
      const validTabs: NavTab[] = ['landing', 'lab', 'explorer', 'compare', 'heuristics', 'tutorial', 'experiments'];
      if (validTabs.includes(hash)) return hash;
    }
    return 'landing'; // Starts with Overview
  };

  const [currentTab, setCurrentTab] = useState<NavTab>(getInitialTab);

  const handleTabChange = (tab: NavTab) => {
    setCurrentTab(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab;
    }
  };

  // Shared Problem States
  const [problemType, setProblemType] = useState<ProblemType>('grid');

  const [currentGrid, setCurrentGrid] = useState<GridState>({
    rows: 15,
    cols: 25,
    start: [1, 1],
    goal: [13, 23],
    walls: [],
    terrain: {},
    diagonal_movement: false,
  });

  const [currentGraph, setCurrentGraph] = useState<GraphState>({
    nodes: [],
    edges: [],
    start: '',
    goal: '',
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExportConfig = () => {
    const config = {
      project: 'AI Search Lab (Artificial Intelligence Foundations)',
      problemType,
      grid: currentGrid,
      graph: currentGraph,
      exportedAt: new Date().toISOString(),
    };
    exportToJson(config, `ai_search_${problemType}_config.json`);
  };

  const handleImportConfig = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.problemType) setProblemType(parsed.problemType);
        if (parsed.grid) setCurrentGrid(parsed.grid);
        if (parsed.graph) setCurrentGraph(parsed.graph);
        alert('Configuration imported successfully! Navigating to Search Lab.');
        handleTabChange('lab');
      } catch (err) {
        alert('Failed to parse JSON file. Please provide a valid configuration export.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const [labLaunchConfig, setLabLaunchConfig] = useState<LabLaunchConfig | null>(null);

  const handleLaunchInLab = (config: LabLaunchConfig) => {
    setLabLaunchConfig(config);
    handleTabChange('lab');
  };

  return (
    <div className="min-h-screen bg-lab-bg text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white relative overflow-x-hidden">
      {/* Animated Moving Watermark & Water Waves Background */}
      <WaterBackground />

      {/* Smart Cursor with Particle Trail & Click Shockwave Effects */}
      <SmartCursor />

      {/* Hidden file input for importing configurations */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Main Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onExportConfig={handleExportConfig}
        onImportConfig={handleImportConfig}
      />

      {/* Main View Area with Classy Page Mount Animation */}
      <main key={currentTab} className="flex-1 py-6 relative z-10 animate-fade-in-up">
        {currentTab === 'landing' && <LandingPage onNavigate={handleTabChange} />}
        {currentTab === 'lab' && <SearchLab launchConfig={labLaunchConfig} />}
        {currentTab === 'explorer' && (
          <AlgorithmExplorer
            onLoadAlgorithmInLab={(alg) => {
              if (alg) {
                handleLaunchInLab({ algorithm: alg });
              } else {
                handleTabChange('lab');
              }
            }}
            onNavigate={handleTabChange}
          />
        )}
        {currentTab === 'compare' && (
          <CompareLab
            currentGrid={currentGrid}
            currentGraph={currentGraph}
            problemType={problemType}
          />
        )}
        {currentTab === 'heuristics' && <HeuristicsLab />}
        {currentTab === 'tutorial' && (
          <GuidedTutorial
            onLoadTutorialSetup={(presetId, alg, heuristic, diagonal, pType) =>
              handleLaunchInLab({
                presetId,
                algorithm: alg,
                heuristic,
                diagonal,
                problemType: pType,
              })
            }
            onNavigate={handleTabChange}
          />
        )}
        {currentTab === 'experiments' && (
          <ExperimentsLab
            onLoadExperimentInLab={(config) => handleLaunchInLab(config)}
          />
        )}
      </main>

      {/* Architectural Modern Footer from User Design */}
      <ArchitecturalFooter onNavigateToLab={() => handleTabChange('lab')} />
    </div>
  );
};

export default App;
