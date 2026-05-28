let socket: WebSocket | null = null;
let lastKnownUserCount = 0;
let isConnected = false;

export function initSocket() {
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    // 環境変数からWebSocketのURLを取得
    const websocketUrl: string | undefined =
      process.env.NEXT_PUBLIC_WEBSOCKET_URL;

    if (!websocketUrl) {
      throw new Error("WEBSOCKET_URL が設定されていません");
    }

    socket = new WebSocket(websocketUrl);

    socket.addEventListener("open", () => {
      isConnected = true;
      console.log("WebSocket接続成功:SocketOS");
    });

    socket.addEventListener("error", (event) => {
      console.log("WebSocketエラー", event, ":SocketOS");
    });
    socket.addEventListener("close", (event) => {
      isConnected = false;
      // console.log(event);
      console.log(
        "WebSocket接続が閉じました",
        event.code,
        event.reason,
        ":SocketOS",
      );
    });
  }
  isConnected = socket?.readyState === WebSocket.OPEN;
  return socket;
}

export function sendMessage(msg: unknown) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg));
  } else {
    console.log("WebSocketが未接続です:SocketOS");
  }
}

export function getSocket() {
  return socket;
}

export function setLastKnownUserCount(count: number) {
  lastKnownUserCount = count;
}

export function getLastKnownUserCount() {
  return lastKnownUserCount;
}

export function getSocketConnectionState() {
  return isConnected || socket?.readyState === WebSocket.OPEN;
}
