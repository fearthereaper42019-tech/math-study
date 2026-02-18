
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tab, Settings, DEFAULT_BACKGROUNDS, Backend, QuickApp } from './types';
import { RainEffect } from './components/RainEffect';
import { StarEffect } from './components/StarEffect';
import { GridEffect } from './components/GridEffect';
import { ProxyTab } from './components/ProxyTab';
import { AiTab } from './components/AiTab';
import { GameTab } from './components/GameTab';
import { SettingsTab } from './components/SettingsTab';
import { MusicTab } from './components/MusicTab';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('proxy');
  const [browserUrl, setBrowserUrl] = useState('');
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [currentProxyUrl, setCurrentProxyUrl] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('eternity_settings_v4');
    const defaultSettings: Settings = {
      background: DEFAULT_BACKGROUNDS[0].url,
      customBackground: null,
      activeEffect: 'none',
      rainSeed: Math.random(),
      glowIntensity: 1,
      brandColor: '#ffffff',
      panicKey: null,
      panicAction: 'redirect',
      cloakEnabled: false,
      cloakTitle: 'Dashboard',
      cloakIcon: 'https://www.google.com/favicon.ico',
      backend: Backend.ULTRAVIOLET,
      customApps: [],
      adblockEnabled: true
    };

    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('eternity_settings_v4', JSON.stringify(settings));
    const favicon = document.getElementById('favicon') as HTMLLinkElement;
    if (settings.cloakEnabled) {
      document.title = settings.cloakTitle;
      if (favicon) favicon.href = settings.cloakIcon;
    } else {
      document.title = 'Eternity - Proxy';
      if (favicon) favicon.href = 'https://picsum.photos/32/32';
    }
  }, [settings]);

  // Adblock Logic
  useEffect(() => {
    if (!settings.adblockEnabled || !isBrowsing || !iframeRef.current) return;

    const injectAdblock = () => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      
      try {
        const script = win.document.createElement('script');
        script.textContent = `
          (function() {
            const block = () => {
              const selectors = [
                '.adsbygoogle', 'ins.adsbygoogle', '[id^="google_ads_"]', 
                '#ad-container', '.ad-box', '.footer-ads', '.sidebar-ads',
                'iframe[src*="doubleclick.net"]', 'iframe[src*="adservice"]'
              ];
              selectors.forEach(s => {
                document.querySelectorAll(s).forEach(el => el.remove());
              });
            };
            setInterval(block, 1000);
            block();
          })();
        `;
        win.document.body.appendChild(script);
      } catch (e) {
        // Cross-origin might block this if UV hasn't fully wrapped the document yet
        console.debug("Adblock injection pending...");
      }
    };

    const interval = setInterval(injectAdblock, 2000);
    return () => clearInterval(interval);
  }, [settings.adblockEnabled, isBrowsing, currentProxyUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!settings.panicKey) return;
      if (e.key.toLowerCase() === settings.panicKey.toLowerCase()) {
        if (settings.panicAction === 'redirect') {
          window.location.href = 'https://clever.com';
        } else {
          window.close();
          window.location.href = 'about:blank';
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.panicKey, settings.panicAction]);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const addCustomApp = (app: QuickApp) => {
    updateSettings({ customApps: [...settings.customApps, app] });
  };

  const launchUrl = (url: string) => {
    if (!url) return;
    let finalUrl = url;
    if (!url.startsWith('http')) {
      if (url.includes('.') && !url.includes(' ')) {
        finalUrl = 'https://' + url;
      } else {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      }
    }

    // Try to open in AI Studio "Code Thingy" even if it might fail
    try {
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.openUrl === 'function') {
        // @ts-ignore
        window.aistudio.openUrl(finalUrl);
      }
    } catch (e) {
      console.warn("AI Studio OpenURL failed, falling back to proxy.");
    }

    // @ts-ignore
    if (window.Ultraviolet && window.__uv$config) {
      // @ts-ignore
      const encoded = window.__uv$config.prefix + window.__uv$config.encodeUrl(finalUrl);
      const absoluteProxyUrl = new URL(encoded, window.location.href).href;
      
      setCurrentProxyUrl(absoluteProxyUrl);
      setBrowserUrl(finalUrl);
      setIsBrowsing(true);
      setIsNavOpen(true);
    } else {
      alert("Proxy engine is still loading. Please wait a moment and try again.");
    }
  };

  const toggleEruda = () => {
    if (!iframeRef.current) return;
    const win = iframeRef.current.contentWindow;
    if (!win) return;
    
    // @ts-ignore
    if (win.eruda) {
      // @ts-ignore
      win.eruda.show();
      return;
    }

    const script = win.document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/eruda";
    win.document.body.appendChild(script);
    script.onload = () => {
      // @ts-ignore
      win.eruda.init();
      // @ts-ignore
      win.eruda.show();
    };
  };

  const getBackgroundStyles = () => {
    if (settings.customBackground) return { backgroundImage: `url(${settings.customBackground})` };
    if (settings.background === 'black') return { backgroundColor: '#000', backgroundImage: 'none' };
    return { backgroundImage: `url(${settings.background})` };
  };

  const glowStyle = {
    color: settings.brandColor,
    textShadow: `0 0 ${10 * settings.glowIntensity}px ${settings.brandColor}, 0 0 ${20 * settings.glowIntensity}px ${settings.brandColor}`
  };

  return (
    <div
      className="relative w-full h-full bg-cover bg-center transition-all duration-1000 overflow-hidden"
      style={getBackgroundStyles()}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-none z-[1]" />

      <RainEffect enabled={settings.activeEffect === 'rain'} seed={settings.rainSeed} />
      <StarEffect enabled={settings.activeEffect === 'stars'} />
      <GridEffect enabled={settings.activeEffect === 'grid'} />

      <div className="relative z-20 flex flex-col h-full text-white">
        {!isBrowsing && (
          <nav className="flex items-center justify-between px-8 py-4 backdrop-blur-md bg-black/10 border-b border-white/5">
            <h1 className="text-xl font-black uppercase tracking-tighter" style={glowStyle}>Eternity</h1>
            <div className="flex gap-2">
              {(['proxy', 'ai', 'music', 'games', 'settings'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-1.5 rounded-full font-bold text-xs transition-all ${
                    activeTab === tab
                      ? 'bg-white text-black shadow-lg shadow-white/20 scale-105'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </nav>
        )}

        <main className="flex-1 relative overflow-hidden">
          {isBrowsing ? (
            <iframe 
              ref={iframeRef}
              src={currentProxyUrl}
              className="w-full h-full border-none bg-white"
              title="Browser Content"
            />
          ) : (
            <>
              {activeTab === 'proxy' && <ProxyTab customApps={settings.customApps} onAddApp={addCustomApp} onLaunch={launchUrl} />}
              {activeTab === 'ai' && <AiTab />}
              {activeTab === 'music' && <MusicTab />}
              {activeTab === 'games' && <GameTab onLaunch={launchUrl} />}
              {activeTab === 'settings' && (
                <SettingsTab settings={settings} updateSettings={updateSettings} />
              )}
            </>
          )}
        </main>

        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${isNavOpen ? 'translate-y-0' : 'translate-y-[calc(100%-24px)]'}`}>
          <div className="flex justify-center">
            <button 
              onClick={() => setIsNavOpen(!isNavOpen)}
              className="bg-black/80 backdrop-blur-xl border border-white/10 border-b-0 px-6 py-1 rounded-t-xl hover:bg-black transition-all group shadow-2xl"
            >
              <svg 
                className={`w-4 h-4 transition-transform duration-300 ${isNavOpen ? 'rotate-180' : 'rotate-0'}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
          
          <div className="px-6 py-3 backdrop-blur-3xl bg-black/80 border-t border-white/10 flex items-center gap-4 h-16 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-1">
              <button 
                title="Back"
                onClick={() => iframeRef.current?.contentWindow?.history.back()} 
                className="p-2 hover:bg-white/10 rounded-lg opacity-60 hover:opacity-100 transition-all disabled:opacity-20"
                disabled={!isBrowsing}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button 
                title="Forward"
                onClick={() => iframeRef.current?.contentWindow?.history.forward()} 
                className="p-2 hover:bg-white/10 rounded-lg opacity-60 hover:opacity-100 transition-all disabled:opacity-20"
                disabled={!isBrowsing}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
              </button>
              <button 
                title="Home"
                onClick={() => { setIsBrowsing(false); setActiveTab('proxy'); }} 
                className="p-2 hover:bg-white/10 rounded-lg opacity-60 hover:opacity-100 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              </button>
              <button 
                title="Refresh"
                onClick={() => {
                  const win = iframeRef.current?.contentWindow;
                  if (win) win.location.reload();
                }}
                className="p-2 hover:bg-white/10 rounded-lg opacity-60 hover:opacity-100 transition-all disabled:opacity-20"
                disabled={!isBrowsing}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
              <button 
                title="Inspect Element (Eruda)"
                onClick={toggleEruda}
                disabled={!isBrowsing}
                className="p-2 hover:bg-white/10 rounded-lg opacity-60 hover:opacity-100 transition-all disabled:opacity-20 flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Search or enter URL..." 
                value={browserUrl}
                onChange={(e) => setBrowserUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && launchUrl(browserUrl)}
                className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-2 text-xs outline-none focus:border-white/30 transition-all placeholder:text-white/20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
