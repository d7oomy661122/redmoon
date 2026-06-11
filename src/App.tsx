import { useState, useEffect } from 'react';
import Header from './components/Header';
import MatchList from './components/MatchList';
import ServerDialog from './components/ServerDialog';
import PlayerPage from './components/PlayerPage';
import YoutubeDialog from './components/YoutubeDialog';
import { AnimatePresence } from 'motion/react';
import { Match, Stream } from './types';
import { useMatches } from './hooks/useMatches';
import AdUnit from './components/AdUnit';

export default function App() {
  const { matches, loading, error } = useMatches();
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [view, setView] = useState<'home' | 'player'>('home');
  const [dialogMatch, setDialogMatch] = useState<Match | null>(null);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [activeStream, setActiveStream] = useState<Stream | null>(null);
  
  const [filter, setFilter] = useState('all');

  const [pageLoading, setPageLoading] = useState(false);

  const handleFilterChange = (f: string) => {
    if (f === filter) return;
    setPageLoading(true);
    setTimeout(() => {
      setFilter(f);
      setPageLoading(false);
    }, 600);
  };

  const handleMatchClick = (match: Match) => {
    if (match.status === 'live') {
      setDialogMatch(match);
    }
  };

  const handleServerSelect = (stream: Stream) => {
    setDialogMatch(null);
    setPageLoading(true);
    
    // Simulate professional loading delay for connection setup
    setTimeout(() => {
      setActiveStream(stream);
      setActiveMatch(dialogMatch);
      setView('player');
      setPageLoading(false);
    }, 1500);
  };

  const handleBack = () => {
    setPageLoading(true);
    setTimeout(() => {
      setView('home');
      setActiveStream(null);
      setActiveMatch(null);
      setPageLoading(false);
    }, 1000);
  };

  if (pageLoading) {
    return (
      <div className="fixed inset-0 bg-[#06080d] z-[200] flex flex-col items-center justify-center font-sans tracking-wide" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="relative mb-10 flex items-center justify-center">
            {/* Pulsing glow background */}
            <div className="absolute inset-0 bg-[#e60000] rounded-full blur-[40px] opacity-20 animate-pulse"></div>
            <img src="https://i.ibb.co/MxsSzdwY/1781130888674-2.jpg" alt="Logo" className="w-28 h-28 object-cover rounded-full shadow-[0_0_40px_rgba(255,0,0,0.15)] relative z-10" 
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Professional broadcast loading ring */}
            <svg className="absolute -inset-6 w-[160px] h-[160px] animate-[spin_2s_linear_infinite] opacity-80" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <circle cx="50" cy="50" r="48" fill="none" stroke="#e60000" strokeWidth="2" strokeDasharray="60 200" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-2">
             <div className="flex items-center gap-2 text-white font-black text-xl tracking-widest uppercase shadow-black drop-shadow-md">
                {lang === 'ar' ? 'جاري التحضير' : 'Preparing System'}
                <span className="flex gap-1.5 ml-1 rtl:mr-1">
                  <span className="w-1.5 h-1.5 bg-[#e60000] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#e60000] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#e60000] rounded-full animate-bounce"></span>
                </span>
             </div>
             <p className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase">Matchora Broadcast Network</p>
          </div>
      </div>
    );
  }

  if (view === 'player' && activeMatch && activeStream) {
    return (
      <PlayerPage 
        match={activeMatch} 
        stream={activeStream}
        lang={lang}
        onBack={handleBack}
        onServerChange={setActiveStream}
      />
    );
  }

  const liveCount = matches.filter(m => m.status === 'live').length;

  return (
    <div className="min-h-[100dvh] font-sans flex flex-col relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Background Overlay for a modern aesthetic */}
      <div className="fixed inset-0 bg-black/5 pointer-events-none" />

      <YoutubeDialog lang={lang} />

      <Header liveCount={liveCount} lang={lang} toggleLang={() => setLang(l => l === 'en' ? 'ar' : 'en')} />
      
      {loading && matches.length === 0 ? (
        <div className="fixed inset-0 bg-[#06080d] z-[200] flex flex-col items-center justify-center font-sans tracking-wide">
          <div className="relative mb-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#e60000] rounded-full blur-[40px] opacity-20 animate-pulse"></div>
            <img src="https://i.ibb.co/MxsSzdwY/1781130888674-2.jpg" alt="Logo" className="w-28 h-28 object-cover rounded-full shadow-[0_0_40px_rgba(255,0,0,0.15)] relative z-10" />
            <svg className="absolute -inset-6 w-[160px] h-[160px] animate-[spin_2s_linear_infinite] opacity-80" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <circle cx="50" cy="50" r="48" fill="none" stroke="#e60000" strokeWidth="2" strokeDasharray="60 200" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-2">
             <div className="flex items-center gap-2 text-white font-black text-xl tracking-widest uppercase shadow-black drop-shadow-md">
                {lang === 'ar' ? 'جاري تحميل البيانات' : 'Loading Data'}
                <span className="flex gap-1.5 ml-1 rtl:mr-1">
                  <span className="w-1.5 h-1.5 bg-[#e60000] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#e60000] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#e60000] rounded-full animate-bounce"></span>
                </span>
             </div>
             <p className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase">Matchora Broadcast Network</p>
          </div>
        </div>
      ) : error && matches.length === 0 ? (
         <div className="flex-1 flex flex-col items-center justify-center relative z-10 text-white gap-3">
           <span className="text-5xl">⚠️</span>
           <p className="font-bold text-lg drop-shadow-md">
             {lang === 'ar' ? 'حدث خطأ في جلب البيانات' : 'Error fetching data'}
           </p>
         </div>
      ) : (
        <div className="flex-1 w-full flex justify-center max-w-[800px] mx-auto relative z-10">
          <main className="flex-1 w-full relative flex flex-col pt-4 mx-2 lg:mx-4 pb-4">
            
            {/* Top Ad Banner */}
            <div className="w-full flex justify-center mb-4 px-0 shrink-0">
               <AdUnit format="banner" size="320x50" className="!my-0 rounded-xl overflow-hidden shadow-sm" />
            </div>

            <MatchList 
              matches={matches} 
              selectedMatch={activeMatch?.id || dialogMatch?.id} 
              lang={lang}
              onSelect={handleMatchClick}
              filter={filter}
              setFilter={handleFilterChange}
            />

            {/* Bottom Ad Banner */}
            <div className="w-full flex-col items-center justify-center flex mt-6 px-0 pb-8 shrink-0 gap-4">
               <AdUnit format="banner" size="320x50" className="!my-0 rounded-xl overflow-hidden shadow-sm" />
               <AdUnit format="native_banner" className="!my-0 max-w-full overflow-hidden" />
            </div>
          </main>
        </div>
      )}

      <AnimatePresence>
        {dialogMatch && (
          <ServerDialog 
            match={dialogMatch} 
            lang={lang}
            onSelectStream={handleServerSelect}
            onClose={() => setDialogMatch(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
