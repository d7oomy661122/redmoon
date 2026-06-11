import { useState } from 'react';
import Header from './components/Header';
import MatchList from './components/MatchList';
import ServerDialog from './components/ServerDialog';
import PlayerPage from './components/PlayerPage';
import { AnimatePresence } from 'motion/react';
import { Match, Stream } from './types';
import { useMatches } from './hooks/useMatches';

export default function App() {
  const { matches, loading, error } = useMatches();
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [view, setView] = useState<'home' | 'player'>('home');
  const [dialogMatch, setDialogMatch] = useState<Match | null>(null);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [activeStream, setActiveStream] = useState<Stream | null>(null);
  const [filter, setFilter] = useState('all');

  const [pageLoading, setPageLoading] = useState(false);

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
      <div className="fixed inset-0 bg-[#0a0e17] z-[200] flex flex-col items-center justify-center font-sans tracking-wide" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="relative mb-8 flex items-center justify-center">
            {/* Elegant, clean logo without scammy rings */}
            <img src="/logo.jpg" alt="Logo" className="w-24 h-24 object-cover rounded-full shadow-2xl animate-pulse" 
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="flex items-center gap-3 text-white font-bold text-lg opacity-90">
             <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
             {lang === 'ar' ? 'جاري التحضير...' : 'Preparing...'}
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
    <div className="min-h-[100dvh] font-sans flex flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Background Overlay for a modern aesthetic */}
      <div className="fixed inset-0 bg-black/5 pointer-events-none" />

      <Header liveCount={liveCount} lang={lang} toggleLang={() => setLang(l => l === 'en' ? 'ar' : 'en')} />
      
      {loading && matches.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 relative z-10">
           <div className="relative">
             <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
             <div className="w-8 h-8 rounded-full border-4 border-[#C77DFF]/30 border-t-[#C77DFF] animate-spin absolute top-4 left-4" style={{ animationDirection: 'reverse' }}></div>
           </div>
           <p className="text-white font-black tracking-wider animate-pulse drop-shadow-md text-lg">
             {lang === 'ar' ? 'جاري تحميل المباريات...' : 'Loading matches...'}
           </p>
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
            
            <MatchList 
              matches={matches} 
              selectedMatch={activeMatch?.id || dialogMatch?.id} 
              lang={lang}
              onSelect={handleMatchClick}
              filter={filter}
              setFilter={setFilter}
            />
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
