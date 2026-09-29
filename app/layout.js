import { archivo } from "./fonts/archivo";
import { bodoni } from "./fonts/bodoni";
import { montserrat } from "./fonts/montserrat";
import "./globals.css";

export const metadata = {
  title: "The Crest",
  description:
    "Eighteen swipes. One club. Find the football club that sounds like your heart, thinks like your mind and feels like your soul.",
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
