import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { GraduationCap, Award, BookOpen } from 'lucide-react';

export const CurriculumVitaeSection: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section id="curriculum-vitae" className="py-6 relative w-full font-sans">
      <div
        className={`relative rounded-3xl border p-6 sm:p-10 transition-colors duration-300 shadow-xl ${
          isDark
            ? 'bg-[#18181b] border-zinc-700/80 text-white shadow-2xl'
            : 'bg-white border-zinc-200 text-zinc-900 shadow-xl'
        }`}
      >
        {/* Header Bar */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b pb-6 ${
            isDark ? 'border-zinc-700/80' : 'border-zinc-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-100 border-zinc-300 text-zinc-900'
              }`}
            >
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Curriculum Vitae
              </h2>
              <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Academic Background & Technical Qualifications
              </p>
            </div>
          </div>

          <span
            className={`self-start sm:self-auto px-4 py-1.5 rounded-full text-xs font-semibold border shadow-sm flex items-center gap-2 ${
              isDark
                ? 'bg-zinc-900 text-white border-zinc-700'
                : 'bg-zinc-100 text-zinc-800 border-zinc-300'
            }`}
          >
            <Award className={`w-3.5 h-3.5 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`} />
            Education & Qualifications
          </span>
        </div>

        {/* Content Card */}
        <div
          className={`rounded-2xl border p-6 sm:p-8 shadow-lg transition-colors duration-300 ${
            isDark
              ? 'bg-zinc-900/90 border-zinc-700/80'
              : 'bg-zinc-50/90 border-zinc-200'
          }`}
        >
          <div
            className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b ${
              isDark ? 'border-zinc-800' : 'border-zinc-200'
            }`}
          >
            <div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-wide">
                B.E. in Electronics Engineering
              </h3>
              <p className={`text-base font-semibold mt-1 ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                Department of Electronics and Electrical Engineering
              </p>
              <p className={`text-sm mt-1 font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Chennai Institute of Technology (CIT)
              </p>
            </div>

            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs self-start md:self-auto ${
                isDark
                  ? 'bg-zinc-950/80 border-zinc-800 text-zinc-300'
                  : 'bg-white border-zinc-300 text-zinc-700 shadow-sm'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${isDark ? 'text-white' : 'text-zinc-900'}`} />
              <span>Full-Time Degree</span>
            </div>
          </div>

          <div className={`pt-4 text-sm leading-relaxed font-normal ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
            Specializing in <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-950'}`}>Embedded IoT Systems</span>, <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-950'}`}>VLSI Architectures</span>, <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-950'}`}>Microcontrollers</span>, <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-950'}`}>Computer Vision Metrology</span>, and <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-950'}`}>Hardware-Software Co-Design</span>.
          </div>
        </div>

      </div>
    </section>
  );
};
