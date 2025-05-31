const http = require('http');
const { Server } = require('socket.io');

/** 
 * Class to track each connected player (id + position)
 */
class Player {
    constructor(id) {
        this.id = id;
        this.x = 0;
        this.y = 0;
        this.z = 0;
      this.name="";
      this.team="spec"
    }
}

function getPlayerNameById(id) {
    const player = players.find(p => p.id === id);
    return player ? player.name : null;
}

const server = http.createServer();
this.goalb=0
this.goalo=0

// Configure Socket.IO with CORS
const io = new Server(server, {
    cors: {
        // If you only want to allow PlayCanvas launch domain:
        // origin: "https://launch.playcanvas.com",

        // Or allow all origins (less secure, but quick for testing)
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const players = {};
this. sphereOwner=""
/**
 * Handle new socket connections
 */
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Fired when the client is ready to initialize their Player object
    socket.on('initialize', (data) => {
        const newPlayer = new Player(socket.id);
        players[socket.id] = newPlayer;
      newPlayer.name=data.name;
      newPlayer.team=data.team;
        // Send to this client its own ID and the current list of players
        socket.emit('playerData', { id: socket.id, players });

        // Tell everyone else about this new player
        socket.broadcast.emit('playerJoined', newPlayer);
    });
  socket.on('claimSphere', (data) => {
    //console.log("hmm")
    console.log(`${data.id} claimed sphere ownership`);
    
    this.sphereOwner =  players[data.id].name // keep track of current owner

    // Notify all clients about new owner
    
});


   socket.on('Goal', (data) => {
      console.log(this.goalo,this.goalb,data,data.name)
    if (data.name=="Orange")
      this.goalo+=1
    else if (data.name=="Blue")
     this.goalb+=1  // keep track of current owner
     console.log(this.goalo,this.goalb,this.sphereOwner)
 io.emit('scoreupdate', {o:this.goalo,b:this.goalb,scorer:this.sphereOwner})
    // Notify all clients about new score
    
});
  
   socket.on('score', (data) => {
     console.log('fuke')
      io.emit('scoreupdate', {o:this.goalo,b:this.goalb,scorer:this.sphereOwner})
   })
  
socket.on('spherePositionUpdate', (data) => {
  //console.log(data.id,this.sphereOwner,data)
  if (data.id==this.sphereOwner)
    socket.broadcast.emit('updateSphere', data);
});
    // Update player position
    socket.on('positionUpdate', (data) => {
        if (!players[socket.id]) return;
        players[socket.id].x = data.x;
        players[socket.id].y = data.y;
        players[socket.id].z = data.z;
//console.log(data)
        // Broadcast updated position to all other players
        socket.broadcast.emit('playerMoved', {
            id: socket.id,
            x: data.x,
            y: data.y,
            z: data.z,
          face:data.face
        });
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        if (!players[socket.id]) return;
        delete players[socket.id];
        // Notify other players to remove this player
        socket.broadcast.emit('killPlayer', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});