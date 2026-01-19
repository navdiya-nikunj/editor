import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClipSync - Sync Content Across Your Devices Instantly",
  description: "Copy on your phone, paste on your laptop. Share text, links, and files instantly across all your devices in real-time with ClipSync.",
  keywords: "clipboard sync, share content, cross-device, file sharing, real-time sync",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

