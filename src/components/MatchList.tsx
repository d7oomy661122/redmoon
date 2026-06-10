import { Match } from '../types';
import { format, parseISO } from 'date-fns';
import { cn } from '../lib/utils';
import { Trophy, Calendar } from 'lucide-react';
import TeamLogo from './TeamLogo';
import { Fragment } from 'react';
import AdUnit from './AdUnit';

function MatchCard({ key, match, isSelected, onClick, lang }: { key?: string | number; match: Match; isSelected: boolean; onClick: () => void; lang: string }) {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  let statusText = lang === 'ar' ? 'لم تبدأ' : 'Not Started';
  if (match.date && !isLive && !isFinished) {
    try {
       statusText = format(parseISO(match.date), 'HH:mm');
    } catch(e) {}
  }
  if (isLive) statusText = (lang === 'ar' ? '🔴 مباشر ' : '🔴 LIVE ') + (match.matchTime || '');
  if (isFinished) statusText = lang === 'ar' ? 'انتهت المباراة' : 'Finished';

  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-[#FAFAFA] shadow-[0_8px_24px_rgba(0,0,0,0.12)] rounded-[20px] p-5 cursor-pointer relative overflow-hidden mb-5 shrink-0 transition-transform duration-200",
        "border-2",
        isSelected ? "border-[#6A0DAD] scale-[1.02]" : "border-[#9D4EDD] hover:scale-[1.02]"
      )}
    >
      <div className="flex items-start justify-between relative z-10 w-full pt-1">
        {/* Home Team (Right Side in RTL) */}
        <div className="flex flex-col items-center gap-2 w-1/3">
          <TeamLogo 
            teamId={match.homeTeam.id} 
            teamName={match.homeTeam.name} 
            initialUrl={match.crestHome} 
            className="w-[60px] h-[60px] object-contain drop-shadow-sm" 
          />
          <span className="text-[14px] font-black text-gray-900 text-center line-clamp-2 leading-tight">
            {match.homeTeam.name}
          </span>
        </div>

        {/* Center Info */}
        <div className="flex flex-col items-center justify-start flex-1 mt-1">
           <div className={cn(
             "px-4 py-1.5 rounded-full shadow-sm text-[12px] font-bold tracking-wide text-center max-w-full truncate",
             isLive ? "bg-red-50 text-red-600 border border-red-100" : "bg-gray-200 text-gray-700"
           )}>
             {statusText}
           </div>
           
           {(isLive || isFinished) ? (
              <div className="text-3xl font-black text-[#4B0082] mt-3 mb-1 flex items-center justify-center gap-3 w-full">
                <span>{match.homeTeam.score}</span>
                <span className="text-[#9D4EDD] text-2xl">-</span>
                <span>{match.awayTeam.score}</span>
              </div>
           ) : (
              <div className="text-2xl font-black text-gray-300 mt-4 mb-2 flex items-center justify-center w-full">
                VS
              </div>
           )}

           <div className="flex items-center gap-1.5 text-gray-500 mt-2">
             <Trophy className="w-3.5 h-3.5 text-[#9D4EDD]" />
             <span className="text-[11px] font-bold text-gray-600 text-center line-clamp-1">{match.competition || (lang === 'ar' ? 'مباراة ودية' : 'Friendly')}</span>
           </div>
        </div>

        {/* Away Team (Left Side in RTL) */}
        <div className="flex flex-col items-center gap-2 w-1/3">
          <TeamLogo 
            teamId={match.awayTeam.id} 
            teamName={match.awayTeam.name} 
            initialUrl={match.crestAway} 
            className="w-[60px] h-[60px] object-contain drop-shadow-sm" 
          />
          <span className="text-[14px] font-black text-gray-900 text-center line-clamp-2 leading-tight">
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-5 pt-3 flex items-center justify-center px-2 w-full border-t border-gray-200">
         {match.date && (
           <div className="flex items-center gap-2 text-gray-500">
             <Calendar className="w-4 h-4 text-[#9D4EDD]" />
             <span className="text-[12px] font-bold" dir="ltr">
               {format(parseISO(match.date), 'dd/MM/yyyy')}
             </span>
             <span className="text-[11px] font-medium text-gray-400 mr-2 rtl:border-r ltr:border-l border-gray-300 rtl:pr-2 ltr:pl-2">
                {lang === 'ar' ? '(بالتوقيت المحلي)' : '(Local Time)'}
             </span>
           </div>
         )}
      </div>
    </div>
  );
}

export default function MatchList({ 
  matches, 
  selectedMatch,
  lang,
  onSelect,
  filter,
  setFilter 
}: { 
  matches: Match[], 
  selectedMatch?: string,
  lang: string,
  onSelect: (match: Match) => void,
  filter: string,
  setFilter: (f: string) => void
}) {
  
  const filteredMatches = matches.filter(m => {
    if (filter === 'live') return m.status === 'live';
    if (filter === 'upcoming') return m.status === 'upcoming';
    if (filter === 'finished') return m.status === 'finished';
    return true;
  });

  return (
    <div className="w-full flex flex-col h-full pt-4 px-4 pb-20">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 shrink-0 bg-black/20 p-1.5 rounded-full backdrop-blur-md border border-white/10">
        {['all', 'live', 'upcoming', 'finished'].map((f) => {
           let tabLabel = f;
           if (lang === 'ar') {
             tabLabel = f === 'all' ? 'الكل' : f === 'live' ? 'مباشر' : f === 'upcoming' ? 'قادمة' : 'انتهت';
           } else {
             tabLabel = f === 'all' ? 'All' : f === 'live' ? 'Live' : f === 'upcoming' ? 'Upcoming' : 'Finished';
           }

           return (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={cn(
                 "px-3 py-2.5 rounded-full text-[14px] font-black transition-all flex-1 text-center whitespace-nowrap",
                 filter === f 
                   ? "bg-white text-[#4B0082] shadow-sm" 
                   : "text-white/80 hover:text-white hover:bg-white/20"
               )}
             >
               {tabLabel}
             </button>
           );
        })}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto flex flex-col pb-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match, index) => (
            <Fragment key={match.id}>
              <MatchCard 
                match={match} 
                isSelected={selectedMatch === match.id}
                lang={lang}
                onClick={() => {
                  if (match.status === 'live') {
                    onSelect(match);
                  }
                }}
              />
            </Fragment>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-white/70 gap-3 mt-10">
            <Trophy className="w-12 h-12 opacity-50" />
            <p className="text-lg font-bold">
               {lang === 'ar' ? 'لا توجد مباريات حالياً' : 'No matches available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
