import React, { useState } from 'react';
import { Achievement } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Trophy, Award, FileCheck2, Building2, Calendar, 
  ExternalLink, Sparkles, CheckCircle2 
} from 'lucide-react';

interface AchievementsSectionProps {
  achievements: Achievement[];
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ achievements }) => {
  const [filter, setFilter] = useState<string>('ALL');

  const categories = ['ALL', 'Hackathon', 'Research', 'Certification', 'Internship'];

  const filtered = filter === 'ALL'
    ? achievements
    : achievements.filter(a => a.category.toLowerCase() === filter.toLowerCase());

  const handleTriggerCelebration = (e: React.MouseEvent) => {
    sound.playBeep(1320, 'sine', 0.1);
    sound.playSignalPulse();
    
    // Confetti explosion matching PCB neon green, electric blue, and gold colors
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00FF9C', '#00BFFF', '#D4AF37', '#ffffff']
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'hackathon':
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case 'research':
        return <Award className="w-5 h-5 text-[#00BFFF]" />;
      case 'certification':
        return <FileCheck2 className="w-5 h-5 text-[#00FF9C]" />;
      case 'internship':
        return <Building2 className="w-5 h-5 text-purple-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#00FF9C]" />;
    }
  };

  return (
    <section id="achievements" className="py-16 relative">
      {/* Header Accent */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-[2px] bg-[#D4AF37]" />
        <span className="text-xs font-mono font-bold text-[#D4AF37] tracking-widest uppercase">
          SECTION 05 // HONORS & CERTIFICATIONS
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white font-orbitron tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-[#D4AF37]" />
            HONORS & RECOGNITION
          </h2>
          <p className="text-sm text-[#C0C6CE] font-mono mt-1 max-w-2xl">
            National hackathon awards, IEEE peer-reviewed publications, Cadence & ARM industry certifications, and semiconductor research internships.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-[#0B4D38]/30 border border-[#00FF9C]/30 rounded-lg">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setFilter(cat);
                sound.playRelayClick();
              }}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                filter === cat
                  ? 'bg-[#D4AF37] text-black shadow'
                  : 'text-[#C0C6CE] hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(ach => (
          <div
            key={ach.id}
            onClick={handleTriggerCelebration}
            className="cursor-pointer group relative bg-gradient-to-br from-[#131922] to-[#0A0D14] border-2 border-[#1E293B] hover:border-[#D4AF37] rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:glow-copper"
          >
            {/* Top Ribbon & Icon */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-black/60 border border-white/10 group-hover:border-[#D4AF37] transition-colors">
                  {getCategoryIcon(ach.category)}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#D4AF37] tracking-wider block">
                    {ach.category}
                  </span>
                  <span className="text-[11px] font-mono text-[#C0C6CE]/60 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {ach.date}
                  </span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                VERIFIED
              </span>
            </div>

            {/* Achievement Title */}
            <h3 className="text-base font-bold text-white font-rajdhani group-hover:text-[#D4AF37] transition-colors leading-snug">
              {ach.title}
            </h3>

            {/* Organization */}
            <p className="text-xs text-[#00BFFF] font-mono mt-1 font-medium">
              {ach.organization}
            </p>

            {/* Description */}
            <p className="text-xs text-[#C0C6CE] mt-2.5 leading-relaxed">
              {ach.description}
            </p>

            {/* Bottom Badge Text */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-[11px] font-bold text-[#00FF9C] tracking-wide">
                {ach.badgeText}
              </span>
              <span className="text-[10px] text-[#C0C6CE]/50 group-hover:text-[#D4AF37] transition-colors">
                CLICK TO SALUTE 🎉
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

