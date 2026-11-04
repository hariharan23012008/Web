import React, { useState } from 'react';
import type { Project, Achievement, EngineerProfile } from '../types';
import { StorageService } from '../utils/storage';
import { sound } from '../utils/audio';
import { 
  Lock, Unlock, Plus, Trash2, Edit3, Save, X, 
  Download, Upload, RefreshCw, AlertCircle
} from 'lucide-react';

interface AdminDashboardProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  achievements: Achievement[];
  setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
  profile: EngineerProfile;
  setProfile: React.Dispatch<React.SetStateAction<EngineerProfile>>;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  projects, setProjects,
  achievements, setAchievements,
  profile, setProfile,
  onClose
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'achievements' | 'backup'>('projects');

  // Form State for Adding / Editing a Project
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectForm, setProjectForm] = useState<Partial<Project>>({
    id: '',
    title: '',
    subtitle: '',
    category: 'IoT',
    description: '',
    longDescription: '',
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80',
    techStack: ['ESP32', 'IoT Relay'],
    githubUrl: '',
    videoUrl: '',
    bom: [
      { ref: 'U1', name: 'ESP32 Controller', package: 'SMD', footprint: 'ESP32', qty: 1, description: 'Microcontroller' }
    ]
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123' || password === 'pcb2026') {
      setIsAuthenticated(true);
      setErrorMsg('');
      sound.playBeep(880, 'sine', 0.1);
    } else {
      setErrorMsg('AUTHENTICATION FAILED: Invalid security passcode.');
      sound.playErrorBeep();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProjectForm(prev => ({
          ...prev,
          image: reader.result as string
        }));
        sound.playSignalPulse();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.description) return;

    if (projectForm.id) {
      const updated = StorageService.updateProject(projectForm as Project);
      setProjects(updated);
    } else {
      const newProj: Project = {
        ...(projectForm as Project),
        id: `proj-${Date.now()}`,
        bom: projectForm.bom || [],
        techStack: projectForm.techStack || ['Electronics']
      };
      const updated = StorageService.addProject(newProj);
      setProjects(updated);
    }

    sound.playBeep(1200, 'sine', 0.1);
    setIsEditingProject(false);
    resetProjectForm();
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Confirm deletion of this project record?')) {
      const updated = StorageService.deleteProject(id);
      setProjects(updated);
      sound.playRelayClick();
    }
  };

  const handleEditProjectClick = (p: Project) => {
    setProjectForm(p);
    setIsEditingProject(true);
    sound.playRelayClick();
  };

  const resetProjectForm = () => {
    setProjectForm({
      id: '',
      title: '',
      subtitle: '',
      category: 'IoT',
      description: '',
      longDescription: '',
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80',
      techStack: ['ESP32', 'IoT'],
      githubUrl: '',
      videoUrl: '',
      bom: [{ ref: 'U1', name: 'Microcontroller', package: 'Module', footprint: 'SMD', qty: 1, description: 'Controller' }]
    });
  };

  const handleExportBackup = () => {
    const json = StorageService.exportFullBackup();
    const element = document.createElement('a');
    const file = new Blob([json], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `PCB_Portfolio_Backup_${Date.now()}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    sound.playBeep(1000, 'sine', 0.1);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const success = StorageService.importFullBackup(reader.result as string);
        if (success) {
          setProjects(StorageService.getProjects());
          setAchievements(StorageService.getAchievements());
          setProfile(StorageService.getProfile());
          alert('Database successfully restored!');
          sound.playBeep(1200, 'sine', 0.1);
        } else {
          alert('Failed to parse backup JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all content back to factory default datasets?')) {
      StorageService.resetToDefaults();
      setProjects(StorageService.getProjects());
      setAchievements(StorageService.getAchievements());
      setProfile(StorageService.getProfile());
      sound.playRelayClick();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#0A0E14] border-2 border-[#00FF9C] rounded-2xl shadow-2xl glow-green overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0B4D38]/50 border-b border-[#00FF9C]/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-black/50 border border-[#00FF9C]">
              {isAuthenticated ? <Unlock className="w-5 h-5 text-[#00FF9C]" /> : <Lock className="w-5 h-5 text-[#00FF9C]" />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-rajdhani">
                ENGINEERING CONTENT LAB // ADMIN CONSOLE
              </h3>
              <p className="text-xs text-[#00BFFF] font-mono">
                Persistent Project Upload & Hardware Database Management
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

        {/* Security Gate */}
        {!isAuthenticated ? (
          <div className="p-8 md:p-12 flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#0B4D38] border-2 border-[#00FF9C] flex items-center justify-center glow-green">
              <Lock className="w-8 h-8 text-[#00FF9C]" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-white font-rajdhani">
                SECURITY ACCESS PASSCODE REQUIRED
              </h4>
              <p className="text-xs text-[#C0C6CE] font-mono mt-1">
                Enter your engineering management passcode to upload new projects and manage content.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <input
                type="password"
                autoFocus
                placeholder="Enter passcode (default: admin123)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black/80 border border-white/20 focus:border-[#00FF9C] text-center font-mono text-sm py-3 px-4 rounded-xl text-white outline-none"
              />

              {errorMsg && (
                <div className="text-xs font-mono text-red-400 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#00FF9C] hover:bg-[#00FF9C]/80 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all glow-green"
              >
                AUTHORIZE ACCESS
              </button>

              <div className="text-[11px] font-mono text-[#C0C6CE]/50">
                Hint: Passcode is <code className="text-[#00FF9C]">admin123</code>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Sub-Navigation Tabs */}
            <div className="flex items-center border-b border-white/10 px-6 bg-[#080B10] overflow-x-auto text-xs font-mono">
              <button
                onClick={() => { setActiveTab('projects'); sound.playRelayClick(); }}
                className={`py-3 px-4 font-bold border-b-2 flex items-center gap-2 ${
                  activeTab === 'projects' ? 'border-[#00FF9C] text-[#00FF9C]' : 'border-transparent text-[#C0C6CE]'
                }`}
              >
                PROJECTS ({projects.length})
              </button>
              <button
                onClick={() => { setActiveTab('achievements'); sound.playRelayClick(); }}
                className={`py-3 px-4 font-bold border-b-2 flex items-center gap-2 ${
                  activeTab === 'achievements' ? 'border-[#00FF9C] text-[#00FF9C]' : 'border-transparent text-[#C0C6CE]'
                }`}
              >
                ACHIEVEMENTS ({achievements.length})
              </button>
              <button
                onClick={() => { setActiveTab('backup'); sound.playRelayClick(); }}
                className={`py-3 px-4 font-bold border-b-2 flex items-center gap-2 ${
                  activeTab === 'backup' ? 'border-[#00FF9C] text-[#00FF9C]' : 'border-transparent text-[#C0C6CE]'
                }`}
              >
                DATABASE BACKUP / RESTORE
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {activeTab === 'projects' && (
                <div className="space-y-6 animate-fadeIn">
                  {!isEditingProject ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-[#C0C6CE]">
                          MANAGE ALL STORED PROJECTS
                        </span>
                        <button
                          onClick={() => {
                            resetProjectForm();
                            setIsEditingProject(true);
                            sound.playRelayClick();
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00FF9C] text-black font-mono font-bold text-xs glow-green transition-all"
                        >
                          <Plus className="w-4 h-4" /> ADD NEW PROJECT
                        </button>
                      </div>

                      <div className="space-y-3">
                        {projects.map(p => (
                          <div
                            key={p.id}
                            className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <img
                                src={p.image}
                                alt={p.title}
                                className="w-16 h-12 rounded object-cover border border-white/10"
                              />
                              <div>
                                <div className="text-sm font-bold text-white font-rajdhani">{p.title}</div>
                                <div className="text-xs text-[#00BFFF] font-mono">{p.category} • {p.subtitle}</div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditProjectClick(p)}
                                className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#00FF9C] flex items-center gap-1 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> EDIT
                              </button>
                              <button
                                onClick={() => handleDeleteProject(p.id)}
                                className="px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-mono text-red-400 flex items-center gap-1 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> DELETE
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProject} className="space-y-4 font-mono text-xs">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h4 className="text-sm font-bold text-white font-rajdhani">
                          {projectForm.id ? 'EDIT PROJECT RECORD' : 'CREATE NEW PROJECT RECORD'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsEditingProject(false)}
                          className="text-[#C0C6CE] hover:text-white"
                        >
                          CANCEL
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[#C0C6CE]/70 block mb-1">PROJECT NAME:</label>
                          <input
                            type="text"
                            required
                            value={projectForm.title || ''}
                            onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                            className="w-full bg-black/60 border border-white/20 p-2.5 rounded text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[#C0C6CE]/70 block mb-1">CATEGORY:</label>
                          <select
                            value={projectForm.category || 'IoT'}
                            onChange={e => setProjectForm({ ...projectForm, category: e.target.value as any })}
                            className="w-full bg-black/60 border border-white/20 p-2.5 rounded text-white"
                          >
                            <option value="IoT">IoT & Embedded</option>
                            <option value="VLSI">VLSI & AI Metrology</option>
                            <option value="Embedded">Embedded Systems</option>
                            <option value="Robotics">Robotics & Automation</option>
                            <option value="PCB">PCB Design</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[#C0C6CE]/70 block mb-1">SUBTITLE / TAGLINE:</label>
                        <input
                          type="text"
                          value={projectForm.subtitle || ''}
                          onChange={e => setProjectForm({ ...projectForm, subtitle: e.target.value })}
                          className="w-full bg-black/60 border border-white/20 p-2.5 rounded text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[#C0C6CE]/70 block mb-1">SHORT SUMMARY DESCRIPTION:</label>
                        <textarea
                          rows={2}
                          required
                          value={projectForm.description || ''}
                          onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                          className="w-full bg-black/60 border border-white/20 p-2.5 rounded text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[#C0C6CE]/70 block mb-1">FULL PROBLEM STATEMENT & ARCHITECTURE:</label>
                        <textarea
                          rows={4}
                          value={projectForm.longDescription || ''}
                          onChange={e => setProjectForm({ ...projectForm, longDescription: e.target.value })}
                          className="w-full bg-black/60 border border-white/20 p-2.5 rounded text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[#C0C6CE]/70 block mb-1">PROJECT HERO IMAGE:</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="text-xs text-[#C0C6CE]"
                          />
                          {projectForm.image && (
                            <img
                              src={projectForm.image}
                              alt="preview"
                              className="w-16 h-10 object-cover rounded border border-white/10"
                            />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[#C0C6CE]/70 block mb-1">GITHUB REPOSITORY URL:</label>
                          <input
                            type="url"
                            value={projectForm.githubUrl || ''}
                            onChange={e => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                            className="w-full bg-black/60 border border-white/20 p-2.5 rounded text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[#C0C6CE]/70 block mb-1">DEMO / VIDEO URL:</label>
                          <input
                            type="url"
                            value={projectForm.videoUrl || ''}
                            onChange={e => setProjectForm({ ...projectForm, videoUrl: e.target.value })}
                            className="w-full bg-black/60 border border-white/20 p-2.5 rounded text-white"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="py-3 px-6 rounded-lg bg-[#00FF9C] hover:bg-[#00FF9C]/80 text-black font-bold font-mono text-xs flex items-center gap-2 glow-green transition-all"
                      >
                        <Save className="w-4 h-4" />
                        PERSIST PROJECT TO DATABASE
                      </button>
                    </form>
                  )}
                </div>
              )}

              {activeTab === 'backup' && (
                <div className="space-y-6 animate-fadeIn font-mono text-xs">
                  <div className="p-5 rounded-xl bg-black/50 border border-white/10 space-y-3">
                    <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                      <Download className="w-4 h-4 text-[#00FF9C]" />
                      EXPORT ENTIRE PORTFOLIO DATABASE (JSON)
                    </h4>
                    <p className="text-[#C0C6CE]">
                      Download a complete backup of all projects, achievements, and engineer credentials.
                    </p>
                    <button
                      onClick={handleExportBackup}
                      className="px-4 py-2.5 rounded-lg bg-[#00FF9C] hover:bg-[#00FF9C]/80 text-black font-bold transition-all shadow glow-green"
                    >
                      DOWNLOAD BACKUP FILE
                    </button>
                  </div>

                  <div className="p-5 rounded-xl bg-black/50 border border-white/10 space-y-3">
                    <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                      <Upload className="w-4 h-4 text-[#00BFFF]" />
                      RESTORE DATABASE FROM BACKUP (JSON)
                    </h4>
                    <p className="text-[#C0C6CE]">
                      Upload a previously exported JSON backup file to overwrite current database records.
                    </p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="text-xs text-[#C0C6CE]"
                    />
                  </div>

                  <div className="p-5 rounded-xl bg-red-950/20 border border-red-500/30 space-y-3">
                    <h4 className="text-sm font-bold text-red-400 uppercase flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      FACTORY DATASET RESET
                    </h4>
                    <p className="text-[#C0C6CE]">
                      Reset all projects and achievements back to initial VoltX and DriftSense datasets.
                    </p>
                    <button
                      onClick={handleResetDefaults}
                      className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/40 transition-colors"
                    >
                      RESET TO VOLTX & DRIFTSENSE
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className="space-y-3 animate-fadeIn font-mono text-xs">
                  <div className="text-white font-bold mb-2">VERIFIED HONORS & AWARDS:</div>
                  {achievements.map(a => (
                    <div key={a.id} className="p-3 bg-black/40 border border-white/10 rounded-lg flex justify-between items-center">
                      <div>
                        <span className="text-[#D4AF37] font-bold">{a.title}</span>
                        <div className="text-[11px] text-[#C0C6CE]/70">{a.organization} ({a.date})</div>
                      </div>
                      <span className="text-[10px] text-[#00FF9C] px-2 py-0.5 rounded bg-black/50">
                        {a.badgeText}
                      </span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
