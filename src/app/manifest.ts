import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "おかねのタネ - こどもの資産運用たいけんゲーム",
    short_name: "おかねのタネ",
    description: "まいにち100円をあずけて、おかねをそだてよう！",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFF7ED",
    theme_color: "#FB923C",
    lang: "ja",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
