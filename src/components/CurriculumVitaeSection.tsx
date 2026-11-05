import React from 'react';
import { GraduationCap, Award, BookOpen } from 'lucide-react';

export const CurriculumVitaeSection: React.FC = () => {
  return (
    <section id="curriculum-vitae" className="py-6 relative w-full font-sans">
      <div className="relative rounded-3xl bg-[#18181b] border border-zinc-700/80 p-6 sm:p-10 shadow-2xl text-white">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-zinc-700/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Curriculum Vitae
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Academic Background & Technical Qualifications
              </p>
            </div>
          </div>

          <span className="self-start sm:self-auto px-4 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 text-white border border-zinc-700 shadow-sm flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-zinc-300" />
            Education & Qualifications
          </span>
        </div>

        {/* Content Card */}
        <div className="rounded-2xl bg-zinc-900/90 border border-zinc-700/80 p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                B.E. in Electronics Engineering
              </h3>
              <p className="text-base font-semibold text-zinc-200 mt-1">
                Department of Electronics and Electrical Engineering
              </p>
              <p className="text-sm text-zinc-400 mt-1 font-medium">
                Chennai Institute of Technology (CIT)
              </p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 self-start md:self-auto">
              <BookOpen className="w-4 h-4 text-white" />
              <span>Full-Time Degree</span>
            </div>
          </div>

          <div className="pt-4 text-sm text-zinc-300 leading-relaxed font-normal">
            Specializing in <span className="text-white font-medium">Embedded IoT Systems</span>, <span className="text-white font-medium">VLSI Architectures</span>, <span className="text-white font-medium">Microcontrollers</span>, <span className="text-white font-medium">Computer Vision Metrology</span>, and <span className="text-white font-medium">Hardware-Software Co-Design</span>.
          </div>
        </div>

      </div>
    </section>
  );
};
