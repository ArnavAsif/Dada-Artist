import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FEA ATELIER | Spatial Product Showroom",
  description: "An immersive 3D interactive living room product showroom. Experience handcrafted luxury furniture, architectural lighting, and fine artisanal decor.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#090807] text-[#f4efe6] overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
