import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import { GithubIcon } from './SocialIcons';
import { 
  GitBranch, Star, GitFork, Search, RefreshCw, 
  ExternalLink, Code2, AlertCircle, Check, Copy, Terminal, User
} from 'lucide-react';

interface RepoData {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  default_branch: string;
  topics: string[];
  clone_url: string;
}

interface UserProfile {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  html_url: string;
}

interface GitHubRepositoriesProps {
  initialUsername?: string;
}

export const GitHubRepositories: React.FC<GitHubRepositoriesProps> = ({ initialUsername = 'hariharan-k' }) => {
  const [username, setUsername] = useState(initialUsername);
  const [inputUsername, setInputUsername] = useState(initialUsername);
  const [repos, setRepos] = useState<RepoData[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [copiedClone, setCopiedClone] = useState<string | null>(null);

  // Language color mappings matching standard GitHub hexes
  const langColors: Record<string, string> = {
    'Verilog': '#00FF9C',
    'SystemVerilog': '#00BFFF',
    'C': '#555555',
    'C++': '#f34b7d',
    'Python': '#3572A5',
    'Arduino': '#bd79d1',
    'Assembly': '#6E4C13',
    'HTML': '#e34c26',
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'VHDL': '#498bfe'
  };

  const fetchGitHubData = async (userToFetch: string) => {
    if (!userToFetch.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch User Info
      const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(userToFetch)}`);
      if (!userRes.ok) {
        if (userRes.status === 404) {
          throw new Error(`GitHub user "${userToFetch}" not found. Please verify your exact username.`);
        } else if (userRes.status === 403) {
          throw new Error('GitHub API rate limit reached. Please wait a moment or try again later.');
        } else {
          throw new Error(`Failed to load GitHub user data (Status ${userRes.status}).`);
        }
      }
      const userData: UserProfile = await userRes.json();
      setUserProfile(userData);

      // 2. Fetch Public Repositories
      const repoRes = await fetch(`https://api.github.com/users/${encodeURIComponent(userToFetch)}/repos?sort=updated&per_page=100`);
      if (!repoRes.ok) {
        throw new Error(`Failed to fetch repositories for ${userToFetch}.`);
      }
      const repoData: RepoData[] = await repoRes.json();
      setRepos(repoData);
      setUsername(userToFetch);
    } catch (err: any) {
      setError(err.message || 'An error occurred fetching GitHub repositories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGitHubData(username);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playRelayClick();
    fetchGitHubData(inputUsername.trim());
  };

  const handleCopyClone = (cloneUrl: string) => {
    navigator.clipboard.writeText(`git clone ${cloneUrl}`);
    sound.playBeep(1100, 'sine', 0.08);
    setCopiedClone(cloneUrl);
    setTimeout(() => setCopiedClone(null), 2000);
  };

  // Extract all unique languages from repos
  const availableLanguages = ['ALL', ...Array.from(new Set(repos.map(r => r.language).filter(Boolean) as string[]))];

  // Filter repositories based on search and language
  const filteredRepos = repos.filter(repo => {
    const matchesSearch = 
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLang = selectedLanguage === 'ALL' || repo.language === selectedLanguage;
    return matchesSearch && matchesLang;
  });

  return (
    <section id="github" className="py-16 relative">
      {/* Header Accent */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-[2px] bg-[#00FF9C]" />
        <span className="text-xs font-mono font-bold text-[#00FF9C] tracking-widest uppercase">
          LIVE TELEMETRY // GITHUB REPOSITORY SYNC
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white font-orbitron tracking-tight flex items-center gap-3">
            <GithubIcon className="w-8 h-8 text-[#00FF9C]" />
            LIVE GITHUB REPOSITORIES
          </h2>
          <p className="text-sm text-[#C0C6CE] font-mono mt-1 max-w-2xl">
            Real-time public code repositories, embedded firmware, and hardware designs synchronized directly via GitHub REST API.
          </p>
        </div>

        {/* Sync Input Form to switch or connect any GitHub username */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <User className="w-3.5 h-3.5 text-[#00FF9C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Enter GitHub username"
              value={inputUsername}
              onChange={e => setInputUsername(e.target.value)}
              className="bg-black/60 border border-white/20 focus:border-[#00FF9C] rounded-lg pl-8 pr-3 py-2 text-xs font-mono text-white outline-none w-56 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-3.5 py-2 rounded-lg bg-[#0B4D38] hover:bg-[#0B4D38]/80 text-[#00FF9C] border border-[#00FF9C]/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all glow-green"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            SYNC REPOS
          </button>
        </form>
      </div>

      {/* Profile Header Card (if loaded) */}
      {userProfile && (
        <div className="bg-[#0A0E14] border border-white/10 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={userProfile.avatar_url}
              alt={userProfile.login}
              className="w-14 h-14 rounded-full border-2 border-[#00FF9C] shadow-lg"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-white font-rajdhani">
                  {userProfile.name || userProfile.login}
                </span>
                <span className="text-xs font-mono text-[#00BFFF]">
                  @{userProfile.login}
                </span>
              </div>
              {userProfile.bio && (
                <p className="text-xs text-[#C0C6CE] font-mono mt-0.5 max-w-xl">
                  {userProfile.bio}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono text-[#C0C6CE]">
            <div className="text-center px-3 py-1 rounded bg-black/40 border border-white/5">
              <span className="text-white font-bold block text-sm">{userProfile.public_repos}</span>
              <span className="text-[10px] text-[#C0C6CE]/60">REPOSITORIES</span>
            </div>
            <div className="text-center px-3 py-1 rounded bg-black/40 border border-white/5">
              <span className="text-white font-bold block text-sm">{userProfile.followers}</span>
              <span className="text-[10px] text-[#C0C6CE]/60">FOLLOWERS</span>
            </div>
            <a
              href={userProfile.html_url}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-lg bg-[#00FF9C] hover:bg-[#00FF9C]/80 text-black font-bold flex items-center gap-1 transition-all glow-green"
              title="Open GitHub Profile"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-red-950/30 border border-red-500/40 rounded-xl text-red-300 flex items-start gap-3 font-mono text-xs mb-8 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <div className="font-bold">GITHUB SYNC NOTIFICATION:</div>
            <div>{error}</div>
            <div className="text-[11px] text-[#C0C6CE]">
              Tip: Type your exact public GitHub username in the box above (e.g. your username from <code className="text-[#00FF9C]">github.com/YourUsername</code>) and click "SYNC REPOS".
            </div>
          </div>
        </div>
      )}

      {/* Search Bar & Language Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#C0C6CE]/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search repositories by name or topic..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-white/10 focus:border-[#00FF9C] rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white outline-none transition-colors"
          />
        </div>

        {/* Language Filter Tags */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto w-full sm:w-auto">
          {availableLanguages.map(lang => (
            <button
              key={lang}
              onClick={() => { setSelectedLanguage(lang); sound.playRelayClick(); }}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                selectedLanguage === lang
                  ? 'bg-[#00FF9C] text-black shadow glow-green'
                  : 'bg-black/40 border border-white/10 text-[#C0C6CE] hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Repositories Grid */}
      {loading ? (
        <div className="p-12 text-center font-mono text-xs text-[#00FF9C] flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#00FF9C]" />
          <span>QUERYING GITHUB API & FETCHING REAL HARDWARE REPOSITORIES...</span>
        </div>
      ) : filteredRepos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepos.map(repo => (
            <div
              key={repo.id}
              className="bg-[#0A0D14] border-2 border-[#1E293B] hover:border-[#00FF9C] rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:glow-green flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                  <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-[#00BFFF] truncate max-w-[210px]">
                    <GitBranch className="w-3.5 h-3.5 text-[#00FF9C] flex-shrink-0" />
                    <span className="truncate">{repo.name}</span>
                  </div>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded hover:bg-white/10 text-[#C0C6CE] hover:text-[#00FF9C] transition-colors"
                    title="View repository on GitHub"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <p className="text-xs text-[#C0C6CE] leading-relaxed line-clamp-3 mb-4">
                  {repo.description || 'No description provided for this hardware repository.'}
                </p>

                {/* Topics */}
                {repo.topics && repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {repo.topics.slice(0, 3).map((topic, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0B4D38]/30 text-[#00FF9C] border border-[#00FF9C]/20"
                      >
                        #{topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Meta Bar: Language, Stars, Forks, Clone */}
              <div className="pt-3 border-t border-white/10 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  {repo.language ? (
                    <div className="flex items-center space-x-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: langColors[repo.language] || '#00FF9C' }}
                      />
                      <span className="text-white text-[11px]">{repo.language}</span>
                    </div>
                  ) : (
                    <span className="text-[#C0C6CE]/50 text-[11px]">Hardware</span>
                  )}

                  <div className="flex items-center space-x-3 text-[#C0C6CE]/80 text-[11px]">
                    <span className="flex items-center gap-1" title="Stars">
                      <Star className="w-3 h-3 text-amber-400" /> {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1" title="Forks">
                      <GitFork className="w-3 h-3 text-[#00BFFF]" /> {repo.forks_count}
                    </span>
                  </div>
                </div>

                {/* Quick Clone Button */}
                <button
                  onClick={() => handleCopyClone(repo.clone_url)}
                  className="w-full py-1.5 px-2 rounded bg-black/50 hover:bg-black border border-white/10 hover:border-[#00FF9C]/40 text-[10px] text-[#C0C6CE] hover:text-[#00FF9C] flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-1 truncate font-mono">
                    <Terminal className="w-3 h-3" />
                    git clone {repo.name}.git
                  </span>
                  {copiedClone === repo.clone_url ? (
                    <span className="text-[#00FF9C] flex items-center gap-0.5 font-bold">
                      <Check className="w-3 h-3" /> COPIED
                    </span>
                  ) : (
                    <Copy className="w-3 h-3 text-[#C0C6CE]/50" />
                  )}
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center font-mono text-xs text-[#C0C6CE]/60 bg-black/40 rounded-xl border border-white/10">
          No repositories found matching your query.
        </div>
      )}
    </section>
  );
};

