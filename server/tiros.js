import { WebSocketServer } from 'ws';

let nextTiroId = 1;
const tiros = {}; // { idTiro: { x, y, angle, jogadorId } }

export function configurarTiros(wss) {
    console.log('🟢 Módulo de tiros carregado.');

    wss.on('connection', (ws) => {
        console.log('👤 Novo jogador conectado para tiros.');

        ws.on('message', (message) => {
            let data;
            try {
                data = JSON.parse(message);
            } catch (err) {
                console.error('❌ Erro ao analisar mensagem:', err);
                return;
            }

            // Quando um jogador atira
            if (data.type === 'shoot') {
                const id = nextTiroId++;
                tiros[id] = {
                    id,
                    x: data.x,
                    y: data.y,
                    angle: data.angle,
                    jogadorId: data.jogadorId
                };

                console.log(`🔫 Jogador ${data.jogadorId} atirou! (Tiro #${id})`);
                console.log(`    → Posição inicial: x=${data.x.toFixed(1)} | y=${data.y.toFixed(1)} | ângulo=${data.angle.toFixed(2)} rad`);

                // Envia o novo tiro para todos
                broadcast(wss, {
                    type: 'tiros',
                    tiros: { [id]: tiros[id] }
                });
            }
        });

        // Quando o jogador sai, remove tiros associados
        ws.on('close', () => {
            const tirosRemovidos = [];
            for (const id in tiros) {
                if (tiros[id].jogadorId === ws.id) {
                    tirosRemovidos.push(id);
                    delete tiros[id];
                }
            }
            if (tirosRemovidos.length > 0) {
                console.log(`❌ Removendo tiros do jogador desconectado: ${tirosRemovidos.join(', ')}`);
            }
        });
    });

    // Atualiza posições dos tiros em tempo real
    setInterval(() => {
        const velocidade = 8;
        let removidos = 0;

        for (const id in tiros) {
            const t = tiros[id];
            t.x += Math.cos(t.angle) * velocidade;
            t.y += Math.sin(t.angle) * velocidade;

            // Remove tiros que saíram da tela
            if (t.x < -20 || t.x > 2000 || t.y < -20 || t.y > 2000) {
                console.log(`💥 Tiro #${id} saiu da tela e foi removido.`);
                delete tiros[id];
                removidos++;
            }
        }

        if (Object.keys(tiros).length > 0) {
            console.log(`📡 Atualizando ${Object.keys(tiros).length} tiros ativos.`);
        }

        if (removidos > 0) {
            console.log(`🧹 ${removidos} tiros removidos.`);
        }

        // Envia estado atualizado dos tiros para todos os clientes
        broadcast(wss, { type: 'tiros', tiros });
    }, 1000 / 60);
}

// Função auxiliar para enviar dados a todos os clientes conectados
function broadcast(wss, data) {
    const json = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(json);
        }
    });
}
