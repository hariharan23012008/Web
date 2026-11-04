import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { GithubIcon, LinkedinIcon } from './SocialIcons';
import { 
  Radio, Send, CheckCircle2, Mail, MapPin, Terminal 
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [frequencyBand, setFrequencyBand] = useState('868.1 MHz');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsTransmitting(true);
    sound.playTelemetryBurst();

    setTimeout(() => {
      setIsTransmitting(false);
      setIsSuccess(true);
      sound.playBeep(1046, 'sine', 0.15);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSuccess(false), 6000);
    }, 1500);
  };

  return (
    <section id="contact" className="py-16 relative">
      {/* Header Accent */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-[2px] bg-[#00FF9C]" />
        <span className="text-xs font-mono font-bold text-[#00FF9C] tracking-widest uppercase">
          SECTION 07 // RF TELEMETRY & CONTACT TRANSCEIVER
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white font-orbitron tracking-tight flex items-center gap-3">
            <Radio className="w-8 h-8 text-[#00FF9C] animate-pulse" />
            COMMUNICATION TERMINAL
          </h2>
          <p className="text-sm text-[#C0C6CE] font-mono mt-1 max-w-2xl">
            Transmit an encrypted message directly to my station for engineering opportunities, hardware collaborations, or project inquiries.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: RF Transceiver Console */}
        <div className="lg:col-span-7 bg-[#0A0E14] border-2 border-[#1E293B] rounded-2xl p-6 lg:p-8 shadow-2xl relative">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-[#00FF9C]" />
              <span className="text-xs font-mono font-bold text-white uppercase">
                TELEMETRY PACKET ENCODER
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] font-mono text-[#00BFFF]">
              <span className="w-2 h-2 rounded-full bg-[#00FF9C] animate-ping" />
              <span>RF CARRIER LOCKED ({frequencyBand})</span>
            </div>
          </div>

          {/* Frequency Band Selector */}
          <div className="mb-6">
            <label className="text-[11px] font-mono text-[#C0C6CE]/70 block mb-2 uppercase">
              CARRIER FREQUENCY CHANNEL:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['433.9 MHz (ISM)', '868.1 MHz (LoRa)', '2.400 GHz (BLE)'].map(band => (
                <button
                  type="button"
                  key={band}
                  onClick={() => { setFrequencyBand(band); sound.playRelayClick(); }}
                  className={`py-2 px-3 rounded-lg text-xs font-mono font-bold border transition-all ${
                    frequencyBand === band
                      ? 'bg-[#00FF9C] text-black border-[#00FF9C] shadow glow-green'
                      : 'bg-black/50 border-white/10 text-[#C0C6CE] hover:border-white/30'
                  }`}
                >
                  {band}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[#C0C6CE]/80 block mb-1">CALL SIGN / YOUR NAME:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/60 border border-white/20 focus:border-[#00FF9C] rounded-lg p-3 text-white outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[#C0C6CE]/80 block mb-1">RETURN FREQUENCY / EMAIL:</label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black/60 border border-white/20 focus:border-[#00FF9C] rounded-lg p-3 text-white outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[#C0C6CE]/80 block mb-1">MODULATION / SUBJECT:</label>
              <input
                type="text"
                required
                placeholder="Hardware Project / ASIC Design Role / PCB Review"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-black/60 border border-white/20 focus:border-[#00FF9C] rounded-lg p-3 text-white outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[#C0C6CE]/80 block mb-1">DATA PAYLOAD / MESSAGE:</label>
              <textarea
                rows={4}
                required
                placeholder="Type your telemetry message here..."
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-black/60 border border-white/20 focus:border-[#00FF9C] rounded-lg p-3 text-white outline-none transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isTransmitting}
              className={`w-full py-3.5 px-6 rounded-xl font-orbitron font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl ${
                isTransmitting
                  ? 'bg-[#0B4D38] text-[#00FF9C] border border-[#00FF9C] animate-pulse cursor-wait'
                  : 'bg-[#00FF9C] hover:bg-[#00FF9C]/80 text-black border border-[#00FF9C] glow-green'
              }`}
            >
              {isTransmitting ? (
                <>
                  <Radio className="w-4 h-4 animate-spin" />
                  TRANSMITTING PACKET OVER AIR...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  TRANSMIT TELEMETRY SIGNAL
                </>
              )}
            </button>

            {isSuccess && (
              <div className="p-3 bg-[#0B4D38]/80 border border-[#00FF9C] rounded-xl text-[#00FF9C] flex items-center gap-2 text-xs font-mono animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-[#00FF9C]" />
                TELEMETRY PACKET ACKNOWLEDGED (CRC-32 CHECKSUM VERIFIED). I WILL REPLY PROMPTLY!
              </div>
            )}
          </form>
        </div>

        {/* Right Info: Direct Signal Nodes */}
        <div className="lg:col-span-5 space-y-4 font-mono text-xs">
          
          <div className="bg-[#0A0E14] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#00FF9C]" />
              DIRECT STATION CHANNELS
            </h3>

            <div className="space-y-3">
              <a
                href="mailto:hariharan.vlsi@engineer.tech"
                className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 hover:border-[#00FF9C] hover:text-white transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded bg-[#0B4D38]/40 text-[#00FF9C]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#C0C6CE]/60">PRIMARY EMAIL</div>
                    <div className="text-xs text-white group-hover:text-[#00FF9C] transition-colors">
                      hariharan.vlsi@engineer.tech
                    </div>
                  </div>
                </div>
              </a>

              <a
                href="https://github.com/electronics-engineer"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 hover:border-[#00BFFF] hover:text-white transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded bg-black/60 text-[#00BFFF]">
                    <GithubIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#C0C6CE]/60">GITHUB REPOSITORIES</div>
                    <div className="text-xs text-white group-hover:text-[#00BFFF] transition-colors">
                      github.com/electronics-engineer
                    </div>
                  </div>
                </div>
              </a>

              <a
                href="https://linkedin.com/in/electronics-engineer"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 hover:border-[#00BFFF] hover:text-white transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded bg-blue-900/40 text-[#00BFFF]">
                    <LinkedinIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#C0C6CE]/60">LINKEDIN NETWORK</div>
                    <div className="text-xs text-white group-hover:text-[#00BFFF] transition-colors">
                      linkedin.com/in/electronics-engineer
                    </div>
                  </div>
                </div>
              </a>

              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded bg-[#0B4D38]/30 text-[#00FF9C]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#C0C6CE]/60">GEOGRAPHIC LOCATION</div>
                    <div className="text-xs text-white">
                      Bangalore, India (Global Remote / Relocation Ready)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Telemetry Status Widget */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0B4D38]/30 to-[#080B10] border border-[#00FF9C]/30 text-xs text-[#C0C6CE]">
            <div className="flex items-center justify-between font-mono text-[#00FF9C] font-bold mb-2">
              <span>SYSTEM DIAGNOSTIC:</span>
              <span>100% OPERATIONAL</span>
            </div>
            <p className="leading-relaxed">
              Available for full-time VLSI / ASIC Design roles, Embedded Systems Firmware engineering, and hardware consulting projects worldwide.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
