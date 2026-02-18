
import React, { useRef, useState, useEffect } from 'react';
import { Settings, DEFAULT_BACKGROUNDS, Backend, CLOAK_PRESETS } from '../types';

interface SettingsTabProps {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ settings, updateSettings }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isBinding, setIsBinding] = useState(false);

  useEffect(() => {
    if (!isBinding) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;
      updateSettings({ panicKey: e.key.toLowerCase() });
      setIsBinding(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBinding, updateSettings]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings({ customBackground: reader.result as string, background: 'custom' });
      };
      reader.readAsDataURL(file);
    }
  };

  const Toggle = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-10 h-5 rounded-full transition-all relative ${active ? 'bg-white' : 'bg-white/20'}`}
    >
      <div className={`absolute top-0.5 bottom-0.5 w-4 rounded-full transition-all ${
        active ? 'right-0.5 bg-black' : 'left-0.5 bg-white'
      }`} />
    </button>
  );

  return (
    <div className="h-full overflow-y-auto px-6 pb-40 scrollbar-hide">
      <div className="max-w-4xl mx-auto space-y-12 py-12">
        
        {/* Background Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold border-l-4 border-white pl-3 uppercase tracking-wider">Background</h3>
            <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
               <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold opacity-50 uppercase">Rain</span>
                <Toggle active={settings.activeEffect === 'rain'} onClick={() => updateSettings({ activeEffect: settings.activeEffect === 'rain' ? 'none' : 'rain' })} />
              </div>
              <div className="w-[1px] h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold opacity-50 uppercase">Stars</span>
                <Toggle active={settings.activeEffect === 'stars'} onClick={() => updateSettings({ activeEffect: settings.activeEffect === 'stars' ? 'none' : 'stars' })} />
              </div>
              <div className="w-[1px] h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold opacity-50 uppercase">Grid</span>
                <Toggle active={settings.activeEffect === 'grid'} onClick={() => updateSettings({ activeEffect: settings.activeEffect === 'grid' ? 'none' : 'grid' })} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {DEFAULT_BACKGROUNDS.map((bg) => (
              <button
                key={bg.name}
                onClick={() => updateSettings({ background: bg.url, customBackground: null })}
                className={`group relative rounded-2xl overflow-hidden aspect-video border-2 transition-all ${
                  settings.background === bg.url && !settings.customBackground ? 'border-white scale-105 shadow-xl shadow-white/10' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-102'
                }`}
              >
                {bg.url === 'black' ? (
                  <div className="w-full h-full bg-black" />
                ) : (
                  <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 flex items-end p-3 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                  <span className="text-[10px] font-bold uppercase tracking-widest">{bg.name}</span>
                </div>
              </button>
            ))}
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-2xl overflow-hidden aspect-video border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 bg-white/5 hover:bg-white/10 transition-all ${
                settings.customBackground ? 'border-white' : ''
              }`}
            >
              {settings.customBackground ? (
                <img src={settings.customBackground} className="w-full h-full object-cover opacity-50" />
              ) : (
                <div className="text-xl opacity-30">+</div>
              )}
              <span className="absolute text-[10px] font-bold uppercase tracking-widest">Add Image</span>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </button>
          </div>
        </section>

        {/* Adblocker Section */}
        <section>
          <h3 className="text-lg font-bold mb-6 border-l-4 border-white pl-3 uppercase tracking-wider">Adblocker</h3>
          <div className="bg-black/40 backdrop-blur-md p-8 rounded-3xl border border-white/10 flex items-center justify-between shadow-2xl">
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-tighter">Enable Ad-Blocker</p>
              <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">Automatically removes ads from proxied pages</p>
            </div>
            <Toggle 
              active={settings.adblockEnabled} 
              onClick={() => updateSettings({ adblockEnabled: !settings.adblockEnabled })} 
            />
          </div>
        </section>

        {/* Accessibility */}
        <section>
          <h3 className="text-lg font-bold mb-6 border-l-4 border-white pl-3 uppercase tracking-wider">Accessibility</h3>
          <div className="grid md:grid-cols-2 gap-6 bg-black/40 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Glow Intensity</label>
                <span className="text-[10px] font-mono">{Math.round(settings.glowIntensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="2.5"
                step="0.05"
                value={settings.glowIntensity}
                onChange={(e) => updateSettings({ glowIntensity: parseFloat(e.target.value) })}
                className="w-full accent-white h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Brand Color</label>
              <div className="flex items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  {['#ffffff', '#3b82f6', '#10b981', '#f43f5e', '#a855f7', '#f59e0b'].map(c => (
                    <button
                      key={c}
                      onClick={() => updateSettings({ brandColor: c })}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        settings.brandColor === c ? 'border-white scale-125' : 'border-transparent opacity-40 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="w-[1px] h-6 bg-white/10" />
                <input 
                  type="color" 
                  value={settings.brandColor} 
                  onChange={(e) => updateSettings({ brandColor: e.target.value })}
                  className="w-8 h-8 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Backend Engine */}
        <section>
          <h3 className="text-lg font-bold mb-6 border-l-4 border-white pl-3 uppercase tracking-wider">Backend Engine</h3>
          <div className="bg-black/40 backdrop-blur-md p-8 rounded-3xl border border-white/10 flex flex-wrap gap-3">
            {Object.values(Backend).map((b) => (
              <button
                key={b}
                onClick={() => updateSettings({ backend: b })}
                className={`flex-1 min-w-[120px] py-4 rounded-2xl border transition-all text-center ${
                  settings.backend === b ? 'bg-white text-black font-bold border-white' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="text-xs uppercase tracking-widest">{b}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Settings Group: Cloaking & Panic */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Tab Cloaking */}
          <section>
            <h3 className="text-lg font-bold mb-6 border-l-4 border-white pl-3 uppercase tracking-wider">Tab Cloaking</h3>
            <div className="bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase opacity-60">Enable Hiding</p>
                <Toggle active={settings.cloakEnabled} onClick={() => updateSettings({ cloakEnabled: !settings.cloakEnabled })} />
              </div>

              {settings.cloakEnabled && (
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5">
                  {CLOAK_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => updateSettings({ cloakTitle: preset.title, cloakIcon: preset.icon })}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        settings.cloakTitle === preset.title ? 'bg-white text-black border-white' : 'bg-white/5 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <img src={preset.icon} alt="" className="w-4 h-4 rounded-sm" />
                      <span className="text-[10px] font-bold truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Panic Key */}
          <section>
            <h3 className="text-lg font-bold mb-6 border-l-4 border-white pl-3 uppercase tracking-wider">Panic Key</h3>
            <div className="bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase opacity-60">Set Key</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-4 py-2 rounded-xl font-mono text-sm border min-w-[3rem] text-center ${
                    isBinding ? 'border-white animate-pulse bg-white/20' : 'border-white/10 bg-white/5'
                  }`}>
                    {isBinding ? '...' : (settings.panicKey ? settings.panicKey.toUpperCase() : 'OFF')}
                  </div>
                  <button
                    onClick={() => setIsBinding(true)}
                    className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-bold transition-all uppercase hover:bg-white/80"
                  >
                    Bind
                  </button>
                  {settings.panicKey && (
                    <button
                      onClick={() => updateSettings({ panicKey: null })}
                      className="text-red-400 hover:text-red-300 px-2 py-2 rounded-xl text-[10px] font-bold transition-all uppercase"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="space-y-1">
                   <p className="text-xs font-bold uppercase opacity-60">Action</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl">
                  <button 
                    onClick={() => updateSettings({ panicAction: 'redirect' })}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${settings.panicAction === 'redirect' ? 'bg-white text-black shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                  >
                    CLEVER
                  </button>
                  <button 
                    onClick={() => updateSettings({ panicAction: 'close' })}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${settings.panicAction === 'close' ? 'bg-white text-black shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
