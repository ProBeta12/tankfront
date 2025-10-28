import WebSocket, { WebSocketServer } from 'ws';
import { adicionarTiro, atualizarTiros, obterTiros, removerTirosDoJogador } from './tiros.js';

const wss = new WebSocketServer({ port: 8080 });

const tanks = {}; // {id: {x, y, angle}}
let nextId = 1;

wss.on('connection', (ws) => {
    const id = nextId++;
    tanks[id] = { x: 200, y: 200, angle: 0 };

    ws.send(JSON.stringify({ type: 'init', id }));

    ws.on('message', (msg) => {
        const data = JSON.parse(msg);

        if (data.type === 'move') {
            tanks[id] = { x: data.x, y: data.y, angle: data.angle };
        }

        if (data.type === 'shoot') {
            adicionarTiro(id, data.x, data.y, data.angle);
        }
    });

    ws.on('close', () => {
        delete tanks[id];
        removerTirosDoJogador(id);
    });
});

// Atualiza clientes a 60 FPS
setInterval(() => {
    atualizarTiros(); // remove tiros expirados

    const update = JSON.stringify({
        type: 'update',
        tanks,
        tiros: obterTiros()
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(update);
        }
    });
}, 1000 / 60);

console.log('Servidor WebSocket rodando na porta 8080');
