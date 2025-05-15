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

export const metadata = {
  title: "Earth Guardians | Project Grants",
  description: "Track granteds socioenvironmental initiatives worldwide",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Earth Guardians | Project Grants",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Earth Guardians | Project Grants",
    description: "Track environmental initiatives worldwide",
    siteName: "Earth Guardians",
  },
  generator: 'Hautly'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#000000" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://basemaps.cartocdn.com" crossOrigin="anonymous" />
        
        {/* Disable iOS touch callout */}
        <style>{`
          * {
            -webkit-overflow-scrolling: touch;
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
          }
          
          /* Fix 100vh issue on mobile */
          html, body, .min-h-screen {
            height: 100%;
          }
          
          @supports (-webkit-touch-callout: none) {
            .min-h-screen {
              min-height: -webkit-fill-available;
            }
          }
        `}</style>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
