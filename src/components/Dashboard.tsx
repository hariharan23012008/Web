import React from 'react';
import type { Project, EngineerProfile } from '../types';
import { PcbBoardViewer } from './PcbBoardViewer';
import { ProjectsSection } from './ProjectsSection';
import { AboutMeSection } from './AboutMeSection';
import { sound } from '../utils/audio';
import { Cpu, ArrowUp } from 'lucide-react';
import { GithubIcon } from './SocialIcons';

interface DashboardProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  achievements?: any[];
  setAchievements?: any;
  profile: EngineerProfile;
  setProfile?: any;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  profile
}) => {
  const scrollTo = (id: string) => {
    sound.playRelayClick();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#121316] text-[#e4e4e7] font-sans relative selection:bg-white selection:text-black">
      
      {/* Top Clean Engineering Header / Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#121316]/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-700/80">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-wide block">
                Hariharan K
              </span>
              <span className="text-xs text-zinc-400 font-mono hidden sm:block">
                Electronics & PCB Systems Engineer
              </span>
            </div>
          </div>

          <nav className="flex items-center space-x-1 sm:space-x-3 text-xs font-semibold">
            <button
              onClick={() => scrollTo('pcb-board')}
              className="px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              PCB Board
            </button>
            <button
              onClick={() => scrollTo('about')}
              className="px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              About Me
            </button>
            <button
              onClick={() => scrollTo('projects')}
              className="px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Featured Projects
            </button>
            <a
              href="https://github.com/hariharan23012008"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-colors ml-1"
              title="GitHub Profile"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          </nav>
        </div>
      </header>

      {/* Main Workstation Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* 1. PCB Board Integrated Directly Inside Dashboard */}
        <PcbBoardViewer />

        {/* 2. About Me - Hariharan Core Column */}
        <AboutMeSection profile={profile} />

        {/* 3. Featured Projects Column - VoltX & DriftSense */}
        <div className="w-full">
          <ProjectsSection projects={projects} />
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
