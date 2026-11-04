import React, { useState, useEffect } from 'react';
import type { Project, Achievement, EngineerProfile } from '../types';
import { ProjectsSection } from './ProjectsSection';
import { HardwareLab } from './HardwareLab';
import { AchievementsSection } from './AchievementsSection';
import { AboutMeSection } from './AboutMeSection';
import { ContactSection } from './ContactSection';
import { GitHubRepositories } from './GitHubRepositories';
import { ProfileImporterModal } from './ProfileImporterModal';
import { OscilloscopeWidget } from './OscilloscopeWidget';
import { AdminDashboard } from './AdminDashboard';
import { sound } from '../utils/audio';
import { GithubIcon, LinkedinIcon } from './SocialIcons';
import { 
  Cpu, Bot, Trophy, User, Radio, 
  Settings, Volume2, VolumeX, Eye, ArrowUp, Activity, GitBranch, Zap
} from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  achievements: Achievement[];
  setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
  profile: EngineerProfile;
  setProfile: React.Dispatch<React.SetStateAction<EngineerProfile>>;
  onOpen3DPCB: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects, setProjects,
  achievements, setAchievements,
  profile, setProfile,
  onOpen3DPCB
}) => {
  const [activeNav, setActiveNav] = useState('projects');
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showProfileImporter, setShowProfileImporter] = useState(false);
  const [clockTime, setClockTime] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Live RTC Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockTime(now.toTimeString().split(' ')[0] + ' UTC+5:30');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll Progress Tracker
  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    sound.playRelayClick();
    setActiveNav(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'projects', label: 'PROJECTS', icon: Cpu },
    { id: 'github', label: 'REPOSITORIES', icon: GitBranch },
    { id: 'hardware', label: 'HARDWARE LAB', icon: Bot },
    { id: 'achievements', label: 'ACHIEVEMENTS', icon: Trophy },
    { id: 'about', label: 'ABOUT ME', icon: User },
    { id: 'contact', label: 'CONTACT', icon: Radio },
  ];

  return (
    <div className="min-h-screen bg-[#121316] text-[#e4e4e7] font-sans relative selection:bg-white selection:text-black">
      
      {/* Top Header - White and Gray Palette */}
      <header className="sticky top-0 z-40 bg-[#121316]/90 backdrop-blur-xl border-b border-zinc-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Call Sign */}
          <div className="flex items-center space-x-3">
            <div 
              onClick={() => { sound.playSignalPulse(); onOpen3DPCB(); }}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 cursor-pointer hover:border-zinc-500 hover:scale-105 transition-all"
              title="Click to view 3D Motherboard"
            >
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-white tracking-wide">
                  Hariharan K
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                  CIT Chennai
                </span>
              </div>
              <div className="text-xs text-zinc-400">
                Electronics & Hardware Engineering
              </div>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-3">
            <a
              href="https://github.com/hariharan23012008"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 hover:text-white transition-all"
            >
              <GithubIcon className="w-3.5 h-3.5 text-white" />
              <span>@hariharan23012008</span>
            </a>

            <button
              onClick={() => {
                sound.playRelayClick();
                onOpen3DPCB();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 border border-white text-xs font-semibold transition-all shadow-sm active:scale-95"
            >
              <Eye className="w-4 h-4" />
              <span>View 3D PCB Board</span>
            </button>
          </div>

        </div>

        {/* Divider line */}
        <div className="w-full h-[1px] bg-zinc-800" />
      </header>

      {/* Main Workstation Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* About Me - Hariharan Core Column */}
        <AboutMeSection profile={profile} onOpen3DPCB={onOpen3DPCB} />

        {/* Featured Projects Column - Touch Picture to view details */}
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

      {/* Admin Dashboard Modal */}
      {showAdmin && (
        <AdminDashboard
          projects={projects}
          setProjects={setProjects}
          achievements={achievements}
          setAchievements={setAchievements}
          profile={profile}
          setProfile={setProfile}
          onClose={() => setShowAdmin(false)}
        />
      )}

      {/* LinkedIn Profile Importer Modal */}
      {showProfileImporter && (
        <ProfileImporterModal
          currentProfile={profile}
          onProfileUpdated={(updated) => setProfile(updated)}
          onClose={() => setShowProfileImporter(false)}
        />
      )}

    </div>
  );
};
