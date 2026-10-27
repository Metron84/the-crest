import { archivo } from "./fonts/archivo";
import { bodoni } from "./fonts/bodoni";
import { montserrat } from "./fonts/montserrat";
import "./globals.css";

export const metadata = {
  title: "Find Your FC",
  description: "Matched on heart, mind and soul",
  applicationName: "Find Your FC",
  openGraph: {
    title: "Find Your FC",
    description: "Matched on heart, mind and soul",
    siteName: "Find Your FC",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Find Your FC",
    description: "Matched on heart, mind and soul",
  },
  icons: { icon: "/icon.png" },
};

export const viewport = {
  themeColor: "#0a111f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${bodoni.variable} ${archivo.variable} ${montserrat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
