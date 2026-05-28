import toast from "react-hot-toast";

// 接続が閉じたときのハンドラ
export const hanldeClose = (event: CloseEvent) => {
  if (
    [
      1000, 1001, 1002, 1003, 1005, 1006, 1007, 1008, 1011, 1012, 1013, 1015,
    ].includes(event.code)
  ) {
    const codeMessages: Record<string, string> = {
      1000: "正常終了しました (Normal Closure)",
      1001: "サーバーまたはクライアントが終了しました (Going Away)",
      1002: "プロトコルエラーが発生しました",
      1003: "不正なデータ型を受信しました",
      1005: "理由が明示されませんでした (No Status Received)",
      1006: "サーバーが応答しなかった、または切断されました (Abnormal Closure)",
      1007: "データが不正です",
      1008: "ポリシー違反が発生しました",
      1011: "サーバー内部エラーが発生しました",
      1012: "サーバーが再起動中です",
      1013: "一時的な過負荷により接続できません",
      1015: "TLSハンドシェイクに失敗しました",
    };
    if ([1000, 1001].includes(event.code))
      console.log(codeMessages[event.code]);
    else {
      console.error(codeMessages[event.code]);
      toast.error(`${codeMessages[event.code]}`);
    }
  } else
    console.error(
      `WebSocket closed with code ${event.code}, reason: ${event.reason}`,
    );
};

// メッセージハンドラ
export const handleMessage = (
  event: MessageEvent,
  handlers: Record<string, (msg: unknown) => void>,
) => {
  try {
    const raw = JSON.parse(event.data) as {
      type?: string;
      message?: unknown;
    };
    console.log("Received message:", raw);
    // 型安全なハンドラ呼び出し
    // 型(raw.type)によって適切なハンドラを呼び出す
    if (!raw.type) {
      console.warn("invalid type: missing message type");
      return;
    }

    const handler = handlers[raw.type];
    if (handler) handler(raw.message);
    else console.warn(`invalid type: ${raw.type}`);
  } catch (err) {
    console.error("invalid JSON message", err);
  }
};
