import type { Response } from "express";

export interface SSEWriter {
  sendStatus(message: string): void;
  sendResult(data: unknown): void;
  sendError(error: string): void;
  startHeartbeat(): void;
  stopHeartbeat(): void;
}

export function initSSE(res: Response): SSEWriter {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // Disable Heroku's nginx buffering
  });

  let heartbeatInterval: NodeJS.Timeout | null = null;

  // Clean up if client disconnects mid-stream
  res.on("close", () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  });

  function write(event: string, data: unknown): void {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  return {
    sendStatus(message: string) {
      write("status", { message });
    },
    sendResult(data: unknown) {
      this.stopHeartbeat();
      write("result", data);
      res.end();
    },
    sendError(error: string) {
      this.stopHeartbeat();
      write("error", { error });
      res.end();
    },
    startHeartbeat() {
      heartbeatInterval = setInterval(() => {
        write("heartbeat", {});
      }, 10_000);
    },
    stopHeartbeat() {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
    },
  };
}
