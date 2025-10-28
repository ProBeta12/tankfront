// server.js
import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

// Estados do jogo
const tanks = {};   // {id: {x, y, angle}}
const tiros = [];   // {idJogador, x, y, angle, inicio}
let nextId = 1;

// Configurações
const tempoVidaTiro = 3000; // 3s de vida do tiro

wss.on('connection', (ws) => {
    const id = nextId++;

    // Inicializa tanque do jogador
    tanks[id] = { x: 200, y: 200, angle: 0 };

    // Envia ID para o cliente
    ws.send(JSON.stringify({ type: 'init', id }));

    ws.on('message', (msg) => {
        const data = JSON.parse(msg);

        if (data.type === 'move') {
            tanks[id] = { x: data.x, y: data.y, angle: data.angle };
        }

        if (data.type === 'shoot') {
            tiros.push({
                idJogador: id,
                x: data.x,
                y: data.y,
                angle: data.angle,
                inicio: Date.now()
            });
            console.log(`Tiro recebido de jogador ${id}: x=${data.x}, y=${data.y}, angle=${data.angle}`);
        }
    });

    ws.on('close', () => {
        delete tanks[id];
        // Remove tiros do jogador que saiu
        for (let i = tiros.length - 1; i >= 0; i--) {
            if (tiros[i].idJogador === id) tiros.splice(i, 1);
        }
    });
});

// Atualiza clientes a 60 FPS
setInterval(() => {
    const agora = Date.now();

    // Remove tiros antigos
    for (let i = tiros.length - 1; i >= 0; i--) {
        if (agora - tiros[i].inicio > tempoVidaTiro) {
            tiros.splice(i, 1);
        }
    }

    const update = JSON.stringify({
        type: 'update',
        tanks,
        tiros
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(update);
        }
    });
}, 1000 / 60);

console.log('Servidor WebSocket rodando na porta 8080');
