const clients = new Set();
export function addClient(socket) {
    clients.add(socket);
    socket.on("close", () => {
        clients.delete(socket);
    });
}
export function broadcast(data) {
    const message = JSON.stringify(data);
    for (const client of clients) {
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    }
}
