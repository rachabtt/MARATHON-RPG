import { WebSocket, WebSocketServer } from "ws";

const PORT = 3001;
const wss = new WebSocketServer({ host: "0.0.0.0", port: PORT });

let currentState = null;

function sendJson(client, payload) {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(payload));
  }
}

function broadcast(payload) {
  for (const client of wss.clients) {
    sendJson(client, payload);
  }
}

wss.on("connection", (socket, request) => {
  const remoteAddress = request.socket.remoteAddress ?? "unknown";
  console.log(`[sync] client connected: ${remoteAddress}`);

  if (currentState) {
    sendJson(socket, {
      type: "STATE_UPDATE",
      state: currentState,
      source: "server",
    });
  }

  socket.on("message", (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage.toString());

      if (message.type === "STATE_UPDATE" && message.state) {
        currentState = message.state;
        broadcast({
          type: "STATE_UPDATE",
          state: currentState,
          source: message.source ?? "unknown",
        });
        return;
      }

      if (message.type === "RESET_STATE") {
        currentState = null;
        broadcast({
          type: "RESET_STATE",
          source: message.source ?? "unknown",
        });
      }
    } catch (error) {
      console.warn("[sync] ignored invalid message", error);
    }
  });

  socket.on("close", () => {
    console.log(`[sync] client disconnected: ${remoteAddress}`);
  });

  socket.on("error", (error) => {
    console.warn(`[sync] client error: ${error.message}`);
  });
});

wss.on("listening", () => {
  console.log(`[sync] WebSocket server listening on ws://0.0.0.0:${PORT}`);
});

wss.on("error", (error) => {
  console.error(`[sync] server error: ${error.message}`);
});
