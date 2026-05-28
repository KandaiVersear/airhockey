"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function parseScore(value: string | null) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

function ScorePanel({
  title,
  score,
  accent,
  active,
  fill,
}: {
  title: string;
  score: number;
  accent: string;
  active: boolean;
  fill: number;
}) {
  return (
    <section
      className={[
        "relative overflow-hidden rounded-[1.5rem] border p-5 sm:p-6",
        active
          ? `border-white/25 bg-gradient-to-br ${accent} shadow-[0_0_60px_-20px_rgba(255,255,255,0.35)]`
          : "border-white/10 bg-white/5",
      ].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
      <p className="text-[0.65rem] uppercase tracking-[0.45em] text-white/70">
        {title}
      </p>
      <div className="mt-4 flex items-end gap-3">
        <span className="text-7xl font-black leading-none tracking-tighter text-white tabular-nums sm:text-8xl">
          {score}
        </span>
        <span className="pb-2 text-sm uppercase tracking-[0.4em] text-white/60">
          pts
        </span>
      </div>
      <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${
            title === "BLUE" ? "bg-cyan-300" : "bg-rose-300"
          }`}
          style={{ width: `${fill}%` }}
        />
      </div>
    </section>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const result = useMemo(() => {
    const score1 = parseScore(
      searchParams.get("score1") ??
        searchParams.get("p1") ??
        searchParams.get("player1"),
    );
    const score2 = parseScore(
      searchParams.get("score2") ??
        searchParams.get("p2") ??
        searchParams.get("player2"),
    );
    const diff = Math.abs(score1 - score2);
    const isDraw = score1 === score2;
    const winner = isDraw ? "DRAW" : score1 > score2 ? "BLUE" : "RED";
    const winnerScore = Math.max(score1, score2);
    const loserScore = Math.min(score1, score2);
    const total = Math.max(score1 + score2, 1);
    const blueFill = Math.max(
      12,
      Math.round((score1 / Math.max(winnerScore, 1)) * 100),
    );
    const redFill = Math.max(
      12,
      Math.round((score2 / Math.max(winnerScore, 1)) * 100),
    );

    return {
      score1,
      score2,
      diff,
      isDraw,
      winner,
      winnerScore,
      loserScore,
      total,
      blueFill,
      redFill,
    };
  }, [searchParams]);

  const gapLabel = result.isDraw ? "EVEN MATCH" : `+${result.diff}`;
  const verdictLabel = result.isDraw
    ? "DRAW"
    : result.winner === "BLUE"
      ? "BLUE WINS"
      : "RED WINS";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.24),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(244,63,94,0.18),_transparent_30%),linear-gradient(180deg,_#050816_0%,_#080d1f_55%,_#02040b_100%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -right-24 top-12 h-80 w-80 rounded-full bg-rose-400/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="mb-6 flex flex-col gap-4 text-center sm:mb-8">
            <p className="text-xs uppercase tracking-[0.6em] text-cyan-200/80">
              MATCH COMPLETE
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
              {verdictLabel}
            </h1>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_40px_140px_-60px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
              <ScorePanel
                title="BLUE"
                score={result.score1}
                accent="from-cyan-500/25 to-cyan-300/10"
                active={!result.isDraw && result.winner === "BLUE"}
                fill={
                  result.isDraw
                    ? 88
                    : result.winner === "BLUE"
                      ? 100
                      : result.blueFill
                }
              />

              <div className="flex min-h-[220px] items-center justify-center rounded-[1.5rem] border border-white/10 bg-black/25 px-6 py-8 text-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.45em] text-white/55">
                    POINT GAP
                  </p>
                  <div className="mt-4 text-7xl font-black tracking-tighter text-white sm:text-8xl">
                    {gapLabel}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-white/60">
                    {result.isDraw
                      ? "互角の戦い。最後まで目が離せない接戦でした。"
                      : `${result.winner === "BLUE" ? "BLUE" : "RED"} が ${result.loserScore} 対 ${result.winnerScore} で制しました。`}
                  </p>
                  <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                </div>
              </div>

              <ScorePanel
                title="RED"
                score={result.score2}
                accent="from-rose-500/25 to-rose-300/10"
                active={!result.isDraw && result.winner === "RED"}
                fill={
                  result.isDraw
                    ? 88
                    : result.winner === "RED"
                      ? 100
                      : result.redFill
                }
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-semibold tracking-wide text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/20"
              >
                ロビーに戻る
              </button>
              <div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-center text-sm text-white/55">
                FINAL SCORE {result.score1} - {result.score2} | TOTAL{" "}
                {result.total}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
