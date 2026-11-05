import React from 'react';
import type { Project, EngineerProfile } from '../types';
import { ProjectsSection } from './ProjectsSection';
import { AboutMeSection } from './AboutMeSection';
import { ActivitiesSection } from './ActivitiesSection';
import { CurriculumVitaeSection } from './CurriculumVitaeSection';
import { sound } from '../utils/audio';
import { Cpu, ArrowUp } from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  achievements?: any[];
  setAchievements?: any;
  profile: EngineerProfile;
  setProfile?: any;
  onOpen3DPCB: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  profile,
  onOpen3DPCB
}) => {
  return (
    <div className="min-h-screen bg-[#121316] text-[#e4e4e7] font-sans relative selection:bg-white selection:text-black">
      
      {/* Main Workstation Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* About Me - Hariharan Core Column */}
        <AboutMeSection profile={profile} onOpen3DPCB={onOpen3DPCB} />

        {/* Featured Projects Column - Touch Picture to view details */}
        <div className="w-full">
          <ProjectsSection projects={projects} />
        </div>

        {/* Activities & Creative Works - Placed under Featured Projects */}
        <div className="w-full">
          <ActivitiesSection />
        </div>

        {/* Curriculum Vitae - Down under Featured Projects & Activities */}
        <div className="w-full">
          <CurriculumVitaeSection />
        </div>
      </main>

      {/* Footer in White and Gray */}
      <footer className="border-t border-zinc-800 bg-[#0d0e11] py-8 mt-16 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-white" />
            <span>Designed & Maintained by Hariharan K // Chennai Institute of Technology</span>
          </div>

          <div className="flex items-center space-x-4 text-zinc-400">
            <span>Chennai, India</span>
            <span>•</span>
            <span>Status: Operational</span>
          </div>
        </div>
      </footer>

      {/* Floating Scroll-to-Top Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            sound.playSignalPulse();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white shadow-xl hover:bg-zinc-800 hover:border-zinc-500 hover:scale-105 transition-all"
          title="Scroll to Top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
