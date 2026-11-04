import React, { useState } from 'react';
import type { EngineerProfile } from '../types';
import { StorageService } from '../utils/storage';
import { sound } from '../utils/audio';
import { LinkedinIcon } from './SocialIcons';
import { 
  FileText, CheckCircle2, Upload, AlertCircle, X, 
  Sparkles, Save, User, GraduationCap, Wrench, Briefcase
} from 'lucide-react';

interface ProfileImporterModalProps {
  currentProfile: EngineerProfile;
  onProfileUpdated: (updated: EngineerProfile) => void;
  onClose: () => void;
}

export const ProfileImporterModal: React.FC<ProfileImporterModalProps> = ({
  currentProfile,
  onProfileUpdated,
  onClose
}) => {
  const [importMode, setImportMode] = useState<'form' | 'paste'>('paste');
  const [rawText, setRawText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: currentProfile.name,
    title: currentProfile.title,
    headline: currentProfile.headline,
    about: currentProfile.about,
    email: currentProfile.contact.email,
    linkedin: currentProfile.contact.linkedin,
    github: currentProfile.contact.github,
    location: currentProfile.contact.location,
    degree: currentProfile.education[0]?.degree || '',
    institution: currentProfile.education[0]?.institution || '',
    duration: currentProfile.education[0]?.duration || '',
    gpa: currentProfile.education[0]?.gpa || '',
    eduDetails: currentProfile.education[0]?.details || '',
    skillsText: currentProfile.skills.map(s => s.items.map(i => i.name).join(', ')).join(', ')
  });

  // Intelligent text parser to extract info if the user pastes their LinkedIn profile summary or resume text
  const handleParseRawText = () => {
    if (!rawText.trim()) return;

    sound.playSignalPulse();
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

    let parsedName = formData.name;
    let parsedTitle = formData.title;
    let parsedAbout = '';
    const parsedSkills: string[] = [];

    // Attempt simple heuristics
    if (lines.length > 0) {
      parsedName = lines[0];
    }
    if (lines.length > 1 && lines[1].length < 120) {
      parsedTitle = lines[1];
    }

    const fullJoined = lines.join(' ');
    // Look for About section
    const aboutMatch = fullJoined.match(/(?:About|Summary|Objective)[:\s]+([^]+?)(?:Experience|Education|Skills|$)/i);
    if (aboutMatch && aboutMatch[1]) {
      parsedAbout = aboutMatch[1].trim();
    } else {
      parsedAbout = lines.slice(2, 6).join(' ');
    }

    setFormData(prev => ({
      ...prev,
      name: parsedName,
      title: parsedTitle,
      about: parsedAbout || prev.about
    }));

    setStatusMessage('Text parsed! Please review the extracted fields below and click SAVE to apply.');
    setImportMode('form');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playBeep(1200, 'sine', 0.1);

    // Group skills
    const rawSkillArray = formData.skillsText.split(',').map(s => s.trim()).filter(Boolean);
    const skillItems = rawSkillArray.map(name => ({ name, proficiency: 90 }));

    const updatedProfile: EngineerProfile = {
      name: formData.name,
      title: formData.title,
      headline: formData.headline || formData.title,
      about: formData.about,
      education: [
        {
          degree: formData.degree,
          institution: formData.institution,
          duration: formData.duration,
          gpa: formData.gpa,
          details: formData.eduDetails
        }
      ],
      contact: {
        email: formData.email,
        github: formData.github,
        linkedin: formData.linkedin,
        phone: currentProfile.contact.phone,
        location: formData.location
      },
      skills: [
        {
          category: 'Core Engineering Competencies (From LinkedIn)',
          items: skillItems.slice(0, 8)
        },
        {
          category: 'Specialized Hardware & Protocols',
          items: skillItems.slice(8)
        }
      ]
    };

    StorageService.saveProfile(updatedProfile);
    onProfileUpdated(updatedProfile);
    setStatusMessage('Profile successfully updated from LinkedIn data!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#0A0E14] border-2 border-[#00BFFF] rounded-2xl shadow-2xl glow-blue overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0B3B4D]/40 border-b border-[#00BFFF]/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-black/50 border border-[#00BFFF]">
              <LinkedinIcon className="w-5 h-5 text-[#00BFFF]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-rajdhani">
                LINKEDIN & RESUME PROFILE IMPORTER
              </h3>
              <p className="text-xs text-[#00FF9C] font-mono">
                Populate your genuine professional engineering credentials
              </p>
            </div>
          </div>

          <button
            onClick={() => { sound.playRelayClick(); onClose(); }}
            className="p-2 rounded-lg bg-black/40 hover:bg-red-500/20 text-[#C0C6CE] hover:text-red-400 border border-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Import Mode Selector */}
        <div className="flex border-b border-white/10 px-6 bg-[#080B10] text-xs font-mono">
          <button
            onClick={() => setImportMode('paste')}
            className={`py-3 px-4 font-bold border-b-2 flex items-center gap-2 ${
              importMode === 'paste' ? 'border-[#00BFFF] text-[#00BFFF]' : 'border-transparent text-[#C0C6CE]'
            }`}
          >
            <FileText className="w-4 h-4" /> PASTE PROFILE TEXT
          </button>
          <button
            onClick={() => setImportMode('form')}
            className={`py-3 px-4 font-bold border-b-2 flex items-center gap-2 ${
              importMode === 'form' ? 'border-[#00BFFF] text-[#00BFFF]' : 'border-transparent text-[#C0C6CE]'
            }`}
          >
            <User className="w-4 h-4" /> EDIT PROFILE FIELDS
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 font-mono text-xs">
          
          {statusMessage && (
            <div className="p-3 bg-[#0B4D38]/80 border border-[#00FF9C] rounded-xl text-[#00FF9C] flex items-center gap-2 text-xs font-mono animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {statusMessage}
            </div>
          )}

          {importMode === 'paste' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-[#C0C6CE] leading-relaxed">
                <span className="text-white font-bold block mb-1">INSTRUCTIONS:</span>
                Copy text from your LinkedIn profile (Name, Headline, About, Education, Skills) or paste your resume text below. Our parser will automatically extract your authentic data without inventing anything.
              </div>

              <div>
                <label className="text-[#00BFFF] font-bold block mb-1 uppercase">
                  PASTE YOUR LINKEDIN / RESUME TEXT:
                </label>
                <textarea
                  rows={8}
                  placeholder="Paste your LinkedIn summary, education, and skills here..."
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  className="w-full bg-black/70 border border-white/20 focus:border-[#00BFFF] rounded-xl p-3 text-white outline-none font-mono text-xs"
                />
              </div>

              <button
                type="button"
                onClick={handleParseRawText}
                className="w-full py-3 rounded-xl bg-[#00BFFF] hover:bg-[#00BFFF]/80 text-black font-bold flex items-center justify-center gap-2 shadow glow-blue transition-all"
              >
                <Sparkles className="w-4 h-4" />
                PARSE & EXTRACT LINKEDIN INFORMATION
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#C0C6CE]/80 block mb-1">FULL NAME:</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 p-2.5 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-[#C0C6CE]/80 block mb-1">TITLE / ENGINEERING ROLE:</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 p-2.5 rounded text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#C0C6CE]/80 block mb-1">ABOUT / SUMMARY:</label>
                <textarea
                  rows={3}
                  required
                  value={formData.about}
                  onChange={e => setFormData({ ...formData, about: e.target.value })}
                  className="w-full bg-black/60 border border-white/20 p-2.5 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#C0C6CE]/80 block mb-1">PUBLIC LINKEDIN URL:</label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 p-2.5 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-[#C0C6CE]/80 block mb-1">PUBLIC GITHUB URL:</label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={e => setFormData({ ...formData, github: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 p-2.5 rounded text-white"
                  />
                </div>
              </div>

              {/* Education */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                <span className="text-white font-bold flex items-center gap-1.5 text-xs text-[#00FF9C]">
                  <GraduationCap className="w-4 h-4" /> ACADEMIC EDUCATION
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#C0C6CE]/70 block mb-1 text-[11px]">DEGREE:</label>
                    <input
                      type="text"
                      value={formData.degree}
                      onChange={e => setFormData({ ...formData, degree: e.target.value })}
                      className="w-full bg-black/60 border border-white/20 p-2 rounded text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[#C0C6CE]/70 block mb-1 text-[11px]">INSTITUTION:</label>
                    <input
                      type="text"
                      value={formData.institution}
                      onChange={e => setFormData({ ...formData, institution: e.target.value })}
                      className="w-full bg-black/60 border border-white/20 p-2 rounded text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="text-[#C0C6CE]/80 block mb-1">SKILLS (COMMA SEPARATED):</label>
                <textarea
                  rows={2}
                  value={formData.skillsText}
                  onChange={e => setFormData({ ...formData, skillsText: e.target.value })}
                  placeholder="Verilog, SystemVerilog, FPGA, KiCad, Altium, Embedded C, FreeRTOS, STM32..."
                  className="w-full bg-black/60 border border-white/20 p-2.5 rounded text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#00FF9C] hover:bg-[#00FF9C]/80 text-black font-bold flex items-center justify-center gap-2 glow-green shadow transition-all"
              >
                <Save className="w-4 h-4" />
                SAVE GENUINE PROFILE TO PORTFOLIO
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};

