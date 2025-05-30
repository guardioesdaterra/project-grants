import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

// Preload Inter font for better performance
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

// Metadata for SEO and PWA capabilities
export const metadata = {
  title: "Earth Guardians | Project Grants",
  description: "Track granted socioenvironmental initiatives by Earth Guardians, worldwide",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Earth Guardians | Project Grants",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Earth Guardians | Project Grants",
    description: "Track environmental initiatives by Earth Guardians, worldwide",
    siteName: "Earth Guardians",
  },
  generator: 'Tupã Levi | 2025'
}

// Viewports settings - updated for optimal mobile experience
export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192x140.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://api.maptiler.com" crossOrigin="anonymous" />
        
        {/* Mobile optimizations */}
        <style>{`
          * {
            -webkit-overflow-scrolling: touch;
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            touch-action: manipulation;
          }
          
          /* Fix 100vh issue on mobile */
          html, body {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
          }
          
          .min-h-screen {
            height: 100%;
          }
          
          @supports (-webkit-touch-callout: none) {
            .min-h-screen {
              min-height: -webkit-fill-available;
              height: -webkit-fill-available;
            }
          }
          
          /* Prevent content from being hidden under notches/cut-outs */
          @supports (padding: max(0px)) {
            body {
              padding-left: env(safe-area-inset-left);
              padding-right: env(safe-area-inset-right);
              padding-top: env(safe-area-inset-top);
              padding-bottom: env(safe-area-inset-bottom);
            }
          }
        `}</style>
        
        {/* Fix mobile viewport height */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Mobile viewport height fix
            function setAppHeight() {
              document.documentElement.style.setProperty('--app-height', \`\${window.innerHeight}px\`);
            }
            
            // Set initial height
            setAppHeight();
            
            // Update on resize and orientation change
            window.addEventListener('resize', setAppHeight);
            window.addEventListener('orientationchange', setAppHeight);
          `
        }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
