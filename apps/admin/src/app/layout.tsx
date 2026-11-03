import { Toaster } from "@ghom/ui/components/sonner";
import { TooltipProvider } from "@ghom/ui/components/tooltip";
import type { Metadata, Viewport } from "next";
import { Chakra_Petch, JetBrains_Mono, Tektur } from "next/font/google";
import "./globals.css";

const display = Tektur({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display-family",
});
const body = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body-family",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-family" });

export const metadata: Metadata = {
  title: { default: "Console · GHOM", template: "%s · Console GHOM" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#030308", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`dark ${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-dvh bg-void">
        <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
