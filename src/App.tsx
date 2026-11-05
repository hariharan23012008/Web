import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { StorageService } from './utils/storage';
import type { Project, Achievement, EngineerProfile } from './types';

export const App: React.FC = () => {
  // Persistent Datasets
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [profile, setProfile] = useState<EngineerProfile>(StorageService.getProfile());

  useEffect(() => {
    setProjects(StorageService.getProjects());
    setAchievements(StorageService.getAchievements());
    setProfile(StorageService.getProfile());
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#121316] text-[#e4e4e7] overflow-x-hidden font-sans">
      <Dashboard
        projects={projects}
        setProjects={setProjects}
        achievements={achievements}
        setAchievements={setAchievements}
        profile={profile}
        setProfile={setProfile}
      />
    </div>
  );
};

export default App;
