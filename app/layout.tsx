import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import QueryProvider from "@/components/QueryProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Instagram AI - Instagram DM Automation Platform",
  description: "Automate your Instagram DMs with intelligent responses that convert followers into customers. Instagram AI helps businesses grow faster with smart automation, CRM integrations, and analytics. Start your free trial today.",
  keywords: "Instagram automation, DM automation, Instagram marketing, social media automation, customer engagement, Instagram bot, Instagram CRM, social media management",
  authors: [{ name: "Instagram AI" }],
  creator: "Instagram AI",
  publisher: "Instagram AI",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    // url: "https://flowarix.ai",
    title: "Instagram AI - Instagram DM Automation Platform",
    description: "Automate your Instagram DMs with intelligent responses that convert followers into customers. Start your free trial today.",
    siteName: "Instagram AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram AI - Instagram DM Automation Platform",
    description: "Automate your Instagram DMs with intelligent responses that convert followers into customers. Start your free trial today.",
    creator: "@instagramai",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <SessionProvider session={session}>
            {children}
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
