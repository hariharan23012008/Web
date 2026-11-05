import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { PCB3DCanvas } from './components/PCB3DCanvas';
import { Dashboard } from './components/Dashboard';
import { StorageService } from './utils/storage';
import type { Project, Achievement, EngineerProfile } from './types';

const PortfolioContent: React.FC = () => {
  // Navigation View: 'pcb' (Landing 3D Experience) or 'dashboard' (Main Engineering Lab)
  const [view, setView] = useState<'pcb' | 'dashboard'>('pcb');

  // Persistent Datasets
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [profile, setProfile] = useState<EngineerProfile>(StorageService.getProfile());

  // Load from StorageService on initial mount & ensure PCB board shows first
  useEffect(() => {
    setView('pcb');
    setProjects(StorageService.getProjects());
    setAchievements(StorageService.getAchievements());
    setProfile(StorageService.getProfile());
  }, []);

  const handleEnterDashboard = () => {
    setView('dashboard');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleOpen3D = () => {
    setView('pcb');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden font-sans">
      {view === 'pcb' ? (
        /* 1. 3D PCB Motherboard Hero Canvas - Landing View Only */
        <div id="pcb-section" className="relative w-full h-screen bg-[#121316]">
          <PCB3DCanvas
            onEnterPortfolio={handleEnterDashboard}
          />
        </div>
      ) : (
        /* 2. Main Workstation (Dashboard) - 3D view is completely hidden and not in DOM */
        <div id="portfolio-section" className="relative w-full">
          <Dashboard
            projects={projects}
            setProjects={setProjects}
            achievements={achievements}
            setAchievements={setAchievements}
            profile={profile}
            setProfile={setProfile}
            onOpen3DPCB={handleOpen3D}
          />
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <PortfolioContent />
    </ThemeProvider>
  );
};

export default App;
