import React from 'react';
import type { EngineerProfile } from '../types';
import { useTheme } from '../context/ThemeContext';
import { sound } from '../utils/audio';
import { Sparkles, Eye } from 'lucide-react';

interface AboutMeSectionProps {
  profile?: EngineerProfile;
  onOpen3DPCB?: () => void;
}

export const AboutMeSection: React.FC<AboutMeSectionProps> = ({ onOpen3DPCB }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section id="about" className="py-6 relative w-full font-sans">
      {/* Clean Palette Container */}
      <div
        className={`relative rounded-3xl border p-6 sm:p-10 transition-colors duration-300 shadow-xl ${
          isDark
            ? 'bg-[#18181b] border-zinc-700/80 text-white shadow-2xl'
            : 'bg-white border-zinc-200 text-zinc-900 shadow-xl'
        }`}
      >
        {/* Subtle Accent Glow */}
        <div
          className={`absolute top-0 right-0 w-64 h-64 pointer-events-none ${
            isDark
              ? 'bg-gradient-to-bl from-white/5 via-transparent to-transparent'
              : 'bg-gradient-to-bl from-zinc-200/40 via-transparent to-transparent'
          }`}
        />

        {/* Header Bar */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b pb-6 relative z-10 ${
            isDark ? 'border-zinc-700/80' : 'border-zinc-200'
          }`}
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              About Me{' '}
              <span className={`font-normal ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                – Hariharan
              </span>
            </h1>
          </div>

          {onOpen3DPCB && (
            <button
              onClick={() => {
                sound.playSignalPulse();
                onOpen3DPCB();
              }}
              className={`self-start sm:self-auto px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md flex items-center gap-2 hover:scale-105 active:scale-95 ${
                isDark
                  ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
            >
              <Eye className="w-4 h-4" />
              View 3D PCB Board
            </button>
          )}
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
          
          {/* Left Column: Portrait Photo with Matching Frame */}
          <div className="lg:col-span-4 flex flex-col items-center text-center">
            <div className="relative group">
              <div
                className={`absolute -inset-1 rounded-2xl blur-sm transition-opacity ${
                  isDark
                    ? 'bg-gradient-to-b from-white/20 via-zinc-500/10 to-transparent group-hover:opacity-100'
                    : 'bg-gradient-to-b from-zinc-300 via-zinc-100 to-transparent group-hover:opacity-80'
                }`}
              />
              
              <div
                className={`relative w-64 h-80 sm:w-72 sm:h-96 rounded-2xl overflow-hidden border-2 shadow-xl ${
                  isDark ? 'border-zinc-400/80 bg-zinc-900' : 'border-zinc-300 bg-zinc-100'
                }`}
              >
                <img
                  src="./hariharan.jpg"
                  alt="Hariharan K - Electronics Engineer"
                  className="w-full h-full object-cover object-top filter brightness-100 contrast-105 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Biography Statement Box */}
          <div className="lg:col-span-8 space-y-6">
            
            <div
              className={`p-6 sm:p-7 rounded-2xl border shadow-lg relative transition-colors duration-300 ${
                isDark
                  ? 'bg-zinc-900/90 border-zinc-700/80'
                  : 'bg-zinc-50/90 border-zinc-200 shadow-sm'
              }`}
            >
              <div
                className={`flex items-center gap-2 text-xs font-semibold tracking-wider uppercase mb-3 ${
                  isDark ? 'text-zinc-400' : 'text-zinc-600'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${isDark ? 'text-white' : 'text-zinc-900'}`} />
                Engineering Profile
              </div>
              
              <p className={`text-base leading-relaxed font-normal ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                I am <strong className={`font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>Hariharan</strong>, a passionate and innovative Electronics Engineer with a strong interest in <span className={`font-medium underline underline-offset-4 ${isDark ? 'text-white decoration-zinc-500' : 'text-zinc-950 decoration-zinc-400'}`}>Embedded Systems, VLSI Design, Robotics, IoT, and Hardware Development</span>.
              </p>

              <p className={`text-base leading-relaxed mt-4 font-normal ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                I enjoy designing and developing real-world engineering solutions through hands-on projects, including <strong className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-950'}`}>smart charging controllers</strong>, <strong className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-950'}`}>AI-powered retail intelligence systems</strong>, <strong className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-950'}`}>industrial safety automation</strong>, <strong className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-950'}`}>ESP32-based robotics</strong>, and <strong className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-950'}`}>custom PCB designs</strong>. I have experience working with microcontrollers, sensors, embedded programming, hardware integration, and system development. I am always eager to explore emerging technologies, take on challenging problems, and transform creative ideas into practical innovations.
              </p>

              <p className={`text-base leading-relaxed mt-4 font-normal ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                Apart from my technical interests, I enjoy <strong className={`font-medium ${isDark ? 'text-white' : 'text-zinc-950'}`}>playing badminton</strong>, <strong className={`font-medium ${isDark ? 'text-white' : 'text-zinc-950'}`}>drawing</strong>, <strong className={`font-medium ${isDark ? 'text-white' : 'text-zinc-950'}`}>creating art and craft projects</strong>, and participating in various extracurricular activities. I love exploring my creativity, learning new skills, and maintaining a balance between technical development and personal interests.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
