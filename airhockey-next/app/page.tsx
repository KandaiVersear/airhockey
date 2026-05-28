"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getLastKnownUserCount,
  getSocketConnectionState,
  initSocket,
  sendMessage,
  setLastKnownUserCount,
} from "@/lib/websocket";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { handleMessage, hanldeClose } from "@/lib/websocketHandler";

export default function HomePage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(() => getSocketConnectionState());
  const [roomId, setRoomId] = useState("");
  const [roomIdInput, setRoomIdInput] = useState("");
  const [roomNum, setRoomNum] = useState(0);
  const [userCount, setUserCount] = useState(() => getLastKnownUserCount());
  const [isHost, setIsHost] = useState(false);

  const handleleaveRoom = useCallback(() => {
    setRoomId("");
    setIsHost(false);
    setRoomIdInput("");
    toast.success("ルームを退出しました");
  }, []);

  const handlers = useMemo<Record<string, (msg: unknown) => void>>(
    () => ({
      userNum: (msg) => {
        const count = Number(msg);
        setUserCount(count);
        setLastKnownUserCount(count);
      },
      roomId: (msg) => setRoomId(String(msg)),
      roomNum: (msg) => setRoomNum(Number(msg)),
      message: (msg) => toast.success(String(msg)),
      errorMessage: (msg) => toast.error(String(msg)),
      gameStart: () => router.push(`/game`),
      host: () => setIsHost(true),
      leaveRoom: () => handleleaveRoom(),
    }),
    [handleleaveRoom, router],
  );

  const handleCloseBatch = (event: CloseEvent) => {
    hanldeClose(event);
    setLastKnownUserCount(0);
    setRoomId("");
    setUserCount(0);
    setIsHost(false);
    setRoomIdInput("");
    setRoomNum(0);
    setIsOnline(false);
  };

  useEffect(() => {
    // WebSocketを初期化（既存接続があればそれを使用）
    const socket = initSocket();
    if (!socket) return;

    const handleMessageBatch = (event: MessageEvent) => {
      handleMessage(event, handlers);
    };

    // イベントにハンドラを登録
    socket.addEventListener("message", handleMessageBatch);
    socket.addEventListener("open", () => {
      setIsOnline(true);
    });
    socket.addEventListener("close", handleCloseBatch);

    // クリーンアップ 画面遷移時にアンマウントする
    return () => {
    socket.removeEventListener("message", handleMessageBatch);
    socket.removeEventListener("close", handleCloseBatch);
    };
  }, [handlers]);

  // ルーム作成のJSONを送信
  const makeRoom = () => {
    sendMessage({
      type: "makeRoom",
    });
  };

  // ルーム参加のJSONを送信
  const joinRoom = () => {
    sendMessage({
      type: "joinRoom",
      roomId: roomIdInput,
    });
    // 送信後に入力をクリア
    setRoomIdInput("");
  };

  // ルーム退出のJSONを送信
  const leaveRoom = () => {
    sendMessage({
      type: "leaveRoom",
    });
    // 送信後に入力をクリア
    setRoomIdInput("");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("コピーしました！");
    } catch {
      toast.error("コピーに失敗しました");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 space-y-6">
        {/* 接続状態 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isOnline ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm font-medium">
              {isOnline ? "オンライン" : "オフライン"}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            接続ユーザー: {userCount}
          </span>
        </div>

        {/* ルーム情報 */}
        {roomId && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3 border">
            <div>
              <p className="text-sm text-gray-500">ルームID</p>
              <p className="font-mono text-lg">{roomId}</p>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={handleCopy}
                className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
              >
                コピー
              </button>
              <span className="text-sm text-gray-600">人数: {roomNum}</span>
            </div>
          </div>
        )}

        {/* ルーム操作 */}
        <div className="space-y-3">
          <button
            onClick={makeRoom}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            ルーム作成
          </button>

          <div className="flex space-x-2">
            <input
              type="text"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              placeholder="ルームID"
              className="flex-1 border rounded px-3 py-2"
            />
            <button
              onClick={joinRoom}
              className="bg-green-500 text-white px-4 rounded hover:bg-green-600"
            >
              参加
            </button>
          </div>

          {isHost && (
            <button
              onClick={() =>
                sendMessage({
                  type: "match",
                })
              }
              className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
            >
              ゲーム開始
            </button>
          )}

          <button
            onClick={leaveRoom}
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
          >
            ルーム退出
          </button>
        </div>
      </div>
    </div>
  );
}
