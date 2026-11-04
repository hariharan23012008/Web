import React, { useState } from 'react';
import type { EngineerProfile } from '../types';
import { sound } from '../utils/audio';
import { 
  Trophy, Cpu, Code2, 
  CheckCircle2, Sparkles, Eye
} from 'lucide-react';

interface AboutMeSectionProps {
  profile?: EngineerProfile;
  onOpen3DPCB?: () => void;
}

export const AboutMeSection: React.FC<AboutMeSectionProps> = ({ onOpen3DPCB }) => {
  const [activeTab, setActiveTab] = useState<'bio' | 'competitions' | 'projects'>('bio');

  const competencies = [
    { title: 'Embedded Systems & RTOS', desc: 'ARM Cortex-M4, STM32, ESP32, FreeRTOS, Bare-Metal C/C++' },
    { title: 'VLSI & System Design', desc: 'Digital Logic, Verilog HDL, Semiconductor Architecture' },
    { title: 'Robotics & Control', desc: 'ESP32-based Quadruped Pet Robot, Kinematics, Motor Drivers' },
    { title: 'IoT & Hardware Automation', desc: 'VoltX Smart Relay Controller, Industrial Safety Systems' },
    { title: 'PCB Design & Prototyping', desc: 'KiCad, High-Speed Differential Routing, Gerber CAM, SMD Fab' }
  ];

  const competitions = [
    {
      name: 'FAR AWAY 2026 Hackathon',
      role: 'Participant & Hardware Innovator',
      desc: 'Engineered rapid hardware & IoT telemetry solutions under competitive hackathon constraints.'
    },
    {
      name: 'Applied Materials Semiconductor Hackathon',
      role: 'Semiconductor Metrology & AI',
      desc: 'Pioneered advanced metrology and semiconductor localized defect inspection algorithms.'
    },
    {
      name: 'NXP Cup India 2026',
      role: 'Autonomous Vehicle & Robotics',
      desc: 'Built high-speed autonomous control algorithms and sensor fusion hardware on NXP platforms.'
    }
  ];

  const keyProjects = [
    {
      title: 'VoltX Smart Charging Controller',
      tech: 'ESP32 • IoT Relay • DependencyGuard',
      desc: 'Automated smartphone charging cutoff via real-time battery threshold monitoring and fail-safe logic.'
    },
    {
      title: 'ESP32 Quadruped Pet Robot',
      tech: 'Robotics • Kinematics • Servo PWM',
      desc: 'Custom four-legged walking pet robot powered by ESP32 with wireless telemetry and gait coordination.'
    },
    {
      title: 'AI-Powered Retail Intelligence System',
      tech: 'Edge AI • Computer Vision • IoT',
      desc: 'Automated tracking and inventory metrology using neural computer vision pipelines.'
    },
    {
      title: 'Industrial Safety Automation',
      tech: 'Sensors • Safety Interlocks • Microcontrollers',
      desc: 'Mission-critical hardware fail-safe system mitigating industrial electrical and operational hazards.'
    }
  ];

  return (
    <section id="about" className="py-8 relative w-full font-sans">
      {/* Clean White and Gray Palette Container */}
      <div className="relative rounded-3xl bg-[#18181b] border border-zinc-700/80 p-6 sm:p-10 shadow-2xl text-white">
        
        {/* Subtle Accent Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/5 via-transparent to-transparent pointer-events-none" />

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-zinc-700/80 pb-6 relative z-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              About Me <span className="text-zinc-400 font-normal">– Hariharan</span>
            </h1>
          </div>

          {onOpen3DPCB && (
            <button
              onClick={() => {
                sound.playSignalPulse();
                onOpen3DPCB();
              }}
              className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-sm transition-all shadow-md flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Eye className="w-4 h-4" />
              View 3D PCB Board
            </button>
          )}
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
          
          {/* Left Column: Portrait Photo with White & Gray Frame */}
          <div className="lg:col-span-4 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-white/20 via-zinc-500/10 to-transparent blur-sm group-hover:opacity-100 transition-opacity" />
              
              <div className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-2xl overflow-hidden border-2 border-zinc-400/80 bg-zinc-900 shadow-xl">
                <img
                  src="/hariharan.jpg"
                  alt="Hariharan K - Electronics Engineer"
                  className="w-full h-full object-cover object-top filter brightness-100 contrast-105 group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Information Card Overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent p-4 text-left border-t border-zinc-800">
                  <div className="text-base font-bold text-white tracking-wide flex items-center justify-between">
                    <span>Hariharan K</span>
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Chennai Institute of Technology (CIT)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Exact Biography & Technical Breakdown */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Biography Statement Box */}
            <div className="p-6 sm:p-7 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 shadow-lg relative">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-3">
                <Sparkles className="w-4 h-4 text-white" />
                Engineering Profile
              </div>
              
              <p className="text-base text-zinc-200 leading-relaxed font-normal">
                I am <strong className="text-white font-bold">Hariharan</strong>, a passionate and innovative Electronics Engineer with a strong interest in <span className="text-white font-medium underline underline-offset-4 decoration-zinc-500">Embedded Systems, VLSI Design, Robotics, IoT, and Hardware Development</span>.
              </p>

              <p className="text-base text-zinc-300 leading-relaxed mt-4 font-normal">
                I enjoy designing and developing real-world engineering solutions through hands-on projects, including <strong className="text-white font-semibold">smart charging controllers</strong>, <strong className="text-white font-semibold">AI-powered retail intelligence systems</strong>, <strong className="text-white font-semibold">industrial safety automation</strong>, <strong className="text-white font-semibold">ESP32-based robotics</strong>, and <strong className="text-white font-semibold">custom PCB designs</strong>. I have experience working with microcontrollers, sensors, embedded programming, hardware integration, and system development. I am always eager to explore emerging technologies, take on challenging problems, and transform creative ideas into practical innovations.
              </p>

              <p className="text-base text-zinc-300 leading-relaxed mt-4 font-normal">
                Apart from my technical interests, I enjoy <strong className="text-white font-medium">playing badminton</strong>, <strong className="text-white font-medium">drawing</strong>, <strong className="text-white font-medium">creating art and craft projects</strong>, and participating in various extracurricular activities. I love exploring my creativity, learning new skills, and maintaining a balance between technical development and personal interests.
              </p>
            </div>

            {/* Navigation Tabs in White & Gray */}
            <div className="flex flex-wrap gap-2 border-b border-zinc-700/80 pb-3">
              <button
                onClick={() => { setActiveTab('bio'); sound.playRelayClick(); }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'bio'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-700'
                }`}
              >
                <Cpu className="w-4 h-4" />
                Core Domains
              </button>
              <button
                onClick={() => { setActiveTab('competitions'); sound.playRelayClick(); }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'competitions'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-700'
                }`}
              >
                <Trophy className="w-4 h-4" />
                Competitions (2026)
              </button>
              <button
                onClick={() => { setActiveTab('projects'); sound.playRelayClick(); }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'projects'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-700'
                }`}
              >
                <Code2 className="w-4 h-4" />
                Key Hardware Projects
              </button>
            </div>

            {/* Tab 1: Core Competency Cards */}
            {activeTab === 'bio' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fadeIn">
                {competencies.map((c, i) => (
                  <div 
                    key={i} 
                    className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-700/80 hover:border-zinc-500 transition-all hover:translate-x-0.5"
                  >
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-zinc-300" />
                      {c.title}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-normal">
                      {c.desc}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Hackathons & Competitions */}
            {activeTab === 'competitions' && (
              <div className="space-y-3 animate-fadeIn">
                {competitions.map((comp, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-500 transition-all"
                  >
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-zinc-300" />
                        {comp.name}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 font-normal">
                        {comp.desc}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-200 border border-zinc-700 self-start sm:self-auto whitespace-nowrap">
                      {comp.role}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Key Projects Overview */}
            {activeTab === 'projects' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fadeIn">
                {keyProjects.map((proj, pIdx) => (
                  <div 
                    key={pIdx}
                    className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-700/80 hover:border-zinc-500 transition-all"
                  >
                    <div className="text-sm font-bold text-white">
                      {proj.title}
                    </div>
                    <div className="text-xs text-zinc-400 font-medium mt-1">
                      {proj.tech}
                    </div>
                    <p className="text-xs text-zinc-300 mt-2 leading-relaxed font-normal">
                      {proj.desc}
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
