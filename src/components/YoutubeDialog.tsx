import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Youtube, BellRing } from 'lucide-react';
import { cn } from '../lib/utils';

export default function YoutubeDialog({ lang }: { lang: string }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only show once
    const hasSeen = localStorage.getItem('matchora_yt_dialog_seen2');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('matchora_yt_dialog_seen2', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={cn(
            "relative w-full max-w-md bg-gradient-to-b from-[#1a1a24] to-[#0f0f13] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10",
            lang === 'ar' ? "rtl" : "ltr"
          )}
        >
          {/* Top banner */}
          <div className="h-32 w-full bg-gradient-to-r from-red-600 to-red-800 relative flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
             <motion.div 
               animate={{ scale: [1, 1.1, 1] }} 
               transition={{ repeat: Infinity, duration: 2 }}
               className="relative z-10 bg-white p-4 rounded-full shadow-lg"
             >
                <Youtube className="w-10 h-10 text-red-600" />
             </motion.div>
          </div>

        
          <div className="p-8 flex flex-col items-center text-center">
             <h2 className="text-2xl font-black text-white mb-3">
               {lang === 'ar' ? 'اشترك في قناتنا!' : 'Subscribe to our Channel!'}
             </h2>
             <p className="text-gray-300 text-sm leading-relaxed mb-6">
                {lang === 'ar' 
                  ? 'دعماً لنا لتقديم أفضل جودة بث، نرجو منك الاشتراك في قناتنا على اليوتيوب وتفعيل الجرس لتصلك إشعارات المباريات القادمة.' 
                  : 'To support us in providing the best stream quality, please subscribe to our YouTube channel and hit the bell icon for upcoming match notifications.'}
             </p>

             <a
               href="https://youtube.com/@matchora-c6h?si=0N-AUsdK5WyINZPQ"
               target="_blank"
               rel="noopener noreferrer"
               onClick={() => setIsOpen(false)}
               className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
             >
                <Youtube className="w-5 h-5" />
                <span>{lang === 'ar' ? 'اشترك الآن' : 'Subscribe Now'}</span>
                <BellRing className="w-4 h-4 ml-1 opacity-80" />
             </a>
             
             <button
               onClick={() => setIsOpen(false)}
               className="mt-4 text-sm text-gray-500 hover:text-white transition-colors font-medium"
             >
                {lang === 'ar' ? 'ربما لاحقاً' : 'Maybe Later'}
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
