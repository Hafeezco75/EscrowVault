import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SuiProviders } from "../components/providers";
import AppWrapper from "../components/AppWrapper";
import NoSSR from "../components/NoSSR";
import Navbar from "../components/Navbar";
import ErrorBoundary from "../components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Escrow Vault",
  description: "Secure vault system on Sui blockchain",
  robots: "index, follow",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1f2937',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Prevent browser extension hydration issues
                function preventExtensionHydrationIssues() {
                  // Remove browser extension attributes that cause hydration mismatches
                  const extensionAttributes = [
                    'bis_skin_checked',
                    '__processed',
                    'data-bis-processed',
                    'data-extension-processed',
                    'data-adblock-key'
                  ];
                  
                  // Clean up extension attributes on all elements
                  function cleanExtensionAttributes() {
                    extensionAttributes.forEach(attr => {
                      const elements = document.querySelectorAll('[' + attr + ']');
                      elements.forEach(el => {
                        el.removeAttribute(attr);
                      });
                    });
                  }
                  
                  // Run cleanup immediately and on DOM changes
                  cleanExtensionAttributes();
                  
                  // Set up mutation observer to clean attributes as they're added
                  if (typeof MutationObserver !== 'undefined') {
                    const observer = new MutationObserver(cleanExtensionAttributes);
                    observer.observe(document.body || document.documentElement, {
                      attributes: true,
                      attributeOldValue: true,
                      subtree: true
                    });
                  }
                }
                
                function markLoaded() {
                  document.body.classList.add('loaded');
                  preventExtensionHydrationIssues();
                }
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', markLoaded);
                } else {
                  markLoaded();
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
        style={{ minHeight: '100vh' }}
      >
        <ErrorBoundary>
          <NoSSR>
            <SuiProviders>
              <AppWrapper>
                <Navbar />
                <div className="pt-16">
                  {children}
                </div>
              </AppWrapper>
            </SuiProviders>
          </NoSSR>
        </ErrorBoundary>
      </body>
    </html>
  );
}
