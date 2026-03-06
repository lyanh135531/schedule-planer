import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "TalkFirst Support",
    template: "%s | TalkFirst Support",
  },
  description: "Premium automation hub for TalkFirst course planning, scheduling, and enrollment management.",
  applicationName: "TalkFirst Support",
  authors: [{ name: "TalkFirst" }],
  keywords: ["TalkFirst", "course planning", "enrollment", "schedule", "education"],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "TalkFirst Support",
    title: "TalkFirst Support",
    description: "Premium automation hub for TalkFirst course planning & enrollment.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1117",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-right" theme="dark" richColors closeButton />
      </body>
    </html>
  );
}
