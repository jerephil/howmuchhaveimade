import localFont from "next/font/local";
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
  title: 'How Much Have I Made?',
  description: 'Track your earnings in real-time based on your annual salary. A rytāvi corp service.',
  openGraph: {
    title: 'How Much Have I Made?',
    description: 'Track your earnings in real-time based on your annual salary. A rytāvi corp service.',
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title: 'How Much Have I Made?',
    description: 'Track your earnings in real-time based on your annual salary. A rytāvi corp service.'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}