import React, { useState } from 'react';
import { CodeLabEntry } from '../types';
import { sound } from '../utils/audio';
import { 
  Code2, Copy, Check, Play, RotateCcw, Download, Terminal, 
  Cpu, FileCode, Sparkles
} from 'lucide-react';

interface SourceCodeLabProps {
  entries: CodeLabEntry[];
}

export const SourceCodeLab: React.FC<SourceCodeLabProps> = ({ entries }) => {
  const [selectedEntry, setSelectedEntry] = useState<CodeLabEntry>(entries[0]);
  const [copied, setCopied] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [isSimRunning, setIsSimRunning] = useState(false);

  const handleSelectEntry = (entry: CodeLabEntry) => {
    sound.playRelayClick();
    setSelectedEntry(entry);
    setSimStep(0);
    setIsSimRunning(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedEntry.code);
    sound.playBeep(1000, 'sine', 0.08);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([selectedEntry.code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = selectedEntry.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    sound.playBeep(880, 'sine', 0.08);
  };

  const handleStepSimulation = () => {
    sound.playSignalPulse();
    setSimStep(prev => (prev + 1) % 8);
  };

  const handleResetSimulation = () => {
    sound.playRelayClick();
    setSimStep(0);
    setIsSimRunning(false);
  };

  return (
    <section id="codelab" className="py-16 relative">
      {/* Header Accent */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-[2px] bg-[#00BFFF]" />
        <span className="text-xs font-mono font-bold text-[#00BFFF] tracking-widest uppercase">
          SECTION 02 // FIRMWARE & HDL CODE LAB
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white font-orbitron tracking-tight flex items-center gap-3">
            <Code2 className="w-8 h-8 text-[#00BFFF]" />
            SOURCE CODE & HDL LAB
          </h2>
          <p className="text-sm text-[#C0C6CE] font-mono mt-1 max-w-2xl">
            Synthesizable Verilog HDL cores, bare-metal STM32 C drivers, FreeRTOS tasks, and digital signal processing routines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B4D38]/40 hover:bg-[#0B4D38] border border-[#00FF9C]/40 text-xs font-mono text-[#00FF9C] transition-all"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD {selectedEntry.filename}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#00BFFF] hover:bg-[#00BFFF]/80 text-black text-xs font-mono font-bold transition-all shadow glow-blue"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'COPIED TO CLIPBOARD' : 'COPY FILE'}
          </button>
        </div>
      </div>

      {/* Main Code Lab Container: Left Explorer Sidebar + Right Code Viewer & Waveform Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#080B10] border-2 border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Left Sidebar: File Browser */}
        <div className="lg:col-span-4 bg-[#0A0E14] border-r border-white/10 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#C0C6CE]/70 border-b border-white/10 pb-2">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <Terminal className="w-3.5 h-3.5 text-[#00FF9C]" />
              FIRMWARE_EXPLORER
            </span>
            <span>{entries.length} FILES</span>
          </div>

          <div className="space-y-1.5">
            {entries.map(entry => (
              <button
                key={entry.id}
                onClick={() => handleSelectEntry(entry)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                  selectedEntry.id === entry.id
                    ? 'bg-[#0B4D38]/50 border-[#00FF9C] text-white glow-green'
                    : 'bg-black/30 border-white/5 text-[#C0C6CE] hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <div className="mt-0.5">
                  <FileCode className={`w-4 h-4 ${
                    selectedEntry.id === entry.id ? 'text-[#00FF9C]' : 'text-[#00BFFF]'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono font-bold truncate flex items-center justify-between">
                    <span>{entry.filename}</span>
                    <span className="text-[10px] uppercase font-normal px-1.5 py-0.5 rounded bg-black/40 text-[#00FF9C]">
                      {entry.language}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#C0C6CE]/70 truncate mt-0.5">
                    {entry.title}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Logic Analyzer Waveform Simulator Callout */}
          {selectedEntry.simulationWaveform && (
            <div className="mt-6 p-3 rounded-xl bg-[#00BFFF]/10 border border-[#00BFFF]/30">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00BFFF]">
                <Sparkles className="w-4 h-4" />
                DIGITAL TIMING SIMULATOR
              </div>
              <p className="text-[11px] text-[#C0C6CE] mt-1 leading-relaxed">
                Step through clock cycles to inspect register forwarding and hazard flag transitions in the waveform dock below.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleStepSimulation}
                  className="flex-1 py-1.5 rounded bg-[#00BFFF] hover:bg-[#00BFFF]/80 text-black font-mono text-xs font-bold flex items-center justify-center gap-1 transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  STEP CLK (+1)
                </button>
                <button
                  onClick={handleResetSimulation}
                  className="px-2.5 py-1.5 rounded bg-black/50 border border-white/20 text-[#C0C6CE] hover:text-white text-xs font-mono transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Code Display */}
        <div className="lg:col-span-8 flex flex-col bg-[#05070B]">
          
          {/* Top Code File Meta Header */}
          <div className="flex items-center justify-between px-5 py-3 bg-[#0D1117] border-b border-white/10">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs font-mono text-white/70 ml-2 font-bold">
                {selectedEntry.filename}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#00FF9C]">
              UTF-8 • {selectedEntry.category}
            </span>
          </div>

          {/* Syntax Highlighted Code Viewer with Line Numbers */}
          <div className="flex-1 overflow-x-auto p-4 max-h-[460px] font-mono text-xs">
            <table className="w-full border-collapse">
              <tbody>
                {selectedEntry.code.split('\n').map((line, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="pr-4 py-0.5 text-right select-none text-[#4B5563] text-[11px] w-10">
                      {idx + 1}
                    </td>
                    <td className="py-0.5 text-[#C0C6CE] whitespace-pre font-mono">
                      {/* Highlight comments, keywords, registers */}
                      {line.trim().startsWith('//') || line.trim().startsWith('#') ? (
                        <span className="text-[#64748B] italic">{line}</span>
                      ) : line.includes('module') || line.includes('always') || line.includes('input') || line.includes('output') || line.includes('void') || line.includes('float') || line.includes('struct') ? (
                        <span className="text-[#00FF9C]">{line}</span>
                      ) : line.includes('wire') || line.includes('reg') || line.includes('logic') || line.includes('uint') ? (
                        <span className="text-[#00BFFF]">{line}</span>
                      ) : (
                        <span>{line}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Integrated Interactive Logic Analyzer Timing Waveform (ModelSim / GTKWave style) */}
          {selectedEntry.simulationWaveform && (
            <div className="border-t-2 border-[#1E293B] bg-[#070A0F] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-[#00FF9C]" />
                  <span className="text-xs font-mono font-bold text-white uppercase">
                    LOGIC ANALYZER // DIGITAL TIMING DIAGRAM (CYCLE {simStep})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#00FF9C]">
                  TB: 10ns/div • CLK: 100MHz
                </span>
              </div>

              {/* Channels Waveform Visualization */}
              <div className="space-y-2 font-mono text-[11px] bg-black/60 p-3 rounded-lg border border-white/10">
                {selectedEntry.simulationWaveform.channels.map((chan, cIdx) => (
                  <div key={cIdx} className="flex items-center">
                    <div className="w-36 text-xs text-[#00BFFF] truncate font-bold">
                      {chan.name}
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                      {chan.values.map((val, stepIdx) => {
                        const isActive = stepIdx === simStep;
                        return (
                          <div
                            key={stepIdx}
                            className={`flex-1 h-7 flex items-center justify-center text-[10px] font-mono border rounded transition-all ${
                              isActive
                                ? 'bg-[#00FF9C]/20 border-[#00FF9C] text-[#00FF9C] font-bold shadow glow-green'
                                : 'bg-white/5 border-white/10 text-[#C0C6CE]'
                            }`}
                          >
                            {val}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};

