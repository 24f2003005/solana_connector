import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SolanaWrapper } from "@algobright/solana-connector";
import LayoutWrapper from "./components/LayoutWrapper";
import { ToastProvider } from "./providers/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlgoBright Solana Connector",
  description: "Simple Solana PWA",
};

export const viewport = {
  themeColor: "#0d7ccf",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SolanaWrapper
          appName="AlgoBright Solana Connector"
          autoConnect={true}
          walletConnect={true}
          defaultRpcUrl="https://mainnet.helius-rpc.com/?api-key=dfedba99-f41e-4398-a1f7-3e6e585428f4"
        >
          <ToastProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </ToastProvider>
        </SolanaWrapper>
      </body>
    </html>
  );
}
