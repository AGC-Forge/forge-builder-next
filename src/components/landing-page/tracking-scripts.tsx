import Script from "next/script";
import type { TrackingConfig } from "@/types/database";

export function TrackingScripts({ tracking }: { tracking: TrackingConfig | null }) {
  if (!tracking) return null;
  const { gtm_id, fb_pixel_id, histats_id, ga_id } = tracking;

  return (
    <>
      {/* Google Tag Manager */}
      {gtm_id && (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtm_id}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtm_id}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="gtm"
            />
          </noscript>
        </>
      )}

      {/* Google Analytics 4 */}
      {ga_id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga_id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga_id}');`}
          </Script>
        </>
      )}

      {/* Facebook / Meta Pixel */}
      {fb_pixel_id && (
        <Script id="fbpixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${fb_pixel_id}');
fbq('track', 'PageView');`}
        </Script>
      )}

      {/* Histats */}
      {histats_id && (
        <Script id="histats" strategy="afterInteractive">
          {`var _Hasync= _Hasync|| [];
_Hasync.push(['Histats.start', '1,${histats_id},4,0,0,0,00010000']);
_Hasync.push(['Histats.fasi', '1']);
_Hasync.push(['Histats.track_hits', '']);
(function() {
var hs = document.createElement('script'); hs.type = 'text/javascript'; hs.async = true;
hs.src = ('//s10.histats.com/js15_as.js');
(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);
})();`}
        </Script>
      )}
    </>
  );
}
