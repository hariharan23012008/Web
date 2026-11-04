export interface BomItem {
  ref: string;
  name: string;
  package: string;
  footprint: string;
  qty: number;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: 'VLSI' | 'Embedded' | 'PCB' | 'Robotics' | 'IoT';
  description: string;
  longDescription: string;
  image: string;
  schematicImage?: string;
  pcbLayoutImage?: string;
  bom: BomItem[];
  codeSnippet?: {
    language: string;
    filename: string;
    code: string;
  };
  techStack: string[];
  githubUrl: string;
  demoUrl?: string;
  videoUrl?: string;
  featured?: boolean;
  metrics?: { label: string; value: string }[];
}

export interface WaveformChannel {
  name: string;
  type: 'clock' | 'digital' | 'bus';
  values: (number | string)[];
}

export interface CodeLabEntry {
  id: string;
  title: string;
  language: 'verilog' | 'cpp' | 'c' | 'python' | 'arduino' | 'systemverilog';
  category: string;
  description: string;
  filename: string;
  code: string;
  simulationWaveform?: {
    clockCycles: number;
    channels: WaveformChannel[];
  };
}

export interface PcbLayer {
  name: string;
  code: string;
  color: string;
  visible: boolean;
  description: string;
}

export interface PcbDesignEntry {
  id: string;
  title: string;
  boardName: string;
  layerCount: number;
  dimensions: string;
  copperWeight: string;
  minTraceWidth: string;
  finish: string;
  edaTool: string;
  description: string;
  schematicSnippet: string;
  layoutSnippet: string;
  gerberFiles: string[];
  specs: { label: string; value: string }[];
}

export interface Achievement {
  id: string;
  title: string;
  category: 'Hackathon' | 'Competition' | 'Certification' | 'Research' | 'Internship';
  organization: string;
  date: string;
  badgeText: string;
  description: string;
  link?: string;
  iconName?: string;
}

export interface EngineerProfile {
  name: string;
  title: string;
  headline: string;
  about: string;
  education: {
    degree: string;
    institution: string;
    duration: string;
    gpa: string;
    details: string;
  }[];
  contact: {
    email: string;
    github: string;
    linkedin: string;
    phone: string;
    location: string;
  };
  skills: {
    category: string;
    items: { name: string; proficiency: number }[];
  }[];
}

