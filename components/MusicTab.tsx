
import React, { useState, useRef, useEffect } from 'react';

interface Track {
  id: number;
  title: string;
  artist: { name: string };
  album: { 
    title: string;
    cover_xl: string;
    cover_medium: string;
  };
  preview: string;
}

export const MusicTab: React.FC = () => {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initial load with some trending music
  useEffect(() => {
    searchMusic('Trending 2024');
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const searchMusic = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Using Deezer API (via a CORS proxy if necessary, but direct often works for search)
      const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://api.deezer.com/search?q=${q}&limit=50`)}`);
      const data = await res.json();
      
      if (data.data && data.data.length > 0) {
        setTracks(data.data);
        if (!currentTrack) setCurrentTrack(data.data[0]);
      } else {
        setTracks([]);
        setError('No songs found.');
      }
    } catch (e) {
      setError('Search failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const selectTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (currentTrack && isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrack]);

  const nextTrack = () => {
    const idx = tracks.findIndex(t => t.id === currentTrack?.id);
    if (idx !== -1 && idx < tracks.length - 1) {
      selectTrack(tracks[idx + 1]);
    } else if (tracks.length > 0) {
      selectTrack(tracks[0]);
    }
  };

  const prevTrack = () => {
    const idx = tracks.findIndex(t => t.id === currentTrack?.id);
    if (idx > 0) {
      selectTrack(tracks[idx - 1]);
    } else if (tracks.length > 0) {
      selectTrack(tracks[tracks.length - 1]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] text-white overflow-hidden">
      
      {/* Top Navigation / Search */}
      <header className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl z-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center">
            <span className="font-black text-xl tracking-tighter uppercase italic">Eternity</span>
          </div>
          <div className="relative w-96 group">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchMusic(query)}
              placeholder="Search artists, songs, albums..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 px-12 text-xs outline-none focus:border-cyan-400/50 transition-all placeholder:text-white/20"
            />
            <svg className="absolute left-4 top-2.5 w-4 h-4 text-white/20 group-focus-within:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 animate-pulse">Hi-Fi Streaming</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Nav */}
        <aside className="w-64 border-r border-white/5 p-6 space-y-8 bg-black/20 hidden md:block">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Discovery</p>
            <nav className="space-y-1">
              {['Home', 'Explore', 'Videos', 'Eternity Rising'].map(item => (
                <button key={item} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all ${item === 'Home' ? 'text-white bg-white/5' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                  {item}
                </button>
              ))}
            </nav>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Library</p>
            <nav className="space-y-1">
              {['Playlists', 'Albums', 'Artists', 'Tracks'].map(item => (
                <button key={item} className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all">
                  {item}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Tracks List */}
        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide bg-gradient-to-b from-cyan-900/10 to-transparent">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
              <div className="text-4xl mb-4">🔇</div>
              <p className="text-sm font-bold uppercase tracking-widest">{error}</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="flex items-end gap-8 mb-12">
                <div className="w-56 h-56 rounded-xl shadow-2xl overflow-hidden group relative">
                   {currentTrack && <img src={currentTrack.album.cover_xl} className="w-full h-full object-cover" alt="" />}
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={togglePlay} className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                        {isPlaying ? <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
                      </button>
                   </div>
                </div>
                <div className="flex-1 space-y-4 pb-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-cyan-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">Master</span>
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Playlist</span>
                  </div>
                  <h1 className="text-6xl font-black tracking-tighter leading-none truncate w-[90%]">
                    {currentTrack?.title || "Pick a track"}
                  </h1>
                  <p className="text-lg font-bold text-white/60">
                    {currentTrack?.artist.name || "Eternity Music"}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/20 border-b border-white/5">
                   <div className="w-8">#</div>
                   <div>Track</div>
                   <div>Album</div>
                   <div className="w-12 text-right">Bitrate</div>
                </div>
                {tracks.map((track, i) => (
                  <button 
                    key={track.id}
                    onClick={() => selectTrack(track)}
                    className={`w-full grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center px-4 py-3 rounded-xl transition-all group ${currentTrack?.id === track.id ? 'bg-cyan-400/10' : 'hover:bg-white/5'}`}
                  >
                    <div className="w-8 text-[11px] font-bold text-white/20 group-hover:text-cyan-400 transition-colors">
                      {currentTrack?.id === track.id && isPlaying ? (
                        <div className="flex gap-0.5 items-end h-3 w-3">
                          <div className="w-0.5 bg-cyan-400 animate-[bounce_0.5s_infinite]" />
                          <div className="w-0.5 bg-cyan-400 animate-[bounce_0.7s_infinite]" />
                          <div className="w-0.5 bg-cyan-400 animate-[bounce_0.6s_infinite]" />
                        </div>
                      ) : i + 1}
                    </div>
                    <div className="flex items-center gap-4 text-left">
                       <img src={track.album.cover_medium} className="w-10 h-10 rounded-lg shadow-lg" alt="" />
                       <div className="truncate">
                          <div className={`text-sm font-bold truncate ${currentTrack?.id === track.id ? 'text-cyan-400' : 'text-white'}`}>{track.title}</div>
                          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">{track.artist.name}</div>
                       </div>
                    </div>
                    <div className="text-left truncate text-xs font-bold text-white/30">{track.album.title}</div>
                    <div className="text-right text-[10px] font-black text-cyan-400/40 uppercase tracking-tighter">High Res</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Playback Bar */}
      <footer className="h-24 bg-black border-t border-white/5 px-6 flex items-center justify-between relative z-30">
        <div className="flex items-center gap-4 w-72">
          <div className="w-14 h-14 rounded-lg bg-white/5 overflow-hidden shadow-2xl flex-shrink-0">
             {currentTrack && <img src={currentTrack.album.cover_medium} className="w-full h-full object-cover" alt="" />}
          </div>
          <div className="truncate">
            <div className="text-sm font-black tracking-tight truncate">{currentTrack?.title || "Not Playing"}</div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">{currentTrack?.artist.name || "Select Track"}</div>
          </div>
          <button className="text-white/20 hover:text-white transition-colors ml-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 flex-1 max-w-2xl px-12">
          <div className="flex items-center gap-8">
            <button className="text-white/20 hover:text-white transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg></button>
            <button onClick={prevTrack} className="text-white/40 hover:text-white transition-all"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
            <button onClick={togglePlay} className="w-11 h-11 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl">
               {isPlaying ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
            </button>
            <button onClick={nextTrack} className="text-white/40 hover:text-white transition-all"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
            <button className="text-white/20 hover:text-white transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg></button>
          </div>
          <div className="w-full flex items-center gap-3">
            <span className="text-[9px] font-bold text-white/20 font-mono">0:00</span>
            <div className="flex-1 h-1 bg-white/10 rounded-full relative overflow-hidden group">
               <div className="absolute top-0 bottom-0 left-0 bg-white group-hover:bg-cyan-400 transition-colors w-0" />
            </div>
            <span className="text-[9px] font-bold text-white/20 font-mono">0:30</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-6 w-72">
           <div className="flex items-center gap-3 group w-32">
              <svg className="w-4 h-4 text-white/20 group-hover:text-cyan-400 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              <input 
                type="range" 
                min="0" max="1" step="0.01" 
                value={volume} 
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-white/10 rounded-full appearance-none accent-white cursor-pointer hover:accent-cyan-400 transition-all"
              />
           </div>
           <button className="p-2 text-white/20 hover:text-white transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg></button>
        </div>
      </footer>

      <audio 
        ref={audioRef}
        src={currentTrack?.preview}
        onEnded={nextTrack}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

    </div>
  );
};
