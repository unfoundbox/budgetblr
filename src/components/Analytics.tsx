import Script from "next/script";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

const GA = process.env.NEXT_PUBLIC_GA_ID;

/** Google Analytics 4 (env-gated) + Vercel Web Analytics. */
export function Analytics() {
  return (
    <>
      {GA ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA}');`}
          </Script>
        </>
      ) : null}
      <VercelAnalytics />
    </>
  );
}
