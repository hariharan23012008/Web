import React, { useState } from 'react';
import type { Project } from '../types';
import { sound } from '../utils/audio';
import { GithubIcon } from './SocialIcons';
import { 
  Cpu, Code2, Layers, Wrench, 
  X, Check, Copy, ChevronRight, Zap, ExternalLink, Image as ImageIcon
} from 'lucide-react';

interface ProjectsSectionProps {
  projects: Project[];
  onUpdateProjectImage?: (projectId: string, newImage: string) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);
  const [modalTab, setModalTab] = useState<'overview' | 'schematic' | 'bom' | 'code'>('overview');
  const [copiedCode, setCopiedCode] = useState(false);

  const categories = ['ALL', 'IoT', 'Embedded', 'VLSI', 'Robotics', 'PCB'];

  const defaultVoltXProject: Project = {
    id: 'proj-voltx',
    title: 'VoltX: IoT-Based Smart Charging Cutoff & Battery Health Optimization System',
    subtitle: 'Automated ESP32 Relay Cutoff with DependencyGuard Fail-Safe Monitoring',
    category: 'IoT',
    description: 'An IoT-based smart charging system that automates smartphone charging control via ESP32 relay switching, target threshold monitoring, and a fault-tolerant DependencyGuard engine.',
    longDescription: `### The Problem Statement:
Continuous overnight charging and holding Li-ion batteries at 100% state-of-charge significantly accelerates chemical degradation and thermal stress. Standard chargers cannot disconnect power automatically based on software thresholds.

### The Solution:
VoltX allows users to set a custom target battery percentage (e.g., 80%) through a dedicated mobile app. When the threshold is reached, VoltX commands an ESP32-connected optoisolated relay module to sever the charging circuit.

### Key Architectural Innovation: DependencyGuard
Features a proprietary DependencyGuard failure-management system that tracks prerequisites, blockers, and recovery protocols.`,
    image: './voltx.png',
    bom: [
      { ref: 'U1', name: 'ESP32-WROOM-32 Dual-Core MCU', package: 'SMD Module', footprint: 'ESP32-Module', qty: 1, description: '240MHz Wi-Fi & BLE SoC executing relay control firmware' },
      { ref: 'K1', name: 'Songle 5V 10A SPDT Relay Module', package: 'Through-Hole', footprint: 'Relay-SPDT', qty: 1, description: 'Optocoupler-isolated AC/DC charging power cutoff' },
      { ref: 'Q1', name: '2N2222 NPN BJT Driver', package: 'TO-92', footprint: 'TO-92', qty: 1, description: 'Relay coil switching transistor' },
      { ref: 'D1', name: '1N4007 Flyback Suppression Diode', package: 'DO-41', footprint: 'DO-41', qty: 1, description: 'Protects MCU from inductive relay coil back-EMF' },
      { ref: 'PSU1', name: 'Hi-Link HLK-PM01 5V/3W Step-Down', package: 'Encapsulated', footprint: 'HLK-PM01', qty: 1, description: 'AC mains to 5V DC regulated power supply' }
    ],
    codeSnippet: {
      language: 'cpp',
      filename: 'voltx_relay_controller.cpp',
      code: `// VoltX ESP32 Smart Charging Relay Controller
#include <WiFi.h>
#include <HTTPClient.h>

#define RELAY_PIN 23
#define STATUS_LED 2

void setup() {
    pinMode(RELAY_PIN, OUTPUT);
    pinMode(STATUS_LED, OUTPUT);
    digitalWrite(RELAY_PIN, HIGH); // Charging Active
    WiFi.begin("VoltX_Net", "secure_pass");
}

void loop() {
    // Automatically disconnect charging when target battery % is reached
    if (WiFi.status() == WL_CONNECTED) {
        // Read battery telemetry and trigger cutoff
        digitalWrite(RELAY_PIN, LOW); // Cutoff Charging
    }
    delay(5000);
}`
    },
    techStack: ['ESP32', 'IoT Relay', 'Android App', 'DependencyGuard', 'Wi-Fi Telemetry'],
    githubUrl: 'https://github.com/hariharan23012008/VOLTX',
    metrics: [
      { label: 'Cutoff Accuracy', value: '100% Target' },
      { label: 'Response Latency', value: '< 250 ms' },
      { label: 'Relay Rating', value: '10A 250VAC' },
      { label: 'Fail-Safe Mode', value: 'DependencyGuard' }
    ]
  };

  const defaultDriftSenseProject: Project = {
    id: 'proj-driftsense',
    title: 'DriftSense: Hybrid Siamese SEM Localization for DRAM & FinFETs',
    subtitle: 'Applied Materials Semiconductor Hackathon 2026 // Custom 4-Layer ResNet Triplet Loss Model',
    category: 'VLSI',
    description: 'A hybrid edge-AI computer vision pipeline combining 3-Level Image Pyramid Normalized Cross-Correlation (NCC) with a custom 4-layer ResNet Siamese network for sub-pixel semiconductor defect metrology.',
    longDescription: `### 🚨 The Problem Statement:
In modern semiconductor foundries, locating a specific microscopic reference patch (e.g., a single FinFET or DRAM layout cell) within a massive, highly-degraded Scanning Electron Microscope (SEM) search image is an immense challenge:
• Extreme Noise: SEM imaging physics naturally introduces catastrophic Poisson shot noise, Gaussian read noise, focal blur, multiplicative speckle, contrast drift, and stage vibration jitter.
• Periodic Decoys: Semiconductor chips (especially DRAM arrays) consist of millions of perfectly repeating, identical-looking structures.
• Classical Fragility: Traditional mathematical Computer Vision algorithms (like pure Template Matching) routinely fail because they lack the semantic understanding to differentiate the true target from a noisy periodic decoy.

### 💡 Our Solution:
We engineered a Hybrid Fusion Pipeline that runs classical Normalized Cross-Correlation (NCC) search through a 3-Level Image Pyramid, disambiguated by a Siamese Triplet Loss Model (TLM) built on a lightweight Custom 4-Layer ResNet encoder.

By combining the raw speed of classical coarse search with the deep semantic understanding of a learned heatmap regressor, we created a system capable of shattering classical accuracy baselines while maintaining strict real-time edge-device constraints (~44ms average on CPU, 1.38MB model weights).

### 🏗️ Architecture Deep-Dive:
1. Preprocessing Pipeline:
   • Grayscale normalization (uint8)
   • Histogram equalization
   • Denoising (Gaussian / Median)
   • High-pass Edge enhancement

2. Custom 4-Layer ResNet Siamese Encoder:
   Rather than deploying a massive off-the-shelf architecture, we designed a deliberately bottlenecked 4-Layer ResNet encoder. It mathematically forces the network to ignore transient noise and focus purely on extracting fundamental, invariant geometric structures.
   • Output: Projects 1-channel grayscale SEM patches into a discriminative 128-Dimensional embedding space.

3. Training & Triplet Loss Setup:
   • Framework: PyTorch 2.x, OpenCV, NumPy
   • Optimizer: AdamW (initial LR = 0.001, weight decay = 1e-4) with Cosine Annealing scheduler
   • Loss Function: Triplet Loss Model (TLM) with hard negative mining (15 periodic-decoy negatives + 15 global random negatives per anchor)
   • Target Deployment: 100% CPU edge execution on factory inspection hardware (optional CUDA 12.1 acceleration)

4. Three-Level Image Pyramid (Hybrid Inference):
   • Level 0 (Coarse NCC): A 50×50 template is swept across a 500×500 downsampled search region for fast global screening, producing Top-K candidate peaks.
   • Level 1 (Siamese Verification & Re-Ranking): Full-resolution (100×100) matching using the Siamese ResNet TLM encoder re-ranks and verifies candidates against periodic decoys.
   • Level 2 (Fine Localization): Local refinement at 200×200 around the best candidate to lock in final sub-pixel coordinates.
   • Center Bias Disambiguation: Computes candidate distance from image center to reliably break ties when multiple candidates score similarly.
   • Post-Processing: 3×3 Non-Maximum Suppression (NMS), coordinate refinement, boundary checking, and confidence thresholding.

### 🔬 Key Benchmark & Robustness Achievements:
• 96.7% Localization Accuracy across 60 physical DRAM semiconductor images (58 successful hits).
• 44ms Inference Latency on 100% CPU execution without requiring expensive foundry GPUs.
• 1.38 MB Model Footprint allowing direct integration onto real-time edge semiconductor metrology tools.
• +5.4% Accuracy Improvement over classical OpenCV baselines under extreme 2.0x noise injection.
• Top-K=3 Ablation Optimization: Restricting classical stage output to top_k=3 candidates with min_distance=10 prevents multi-decoy confusion and guarantees maximum discriminative accuracy.`,
    image: './driftsense.jpg',
    bom: [
      { ref: 'SEM1', name: 'Scanning Electron Microscope (SEM) Image Stream', package: 'Nanoscale Imager', footprint: '1000x1000 Grayscale', qty: 1, description: '1-Channel grayscale semiconductor wafer surface scan' },
      { ref: 'AI-ENG1', name: 'Custom 4-Layer ResNet Siamese TLM Backbone', package: 'PyTorch 2.x', footprint: '128-D Embedding Space', qty: 1, description: 'Triplet Loss metric learning with hard periodic negative mining' },
      { ref: 'PYRAMID1', name: '3-Level Image Pyramid & Multi-Scale NCC Search', package: 'OpenCV / NumPy', footprint: 'Coarse-to-Fine Pipeline', qty: 1, description: 'Fast global screening (Level 0) to local sub-pixel refinement (Level 2)' },
      { ref: 'CPU1', name: 'Edge Industrial Host Processor', package: 'x86 CPU Execution', footprint: 'Zero GPU Dependency', qty: 1, description: 'Real-time foundry tool execution (~44ms average latency)' }
    ],
    codeSnippet: {
      language: 'python',
      filename: 'driftsense_resnet_encoder.py',
      code: `# Custom 4-Layer Bottlenecked ResNet Siamese Encoder for Semiconductor Layouts
import torch
import torch.nn as nn
import torch.nn.functional as F

class Custom4LayerResNet(nn.Module):
    def __init__(self, embedding_dim=128):
        super(Custom4LayerResNet, self).__init__()
        # Layer 1: SEM Grayscale Feature Extraction
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, stride=1, padding=1)
        self.bn1   = nn.BatchNorm2d(32)
        
        # Layer 2: Residual Block A (Geometry vs Noise Disambiguation)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1)
        self.bn2   = nn.BatchNorm2d(64)
        
        # Layer 3: Residual Block B (Periodic Decoy Invariance)
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, stride=2, padding=1)
        self.bn3   = nn.BatchNorm2d(128)
        
        # Layer 4: Semantic Embedding Projection
        self.conv4 = nn.Conv2d(128, 256, kernel_size=3, stride=2, padding=1)
        self.bn4   = nn.BatchNorm2d(256)
        
        self.fc = nn.Linear(256 * 4 * 4, embedding_dim)

    def forward(self, x):
        x = F.relu(self.bn1(self.conv1(x)))
        x = F.relu(self.bn2(self.conv2(x)))
        x = F.relu(self.bn3(self.conv3(x)))
        x = F.relu(self.bn4(self.conv4(x)))
        x = x.view(x.size(0), -1)
        embeddings = F.normalize(self.fc(x), p=2, dim=1)
        return embeddings`
    },
    techStack: ['PyTorch 2.x', 'Custom 4-Layer ResNet', 'Triplet Loss Model', '3-Level Pyramid NCC', 'Semiconductor Metrology', 'Python'],
    githubUrl: 'https://github.com/hariharan23012008/I4C_Drift_sense_D_RAM_submission-1',
    demoUrl: 'https://github.com/hariharan23012008/I4C_Drift_sense_D_RAM_submission-1/blob/main/README.md#-the-problem-statement',
    metrics: [
      { label: 'Localization Accuracy', value: '96.7%' },
      { label: 'Inference Latency', value: '44 ms (CPU)' },
      { label: 'Model Footprint', value: '1.38 MB' },
      { label: 'Noise Resilience', value: '+5.4% vs OpenCV' }
    ]
  };

  const projectList: Project[] = [defaultVoltXProject, defaultDriftSenseProject];
  const filteredProjects = projectList;

  const handleOpenProject = (p: Project) => {
    sound.playRelayClick();
    setActiveModalProject(p);
    setModalTab('overview');
  };

  const handleCloseModal = () => {
    sound.playRelayClick();
    setActiveModalProject(null);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    sound.playBeep(1200, 'sine', 0.08);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section id="projects" className="py-8 relative w-full font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            <Cpu className="w-8 h-8 text-white" />
            Featured Projects
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl font-normal">
            Touch or click any project picture below to view full hardware schematics, firmware code, and bill of materials.
          </p>
        </div>
      </div>

      {/* Projects Grid with Touch-to-Open Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, idx) => (
          <div
            key={project.id || idx}
            onClick={() => handleOpenProject(project)}
            className="group relative cursor-pointer bg-[#18181b] border border-zinc-700/80 hover:border-zinc-400 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4 text-xs">
                <span className="font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  {project.category} Core
                </span>
                <span className="text-zinc-500 font-medium">
                  Project #{idx + 1}
                </span>
              </div>

              {/* Project Image Preview (TOUCH PICTURE TO VIEW DETAILS) */}
              <div className="relative h-48 rounded-xl overflow-hidden mb-4 border border-zinc-700/80 bg-zinc-900 group-hover:border-zinc-400 transition-colors">
                <img
                  src={project.image.startsWith('http') ? project.image : `./${project.image.replace(/^\.?\/+/, '')}`}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Touch hint overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-zinc-950 text-xs font-semibold shadow flex items-center gap-1.5 group-hover:bg-white transition-colors">
                    <span>Touch picture for details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-lg font-bold text-white group-hover:text-zinc-100 transition-colors leading-snug">
                {project.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 font-medium">
                {project.subtitle}
              </p>
              <p className="text-xs text-zinc-300 mt-2.5 line-clamp-3 leading-relaxed font-normal">
                {project.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-800">
              {/* Tech Stack Badges */}
              <div className="flex flex-wrap gap-1 mb-3">
                {project.techStack.slice(0, 4).map((tech, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2 py-0.5 rounded text-[11px] bg-zinc-800 text-zinc-300 border border-zinc-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Bottom Action Line */}
              <div className="flex items-center justify-between text-xs font-semibold text-white group-hover:text-zinc-200">
                <span className="flex items-center gap-1">
                  View Full Project Details <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    <GithubIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= PROJECT DETAIL MODAL ================= */}
      {activeModalProject && (
        <div 
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#18181b] border border-zinc-700 rounded-3xl shadow-2xl overflow-hidden text-white font-sans"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {activeModalProject.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">
                    {activeModalProject.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {activeModalProject.demoUrl && (
                  <a
                    href={activeModalProject.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold shadow transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Problem Statement</span>
                  </a>
                )}
                {activeModalProject.githubUrl && (
                  <a
                    href={activeModalProject.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-white border border-zinc-700 transition-all font-medium"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 transition-all"
                  title="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Tabs in White and Gray */}
            <div className="flex border-b border-zinc-800 px-6 bg-zinc-900/60 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => { setModalTab('overview'); sound.playRelayClick(); }}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
                  modalTab === 'overview'
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Overview & Architecture
              </button>
              {activeModalProject.bom && (
                <button
                  onClick={() => { setModalTab('bom'); sound.playRelayClick(); }}
                  className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
                    modalTab === 'bom'
                      ? 'border-white text-white'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Components & BOM ({activeModalProject.bom.length})
                </button>
              )}
              {activeModalProject.codeSnippet && (
                <button
                  onClick={() => { setModalTab('code'); sound.playRelayClick(); }}
                  className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
                    modalTab === 'code'
                      ? 'border-white text-white'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  Firmware Code
                </button>
              )}
              {activeModalProject.schematicImage && (
                <button
                  onClick={() => { setModalTab('schematic'); sound.playRelayClick(); }}
                  className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
                    modalTab === 'schematic'
                      ? 'border-white text-white'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Schematics
                </button>
              )}
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
              
              {/* TAB 1: OVERVIEW */}
              {modalTab === 'overview' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Hero Project Image */}
                  <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-950">
                    <img
                      src={activeModalProject.image.startsWith('http') ? activeModalProject.image : `./${activeModalProject.image.replace(/^\.?\/+/, '')}`}
                      alt={activeModalProject.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Benchmark Metrics */}
                  {activeModalProject.metrics && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {activeModalProject.metrics.map((m, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
                          <div className="text-xs text-zinc-400 font-medium">{m.label}</div>
                          <div className="text-base font-bold text-white mt-1">{m.value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Description Text */}
                  <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Project Description & Problem Statement
                    </h4>
                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line font-normal">
                      {activeModalProject.longDescription || activeModalProject.description}
                    </p>
                  </div>

                  {/* Tech Stack Chips */}
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Hardware & Software Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeModalProject.techStack.map((tech, i) => (
                        <span key={i} className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-medium text-zinc-200">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BILL OF MATERIALS (BOM) */}
              {modalTab === 'bom' && activeModalProject.bom && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="text-sm font-semibold text-zinc-400">
                    Component Bill of Materials (BOM)
                  </div>
                  <div className="rounded-xl border border-zinc-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-900 text-zinc-400 uppercase border-b border-zinc-800">
                        <tr>
                          <th className="p-3">Designator</th>
                          <th className="p-3">Component Name</th>
                          <th className="p-3">Package</th>
                          <th className="p-3">Qty</th>
                          <th className="p-3">Role & Function</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800">
                        {activeModalProject.bom.map((b, i) => (
                          <tr key={i} className="hover:bg-zinc-900/50">
                            <td className="p-3 font-bold text-white">{b.ref}</td>
                            <td className="p-3 text-zinc-200">{b.name}</td>
                            <td className="p-3 text-zinc-400">{b.package}</td>
                            <td className="p-3 font-semibold text-white">{b.qty}</td>
                            <td className="p-3 text-zinc-400">{b.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: FIRMWARE CODE */}
              {modalTab === 'code' && activeModalProject.codeSnippet && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400">
                      File: {activeModalProject.codeSnippet.filename}
                    </span>
                    <button
                      onClick={() => handleCopyCode(activeModalProject.codeSnippet!.code)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-white border border-zinc-700 transition-all font-medium"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 overflow-x-auto font-mono leading-relaxed">
                    <code>{activeModalProject.codeSnippet.code}</code>
                  </pre>
                </div>
              )}

              {/* TAB 4: SCHEMATICS */}
              {modalTab === 'schematic' && activeModalProject.schematicImage && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="text-sm font-semibold text-zinc-400">
                    Circuit Schematic Diagram
                  </div>
                  <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 p-2">
                    <img
                      src={activeModalProject.schematicImage}
                      alt="Hardware Schematic"
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </section>
  );
};
