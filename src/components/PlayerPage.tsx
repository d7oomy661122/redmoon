import { useEffect, useRef, useState } from 'react';
import { Match, Stream } from '../types';
import Hls from 'hls.js';
import 'plyr/dist/plyr.css';
import Plyr from 'plyr';
import { AlertCircle, ArrowRight, Loader2, RotateCw } from 'lucide-react';
import AdUnit from './AdUnit';

interface PlayerPageProps {
  match: Match;
  stream: Stream;
  lang: string;
  onBack?: () => void;
  onServerChange?: (stream: Stream) => void;
}

export default function PlayerPage({ match, stream, lang, onBack }: PlayerPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const plyrRef = useRef<Plyr | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [servers, setServers] = useState<Stream[]>([]);
  const [activeServer, setActiveServer] = useState<Stream>(stream);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playerClicks, setPlayerClicks] = useState(0);

  // Load all servers for this match
  useEffect(() => {
    fetch('/servers.json?t=' + new Date().getTime())
      .then(res => res.json())
      .then(data => {
         const matchData = data.matches.find((m: any) => {
            const mHome = m.homeTeam.toLowerCase().trim();
            const mAway = m.awayTeam.toLowerCase().trim();
            const home = match.homeTeam.name.toLowerCase().trim();
            const away = match.awayTeam.name.toLowerCase().trim();
            return (mHome === home && mAway === away) || (mHome === away && mAway === home);
         });
         
         if (matchData && matchData.servers) {
            setServers(matchData.servers);
         } else {
            setServers(match.streams || [stream]);
         }
      })
      .catch(() => {
         setServers(match.streams || [stream]);
      });
  }, [match]);

  // Determine stream type accurately
  const getStreamType = (url: string) => {
    const l = url.toLowerCase();
    if (l.includes('.m3u8')) return 'hls';
    if (l.includes('youtube.com') || l.includes('youtu.be')) return 'youtube';
    if (l.includes('dailymotion.com')) return 'dailymotion';
    if (l.includes('facebook.com') || l.includes('fb.watch')) return 'facebook';
    if (l.includes('.mp4') || l.includes('.webm')) return 'mp4';
    return 'iframe';
  };

  const currentType = getStreamType(activeServer.url);

  // Initialize Video Player
  useEffect(() => {
    setLoading(true);
    setError(false);

    if (currentType === 'iframe' || currentType === 'youtube' || currentType === 'dailymotion' || currentType === 'facebook') {
      const timer = setTimeout(() => setLoading(false), 800);
      return () => clearTimeout(timer);
    }

    if (!videoRef.current) return;
    const videoElement = videoRef.current;

    // Default Plyr Options
    const defaultOptions: Plyr.Options = {
        controls: [
            'play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'
        ],
        settings: ['quality', 'speed'],
        i18n: lang === 'ar' ? {
            speed: 'السرعة',
            quality: 'الجودة',
            play: 'تشغيل',
            pause: 'إيقاف',
            mute: 'كتم الصوت',
            unmute: 'تفعيل الصوت',
            enterFullscreen: 'ملء الشاشة',
            exitFullscreen: 'إنهاء ملء الشاشة',
            settings: 'الإعدادات'
        } : {
            speed: 'Speed',
            quality: 'Quality',
            play: 'Play',
            pause: 'Pause',
            mute: 'Mute',
            unmute: 'Unmute',
            enterFullscreen: 'Fullscreen',
            exitFullscreen: 'Exit Fullscreen',
            settings: 'Settings'
        }
    };

    if (currentType === 'hls' && Hls.isSupported()) {
      const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          liveSyncDurationCount: 3
      });
      hlsRef.current = hls;
      
      hls.loadSource(activeServer.url);
      hls.attachMedia(videoElement);
      
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const availableQualities = hls.levels.map((l) => l.height);
        availableQualities.unshift(0); // Auto
        
        defaultOptions.quality = {
            default: 0,
            options: availableQualities,
            forced: true,
            onChange: (e) => updateQuality(e)
        };

        defaultOptions.i18n = {
           ...defaultOptions.i18n,
           qualityBadge: { 2160: '4K', 1440: 'HD', 1080: 'HD', 720: 'HD', 576: 'SD', 480: 'SD' }
        };

        plyrRef.current = new Plyr(videoElement, defaultOptions);
        setLoading(false);
        videoElement.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
         if (data.fatal) {
             setError(true);
             setLoading(false);
         }
      });

      return () => {
          hls.destroy();
          if (plyrRef.current) {
              plyrRef.current.destroy();
          }
      };
    } else if (currentType === 'mp4' || videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari HLS or plain MP4
      videoElement.src = activeServer.url;
      plyrRef.current = new Plyr(videoElement, defaultOptions);
      
      videoElement.addEventListener('loadedmetadata', () => {
         setLoading(false);
         videoElement.play().catch(() => {});
      });
      videoElement.addEventListener('error', () => {
         setError(true);
         setLoading(false);
      });

      return () => {
          if (plyrRef.current) {
              plyrRef.current.destroy();
          }
      };
    }
  }, [activeServer.url, currentType]);

  const updateQuality = (newQuality: number) => {
      if (hlsRef.current) {
          hlsRef.current.levels.forEach((level, levelIndex) => {
              if (level.height === newQuality) {
                  hlsRef.current!.currentLevel = levelIndex;
              }
          });
          if (newQuality === 0) {
              hlsRef.current!.currentLevel = -1; // Auto
          }
      }
  };

  const handleRetry = () => {
     setActiveServer({ ...activeServer }); // force re-render/re-init
  };

  const renderIframe = () => {
      let srcUrl = activeServer.url;
      
      if (currentType === 'youtube') {
          let vId = '';
          if (srcUrl.includes('youtube.com/watch?v=')) vId = srcUrl.split('v=')[1]?.split('&')[0];
          else if (srcUrl.includes('youtu.be/')) vId = srcUrl.split('youtu.be/')[1]?.split('?')[0];
          srcUrl = `https://www.youtube.com/embed/${vId}?autoplay=1&rel=0`;
      } else if (currentType === 'facebook') {
          srcUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(srcUrl)}&show_text=false&autoplay=true`;
      }
      
      return (
         <iframe 
            src={srcUrl}
            className="absolute inset-0 w-full h-full border-0 shadow-lg bg-black"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
         />
      );
  };

  return (
    <div className="fixed inset-0 w-[100vw] h-[100dvh] bg-[#0a0e17] overflow-hidden z-[100] flex flex-col font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Header Navigation */}
      <header className="h-[60px] shrink-0 bg-[#0a0e17] border-b border-white/5 flex items-center justify-between px-4 relative z-10">
         <div className="flex items-center gap-3">
            <button onClick={onBack} className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer text-white ${lang === 'en' ? 'rotate-180' : ''}`}>
               <ArrowRight className="w-5 h-5" />
            </button>
            <span className="text-white font-bold tracking-wider">{match.homeTeam.name} {lang === 'ar' ? 'ضد' : 'VS'} {match.awayTeam.name}</span>
         </div>
      </header>
      
      {/* Player Container */}
      <div className="flex-1 w-full bg-[#000000] relative flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
         {playerClicks < 3 && (
            <div 
               className="absolute inset-0 z-30 cursor-pointer" 
               onClick={(e) => {
                  e.stopPropagation();
                  setPlayerClicks(v => v + 1);
                  window.open('https://www.effectivecpmnetwork.com/aqvr5qwv9?key=04dcea856855796b247a2fd6bce092ca', '_blank');
               }}
            />
         )}
         {(currentType === 'hls' || currentType === 'mp4') ? (
            <video ref={videoRef} className="w-full h-full object-contain" crossOrigin="anonymous" playsInline></video>
         ) : (
            renderIframe()
         )}
         
         {/* Overlays */}
         {loading && (
             <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none transition-opacity duration-300">
                <Loader2 className="w-12 h-12 text-[#22c55e] animate-spin mb-4" />
                <p className="text-white font-bold text-lg tracking-widest drop-shadow-md">
                   {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                </p>
             </div>
         )}
         
         {error && (
             <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
                <AlertCircle className="w-14 h-14 text-red-500 mb-4 drop-shadow-md" />
                <p className="text-white font-bold text-lg mb-6">
                   {lang === 'ar' ? 'حدث خطأ في تشغيل السيرفر المختار' : 'Error playing the selected server'}
                </p>
                <button onClick={handleRetry} className="bg-[#22c55e] text-[#0a0e17] font-bold px-6 py-2.5 rounded-full flex items-center gap-2 hover:bg-[#1ea34f] transition-all">
                   <RotateCw className="w-5 h-5" />
                   {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                </button>
             </div>
         )}
      </div>

      {/* Ads and Servers Container */}
      <div className="h-auto max-h-[40vh] shrink-0 bg-[#06080d] flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden border-t border-white/5">
        
        {/* Ads Section in place of servers */}
        <div className="px-4 py-6 shrink-0 flex flex-col items-center gap-6">
            <div className="hidden md:block w-full">
               <AdUnit format="banner" size="728x90" className="!my-0 shadow-lg rounded-xl overflow-hidden" />
            </div>
            <div className="block md:hidden w-full">
               <AdUnit format="banner" size="320x50" className="!my-0 shadow-lg rounded-xl overflow-hidden" />
            </div>
            <AdUnit format="native_banner" className="max-w-4xl mx-auto w-full !my-0 shadow-lg rounded-xl overflow-hidden" />
            <AdUnit format="native" className="max-w-4xl mx-auto w-full !my-0 shadow-lg rounded-xl overflow-hidden" />
        </div>
      </div>
      
    </div>
  );
}
