const http = require('http');
const { Server } = require('socket.io');

class Player {
    constructor(id) {
        this.id = id;
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
}

const server = http.createServer();

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const players = {};
let sphereOwner = null;

io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on('initialize', () => {
        const newPlayer = new Player(socket.id);
        players[socket.id] = newPlayer;

        socket.emit('playerData', { id: socket.id, players, owner: sphereOwner });
        socket.broadcast.emit('playerJoined', newPlayer);
    });

    socket.on('claimSphere', (data) => {
        console.log(`${data.id} claimed sphere ownership`);
        sphereOwner = data.id;
        io.emit('sphereOwnershipChanged', { owner: sphereOwner });
    });

    socket.on('spherePositionUpdate', (data) => {
        if (data.id === sphereOwner) {
            io.emit('updateSphere', data);
        }
    });

    socket.on('positionUpdate', (data) => {
        if (!players[socket.id]) return;
        players[socket.id].x = data.x;
        players[socket.id].y = data.y;
        players[socket.id].z = data.z;

        socket.broadcast.emit('playerMoved', {
            id: socket.id,
            x: data.x,
            y: data.y,
            z: data.z,
            face: data.face
        });
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        delete players[socket.id];
        socket.broadcast.emit('killPlayer', socket.id);

        if (sphereOwner === socket.id) {
            sphereOwner = null;
            io.emit('sphereOwnershipChanged', { owner: null });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
