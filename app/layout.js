import { Bodoni_Moda, Archivo } from "next/font/google";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "The Crest",
  description:
    "Twenty swipes. One club. Find the football club that sounds like your heart, thinks like your mind and feels like your soul.",
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
    <html lang="en" className={`${bodoni.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
