import React, { useState, useEffect } from 'react';
import { PCB3DCanvas } from './components/PCB3DCanvas';
import { Dashboard } from './components/Dashboard';
import { StorageService } from './utils/storage';
import type { Project, Achievement, EngineerProfile } from './types';

export const App: React.FC = () => {
  // Navigation View: 'pcb' (Landing 3D Experience) or 'dashboard' (Main Engineering Lab)
  const [view, setView] = useState<'pcb' | 'dashboard'>('pcb');
  const [isInspecting, setIsInspecting] = useState(false);

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

  // Enter Portfolio interface after cinematic 3D dive
  const handleEnterPortfolio = () => {
    setView('dashboard');
    setIsInspecting(false);
  };

  // Switch back to 3D PCB inspect view
  const handleOpen3DPCB = () => {
    setIsInspecting(true);
    setView('pcb');
  };

  const handleCloseInspect = () => {
    setView('dashboard');
    setIsInspecting(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#080B10] text-[#C0C6CE] overflow-x-hidden">
      {view === 'pcb' ? (
        <PCB3DCanvas
          onEnterPortfolio={handleEnterPortfolio}
          isInspecting={isInspecting}
          onCloseInspect={handleCloseInspect}
        />
      ) : (
        <Dashboard
          projects={projects}
          setProjects={setProjects}
          achievements={achievements}
          setAchievements={setAchievements}
          profile={profile}
          setProfile={setProfile}
          onOpen3DPCB={handleOpen3DPCB}
        />
      )}
    </div>
  );
};

export default App;
