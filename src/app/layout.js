import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: 'How Much Have I Made? - Real-Time Earnings Tracker',
  description: 'Track your earnings in real-time. See exactly how much money you make per minute, hour, and day. Perfect for freelancers, contractors, and anyone curious about their hourly value.',
  keywords: ['earnings tracker', 'salary calculator', 'hourly rate', 'income tracker', 'money counter', 'wage calculator', 'freelance earnings'],
  authors: [{ name: 'Alchemy Risen', url: 'https://alchemyrisen.com' }],
  creator: 'Alchemy Risen',
  publisher: 'Alchemy Risen',
  applicationName: 'How Much Have I Made?',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Earnings Tracker'
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    title: 'How Much Have I Made? - Real-Time Earnings Tracker',
    description: 'Track your earnings in real-time. See exactly how much money you make per minute, hour, and day.',
    type: 'website',
    siteName: 'How Much Have I Made?',
    locale: 'en_US'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How Much Have I Made? - Real-Time Earnings Tracker',
    description: 'Track your earnings in real-time. See exactly how much money you make per minute, hour, and day.',
    creator: '@AlchemyRisen'
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' }
    ]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}