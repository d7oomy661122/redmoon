import { useEffect, useRef, useState } from 'react';

interface AdUnitProps {
  format?: 'banner' | 'native' | 'native_banner';
  size?: '728x90' | '320x50' | '300x250' | '160x600' | '160x300' | '468x60' | 'responsive';
  className?: string;
  adKey?: string;
}

let adblockWarned = false;

export default function AdUnit({ format = 'banner', size = 'responsive', className = '', adKey = '0033fdc79100a538f21343649a6a0de2' }: AdUnitProps) {
  let adW = 160;
  let adH = 300;
  
  if (size === '300x250') { adW = 300; adH = 250; }
  else if (size === '728x90') { adW = 728; adH = 90; if (adKey === '0033fdc79100a538f21343649a6a0de2') adKey = '4b870d616b3655bae96c1e2f65740bfd'; }
  else if (size === '320x50') { adW = 320; adH = 50; if (adKey === '0033fdc79100a538f21343649a6a0de2') adKey = 'd84040283c70a5e0166385c9cf8259af'; }
  else if (size === '160x300') { adW = 160; adH = 300; }
  else if (size === '160x600') { adW = 160; adH = 600; if (adKey === '0033fdc79100a538f21343649a6a0de2') adKey = '6b23f0521bff798819ee28f109c72461'; }
  else if (size === '468x60') { adW = 468; adH = 60; if (adKey === '0033fdc79100a538f21343649a6a0de2') adKey = '7c620cdf0641c01a146c38a235345706'; }
  else if (size === 'responsive') { adW = 300; adH = 250; } // default to 300x250

  useEffect(() => {
    // Optional Adblock detection - just a soft ping
    if (!adblockWarned && typeof window !== 'undefined') {
       if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('adblock_warned')) {
          adblockWarned = true;
          return;
       }

       fetch('https://www.highperformanceformat.com/favicon.ico', { mode: 'no-cors' })
        .catch(() => {
           if (!adblockWarned) {
              adblockWarned = true;
              if (typeof sessionStorage !== 'undefined') {
                 sessionStorage.setItem('adblock_warned', 'true');
              }
              const toast = document.createElement('div');
              toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#1a1a24] border border-[#2a2a3a] text-white px-6 py-3 rounded-full shadow-2xl z-[9999] text-sm font-bold transition-opacity duration-300 pointer-events-none text-center whitespace-nowrap';
              toast.style.opacity = '0';
              toast.innerText = 'Please disable your ad blocker to support the site 🙏';
              document.body.appendChild(toast);
              
              requestAnimationFrame(() => {
                toast.style.opacity = '1';
              });

              setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
              }, 5000);
           }
        });
    }
  }, []);

  const adContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            background: transparent; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            overflow: hidden; 
          }
        </style>
      </head>
      <body>
        <script>
          atOptions = {
            'key' : '${adKey}',
            'format' : 'iframe',
            'height' : ${adH},
            'width' : ${adW},
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/${adKey}/invoke.js"></script>
      </body>
    </html>
  `;

  if (format === 'native_banner') {
    return (
      <div className={`overflow-hidden max-w-full flex justify-center items-center w-full my-4 ${className}`}>
        <div id="container-c3eef79ca348968d768ca55eb04a4d8c"></div>
      </div>
    );
  }

  return (
    <div 
      className={`overflow-hidden max-w-full flex justify-center items-center ${format === 'native' ? 'bg-[#1a1a24] rounded-xl my-4 border border-[#2a2a3a]' : 'my-4'} ${className}`}
      style={{ minHeight: `${adH}px`, minWidth: '100%' }}
    >
      <iframe 
        title="Advertisement"
        srcDoc={adContent}
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
        scrolling="no"
        frameBorder="0"
        className="max-w-full block"
        style={{ width: `${adW}px`, height: `${adH}px`, border: 'none', overflow: 'hidden' }}
      />
    </div>
  );
}
