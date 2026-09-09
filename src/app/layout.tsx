import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitHub Analyzer",
  description: "Know your GitHub potential.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#07090e] text-neutral-100">
        <main className="relative min-h-screen overflow-hidden">
          {/* Global Aceternity background */}
          <DottedGlowBackground
            className="fixed inset-0 z-0 pointer-events-none"
            gap={12}
            radius={2}
            color="rgba(255, 255, 255, 0.30)"
            darkColor="rgba(255, 255, 255, 0.30)"
            glowColor="rgba(0, 170, 255, 0.85)"
            darkGlowColor="rgba(0, 170, 255, 0.85)"
            opacity={0.8}
            backgroundOpacity={0.08}
            speedMin={0.4}
            speedMax={1.3}
            speedScale={1}
          />

          {/* Website content */}
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}