"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSocket, sendMessage } from "@/lib/websocket";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { GameState, GameUpdateState } from "@/types/gamestate";
import { handleMessage, hanldeClose } from "@/lib/websocketHandler";

const width = 640;
const height = 320;

const mockGameState: GameState = {
  gameSession: {
    PuckX: width / 2,
    PuckY: height / 2,
    Player1X: width / 4,
    Player1Y: height / 2,
    Player2X: (width * 3) / 4,
    Player2Y: height / 2,
    Score1: 0,
    Score2: 0,
    TimeLeftSec: 300,
  },
  PuddleRadius: 20,
  PuckRadius: 10,
};

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(mockGameState);
  const gameStateRef = useRef(gameState);
  const router = useRouter();
  const dev = "";
  // dev = "dev";

  // WebSocketからのメッセージを処理するハンドラ
  const handlers = useMemo<Record<string, (msg: unknown) => void>>(
    () => ({
      gameUpdate: (msg: GameUpdateState) => {
        gameStateRef.current = {
          ...gameStateRef.current,
          gameSession: msg,
        };
        setGameState(gameStateRef.current);
      },
      errorMessage: (msg: unknown) => toast.error(String(msg)),
      websocketClose: () => router.push("/"),
      // ゲーム終了時は結果ページへ遷移する
      gameSet: () =>
        router.push(
          `/result?score1=${gameStateRef.current.gameSession.Score1}&score2=${gameStateRef.current.gameSession.Score2}`,
        ),
      gameStart: (msg: unknown) =>
        router.push(`/game?id=${encodeURIComponent(String(msg))}`),
    }),
    [router],
  );

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    // WebSocket接続を取得
    const socket = getSocket();
    const handleMessageBatch = (event: MessageEvent) => {
      handleMessage(event, handlers);
    };

    if (!socket) {
      // 直接 /game にアクセスした場合、接続がないのでロビーに戻す
      if (dev != "dev") {
        toast.error("接続が切れています。ロビーに戻ります。");
        router.push("/");
        return;
      }
    } else {
      // イベントにハンドラを登録
      socket.addEventListener("message", handleMessageBatch);
      socket.addEventListener("close", hanldeClose);
    }

    // アニメーションループを開始
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error("Canvas not found");
      return;
    }
    const ctx = canvas.getContext("2d")!;

    let animationId: number;

    const loop = () => {
      const current = gameStateRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // パドル1描画
      ctx.beginPath();
      ctx.arc(
        current.gameSession.Player1X,
        current.gameSession.Player1Y,
        current.PuddleRadius,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = "blue";
      ctx.fill();

      // パドル2描画
      ctx.beginPath();
      ctx.arc(
        current.gameSession.Player2X,
        current.gameSession.Player2Y,
        current.PuddleRadius,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = "red";
      ctx.fill();

      // パック描画
      ctx.beginPath();
      ctx.arc(
        current.gameSession.PuckX,
        current.gameSession.PuckY,
        current.PuckRadius,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = "black";
      ctx.fill();

      animationId = requestAnimationFrame(loop);
    };

    loop();

    // クリーンアップ 画面遷移時にアンマウントする
    return () => {
      if (socket) {
        socket.removeEventListener("message", handleMessageBatch);
        socket.removeEventListener("close", hanldeClose);
      }
      cancelAnimationFrame(animationId);
    };
  }, [handlers, router]);

  const lastSentRef = useRef(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const now = Date.now();
    if (now - lastSentRef.current < 16) return; // 約60fps制限

    lastSentRef.current = now;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    sendMessage({
      type: "game",
      position: { PlayerX: x, PlayerY: y },
    });
  };

  if (!gameState) {
    return <div className="p-4 text-xl">ゲームデータを待機中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-white">
      {/* HUD（上部情報） */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-4 px-2">
        <div className="text-lg font-semibold">
          ⏱ 残り時間: {Math.floor(gameState.gameSession.TimeLeftSec)} 秒
        </div>
        <div className="text-lg font-mono">
          {gameState.gameSession.Score1} - {gameState.gameSession.Score2}
        </div>
      </div>

      {/* ゲームエリア */}
      <div className="bg-gray-800 p-4 rounded-xl shadow-lg">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="border border-gray-600 rounded bg-white"
          onMouseMove={handleMouseMove}
        />
      </div>

      {/* 補助情報 */}
      <div className="mt-4 text-sm text-gray-400">マウスでパドルを操作</div>
    </div>
  );
}
