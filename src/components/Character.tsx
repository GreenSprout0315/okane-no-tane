"use client";

// キャラクター - SVG
export function Character({ mood, ribbonColor = "#FF6B9D" }: { mood: "happy" | "neutral" | "sad" | "excited"; ribbonColor?: string }) {
  const mouthPaths: Record<string, string> = {
    happy: "M 35 52 Q 40 58 45 52",     // にっこり
    neutral: "M 35 52 L 45 52",          // まっすぐ
    sad: "M 35 55 Q 40 50 45 55",        // しょんぼり
    excited: "M 33 50 Q 40 60 47 50 Z",  // 大きな笑顔
  };

  const cheekOpacity = mood === "excited" ? 0.6 : mood === "happy" ? 0.4 : 0.2;

  return (
    <svg viewBox="0 0 80 100" className="w-32 h-40 drop-shadow-lg">
      {/* 髪（ツインテール風） */}
      <ellipse cx="20" cy="35" rx="12" ry="20" fill="#5B3A29" />
      <ellipse cx="60" cy="35" rx="12" ry="20" fill="#5B3A29" />
      {/* 頭 */}
      <circle cx="40" cy="35" r="22" fill="#FFE0BD" />
      {/* 髪の毛（前髪） */}
      <path d="M 18 30 Q 25 12 40 15 Q 55 12 62 30 L 58 28 Q 50 18 40 20 Q 30 18 22 28 Z" fill="#5B3A29" />
      {/* リボン */}
      <path d="M 25 20 L 18 14 L 25 18 L 32 14 Z" fill={ribbonColor} />
      {/* 目 */}
      <ellipse cx="33" cy="35" rx="3" ry="3.5" fill="#2D1B10" />
      <ellipse cx="47" cy="35" rx="3" ry="3.5" fill="#2D1B10" />
      {/* 目のハイライト */}
      <circle cx="34" cy="34" r="1" fill="white" />
      <circle cx="48" cy="34" r="1" fill="white" />
      {/* ほっぺ */}
      <circle cx="27" cy="42" r="4" fill="#FF9999" opacity={cheekOpacity} />
      <circle cx="53" cy="42" r="4" fill="#FF9999" opacity={cheekOpacity} />
      {/* 口 */}
      <path d={mouthPaths[mood]} stroke="#C96B5F" strokeWidth="1.5" fill={mood === "excited" ? "#FF9999" : "none"} strokeLinecap="round" />
      {/* 体（ワンピース） */}
      <path d="M 28 55 Q 25 60 22 80 L 58 80 Q 55 60 52 55 Z" fill={ribbonColor} />
      {/* 襟 */}
      <path d="M 34 55 L 40 62 L 46 55" stroke="white" strokeWidth="1.5" fill="none" />
      {/* 腕 */}
      <line x1="25" y1="60" x2="15" y2="72" stroke="#FFE0BD" strokeWidth="4" strokeLinecap="round" />
      <line x1="55" y1="60" x2="65" y2="72" stroke="#FFE0BD" strokeWidth="4" strokeLinecap="round" />
      {/* 星（excited時のみ） */}
      {mood === "excited" && (
        <>
          <text x="5" y="20" fontSize="10" className="animate-bounce">✨</text>
          <text x="62" y="15" fontSize="8" className="animate-bounce" style={{ animationDelay: "0.3s" }}>⭐</text>
        </>
      )}
    </svg>
  );
}
