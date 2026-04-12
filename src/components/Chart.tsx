"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import type { DayRecord } from "@/lib/game-engine";

export function IndexChart({ records }: { records: DayRecord[] }) {
  if (records.length === 0) return null;

  const data = records.map((r) => ({
    day: `${r.day}日目`,
    "S&P500": Math.round(r.indexValue),
  }));

  return (
    <div className="w-full h-44">
      <p className="text-xs text-center text-gray-500 mb-1">S&P500のうごき</p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" />
          <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(data.length / 6) - 1)} />
          <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
          <Tooltip />
          <Line type="monotone" dataKey="S&P500" stroke="#f59e0b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PortfolioChart({ records }: { records: DayRecord[] }) {
  if (records.length === 0) return null;

  const data = records.map((r) => ({
    day: `${r.day}日目`,
    評価額: r.portfolioValue,
    元本: r.totalDeposited,
  }));

  return (
    <div className="w-full h-44">
      <p className="text-xs text-center text-gray-500 mb-1">おかねのそだちぐあい</p>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#bbf7d0" />
          <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(data.length / 6) - 1)} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value) => `${Number(value).toLocaleString()}円`} />
          <Area type="monotone" dataKey="元本" stroke="#94a3b8" fill="#e2e8f0" strokeWidth={1} />
          <Area type="monotone" dataKey="評価額" stroke="#22c55e" fill="#bbf7d0" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
