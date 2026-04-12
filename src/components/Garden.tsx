"use client";

// 花の成長ステージを表示するガーデン
export function Garden({ stage, value }: { stage: number; value: number }) {
  return (
    <div className="relative w-full h-40 bg-gradient-to-b from-sky-200 to-green-200 rounded-2xl overflow-hidden border-2 border-green-300">
      {/* 空 */}
      <div className="absolute top-2 right-4">
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <circle cx="20" cy="20" r="12" fill="#FFD93D" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1={20 + 14 * Math.cos((angle * Math.PI) / 180)}
              y1={20 + 14 * Math.sin((angle * Math.PI) / 180)}
              x2={20 + 18 * Math.cos((angle * Math.PI) / 180)}
              y2={20 + 18 * Math.sin((angle * Math.PI) / 180)}
              stroke="#FFD93D"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>

      {/* 地面 */}
      <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-amber-700 to-green-400 rounded-b-2xl" />

      {/* 花 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        {stage === 0 && (
          <div className="text-center text-sm text-green-700 font-bold">
            タネをまこう！
          </div>
        )}
        {stage === 1 && (
          <svg viewBox="0 0 40 40" className="w-10 h-10">
            <ellipse cx="20" cy="32" rx="6" ry="4" fill="#8B6914" />
            <text x="14" y="30" fontSize="12">🌱</text>
          </svg>
        )}
        {stage === 2 && (
          <div className="text-4xl">🌿</div>
        )}
        {stage === 3 && (
          <div className="text-5xl">🌷</div>
        )}
        {stage === 4 && (
          <div className="text-5xl animate-pulse">🌸</div>
        )}
        {stage === 5 && (
          <div className="flex gap-1 items-end">
            <span className="text-4xl">🌸</span>
            <span className="text-5xl animate-pulse">🌺</span>
            <span className="text-4xl">🌸</span>
          </div>
        )}
        {stage >= 6 && (
          <div className="flex gap-1 items-end">
            <span className="text-3xl">🌻</span>
            <span className="text-4xl">🌸</span>
            <span className="text-5xl animate-pulse">🌺</span>
            <span className="text-4xl">🌸</span>
            <span className="text-3xl">🌻</span>
          </div>
        )}
      </div>

      {/* 評価額バッジ */}
      {value > 0 && (
        <div className="absolute top-2 left-2 bg-white/80 backdrop-blur rounded-full px-3 py-1 text-sm font-bold text-green-700">
          💰 {value.toLocaleString()}円
        </div>
      )}
    </div>
  );
}
