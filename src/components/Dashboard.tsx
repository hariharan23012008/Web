import React from 'react';
import type { Project, EngineerProfile } from '../types';
import { useTheme } from '../context/ThemeContext';
import { TopNavbar } from './TopNavbar';
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen font-sans relative transition-colors duration-300 ${
        isDark
          ? 'bg-[#121316] text-[#e4e4e7] selection:bg-white selection:text-black'
          : 'bg-[#f4f4f5] text-zinc-900 selection:bg-zinc-900 selection:text-white'
      }`}
    >
      {/* Top Navbar with Theme Toggle (Black Mode & White Mode) */}
      <TopNavbar onOpen3DPCB={onOpen3DPCB} />

      {/* Main Workstation Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
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

      {/* Footer */}
      <footer
        className={`border-t py-8 mt-16 font-sans transition-colors duration-300 ${
          isDark
            ? 'border-zinc-800 bg-[#0d0e11] text-zinc-400'
            : 'border-zinc-200 bg-white text-zinc-600'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <Cpu className={`w-4 h-4 ${isDark ? 'text-white' : 'text-zinc-900'}`} />
            <span>Designed & Maintained by Hariharan K // Chennai Institute of Technology</span>
          </div>

          <div className="flex items-center space-x-4">
            <span>Chennai, India</span>
            <span>•</span>
            <span className="font-semibold">{isDark ? 'Black Mode Active' : 'White Mode Active'}</span>
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
          className={`p-3 rounded-xl border shadow-xl transition-all hover:scale-105 active:scale-95 ${
            isDark
              ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800 hover:border-zinc-500'
              : 'bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-100 hover:border-zinc-400'
          }`}
          title="Scroll to Top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
