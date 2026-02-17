import type { Metadata } from "next";
import { Playfair_Display, Fira_Code } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://closetheritage.com"),
  title: "Closet Heritage — Your Smart Digital Wardrobe",
  description:
    "Digitize your wardrobe with AI, get smart outfit suggestions, and try them on virtually. Join the beta for the smartest way to get dressed.",
  openGraph: {
    title: "Closet Heritage — Your Smart Digital Wardrobe",
    description:
      "Digitize your wardrobe with AI, get smart outfit suggestions, and try them on virtually.",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Closet Heritage — Preserve the story your clothes tell",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${firaCode.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
