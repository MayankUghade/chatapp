import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  socket: WebSocket;
  roomId: string;
}

let users: User[] = [];

wss.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("message", (rawMessage) => {
    const message = JSON.parse(rawMessage.toString());

    // JOIN ROOM
    if (message.type === "join") {
      users.push({
        socket,
        roomId: message.payload.roomId,
      });

      console.log("User joined room:", message.payload.roomId);
    }

    // CHAT MESSAGE
    if (message.type === "chat") {
      const senderRoom = users.find(
        (u) => u.socket === socket
      )?.roomId;

      if (!senderRoom) return;

      const outgoingMessage = JSON.stringify({
        type: "chat",
        payload: {
          message: message.payload.message,
        },
      });

      users.forEach((u) => {
        if (u.roomId === senderRoom) {
          u.socket.send(outgoingMessage);
        }
      });
    }
  });

  socket.on("close", () => {
    users = users.filter((u) => u.socket !== socket);
    console.log("Client disconnected");
  });
});