import { Search, Languages } from 'lucide-react';

export default function Header({ 
  liveCount, 
  lang, 
  toggleLang 
}: { 
  liveCount?: number;
  lang: string;
  toggleLang: () => void 
}) {
  return (
    <header className="h-[60px] flex items-center justify-between px-4 bg-gradient-to-r from-[#4B0082] via-[#6A0DAD] to-[#4B0082] shadow-md relative z-50">
      {/* Right side (First element in RTL) -> Language Toggle */}
      <button 
        onClick={toggleLang}
        className="flex items-center gap-2 px-3 py-1.5 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors font-bold text-sm border border-white/10 backdrop-blur-sm"
      >
         <Languages className="w-5 h-5" />
         <span>{lang === 'en' ? 'AR' : 'EN'}</span>
      </button>

      <h1 className="text-white font-heading font-black text-2xl tracking-[0.1em] uppercase drop-shadow-md">
        MATCHORA
      </h1>
      
      {/* Left side (Last element in RTL) -> Logo */}
      <div className="w-12 h-12 shrink-0 flex items-center justify-center relative">
         <div className="absolute inset-0 rounded-full border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]"></div>
         <img 
           src="https://i.ibb.co/MxsSzdwY/1781130888674-2.jpg" 
           alt="شعار الموقع" 
           className="w-full h-full object-cover rounded-full shadow-lg"
           onError={(e) => {
             // Fallback if image not found
             e.currentTarget.onerror = null;
             e.currentTarget.src = 'data:image/svg+xml;utf8,<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="30" fill="white" /><path d="M 38 50 V 38 H 50" stroke="%234B0082" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" /><path d="M 82 50 V 38 H 70" stroke="%234B0082" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" /><path d="M 82 70 V 82 H 70" stroke="%234B0082" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" /><path d="M 38 70 V 82 H 50" stroke="%234B0082" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" /><path d="M 46 80 V 48 L 59 63 C 60 64, 61 65, 62 65 C 64 65, 65 64, 65 62 C 65 60, 63 59, 61 58 A 4 4 0 0 1 61 53 A 4 4 0 0 1 66 53 L 64 55" stroke="%234B0082" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" /><path d="M 74 80 V 48 L 61 63 C 60 64, 59 65, 58 65 C 56 65, 55 64, 55 62 C 55 60, 57 59, 59 58 A 4 4 0 0 0 59 53 A 4 4 0 0 0 54 53" stroke="%234B0082" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" /></svg>';
           }}
         />
      </div>
    </header>
  );
}
