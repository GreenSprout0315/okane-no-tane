// おかねのタネ - ゲームエンジン

export interface DayRecord {
  day: number;
  date: string;
  indexValue: number; // S&P500指数
  deposited: number; // その日の入金額
  totalDeposited: number; // 累計入金額
  units: number; // 購入口数
  totalUnits: number; // 累計口数
  portfolioValue: number; // 評価額
  profit: number; // 損益
}

export interface GameState {
  currentDay: number;
  totalDeposited: number;
  totalUnits: number;
  indexHistory: number[];
  records: DayRecord[];
  seed: number; // 乱数シード
}

// シンプルな疑似乱数生成器（シード付き）
function seededRandom(seed: number): { value: number; nextSeed: number } {
  const next = (seed * 1664525 + 1013904223) & 0x7fffffff;
  return { value: next / 0x7fffffff, nextSeed: next };
}

// S&P500風の指数を生成（実際のS&P500に近い変動特性）
function generateNextIndex(prevIndex: number, seed: number): { index: number; nextSeed: number } {
  const r1 = seededRandom(seed);
  const r2 = seededRandom(r1.nextSeed);

  // 正規分布に近い乱数（Box-Muller的な近似）
  const normalish = (r1.value + r2.value - 1) * 1.5;

  // 日次変動率: 平均+0.04%（年率約10%の上昇トレンド、S&P500の歴史的平均）、標準偏差1.1%
  const dailyReturn = 0.0004 + normalish * 0.011;

  // たまに大きな変動（3%の確率で2倍の変動 = 決算シーズンなど）
  const r3 = seededRandom(r2.nextSeed);
  const multiplier = r3.value < 0.03 ? 2.0 : 1.0;

  const newIndex = Math.max(500, prevIndex * (1 + dailyReturn * multiplier));

  return { index: Math.round(newIndex * 10) / 10, nextSeed: r3.nextSeed };
}

// ゲーム日付をフォーマット
function formatGameDate(day: number): string {
  const start = new Date(2026, 3, 1); // 2026年4月1日スタート
  start.setDate(start.getDate() + day - 1);
  return `${start.getFullYear()}/${start.getMonth() + 1}/${start.getDate()}`;
}

// 初期状態
export function createInitialState(): GameState {
  const initialSeed = 42;
  const initialIndex = 5000;

  return {
    currentDay: 0,
    totalDeposited: 0,
    totalUnits: 0,
    indexHistory: [initialIndex],
    records: [],
    seed: initialSeed,
  };
}

// 1日進める（100円預ける）
export function advanceDay(state: GameState): GameState {
  const deposit = 100;
  const newDay = state.currentDay + 1;

  // 新しい指数を生成
  const prevIndex = state.indexHistory[state.indexHistory.length - 1];
  const { index: newIndex, nextSeed } = generateNextIndex(prevIndex, state.seed);

  // 100円で口数を購入（指数が価格）
  const unitsBought = deposit / newIndex;
  const newTotalUnits = state.totalUnits + unitsBought;
  const newTotalDeposited = state.totalDeposited + deposit;

  // 評価額
  const portfolioValue = Math.round(newTotalUnits * newIndex);
  const profit = portfolioValue - newTotalDeposited;

  const record: DayRecord = {
    day: newDay,
    date: formatGameDate(newDay),
    indexValue: newIndex,
    deposited: deposit,
    totalDeposited: newTotalDeposited,
    units: Math.round(unitsBought * 10000) / 10000,
    totalUnits: Math.round(newTotalUnits * 10000) / 10000,
    portfolioValue,
    profit,
  };

  return {
    currentDay: newDay,
    totalDeposited: newTotalDeposited,
    totalUnits: newTotalUnits,
    indexHistory: [...state.indexHistory, newIndex],
    records: [...state.records, record],
    seed: nextSeed,
  };
}

// 複数日進める
export function advanceDays(state: GameState, days: number): GameState {
  let current = state;
  for (let i = 0; i < days; i++) {
    current = advanceDay(current);
  }
  return current;
}

// キャラクターの表情を決める
export function getCharacterMood(state: GameState): "happy" | "neutral" | "sad" | "excited" {
  if (state.records.length === 0) return "neutral";
  const latest = state.records[state.records.length - 1];
  const profitRate = latest.profit / latest.totalDeposited;

  if (profitRate > 0.1) return "excited";
  if (profitRate > 0) return "happy";
  if (profitRate > -0.05) return "neutral";
  return "sad";
}

// 花の成長段階（資産に応じて）
export function getGardenStage(totalValue: number): number {
  if (totalValue <= 0) return 0;
  if (totalValue < 500) return 1; // 種
  if (totalValue < 2000) return 2; // 芽
  if (totalValue < 5000) return 3; // つぼみ
  if (totalValue < 10000) return 4; // 小さな花
  if (totalValue < 30000) return 5; // 大きな花
  return 6; // 花畑
}
