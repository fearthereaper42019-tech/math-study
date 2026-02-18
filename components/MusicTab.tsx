
import React, { useState, useRef, useEffect } from 'react';

interface YouTubeTrack {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
}

// More robust list of instances for search
const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.leptons.xyz',
  'https://pipedapi.moomoo.me',
  'https://pipedapi.rivo.org',
  'https://api.piped.victr.me'
];

export const MusicTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<YouTubeTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<YouTubeTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<'none' | 'pause' | 'rewind' | 'forward'>('none');
  const [volume, setVolume] = useState(100);
  const [isRepeat, setIsRepeat] = useState(false);

  const searchYouTube = async (query: string, instanceIdx = 0) => {
    if (!query.trim()) return;
    if (instanceIdx === 0) {
      setIsLoading(true);
      setError(null);
    }
    
    const instance = PIPED_INSTANCES[instanceIdx];
    try {
      const response = await fetch(`${instance}/search?q=${encodeURIComponent(query)}&filter=music_songs`);
      if (!response.ok) throw new Error('Failed');
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error('No results');
      }

      const formatted: YouTubeTrack[] = data.items.map((item: any) => ({
        id: item.url.split('v=')[1] || item.url.split('/').pop(),
        title: item.title,
        artist: item.uploaderName,
        thumbnail: item.thumbnail,
        duration: formatDuration(item.duration)
      }));
      
      setTracks(formatted);
      if (!currentTrack && formatted.length > 0) setCurrentTrack(formatted[0]);
      setIsLoading(false);
    } catch (err) {
      if (instanceIdx < PIPED_INSTANCES.length - 1) {
        // Try next instance
        searchYouTube(query, instanceIdx + 1);
      } else {
        setIsLoading(false);
        setError("Search failed. Try another word.");
      }
    }
  };

  const formatDuration = (sec: number) => {
    if (!sec) return "0:00";
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}:${s.toString().padStart(2, '0')}`;
  };

  const selectTrack = (track: YouTubeTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setActiveMenu('none');
  };

  const handleNext = () => {
    if (!currentTrack || tracks.length === 0) return;
    const idx = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIdx = (idx + 1) % tracks.length;
    selectTrack(tracks[nextIdx]);
  };

  const handlePrev = () => {
    if (!currentTrack || tracks.length === 0) return;
    const idx = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIdx = (idx - 1 + tracks.length) % tracks.length;
    selectTrack(tracks[prevIdx]);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  // Initial search
  useEffect(() => {
    searchYouTube('lofi hip hop');
  }, []);

  // Get proxied URL for the YouTube player
  const getProxiedPlayerUrl = () => {
    if (!currentTrack) return '';
    const rawUrl = `https://www.youtube.com/embed/${currentTrack.id}?autoplay=${isPlaying ? 1 : 0}&controls=0&disablekb=1&enablejsapi=1&fs=0&iv_load_policy=3&modestbranding=1&rel=0&showinfo=0&loop=${isRepeat ? 1 : 0}&playlist=${currentTrack.id}`;
    
    // @ts-ignore
    if (window.Ultraviolet && window.__uv$config) {
      // @ts-ignore
      return window.__uv$config.prefix + window.__uv$config.encodeUrl(rawUrl);
    }
    return rawUrl;
  };

  return (
    <div className="h-full flex bg-[#030303] text-white font-sans overflow-hidden p-6 gap-6 relative">
      
      {/* Search Sidebar */}
      <aside className="w-80 flex flex-col bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl z-30">
        <div className="p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Search Music</h3>
          <div className="relative group">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchYouTube(searchQuery)}
              placeholder="Find a song..."
              className="w-full bg-black/60 border border-white/5 rounded-2xl py-3.5 px-6 text-xs outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-white/10"
            />
            <button 
              onClick={() => searchYouTube(searchQuery)}
              className="absolute right-4 top-3 text-white/20 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-2 scrollbar-hide">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
              <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Searching...</span>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 px-6 text-center opacity-30">
               <span className="text-xs font-bold">{error}</span>
               <button onClick={() => searchYouTube(searchQuery || 'music')} className="text-[10px] underline">Try Again</button>
            </div>
          ) : tracks.length > 0 ? (
            tracks.map(track => (
              <button 
                key={track.id}
                onClick={() => selectTrack(track)}
                className={`w-full flex items-center gap-4 p-3.5 rounded-[1.5rem] transition-all group ${currentTrack?.id === track.id ? 'bg-white/10 border border-white/5 shadow-xl' : 'hover:bg-white/5 border border-transparent'}`}
              >
                <div className="relative w-12 h-12 flex-shrink-0">
                  <img src={track.thumbnail} className="w-full h-full rounded-xl shadow-lg object-cover" />
                  {currentTrack?.id === track.id && isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                      <div className="flex gap-0.5 items-end h-3">
                        <div className="w-0.5 bg-white animate-[bounce_0.5s_infinite]" />
                        <div className="w-0.5 bg-white animate-[bounce_0.7s_infinite]" />
                        <div className="w-0.5 bg-white animate-[bounce_0.6s_infinite]" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left truncate">
                  <div className={`text-[11px] font-bold truncate ${currentTrack?.id === track.id ? 'text-white' : 'text-white/80'}`}>{track.title}</div>
                  <div className="text-[9px] text-white/30 truncate uppercase tracking-tighter font-bold mt-0.5">{track.artist}</div>
                </div>
              </button>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-10">
              <span className="text-6xl mb-4">∞</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Music Player */}
      <main className="flex-1 flex flex-col items-center justify-center relative bg-gradient-to-br from-[#0a0a0a] to-[#000] rounded-[3rem] border border-white/5 shadow-inner overflow-hidden">
        
        {/* Background Blur */}
        {currentTrack && (
          <div 
            className="absolute inset-0 opacity-[0.05] blur-[150px] scale-150 transition-all duration-[5s] pointer-events-none"
            style={{ backgroundImage: `url(${currentTrack.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        )}

        <div className="relative z-10 flex flex-col items-center">
          {/* Main Album Box */}
          <div className="relative w-72 h-72 group">
            <div className={`w-full h-full rounded-[4rem] bg-neutral-900 overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,1)] border border-white/10 transition-all duration-1000 relative ${isPlaying ? 'scale-105' : 'scale-95 grayscale'}`}>
              <img 
                src={currentTrack?.thumbnail || 'https://picsum.photos/600/600?grayscale'} 
                className={`w-full h-full object-cover transition-all duration-[3s] ${isPlaying ? 'opacity-70 scale-110 rotate-1' : 'opacity-20 scale-100'}`}
              />
              
              {/* Menu Overlays */}
              {activeMenu === 'pause' && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-10 text-white/40">Music Paused</h4>
                  <div className="flex flex-col gap-3 w-full">
                    <button onClick={() => { togglePlay(); setActiveMenu('none'); }} className="w-full py-4 bg-white text-black rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Play Music</button>
                    <div className="flex flex-col gap-2 mt-2 px-2">
                       <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-white/30">
                          <span>Volume</span>
                          <span>{volume}%</span>
                       </div>
                       <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(parseInt(e.target.value))} className="w-full accent-white h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
                    </div>
                    <button onClick={() => setActiveMenu('none')} className="w-full py-3 bg-white/5 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-white/40 mt-4">Close Menu</button>
                  </div>
                </div>
              )}

              {activeMenu === 'rewind' && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl flex flex-col items-center justify-center p-8 animate-in slide-in-from-left duration-300">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-8 text-white/40">Back</h4>
                  <div className="flex flex-col gap-6 w-full text-center">
                    <button onClick={handlePrev} className="text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors text-white/60">Last Song</button>
                    <button onClick={() => { selectTrack(currentTrack!); setActiveMenu('none'); }} className="text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors text-white/60">Restart Song</button>
                    <div className="h-[1px] bg-white/10 my-1" />
                    <button onClick={() => setActiveMenu('none')} className="text-[10px] font-bold uppercase tracking-widest opacity-40">Go Back</button>
                  </div>
                </div>
              )}

              {activeMenu === 'forward' && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl flex flex-col items-center justify-center p-8 animate-in slide-in-from-right duration-300">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-8 text-white/40">Next</h4>
                  <div className="flex flex-col gap-6 w-full text-center">
                    <button onClick={handleNext} className="text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors text-white/60">Next Song</button>
                    <button onClick={() => { setIsRepeat(!isRepeat); setActiveMenu('none'); }} className={`text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors ${isRepeat ? 'text-indigo-400' : 'text-white/60'}`}>
                      Repeat: {isRepeat ? 'On' : 'Off'}
                    </button>
                    <div className="h-[1px] bg-white/10 my-1" />
                    <button onClick={() => setActiveMenu('none')} className="text-[10px] font-bold uppercase tracking-widest opacity-40">Go Back</button>
                  </div>
                </div>
              )}
            </div>

            {/* Back/Next Buttons */}
            <div className="absolute -left-16 top-1/2 -translate-y-1/2">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'rewind' ? 'none' : 'rewind')}
                className="w-12 h-12 rounded-[1.5rem] bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all group shadow-2xl"
              >
                <svg className="w-5 h-5 group-active:scale-90 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
              </button>
            </div>
            
            <div className="absolute -right-16 top-1/2 -translate-y-1/2">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'forward' ? 'none' : 'forward')}
                className="w-12 h-12 rounded-[1.5rem] bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all group shadow-2xl"
              >
                <svg className="w-5 h-5 group-active:scale-90 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
              </button>
            </div>

            {/* Play/Pause Button */}
            <button 
              onClick={() => {
                if (!isPlaying) togglePlay();
                else setActiveMenu(activeMenu === 'pause' ? 'none' : 'pause');
              }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 rounded-[2.5rem] bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-20"
            >
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                {isPlaying ? <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /> : <path d="M8 5v14l11-7z" />}
              </svg>
            </button>
          </div>

          <div className="text-center mt-16 w-96 px-4">
            <h2 className="text-2xl font-bold tracking-tighter mb-1.5 truncate leading-tight">{currentTrack?.title || "Pick a song..."}</h2>
            <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-white/20 truncate">{currentTrack?.artist || "YouTube"}</p>
          </div>

          {/* Simple Time Bar */}
          <div className="w-64 mt-8 flex items-center justify-between text-[10px] font-mono opacity-20">
             <span>0:00</span>
             <div className="flex-1 mx-4 h-0.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full bg-white transition-all duration-1000 ${isPlaying ? 'w-full' : 'w-0'}`} style={{ transitionDuration: '240s' }} />
             </div>
             <span>{currentTrack?.duration || "0:00"}</span>
          </div>
        </div>

        {/* PROXIED YouTube Player */}
        {currentTrack && (
          <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
            <iframe 
              src={getProxiedPlayerUrl()}
              allow="autoplay"
              title="YouTube Player"
            />
          </div>
        )}

      </main>

    </div>
  );
};
