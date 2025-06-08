import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mailplanet.vercel.app"),
  title: {
    default: "MailPlanet",
    template: "%s | MailPlanet",
  },
  icons: {
    icon: "/mailplanet-logo.svg",
    shortcut: "/mailplanet-logo.svg",
    apple: "/mailplanet-logo.svg",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/mailplanet-logo.svg",
    },
  },
  authors: [
    {
      name: "Teddy ASSIH",
      url: "https://www.linkedin.com/in/teddy-assih-b4204b254/",
    },
  ],
  description: "MailPlanet - Visualize email origins on a global map",
  keywords: ["email", "map", "geolocation", "inbound email", "tracking"],
  openGraph: {
    title: "MailPlanet",
    description: "MailPlanet - Visualize email origins on a global map",
    url: "https://mailplanet.vercel.app",
    siteName: "MailPlanet",
    images: [
      {
        url: "https://mailplanet.vercel.app/og.png",
        width: 2530,
        height: 1148,
      },
    ],
    locale: "en-US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: "MailPlanet",
    card: "summary_large_image",
    description: "MailPlanet - Visualize email origins on a global map",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
