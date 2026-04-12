import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "おかねのタネ - こどもの資産運用たいけんゲーム",
  description: "まいにち100円をあずけて、おかねをそだてよう！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
