// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppProviders } from "./providers";
import "@fontsource/open-sans"; // defaults to weight 400

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aimx Organization",
  description: "Aimx Organization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <AppProviders>
          {children}
          <ToastContainer position="top-right" autoClose={3000} />
        </AppProviders> */}

        <AppProviders>
          {children}
          <ToastContainer position="top-right" autoClose={3000} />
        </AppProviders>
      </body>
    </html>
  );
}
