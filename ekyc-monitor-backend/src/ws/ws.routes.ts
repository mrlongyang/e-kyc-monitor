import { FastifyInstance } from "fastify";
import { addClient } from "./wsHub.js";

export async function websocketRoutes(app: FastifyInstance) {
  app.get("/ws", { websocket: true }, (socket) => {
    addClient(socket);

    socket.send(
      JSON.stringify({
        type: "connected",
        message: "Connected to eKYC Monitor WebSocket",
      })
    );
  });
}