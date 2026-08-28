import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const socialImage = new URL(`${basePath}/og.png`, siteUrl).toString();
const title = "Second — Conversation Intelligence";
const description = "Prepare well. Stay present. Remember what matters.";

export const dynamic = "force-static";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  icons: {
    icon: `${basePath}/favicon.png`,
    shortcut: `${basePath}/favicon.png`,
    apple: `${basePath}/favicon.png`,
  },
  openGraph: {
    title,
    description,
    type: "website",
    images: [{
      url: socialImage,
      width: 1536,
      height: 905,
      alt: "Second — Prepare well. Stay present. Remember what matters.",
    }],
  },
  twitter: { card: "summary_large_image", title, description, images: [socialImage] },
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
