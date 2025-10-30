import { WebSocket } from 'ws';

const tanks = {}; // { id: { x, y, angle } }
let nextId = 1;

export function configurarMovimentacao(wss) {
    // Evento de nova conexão
    wss.on('connection', (ws) => {
        const id = nextId++;
        tanks[id] = { x: 200, y: 200, angle: 0 };

        // Envia ID do jogador recém-conectado
        ws.send(JSON.stringify({ type: 'init', id }));

        // Recebe mensagens do cliente
        ws.on('message', (msg) => {
            const data = JSON.parse(msg);

            // Atualiza posição e ângulo do tanque
            if (data.type === 'move') {
                tanks[id] = { x: data.x, y: data.y, angle: data.angle };
            }
        });

        // Remove tanque quando o jogador desconecta
        ws.on('close', () => {
            delete tanks[id];
        });
    });

    // Envia atualizações de posição a todos os clientes (60 FPS)
    setInterval(() => {
        const update = JSON.stringify({
            type: 'update',
            tanks
        });

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(update);
            }
        });
    }, 1000 / 60);
}
