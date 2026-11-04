import React, { useEffect, useRef, useState } from 'react';
import { Activity, Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, Radio } from 'lucide-react';
import { sound } from '../utils/audio';

export const OscilloscopeWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [waveType, setWaveType] = useState<'sine' | 'square' | 'triangle' | 'spi' | 'pwm'>('sine');
  const [frequency, setFrequency] = useState(2.5); // Normalized freq
  const [amplitude, setAmplitude] = useState(1.2);
  const [isAudioLive, setIsAudioLive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Audio tone generation for active oscilloscope frequency
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscNodeRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Toggle synthesized audio generator
  useEffect(() => {
    if (isAudioLive && isRunning) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = waveType === 'spi' ? 'square' : (waveType as OscillatorType);
        osc.frequency.setValueAtTime(frequency * 180, ctx.currentTime);

        gain.gain.setValueAtTime(0.04, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        audioContextRef.current = ctx;
        oscNodeRef.current = osc;
        gainNodeRef.current = gain;
      } catch {
        // Ignore
      }
    } else {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
        oscNodeRef.current = null;
        gainNodeRef.current = null;
      }
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isAudioLive, isRunning, waveType]);

  // Update frequency of live audio if changed
  useEffect(() => {
    if (oscNodeRef.current && audioContextRef.current) {
      oscNodeRef.current.frequency.setValueAtTime(
        frequency * 180,
        audioContextRef.current.currentTime
      );
    }
  }, [frequency]);

  // Real-time Waveform Rendering Engine on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // 1. Oscilloscope CRT Phosphor Background
      ctx.fillStyle = '#05110d';
      ctx.fillRect(0, 0, width, height);

      // 2. Phosphor Grid Reticle (8x10 divisions)
      ctx.strokeStyle = 'rgba(0, 255, 156, 0.15)';
      ctx.lineWidth = 1;
      const gridCols = 10;
      const gridRows = 8;
      const colStep = width / gridCols;
      const rowStep = height / gridRows;

      for (let x = 0; x <= width; x += colStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += rowStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center crosshairs with division ticks
      ctx.strokeStyle = 'rgba(0, 255, 156, 0.35)';
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      if (isRunning) {
        phase += 0.05 * frequency;
      }

      // 3. Render CH1 Signal Trace (Glowing Green Phosphor)
      ctx.beginPath();
      ctx.strokeStyle = '#00FF9C';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00FF9C';
      ctx.shadowBlur = 8;

      const points = width;
      for (let x = 0; x < points; x++) {
        const t = (x / width) * 12 * frequency + phase;
        let yVal = 0;

        if (waveType === 'sine') {
          yVal = Math.sin(t);
        } else if (waveType === 'square') {
          yVal = Math.sin(t) >= 0 ? 1 : -1;
        } else if (waveType === 'triangle') {
          yVal = (2 / Math.PI) * Math.asin(Math.sin(t));
        } else if (waveType === 'pwm') {
          yVal = (t % (Math.PI * 2)) < (Math.PI * 0.6) ? 1 : -1;
        } else if (waveType === 'spi') {
          // Simulated digital packet byte: 1 0 1 1 0 0 1 0
          const bitIndex = Math.floor(t % 8);
          const packet = [1, -1, 1, 1, -1, -1, 1, -1];
          yVal = packet[bitIndex];
        }

        const y = centerY - yVal * amplitude * 36;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 4. Render CH2 Reference Clock Trace (Electric Cyan)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 191, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#00BFFF';
      ctx.shadowBlur = 4;

      for (let x = 0; x < points; x++) {
        const t = (x / width) * 12 * frequency * 2 + phase * 2;
        const yVal = Math.sin(t) >= 0 ? 0.7 : -0.7;
        const y = centerY + 30 - yVal * 15;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Reset shadow for text overlays
      ctx.shadowBlur = 0;

      // Telemetry On-Screen HUD Text
      ctx.fillStyle = '#00FF9C';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText(`CH1: ${(amplitude * 1.65).toFixed(2)} Vpp  500mV/div`, 10, 18);
      ctx.fillStyle = '#00BFFF';
      ctx.fillText(`CH2: CLK ${(frequency * 100).toFixed(0)} kHz`, 10, 32);
      ctx.fillStyle = '#C0C6CE';
      ctx.fillText(`TRIG: AUTO 50%`, width - 110, 18);
      ctx.fillText(`TB: 10µs/div`, width - 96, 32);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isRunning, waveType, frequency, amplitude]);

  return (
    <div className={`bg-[#080B10]/95 backdrop-blur-md border border-[#00FF9C]/40 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ${
      isMinimized ? 'w-80 h-12' : 'w-full max-w-md'
    }`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0B4D38]/40 border-b border-[#00FF9C]/30">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-[#00FF9C] animate-pulse" />
          <span className="text-xs font-orbitron font-bold text-[#00FF9C] tracking-wide">
            DSO-100MSPS // TELEMETRY
          </span>
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#00FF9C] animate-ping' : 'bg-red-500'}`} />
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              setIsRunning(!isRunning);
              sound.playRelayClick();
            }}
            className={`p-1 rounded text-xs transition-colors ${
              isRunning ? 'text-[#00FF9C] hover:bg-[#00FF9C]/20' : 'text-amber-400 hover:bg-amber-400/20'
            }`}
            title={isRunning ? "Freeze Sampling" : "Resume Sampling"}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => {
              setIsAudioLive(!isAudioLive);
              sound.playRelayClick();
            }}
            className={`p-1 rounded text-xs transition-colors ${
              isAudioLive ? 'text-[#00BFFF] bg-[#00BFFF]/20' : 'text-[#C0C6CE] hover:bg-white/10'
            }`}
            title="Listen to Live Signal Audio"
          >
            {isAudioLive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded text-[#C0C6CE] hover:bg-white/10 text-xs"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-3 space-y-3">
          {/* CRT Screen Canvas */}
          <div className="relative rounded-lg overflow-hidden border border-[#0B4D38] crt-overlay">
            <canvas ref={canvasRef} width={420} height={180} className="w-full h-36 block bg-black" />
          </div>

          {/* Waveform Selector */}
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#C0C6CE]/70">WAVEFORM:</span>
            <div className="flex gap-1">
              {(['sine', 'square', 'triangle', 'pwm', 'spi'] as const).map(w => (
                <button
                  key={w}
                  onClick={() => {
                    setWaveType(w);
                    sound.playRelayClick();
                  }}
                  className={`px-2 py-0.5 rounded uppercase text-[10px] font-bold transition-all ${
                    waveType === w
                      ? 'bg-[#00FF9C] text-black shadow glow-green'
                      : 'bg-[#0B4D38]/30 hover:bg-[#0B4D38]/60 text-[#C0C6CE]'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders for Frequency & Amplitude */}
          <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
            <div>
              <div className="flex justify-between text-[#C0C6CE]/70 mb-1">
                <span>FREQ: {(frequency * 10).toFixed(1)} kHz</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.1"
                value={frequency}
                onChange={e => setFrequency(parseFloat(e.target.value))}
                className="w-full accent-[#00FF9C] bg-[#0B4D38] h-1.5 rounded cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-[#C0C6CE]/70 mb-1">
                <span>GAIN: {(amplitude * 1.5).toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.0"
                step="0.1"
                value={amplitude}
                onChange={e => setAmplitude(parseFloat(e.target.value))}
                className="w-full accent-[#00BFFF] bg-[#0B4D38] h-1.5 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

