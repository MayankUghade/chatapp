import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let userCount = 0;

interface user{
  socket: WebSocket,
  roomId:string,
}

let allSockets: user[] = [];

wss.on("connection", (socket) => {
  userCount = userCount + 1;
  console.log("Client Connected: " + userCount);

  socket.on("message", (message) => {
    const parsedMessage:any = JSON.parse(message as unknown as string)
    if(parsedMessage.type === "join"){
      console.log("User joined the room" + parsedMessage.payload.roomId)
       allSockets.push({
        socket,
        roomId: parsedMessage.payload.roomId
       })
    }

    if(parsedMessage.type ===  "chat"){
      console.log("user wanna send message")
      const currentUserRoom = allSockets.find((x) => x.socket==socket)?.roomId

      for(let i = 0; i<allSockets.length; i++){
        if(allSockets[i]?.roomId == currentUserRoom){
          allSockets[i]?.socket.send(parsedMessage.payload.message)
        }
      }
    }
  });

  socket.on("close", () => {
    userCount--;
    console.log("Client Disconnected:", userCount);
    allSockets = allSockets.filter((x) => x.socket !== socket);
  });
});
