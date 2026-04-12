"use client";

import { useState, useCallback } from "react";
import {
  createInitialState,
  advanceDay,
  advanceDays,
  getCharacterMood,
  getGardenStage,
  type GameState,
} from "@/lib/game-engine";
import { Character } from "@/components/Character";
import { Garden } from "@/components/Garden";
import { IndexChart, PortfolioChart } from "@/components/Chart";

interface PlayerProfile {
  name: string;
  color: string;
  ribbonColor: string;
  headerFrom: string;
  headerTo: string;
}

const PLAYERS: Record<string, PlayerProfile> = {
  kotone: {
    name: "ことね",
    color: "text-pink-600",
    ribbonColor: "#FF6B9D",
    headerFrom: "from-pink-400",
    headerTo: "to-orange-300",
  },
  iroha: {
    name: "いろは",
    color: "text-purple-600",
    ribbonColor: "#A78BFA",
    headerFrom: "from-purple-400",
    headerTo: "to-blue-300",
  },
};

function storageKey(playerId: string) {
  return `okane-no-tane-${playerId}`;
}

function loadGame(playerId: string): GameState {
  if (typeof window === "undefined") return createInitialState();
  try {
    const saved = localStorage.getItem(storageKey(playerId));
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return createInitialState();
}

function saveGame(playerId: string, state: GameState) {
  try {
    localStorage.setItem(storageKey(playerId), JSON.stringify(state));
  } catch {
    // ignore
  }
}

function loadSelectedPlayer(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("okane-no-tane-player");
}

function saveSelectedPlayer(playerId: string) {
  localStorage.setItem("okane-no-tane-player", playerId);
}

// --- キャラクター選択画面 ---
function PlayerSelect({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-yellow-50 to-purple-50 flex flex-col">
      <header className="bg-gradient-to-r from-pink-400 to-purple-400 text-white py-4 px-4 shadow-lg">
        <h1 className="text-center text-xl font-bold tracking-wider">
          🌱 おかねのタネ 🌸
        </h1>
        <p className="text-center text-xs opacity-90">だれであそぶ？</p>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="flex gap-6">
          {Object.entries(PLAYERS).map(([id, player]) => (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer flex flex-col items-center gap-3 border-2 border-transparent hover:border-pink-200"
            >
              <Character mood="happy" ribbonColor={player.ribbonColor} />
              <p className={`text-lg font-bold ${player.color}`}>{player.name}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

// --- メインゲーム画面 ---
function GameScreen({ playerId, onBack }: { playerId: string; onBack: () => void }) {
  const player = PLAYERS[playerId];
  const [game, setGame] = useState<GameState>(() => loadGame(playerId));
  const [showMessage, setShowMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"garden" | "index" | "portfolio">("garden");

  const updateGame = useCallback((newState: GameState) => {
    setGame(newState);
    saveGame(playerId, newState);
  }, [playerId]);

  const handleDeposit = () => {
    const newState = advanceDay(game);
    updateGame(newState);
    const latest = newState.records[newState.records.length - 1];
    if (latest.profit > 0) {
      setShowMessage(`やったー！${latest.profit.toLocaleString()}円ふえたよ！`);
    } else if (latest.profit < 0) {
      setShowMessage(`あれれ…${Math.abs(latest.profit).toLocaleString()}円へっちゃった`);
    } else {
      setShowMessage("おかねをあずけたよ！");
    }
    setTimeout(() => setShowMessage(null), 2500);
  };

  const handleSkip = (days: number) => {
    const newState = advanceDays(game, days);
    updateGame(newState);
    const latest = newState.records[newState.records.length - 1];
    const profitRate = Math.round((latest.profit / latest.totalDeposited) * 100);
    setShowMessage(
      `${days}日すすめたよ！${profitRate >= 0 ? "+" : ""}${profitRate}%`
    );
    setTimeout(() => setShowMessage(null), 3000);
  };

  const handleReset = () => {
    if (confirm("ほんとうにリセットする？おかねがぜんぶなくなるよ！")) {
      const newState = createInitialState();
      updateGame(newState);
      setShowMessage(null);
    }
  };

  const latestRecord = game.records.length > 0 ? game.records[game.records.length - 1] : null;
  const mood = getCharacterMood(game);
  const gardenStage = getGardenStage(latestRecord?.portfolioValue ?? 0);
  const profitRate = latestRecord
    ? Math.round((latestRecord.profit / latestRecord.totalDeposited) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-yellow-50 to-green-50">
      {/* ヘッダー */}
      <header className={`bg-gradient-to-r ${player.headerFrom} ${player.headerTo} text-white py-3 px-4 shadow-lg`}>
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button onClick={onBack} className="text-white/80 hover:text-white text-sm cursor-pointer">
            ← もどる
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-wider">
              🌱 おかねのタネ 🌸
            </h1>
            <p className="text-xs opacity-90">まいにち100円、おかねをそだてよう！</p>
          </div>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* キャラクターエリア */}
        <div className="flex items-center justify-center gap-4">
          <Character mood={mood} ribbonColor={player.ribbonColor} />
          <div className="space-y-1">
            <p className={`text-lg font-bold ${player.color}`}>{player.name}</p>
            <p className="text-xs text-gray-500">
              {game.currentDay === 0
                ? "はじめまして！"
                : `${game.currentDay}日目`}
            </p>
            {latestRecord && (
              <div className="bg-white rounded-xl p-2 shadow-sm space-y-0.5">
                <p className="text-xs text-gray-400">あずけたおかね</p>
                <p className="text-sm font-bold">{latestRecord.totalDeposited.toLocaleString()}円</p>
                <p className="text-xs text-gray-400">いまのかち</p>
                <p className={`text-sm font-bold ${latestRecord.profit >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {latestRecord.portfolioValue.toLocaleString()}円
                  <span className="text-xs ml-1">
                    ({profitRate >= 0 ? "+" : ""}{profitRate}%)
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* メッセージ吹き出し */}
        {showMessage && (
          <div className="bg-white rounded-2xl p-3 text-center shadow-md border-2 border-pink-200 animate-bounce text-sm font-bold text-pink-600">
            {showMessage}
          </div>
        )}

        {/* メインボタン */}
        <button
          onClick={handleDeposit}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-4 rounded-2xl shadow-lg text-lg active:scale-95 transition-transform cursor-pointer"
        >
          💰 100円あずける！
        </button>

        {/* 早送りボタン */}
        <div className="flex gap-2">
          <button
            onClick={() => handleSkip(7)}
            className="flex-1 bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold py-2 rounded-xl text-sm active:scale-95 transition-transform cursor-pointer"
          >
            ⏩ 1週間
          </button>
          <button
            onClick={() => handleSkip(30)}
            className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold py-2 rounded-xl text-sm active:scale-95 transition-transform cursor-pointer"
          >
            ⏩ 1か月
          </button>
          <button
            onClick={() => handleSkip(365)}
            className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold py-2 rounded-xl text-sm active:scale-95 transition-transform cursor-pointer"
          >
            ⏩ 1年
          </button>
        </div>

        {/* タブ切り替え */}
        <div className="flex rounded-xl bg-gray-100 p-1">
          {(["garden", "index", "portfolio"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                activeTab === tab
                  ? "bg-white text-pink-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab === "garden" ? "🌸 おにわ" : tab === "index" ? "📈 S&P500" : "📊 おかね"}
            </button>
          ))}
        </div>

        {/* コンテンツエリア */}
        <div className="bg-white rounded-2xl p-3 shadow-sm">
          {activeTab === "garden" && (
            <Garden stage={gardenStage} value={latestRecord?.portfolioValue ?? 0} />
          )}
          {activeTab === "index" && <IndexChart records={game.records} />}
          {activeTab === "portfolio" && <PortfolioChart records={game.records} />}
        </div>

        {/* S&P500の説明 */}
        <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
          <p className="text-xs text-yellow-800 font-bold mb-1">📈 S&P500ってなに？</p>
          <p className="text-xs text-yellow-700 leading-relaxed">
            S&P500は、アメリカの大きな会社500社のねだんをまとめたもの。
            会社がもうかるとあがって、うまくいかないとさがるよ。
            でも、まいにちコツコツあずけると、すこしずつそだっていくんだ！
          </p>
          {latestRecord && (
            <p className="text-xs text-yellow-600 mt-1 font-bold">
              きょうのS&P500: {latestRecord.indexValue}（スタート: 5,000）
            </p>
          )}
        </div>

        {/* リセットボタン */}
        <div className="text-center pb-4">
          <button
            onClick={handleReset}
            className="text-xs text-gray-300 hover:text-gray-500 underline cursor-pointer"
          >
            ゲームをリセット
          </button>
        </div>
      </main>
    </div>
  );
}

// --- ルート ---
export default function Home() {
  const [playerId, setPlayerId] = useState<string | null>(loadSelectedPlayer);

  const handleSelect = (id: string) => {
    saveSelectedPlayer(id);
    setPlayerId(id);
  };

  const handleBack = () => {
    setPlayerId(null);
    localStorage.removeItem("okane-no-tane-player");
  };

  if (!playerId) {
    return <PlayerSelect onSelect={handleSelect} />;
  }

  return <GameScreen playerId={playerId} onBack={handleBack} />;
}
