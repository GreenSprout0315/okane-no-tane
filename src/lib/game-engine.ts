// おかねのタネ - ゲームエンジン

export type Regime = "normal" | "correction" | "bear";

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
  regime?: Regime; // 相場局面（記録用）
}

export interface GameState {
  currentDay: number;
  totalDeposited: number;
  totalUnits: number;
  indexHistory: number[];
  records: DayRecord[];
  seed: number; // 乱数シード
  volatility?: number; // 直近ボラティリティ（1.0=平常）
  regime?: Regime; // 現在の相場局面
  regimeDaysLeft?: number; // 局面の残日数
}

// シンプルな疑似乱数生成器（シード付き）
function seededRandom(seed: number): { value: number; nextSeed: number } {
  const next = (seed * 1664525 + 1013904223) & 0x7fffffff;
  return { value: next / 0x7fffffff, nextSeed: next };
}

// NISA（S&P500等）を模した変動ロジック。
// 通常は年+7〜10%で上昇、ボラティリティ・クラスタリングで荒れる時期が続き、
// 年1回程度の軽い調整（-5〜10%）、数年に1回の弱気相場（-20〜30%）を混ぜる。
interface NextStep {
  index: number;
  nextSeed: number;
  volatility: number;
  regime: Regime;
  regimeDaysLeft: number;
}

function generateNextStep(
  prevIndex: number,
  seed: number,
  prevVolatility: number,
  prevRegime: Regime,
  prevRegimeDaysLeft: number
): NextStep {
  let s = seed;
  const rand = () => {
    const r = seededRandom(s);
    s = r.nextSeed;
    return r.value;
  };

  // --- 1. 局面遷移 ---
  let regime: Regime = prevRegime;
  let daysLeft = prevRegimeDaysLeft - 1;

  if (daysLeft <= 0 && regime !== "normal") {
    // 調整／弱気が終わったら通常に戻る
    regime = "normal";
    daysLeft = 0;
  }

  if (regime === "normal") {
    // 通常局面からの発生判定
    const r = rand();
    if (r < 0.0004) {
      // 弱気相場：約7年に1回（60〜120日、累計-15〜-30%）
      regime = "bear";
      daysLeft = 60 + Math.floor(rand() * 60);
    } else if (r < 0.006) {
      // 軽い調整：年1〜2回（15〜40日、累計-5〜-12%）
      regime = "correction";
      daysLeft = 15 + Math.floor(rand() * 25);
    }
  }

  // --- 2. 局面ごとのドリフト（日次平均リターン） ---
  let drift: number;
  if (regime === "bear") drift = -0.0018;
  else if (regime === "correction") drift = -0.003;
  else drift = 0.0009; // 通常: +0.09%/日 → 年率約20% … 下落局面と合わせて長期+7〜10%に着地

  // --- 3. ボラティリティ・クラスタリング（GARCH-lite） ---
  // 下落局面は高ボラが続く。平常時は1.0に緩やかに回帰。
  const targetVol = regime === "normal" ? 1.0 : 1.9;
  const volatility = Math.min(
    3.0,
    Math.max(0.5, prevVolatility * 0.95 + targetVol * 0.05)
  );

  // --- 4. 日次リターン ---
  const r1 = rand();
  const r2 = rand();
  const normalish = (r1 + r2 - 1) * 2; // Box-Muller近似
  const baseStdev = 0.008; // 基礎ボラ0.8%
  let dailyReturn = drift + normalish * baseStdev * volatility;

  // --- 5. まれに大きなジャンプ（決算・地政学リスク等） ---
  const rJump = rand();
  if (rJump < 0.015) {
    const rDir = rand();
    // 下落局面では下方向に偏りやすい
    const bias = regime === "normal" ? 0 : -0.01;
    dailyReturn += (rDir - 0.5) * 0.04 + bias;
  }

  const newIndex = Math.max(500, prevIndex * (1 + dailyReturn));

  return {
    index: Math.round(newIndex * 10) / 10,
    nextSeed: s,
    volatility,
    regime,
    regimeDaysLeft: daysLeft,
  };
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
    volatility: 1.0,
    regime: "normal",
    regimeDaysLeft: 0,
  };
}

// 1日進める（100円預ける）
export function advanceDay(state: GameState): GameState {
  const deposit = 100;
  const newDay = state.currentDay + 1;

  const prevIndex = state.indexHistory[state.indexHistory.length - 1];
  const step = generateNextStep(
    prevIndex,
    state.seed,
    state.volatility ?? 1.0,
    state.regime ?? "normal",
    state.regimeDaysLeft ?? 0
  );

  // 100円で口数を購入（指数が価格）
  const unitsBought = deposit / step.index;
  const newTotalUnits = state.totalUnits + unitsBought;
  const newTotalDeposited = state.totalDeposited + deposit;

  // 評価額
  const portfolioValue = Math.round(newTotalUnits * step.index);
  const profit = portfolioValue - newTotalDeposited;

  const record: DayRecord = {
    day: newDay,
    date: formatGameDate(newDay),
    indexValue: step.index,
    deposited: deposit,
    totalDeposited: newTotalDeposited,
    units: Math.round(unitsBought * 10000) / 10000,
    totalUnits: Math.round(newTotalUnits * 10000) / 10000,
    portfolioValue,
    profit,
    regime: step.regime,
  };

  return {
    currentDay: newDay,
    totalDeposited: newTotalDeposited,
    totalUnits: newTotalUnits,
    indexHistory: [...state.indexHistory, step.index],
    records: [...state.records, record],
    seed: step.nextSeed,
    volatility: step.volatility,
    regime: step.regime,
    regimeDaysLeft: step.regimeDaysLeft,
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
