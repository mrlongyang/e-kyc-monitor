import { WebSocket } from "ws";

const clients = new Set<WebSocket>();

export function addClient(socket: WebSocket) {
  clients.add(socket);

  socket.on("close", () => {
    clients.delete(socket);
  });
}

export function broadcast(data: unknown) {
  const message = JSON.stringify(data);

  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  }
}