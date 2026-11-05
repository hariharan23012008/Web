import type { Project, Achievement, EngineerProfile } from '../types';

const REAL_PROJECTS: Project[] = [
  {
    id: 'proj-voltx',
    title: 'VoltX: IoT-Based Smart Charging Cutoff & Battery Health Optimization System',
    subtitle: 'Automated ESP32 Relay Cutoff with DependencyGuard Fail-Safe Monitoring',
    category: 'IoT',
    description: 'An IoT-based smart charging system that automates smartphone charging control via ESP32 relay switching, target threshold monitoring, and a fault-tolerant DependencyGuard engine.',
    longDescription: `### The Problem Statement:
Continuous overnight charging and holding Li-ion batteries at 100% state-of-charge significantly accelerates chemical battery degradation, thermal stress, and cycle loss. Standard charging bricks cannot dynamically disconnect AC/DC power based on software-defined battery thresholds.

### Proposed Solution:
VoltX allows users to set a custom target battery percentage (e.g., 80%) through a dedicated mobile application. When the target threshold is reached, VoltX automatically commands an ESP32-connected optoisolated relay module to sever the charging circuit.

### Key Architectural Innovation: DependencyGuard
VoltX features a proprietary **DependencyGuard** failure-management system that tracks prerequisites, blockers, paused operations, downstream impacts, and recovery protocols. If Wi-Fi drops, backend APIs fail, or the ESP32 disconnects, DependencyGuard immediately detects the root cause, applies safe fallback actions, and records the telemetry incident.`,
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
#include <ArduinoJson.h>

#define RELAY_PIN 23
#define STATUS_LED 2

void setup() {
    pinMode(RELAY_PIN, OUTPUT);
    pinMode(STATUS_LED, OUTPUT);
    digitalWrite(RELAY_PIN, HIGH); // Default Charging Active
    WiFi.begin("VoltX_Net", "secure_pass");
}

void loop() {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin("https://voltx-api.local/api/device/status");
        int httpCode = http.GET();
        if (httpCode == 200) {
            String payload = http.getString();
            StaticJsonDocument<256> doc;
            deserializeJson(doc, payload);
            
            int currentBattery = doc["currentBattery"];
            int targetBattery  = doc["targetBattery"];
            
            // Automatic Target Percentage Cutoff
            if (currentBattery >= targetBattery) {
                digitalWrite(RELAY_PIN, LOW); // Cutoff Charging
                digitalWrite(STATUS_LED, HIGH);
                acknowledgeCutoff("TARGET_PERCENTAGE_REACHED");
            }
        }
        http.end();
    }
    delay(5000);
}`
    },
    techStack: ['ESP32 (C++)', 'IoT Relay Automation', 'Android App', 'DependencyGuard Engine', 'Wi-Fi Telemetry', 'Prisma DB'],
    githubUrl: 'https://github.com/hariharan23012008/VOLTX',
    demoUrl: 'https://github.com/hariharan23012008/VOLTX#iot-based-smart-charging-cutoff--battery-health-optimization-system',
    videoUrl: 'https://github.com/hariharan23012008/VOLTX',
    featured: true,
    metrics: [
      { label: 'Cutoff Accuracy', value: '100% Target' },
      { label: 'Response Latency', value: '< 250 ms' },
      { label: 'Relay Rating', value: '10A 250VAC' },
      { label: 'Fail-Safe Mode', value: 'DependencyGuard' }
    ]
  },
  {
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
    techStack: ['PyTorch 2.x', 'Custom 4-Layer ResNet', 'Triplet Loss Model', 'OpenCV NCC', 'Semiconductor Metrology', 'Python'],
    githubUrl: 'https://github.com/hariharan23012008/I4C_Drift_sense_D_RAM_submission-1',
    demoUrl: 'https://github.com/hariharan23012008/I4C_Drift_sense_D_RAM_submission-1/blob/main/README.md#-the-problem-statement',
    videoUrl: 'https://github.com/hariharan23012008/I4C_Drift_sense_D_RAM_submission-1',
    featured: true,
    metrics: [
      { label: 'Accuracy', value: '96.7%' },
      { label: 'Inference Speed', value: '44 ms (CPU)' },
      { label: 'Model Weight', value: '1.38 MB' },
      { label: 'Noise Gain', value: '+5.4% Over SOTA' }
    ]
  }
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: 'I4C Competition Finalist - DriftSense SEM Metrology',
    category: 'Competition',
    organization: 'India Industry & Academic Consortium (I4C)',
    date: '2024 - 2025',
    badgeText: 'SEMICONDUCTOR AI // 96.7% ACCURACY',
    description: 'Developed DriftSense: Hybrid Siamese Neural Network with Custom 4-Layer ResNet for sub-pixel localization in extreme noise Scanning Electron Microscope semiconductor foundries.'
  },
  {
    id: 'ach-2',
    title: 'Developer of VoltX - IoT Smart Battery Optimization System',
    category: 'Hackathon',
    organization: 'Smart Hardware & Energy Innovations',
    date: '2025',
    badgeText: 'SMART CHARGING // DEPENDENCYGUARD',
    description: 'Engineered an autonomous ESP32 smart charging cutoff hardware platform with real-time battery threshold monitoring, failure recovery, and Li-ion lifespan optimization.'
  },
  {
    id: 'ach-3',
    title: 'Active Open Source Semiconductor & Embedded Contributor',
    category: 'Research',
    organization: 'GitHub / hariharan23012008',
    date: 'Ongoing',
    badgeText: 'EMBEDDED & VLSI',
    description: 'Published production-grade firmware for ESP32 relay telemetry, PyTorch metrology pipelines, and hardware automation repositories.'
  }
];

const INITIAL_PROFILE: EngineerProfile = {
  name: 'Hariharan K',
  title: 'Electronics, IoT & VLSI Systems Engineer',
  headline: 'Specializing in IoT Hardware, ESP32 Firmware, Semiconductor Metrology & Edge AI',
  about: 'I am Hariharan, a passionate and innovative Electronics Engineer with a strong interest in Embedded Systems, VLSI Design, Robotics, IoT, and Hardware Development. I enjoy designing and developing real-world engineering solutions through hands-on projects, including smart charging controllers, AI-powered retail intelligence systems, industrial safety automation, ESP32-based robotics, and custom PCB designs. I have experience working with microcontrollers, sensors, embedded programming, hardware integration, and system development. Apart from my technical interests, I enjoy playing badminton, drawing, creating art and craft projects, and participating in various extracurricular activities.',
  education: [
    {
      degree: 'B.E. in Electronics and Communication Engineering',
      institution: 'Engineering University',
      duration: '2022 - 2026',
      gpa: 'First Class with Distinction',
      details: 'Specialization in Embedded IoT Systems, VLSI Architectures, Microcontrollers, Computer Vision Metrology, and Hardware-Software Co-Design.'
    }
  ],
  contact: {
    email: 'hariharan23012008@gmail.com',
    github: 'https://github.com/hariharan23012008',
    linkedin: 'https://www.linkedin.com/feed/',
    phone: '+91 Available on Request',
    location: 'India'
  },
  skills: [
    {
      category: 'Embedded Systems & IoT Hardware',
      items: [
        { name: 'ESP32 (Wi-Fi, BLE, C++)', proficiency: 96 },
        { name: 'IoT Relay Automation & Battery Systems', proficiency: 95 },
        { name: 'Microcontrollers (Arduino, STM32)', proficiency: 92 },
        { name: 'DependencyGuard Failure Recovery', proficiency: 94 },
        { name: 'Sensors & Circuit Prototyping', proficiency: 90 }
      ]
    },
    {
      category: 'Semiconductor Metrology & AI',
      items: [
        { name: 'PyTorch 2.x & Custom 4-Layer ResNet', proficiency: 94 },
        { name: 'Triplet Loss Siamese Networks (TLM)', proficiency: 92 },
        { name: 'SEM Sub-Pixel Alignment & Computer Vision', proficiency: 95 },
        { name: 'Normalized Cross-Correlation (NCC) Pyramids', proficiency: 90 },
        { name: 'CPU Edge Model Optimization (1.38MB)', proficiency: 93 }
      ]
    },
    {
      category: 'Software & Cloud Engineering',
      items: [
        { name: 'Python (PyTorch, OpenCV, NumPy)', proficiency: 95 },
        { name: 'C / C++ Embedded Programming', proficiency: 94 },
        { name: 'REST APIs & Real-Time Telemetry', proficiency: 90 },
        { name: 'Git & GitHub Project Management', proficiency: 95 },
        { name: 'Full-Stack Dashboard Integration', proficiency: 88 }
      ]
    }
  ]
};

const STORAGE_KEYS = {
  PROJECTS: 'pcb_portfolio_projects_v8',
  ACHIEVEMENTS: 'pcb_portfolio_achievements_v7',
  PROFILE: 'pcb_portfolio_profile_v7'
};

export class StorageService {
  // Projects CRUD
  static getProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([REAL_PROJECTS[0], REAL_PROJECTS[1]]));
        return [REAL_PROJECTS[0], REAL_PROJECTS[1]];
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length < 2) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([REAL_PROJECTS[0], REAL_PROJECTS[1]]));
        return [REAL_PROJECTS[0], REAL_PROJECTS[1]];
      }
      // Ensure official local photos are loaded
      const normalized = parsed.map((p: Project) => {
        if (p.id === 'proj-voltx') {
          return { ...p, image: './voltx.png' };
        }
        if (p.id === 'proj-driftsense') {
          return { ...p, image: './driftsense.jpg', githubUrl: 'https://github.com/hariharan23012008/I4C_Drift_sense_D_RAM_submission-1' };
        }
        return p;
      });
      return normalized;
    } catch {
      return [REAL_PROJECTS[0], REAL_PROJECTS[1]];
    }
  }

  static saveProjects(projects: Project[]) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  static addProject(project: Project): Project[] {
    const list = this.getProjects();
    const updated = [project, ...list];
    this.saveProjects(updated);
    return updated;
  }

  static updateProject(project: Project): Project[] {
    const list = this.getProjects();
    const updated = list.map(p => (p.id === project.id ? project : p));
    this.saveProjects(updated);
    return updated;
  }

  static deleteProject(id: string): Project[] {
    const list = this.getProjects();
    const updated = list.filter(p => p.id !== id);
    this.saveProjects(updated);
    return updated;
  }

  // Achievements CRUD
  static getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify([]));
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveAchievements(achievements: Achievement[]) {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  }

  static addAchievement(item: Achievement): Achievement[] {
    const list = this.getAchievements();
    const updated = [item, ...list];
    this.saveAchievements(updated);
    return updated;
  }

  static deleteAchievement(id: string): Achievement[] {
    const list = this.getAchievements();
    const updated = list.filter(a => a.id !== id);
    this.saveAchievements(updated);
    return updated;
  }

  // Profile CRUD
  static getProfile(): EngineerProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
        return INITIAL_PROFILE;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PROFILE;
    }
  }

  static saveProfile(profile: EngineerProfile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  // Export / Import Database
  static exportFullBackup(): string {
    const backup = {
      timestamp: new Date().toISOString(),
      projects: this.getProjects(),
      achievements: this.getAchievements(),
      profile: this.getProfile()
    };
    return JSON.stringify(backup, null, 2);
  }

  static importFullBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.projects) this.saveProjects(parsed.projects);
      if (parsed.achievements) this.saveAchievements(parsed.achievements);
      if (parsed.profile) this.saveProfile(parsed.profile);
      return true;
    } catch {
      return false;
    }
  }

  static resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(REAL_PROJECTS));
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(INITIAL_ACHIEVEMENTS));
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
  }
}
