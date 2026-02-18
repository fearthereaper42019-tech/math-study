
import React, { useState, useEffect } from 'react';
import { QuickApp } from '../types';

const DEFAULT_APPS: QuickApp[] = [
  { name: 'YouTube', url: 'https://youtube.com', icon: 'https://www.youtube.com/favicon.ico' },
  { name: 'TikTok', url: 'https://tiktok.com', icon: 'https://www.tiktok.com/favicon.ico' },
  { 
    name: 'Discord', 
    url: 'https://discord.com', 
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABvUExURVdl8v///1Zl8lZk8VZk8e7w/fj4/ldk8lZk8VZk8lZk8VZl8ldk8lZk8VZk8aSr+LrA+WJu8rG3+GZy84SO9a20+MXK+ldk8pOc9ldk8d7h/HaB9Gt38+Tm/Fdl8Vdl8lZl8VUA9gBl/0dwTEdwTCQujVkAAAAldFJOU///J+z7///2zdQQCo6cXP//////////Mv+e/////56envv/AAADM8XgAAABK0lEQVQ4y4VT2baDIAwMKIoriktdansf+v/feMFE0VoP86BhHIHJAp8daVnIIAwDWZSpY2EL+CuGHfGbfwmyPIQTwjw7CngCFyTcCR4B/EDw2AT853ej4CjIErhBkq2CHG6RWwF3969r90Qv3AhGWjRqYn07DG3PJtUQ+feBlPLTCHaAIEWcQknaip1QEV1CgcEzOguiJ/IFSAw0+4JGXgIlab2BWLeJMKZkAZqc8ad6YWypcbsZjZJgsJQ5tmOsMxeyq4EEeERnqRagZ6wHaO2qoyOkMynU+qqUcEYl2azYBRXZLPcjop5ygUFHiaJUK8Mtc6u0Vu1svERqS/VWrEaLaSviJDTV4nUq917m5lRub8P4W87btP629w+Of/TsJuNxeEd+me678f8HQVYjIhOHP3oAAAAASUVORK5CYII=' 
  },
  { name: 'Twitter', url: 'https://twitter.com', icon: 'https://abs.twimg.com/favicons/twitter.ico' },
  { 
    name: 'PUBG', 
    url: 'https://now.gg/apps/pubg-mobile.html', 
    icon: 'https://tse3.mm.bing.net/th/id/OIP.DBuALb9Y4EzzMNRjF0HpgAHaHa?pid=Api&P=0&h=180' 
  },
  { 
    name: 'Roblox', 
    url: 'https://now.gg/apps/roblox-corporation/5349/roblox.html', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Roblox_player_icon_black.svg/1024px-Roblox_player_icon_black.svg.png' 
  },
  { 
    name: 'Movies', 
    url: 'https://nyafilmer.gg', 
    icon: 'https://tse2.mm.bing.net/th/id/OIP.vLbknJY4t8RwmnapmrvBRAAAAA?pid=Api&P=0&h=180' 
  },
  { name: 'GeForce Now', url: 'https://play.geforcenow.com', icon: 'https://play.geforcenow.com/favicon.ico' },
  { name: 'Xbox Cloud', url: 'https://www.xbox.com/play', icon: 'https://www.xbox.com/favicon.ico' },
];

const SEQUENCE = ["Browse Freely", "Freedom", "Unblocked", "Yours"];

interface ProxyTabProps {
  customApps: QuickApp[];
  onAddApp: (app: QuickApp) => void;
  onLaunch: (url: string) => void;
}

export const ProxyTab: React.FC<ProxyTabProps> = ({ customApps, onAddApp, onLaunch }) => {
  const [url, setUrl] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setSequenceIndex((prev) => (prev + 1) % SEQUENCE.length);
        setIsFading(false);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    onLaunch(url);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName || !newAppUrl) return;
    onAddApp({
      name: newAppName,
      url: newAppUrl,
      icon: `https://www.google.com/s2/favicons?sz=64&domain=${newAppUrl}`,
      isCustom: true
    });
    setNewAppName('');
    setNewAppUrl('');
    setShowAddModal(false);
  };

  const allApps = [...DEFAULT_APPS, ...customApps];

  return (
    <div className="h-full overflow-y-auto w-full scrollbar-hide">
      <div className="flex flex-col items-center min-h-full max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="w-full mb-10 pt-10">
          <h2 className={`text-3xl font-bold mb-6 transition-all duration-500 ease-in-out ${isFading ? 'opacity-0 scale-95' : 'opacity-90 scale-100'}`}>
            {SEQUENCE[sequenceIndex]}
          </h2>
          <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Search or enter URL..."
              className="w-full bg-black/40 backdrop-blur-md border border-white/20 rounded-full py-3 px-6 text-lg outline-none focus:ring-2 focus:ring-white/30 transition-all shadow-2xl"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 bg-white text-black px-6 rounded-full font-bold hover:bg-white/80 transition-colors text-sm"
            >
              Go
            </button>
          </form>
        </div>

        <div className="w-full mb-20">
          <div className="flex justify-between items-end mb-4 px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60">Favorites</h3>
            <button 
              onClick={() => setShowAddModal(true)}
              className="text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/10 transition-all font-bold"
            >
              + Add App
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {allApps.map((app) => (
              <button
                key={app.name + app.url}
                onClick={() => onLaunch(app.url)}
                className="flex flex-col items-center p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/10 hover:-translate-y-1 transition-all group"
              >
                <div className="w-10 h-10 mb-2 rounded-lg bg-black/20 flex items-center justify-center p-2 overflow-hidden">
                  <img src={app.icon} alt={app.name} className="w-full h-full object-contain" onError={(e) => (e.currentTarget.src = 'https://www.google.com/favicon.ico')} />
                </div>
                <span className="text-[10px] font-bold truncate w-full text-center">{app.name}</span>
              </button>
            ))}
          </div>
        </div>

        <footer className="mt-auto pb-8 opacity-30 text-[10px] uppercase tracking-[0.4em] pointer-events-none">
          made by ayden
        </footer>

        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-black border border-white/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h4 className="text-lg font-bold mb-4">Add Quick App</h4>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold opacity-50">App Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newAppName} 
                    onChange={(e) => setNewAppName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm outline-none"
                    placeholder="e.g. YouTube"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold opacity-50">App URL</label>
                  <input 
                    type="text" 
                    value={newAppUrl} 
                    onChange={(e) => setNewAppUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm outline-none"
                    placeholder="e.g. https://youtube.com"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2 rounded-lg bg-white text-black font-bold text-xs"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
