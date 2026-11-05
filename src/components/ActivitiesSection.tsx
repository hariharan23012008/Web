import React from 'react';
import { Palette, Cpu, PenTool, Scissors, Activity, CheckCircle2 } from 'lucide-react';

interface ActivityCategory {
  id: string;
  number: string;
  title: string;
  tag: string;
  image: string;
  icon: React.ReactNode;
  items: string[];
}

export const ActivitiesSection: React.FC = () => {
  const activities: ActivityCategory[] = [
    {
      id: 'projects',
      number: '01',
      title: 'Projects',
      tag: 'Hardware & Systems',
      image: './activity-projects.jpg',
      icon: <Cpu className="w-5 h-5 text-white" />,
      items: [
        'Electronics and Embedded Systems Projects',
        'Robotics and Hardware Development',
        'IoT-Based Applications',
        'PCB Design and Development'
      ]
    },
    {
      id: 'drawing',
      number: '02',
      title: 'Drawing & Artwork',
      tag: 'Visual Arts',
      image: './activity-drawing.jpg',
      icon: <PenTool className="w-5 h-5 text-white" />,
      items: [
        'Pencil Sketching',
        'Creative Drawing',
        'Artistic Designs',
        'Hand-drawn Illustrations'
      ]
    },
    {
      id: 'crafts',
      number: '03',
      title: 'Arts & Crafts',
      tag: 'Makers & DIY',
      image: './activity-crafts.jpg',
      icon: <Scissors className="w-5 h-5 text-white" />,
      items: [
        'Handmade Crafts',
        'Creative DIY Projects',
        'Decorative Artworks',
        'Innovative Craft Designs'
      ]
    },
    {
      id: 'other',
      number: '04',
      title: 'Other Activities',
      tag: 'Sports & Pursuits',
      image: './activity-badminton.jpg',
      icon: <Activity className="w-5 h-5 text-white" />,
      items: [
        'Badminton',
        'Creative Problem Solving',
        'Exploring New Technologies',
        'Participating in Technical and Non-Technical Activities'
      ]
    }
  ];

  return (
    <section id="activities" className="py-6 relative w-full font-sans">
      <div className="relative rounded-3xl bg-[#18181b] border border-zinc-700/80 p-6 sm:p-10 shadow-2xl text-white">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-white/5 via-transparent to-transparent pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-zinc-700/80 pb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              <Palette className="w-4 h-4 text-white" />
              <span>Personal Interests & Passions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Activities & Creative Works
            </h2>
            <p className="text-sm text-zinc-300 mt-2 max-w-2xl font-normal leading-relaxed">
              Apart from my technical interests, I enjoy exploring my creativity through various activities.
            </p>
          </div>

          <span className="self-start sm:self-auto px-4 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 text-white border border-zinc-700 shadow-sm">
            4 Creative Domains
          </span>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {activities.map((act) => (
            <div
              key={act.id}
              className="group bg-zinc-900/90 border border-zinc-700/80 hover:border-zinc-400 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-44 overflow-hidden border-b border-zinc-800 bg-zinc-950">
                  <img
                    src={act.image}
                    alt={act.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      // Graceful fallback if offline
                      (e.target as HTMLImageElement).src = './hariharan.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  
                  {/* Top Tag Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-zinc-950/80 backdrop-blur-sm border border-zinc-700/80 font-mono text-zinc-300 font-semibold">
                      {act.number}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-sm text-zinc-950 font-semibold text-[11px] shadow">
                      {act.tag}
                    </span>
                  </div>

                  {/* Title on Image Bottom */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-700">
                      {act.icon}
                    </div>
                    <h3 className="text-base font-bold text-white tracking-wide">
                      {act.title}
                    </h3>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-5">
                  <ul className="space-y-2.5">
                    {act.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-zinc-300 leading-snug">
                        <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Subtle Bar */}
              <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-950/40 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Domain #{act.number}</span>
                <span className="text-zinc-500">• Active Passion</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
