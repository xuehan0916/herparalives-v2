import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./museum.css";
import "./game.css";
import "./immersive.css";

export const metadata: Metadata = {
  title: "HerParaLives 她的平行人生",
  description: "在她们的人生岔路里，看见自己会如何选择。",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#252541" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
