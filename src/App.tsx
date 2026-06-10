import { useState } from 'react';
import Header from './components/Header';
import MatchList from './components/MatchList';
import ServerDialog from './components/ServerDialog';
import PlayerPage from './components/PlayerPage';
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
      <div className="fixed inset-0 bg-gradient-to-br from-[#1a1025] to-[#0f0f13] z-[200] flex flex-col items-center justify-center font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
         <div className="relative mb-10 flex items-center justify-center">
           <img src="/logo.jpg" alt="Logo" className="w-24 h-24 object-cover rounded-full shadow-[0_0_20px_rgba(157,78,221,0.6)] animate-pulse z-10 border-2 border-white/10" 
             onError={(e) => {
               e.currentTarget.onerror = null;
               e.currentTarget.style.display = 'none';
             }}
           />
           <div className="absolute -inset-6 border-4 border-transparent border-t-[#9D4EDD] border-b-[#C77DFF] rounded-full animate-spin" style={{ animationDuration: '1s' }}></div>
           <div className="absolute -inset-10 border-4 border-transparent border-r-[#6A0DAD] border-l-[#4B0082] rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
         </div>
         <h2 className="text-white font-black text-2xl tracking-widest text-center animate-pulse drop-shadow-md">
           {lang === 'ar' ? 'جاري الاتصال بالسيرفر...' : 'Connecting to server...'}
         </h2>
         <p className="text-[#a1a1aa] font-semibold mt-3 text-sm tracking-widest">
           {lang === 'ar' ? 'يرجى الانتظار، نتأكد من جودة البث' : 'Please wait, checking stream quality'}
         </p>
         
         <div className="mt-10 flex gap-2">
            <div className="w-2 h-2 rounded-full bg-[#C77DFF] animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 rounded-full bg-[#9D4EDD] animate-bounce" style={{ animationDelay: '0.15s' }}></div>
            <div className="w-2 h-2 rounded-full bg-[#6A0DAD] animate-bounce" style={{ animationDelay: '0.3s' }}></div>
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
        <div className="flex-1 w-full flex justify-center max-w-[1200px] mx-auto px-2 relative z-10">
          {/* Left Vertical Ad (Desktop Only) */}
          <div className="hidden lg:flex w-[160px] flex-col shrink-0 pt-4 px-2 h-full">
            <div className="sticky top-20">
              <AdUnit format="banner" size="160x600" className="!my-0 mb-4" />
            </div>
          </div>

          <main className="flex-1 w-full max-w-2xl relative flex flex-col mx-2 lg:mx-4 pb-4">
            {/* Top Banner Ad */}
            <div className="w-full flex justify-center mt-2 px-0 shrink-0">
               <div className="hidden md:block w-full">
                 <AdUnit format="banner" size="728x90" className="!my-0" />
               </div>
               <div className="block md:hidden w-full">
                 <AdUnit format="banner" size="320x50" className="!my-0" />
               </div>
            </div>
            
            <MatchList 
              matches={matches} 
              selectedMatch={activeMatch?.id || dialogMatch?.id} 
              lang={lang}
              onSelect={handleMatchClick}
              filter={filter}
              setFilter={setFilter}
            />

            {/* Bottom Native Banner Ad */}
            <div className="w-full flex justify-center mt-4 px-0 pb-4 shrink-0">
               <AdUnit format="native_banner" className="!my-0" />
            </div>
          </main>

          {/* Right Vertical Ad (Desktop Only) */}
          <div className="hidden lg:flex w-[160px] flex-col shrink-0 pt-4 px-2 h-full">
            <div className="sticky top-20">
              <AdUnit format="banner" size="160x600" className="!my-0 mb-4" />
            </div>
          </div>
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

      {/* Sticky bottom mobile ad */}
      {view === 'home' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-[#0a0e17]/90 backdrop-blur-md pt-1 pb-safe md:hidden border-t border-white/5">
          <AdUnit format="banner" size="320x50" className="!my-0" />
        </div>
      )}
    </div>
  );
}
