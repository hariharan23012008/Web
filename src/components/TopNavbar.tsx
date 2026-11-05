import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { sound } from '../utils/audio';
import { Sun, Moon, Eye } from 'lucide-react';

interface TopNavbarProps {
  onOpen3DPCB?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpen3DPCB }) => {
  const { theme, setTheme } = useTheme();

  const handleSetTheme = (mode: 'dark' | 'light') => {
    if (theme !== mode) {
      sound.playRelayClick();
      setTheme(mode);
    }
  };

  const isDark = theme === 'dark';

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-300 backdrop-blur-md border-b ${
        isDark
          ? 'bg-[#121316]/90 border-zinc-800 text-white'
          : 'bg-white/90 border-zinc-200 text-zinc-900 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        
        {/* Left: Navigation Links */}
        <nav className="flex items-center gap-4 sm:gap-6 text-xs font-semibold overflow-x-auto py-1">
          <a
            href="#about"
            className={`transition-colors whitespace-nowrap ${
              isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            About Me
          </a>
          <a
            href="#projects"
            className={`transition-colors whitespace-nowrap ${
              isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Featured Projects
          </a>
          <a
            href="#activities"
            className={`transition-colors whitespace-nowrap ${
              isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Activities
          </a>
          <a
            href="#curriculum-vitae"
            className={`transition-colors whitespace-nowrap ${
              isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Curriculum Vitae
          </a>
        </nav>

        {/* Right: 3D PCB Button & Theme Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {onOpen3DPCB && (
            <button
              onClick={() => {
                sound.playSignalPulse();
                onOpen3DPCB();
              }}
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:scale-105 active:scale-95 shadow-sm ${
                isDark
                  ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-900'
              }`}
              title="Return to 3D PCB Landing Board"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>3D PCB</span>
            </button>
          )}

          {/* Theme Selector: Black Mode & White Mode */}
          <div
            className={`flex items-center p-1 rounded-xl border transition-all ${
              isDark ? 'bg-zinc-900/90 border-zinc-700' : 'bg-zinc-100 border-zinc-300'
            }`}
            role="group"
            aria-label="Theme mode selector"
          >
            {/* White / Light Mode Button */}
            <button
              type="button"
              onClick={() => handleSetTheme('light')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                !isDark
                  ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Switch to White (Light) Mode"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">White Mode</span>
            </button>

            {/* Black / Dark Mode Button */}
            <button
              type="button"
              onClick={() => handleSetTheme('dark')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                isDark
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-600'
                  : 'text-zinc-500 hover:text-zinc-950'
              }`}
              title="Switch to Black (Dark) Mode"
            >
              <Moon className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Black Mode</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
