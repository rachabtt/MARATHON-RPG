import type { MissionControlState } from "./syncState";

export type NetworkSyncStatus = "connected" | "disconnected";

interface StateUpdateMessage {
  type: "STATE_UPDATE";
  state: MissionControlState;
  source: string;
}

interface ResetStateMessage {
  type: "RESET_STATE";
  source: string;
}

type NetworkSyncMessage = StateUpdateMessage | ResetStateMessage;

const RECONNECT_DELAY_MS = 2000;
const CLIENT_ID_STORAGE_KEY = "m01_network_sync_client_id";

let socket: WebSocket | null = null;
let reconnectTimer: number | null = null;
let shouldReconnect = false;
let currentStatus: NetworkSyncStatus = "disconnected";
let remoteStateHandler: ((state: MissionControlState, source: string) => void) | null = null;
let statusHandler: ((status: NetworkSyncStatus) => void) | null = null;

export const networkClientId = getOrCreateClientId();

function getOrCreateClientId(): string {
  try {
    const stored = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
    if (stored) return stored;

    const generated =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    localStorage.setItem(CLIENT_ID_STORAGE_KEY, generated);
    return generated;
  } catch {
    return `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function setStatus(status: NetworkSyncStatus) {
  if (currentStatus === status) return;
  currentStatus = status;
  statusHandler?.(status);
}

function getSyncUrl(): string {
  const host = window.location.hostname || "localhost";
  return `ws://${host}:3001`;
}

function scheduleReconnect() {
  if (!shouldReconnect || reconnectTimer !== null) return;

  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    openSocket();
  }, RECONNECT_DELAY_MS);
}

function openSocket() {
  if (!shouldReconnect || typeof WebSocket === "undefined") return;
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

  try {
    socket = new WebSocket(getSyncUrl());
  } catch {
    socket = null;
    setStatus("disconnected");
    scheduleReconnect();
    return;
  }

  socket.addEventListener("open", () => {
    setStatus("connected");
  });

  socket.addEventListener("message", (event) => {
    try {
      const message = JSON.parse(String(event.data)) as NetworkSyncMessage;
      if (message.type === "STATE_UPDATE" && message.state) {
        remoteStateHandler?.(message.state, message.source);
      }
    } catch {
      // Ignore malformed network messages.
    }
  });

  socket.addEventListener("close", () => {
    socket = null;
    setStatus("disconnected");
    scheduleReconnect();
  });

  socket.addEventListener("error", () => {
    setStatus("disconnected");
  });
}

export function connectNetworkSync(
  onRemoteStateReceived: (state: MissionControlState, source: string) => void,
  onStatusChanged?: (status: NetworkSyncStatus) => void
): () => void {
  remoteStateHandler = onRemoteStateReceived;
  statusHandler = onStatusChanged ?? null;
  shouldReconnect = true;
  statusHandler?.(currentStatus);
  openSocket();

  return () => {
    shouldReconnect = false;
    remoteStateHandler = null;
    statusHandler = null;

    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (socket) {
      socket.close();
      socket = null;
    }

    setStatus("disconnected");
  };
}

export function sendNetworkState(state: MissionControlState): boolean {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return false;
  }

  const message: StateUpdateMessage = {
    type: "STATE_UPDATE",
    state,
    source: networkClientId,
  };

  socket.send(JSON.stringify(message));
  return true;
}

export function getNetworkSyncStatus(): NetworkSyncStatus {
  return currentStatus;
}
