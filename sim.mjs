// Quick simulation to verify the new fluctuation feels NISA-like.
// Runs 10 different seeds over 5 game-years (1825 days) and reports stats.

function seededRandom(seed) {
  const next = (seed * 1664525 + 1013904223) & 0x7fffffff;
  return { value: next / 0x7fffffff, nextSeed: next };
}

function step(prevIndex, seed, prevVol, prevRegime, prevDaysLeft) {
  let s = seed;
  const rand = () => {
    const r = seededRandom(s);
    s = r.nextSeed;
    return r.value;
  };

  let regime = prevRegime;
  let daysLeft = prevDaysLeft - 1;

  if (daysLeft <= 0 && regime !== "normal") {
    regime = "normal";
    daysLeft = 0;
  }

  if (regime === "normal") {
    const r = rand();
    if (r < 0.0004) {
      regime = "bear";
      daysLeft = 60 + Math.floor(rand() * 60);
    } else if (r < 0.006) {
      regime = "correction";
      daysLeft = 15 + Math.floor(rand() * 25);
    }
  }

  let drift;
  if (regime === "bear") drift = -0.0018;
  else if (regime === "correction") drift = -0.003;
  else drift = 0.0009;

  const targetVol = regime === "normal" ? 1.0 : 1.9;
  const vol = Math.min(3.0, Math.max(0.5, prevVol * 0.95 + targetVol * 0.05));

  const r1 = rand();
  const r2 = rand();
  const normalish = (r1 + r2 - 1) * 2;
  let daily = drift + normalish * 0.008 * vol;

  const rJump = rand();
  if (rJump < 0.015) {
    const rDir = rand();
    const bias = regime === "normal" ? 0 : -0.01;
    daily += (rDir - 0.5) * 0.04 + bias;
  }

  const newIndex = Math.max(500, prevIndex * (1 + daily));
  return { index: newIndex, seed: s, vol, regime, daysLeft };
}

function runSim(startSeed, days) {
  let idx = 5000;
  let seed = startSeed;
  let vol = 1.0;
  let regime = "normal";
  let daysLeft = 0;
  const history = [idx];
  const regimeCounts = { normal: 0, correction: 0, bear: 0 };

  for (let d = 0; d < days; d++) {
    const r = step(idx, seed, vol, regime, daysLeft);
    idx = r.index;
    seed = r.seed;
    vol = r.vol;
    regime = r.regime;
    daysLeft = r.daysLeft;
    history.push(idx);
    regimeCounts[regime]++;
  }

  // max drawdown
  let peak = history[0];
  let maxDD = 0;
  for (const v of history) {
    if (v > peak) peak = v;
    const dd = (v - peak) / peak;
    if (dd < maxDD) maxDD = dd;
  }

  const finalIdx = history[history.length - 1];
  const years = days / 365;
  const cagr = Math.pow(finalIdx / history[0], 1 / years) - 1;

  return { startIdx: history[0], finalIdx, cagr, maxDD, regimeCounts, history };
}

console.log("=== 5年シミュレーション（10シード）===\n");
console.log("seed | 最終値 | CAGR   | 最大DD  | 通常/調整/弱気 (日数)");
console.log("-----+--------+--------+---------+--------------------");
const seeds = [42, 100, 200, 300, 500, 777, 1000, 1234, 2026, 9999];
for (const s of seeds) {
  const r = runSim(s, 1825);
  const c = r.regimeCounts;
  console.log(
    `${String(s).padStart(4)} | ${r.finalIdx.toFixed(0).padStart(6)} | ${(r.cagr * 100).toFixed(1).padStart(5)}% | ${(r.maxDD * 100).toFixed(1).padStart(6)}% | ${c.normal}/${c.correction}/${c.bear}`
  );
}
