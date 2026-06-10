import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Stream } from '../types';

interface SmartPlayerProps {
  key?: string | number;
  stream: Stream | null;
  isLive?: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export default function SmartPlayer({ stream, isLive = false }: SmartPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [resolvedStream, setResolvedStream] = useState<Stream | null>(null);

  useEffect(() => {
    if (!stream) {
      setResolvedStream(null);
      return;
    }

    let effectiveType = stream.type;
    if (stream.type === 'm3u8' && (stream.url.includes('youtube.com') || stream.url.includes('youtu.be') || stream.url.includes('facebook.com') || stream.url.includes('fb.watch'))) {
      effectiveType = 'auto';
    }

    if (effectiveType === 'auto') {
      const controller = new AbortController();
      setIsLoading(true);
      setLoadingText('جاري تحميل البث...');
      setError(false);

      fetch(`${API_BASE}/api/resolve-stream?url=${encodeURIComponent(stream.url)}`, {
        signal: controller.signal
      })
        .then(res => {
          if (!res.ok) throw new Error('API Error');
          return res.json();
        })
        .then(data => {
          setResolvedStream({ ...stream, url: data.streamUrl, type: data.type === 'mp4' ? 'm3u8' : 'm3u8' });
          setLoadingText('');
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error('Resolve error:', err);
            setIsLoading(false);
            setError(true);
          }
        });

      return () => controller.abort();
    } else {
      setResolvedStream(stream);
    }
  }, [stream]);

  useEffect(() => {
    const currentStream = resolvedStream;
    if (!currentStream) return;

    setError(false);

    if (currentStream.type !== 'm3u8' && currentStream.type !== 'auto') {
      setIsLoading(true);
      setLoadingText('');
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    }

    if (!videoRef.current || currentStream.type === 'auto') return;

    setIsLoading(true);
    setLoadingText('');
    const video = videoRef.current;
    let hls: Hls | null = null;
    
    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxLoadRetries: 5,
        maxRetryDelay: 3000,
        liveSyncDurationCount: 3
      } as any);
      hls.loadSource(currentStream.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(e => console.log('Autoplay prevented:', e));
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
           setIsLoading(false);
           setError(true);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('video/mp4')) {
      video.src = currentStream.url;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().catch(e => console.log('Autoplay prevented:', e));
      });
      video.addEventListener('error', () => {
        setIsLoading(false);
        setError(true);
      });
    }
    
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [resolvedStream]);

  if (!stream) {
    return (
      <div className="absolute inset-0 w-full h-full bg-[#0f0f13] overflow-hidden flex flex-col items-center justify-center text-center m-0 p-0 border-0">
        <span className="text-6xl mb-4">🏟️</span>
        <p className="text-lg font-semibold text-white">اختر مباراة للمشاهدة</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 w-full h-full bg-[#0f0f13] overflow-hidden flex flex-col items-center justify-center text-center m-0 p-0 border-0 z-10">
        <span className="text-4xl mb-3 text-white">⚠️</span>
        <p className="text-base font-semibold text-white">تعذّر تحميل البث — جرب سيرفر آخر</p>
      </div>
    );
  }

  const renderStream = () => {
    const currentStream = resolvedStream;
    if (!currentStream || currentStream.type === 'auto') return null;

    if (currentStream.type === 'm3u8') {
      return (
        <video 
          ref={videoRef} 
          className="absolute inset-0 w-full h-full object-contain bg-[#0f0f13] m-0 p-0 border-0" 
          controls 
          autoPlay 
          playsInline 
        />
      );
    }

    if (currentStream.type === 'youtube') {
      let vId = '';
      if (currentStream.url?.includes('youtube.com/watch?v=')) {
        vId = currentStream.url.split('v=')[1]?.split('&')[0] || '';
      } else if (currentStream.url?.includes('youtu.be/')) {
        vId = currentStream.url.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (currentStream.url?.includes('youtube.com/live/')) {
        vId = currentStream.url.split('youtube.com/live/')[1]?.split('?')[0] || '';
      }
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      let processedUrl = `https://www.youtube.com/embed/${vId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&origin=${encodeURIComponent(origin)}`;
      if (isLive) {
        processedUrl += '&live=1';
      }
      return (
        <iframe 
          src={processedUrl}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 w-full h-full border-0 m-0 p-0 bg-[#0f0f13]"
          style={{ border: 'none' }}
        />
      );
    }

    if (currentStream.type === 'facebook') {
      const encodedUrl = encodeURIComponent(currentStream.url);
      const processedUrl = `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&autoplay=1&allowfullscreen=true&width=1280&height=720`;
      return (
        <iframe 
          src={processedUrl}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0 m-0 p-0 bg-[#0f0f13]"
          style={{ border: 'none' }}
        />
      );
    }

    return (
      <iframe 
        src={currentStream.url}
        allow="autoplay; fullscreen; encrypted-media"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0 m-0 p-0 bg-[#0f0f13]"
        style={{ border: 'none' }}
      />
    );
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-[#0f0f13] overflow-hidden m-0 p-0 border-0">
      {renderStream()}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-[#0f0f13] flex flex-col items-center justify-center pointer-events-none gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-white/10 border-t-[#8b5cf6] animate-spin" />
          {loadingText && (
            <p className="text-sm font-semibold text-[#8b5cf6]">{loadingText}</p>
          )}
        </div>
      )}
    </div>
  );
}
