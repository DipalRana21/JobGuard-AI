import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/components/Provider";
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import LiveTicker from "@/components/LiveTicker";

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobGuard AI",
  description: "AI-Powered Corporate Intelligence & Fraud Defense",
};

// TS Interface: Defining what props this component accepts
interface RootLayoutProps {
  children: React.ReactNode;
}
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-[#0f172a] text-white`}>
        <Navbar />
        {/* pt-20 adds padding-top so content doesn't hide behind fixed Navbar */}
        <main className="flex-grow pt-20 px-4 max-w-7xl mx-auto w-full">
          <AuthProvider> 
            {children}
            <LiveTicker />
          </AuthProvider>
          
        </main>
        
        <footer className="border-t border-white/10 py-6 text-center text-gray-500 text-sm mt-10">
          <p>© 2025 JobGuard AI. Final Year Capstone Project.</p>
        </footer>
      </body>
    </html>
  );
}
