// colisao.js
export const vidas = {}; // { jogadorId: vida }

export function configurarColisao(wss, tanques, tiros) {
    console.log('🟢 Módulo de colisão carregado.');

    // Inicializa vidas dos jogadores
    wss.on('connection', (ws) => {
        if (!vidas[ws.id]) vidas[ws.id] = 3; // cada jogador começa com 3 vidas
    });

    // Verifica colisão 60 vezes por segundo
    setInterval(() => {
        for (const idTiro in tiros) {
            const t = tiros[idTiro];

            for (const jogadorId in tanques) {
                // Não colide o tiro com o próprio jogador
                if (t.jogadorId === jogadorId) continue;

                const tanque = tanques[jogadorId];
                if (!tanque) continue;

                // Hitbox simplificada (50x50)
                const dx = t.x - tanque.x;
                const dy = t.y - tanque.y;
                if (Math.abs(dx) < 25 && Math.abs(dy) < 25) {
                    // Colisão detectada
                    vidas[jogadorId] = (vidas[jogadorId] || 3) - 1;

                    // Remove o tiro
                    delete tiros[idTiro];

                    console.log(`💥 Jogador ${jogadorId} foi atingido! Vida restante: ${vidas[jogadorId]}`);

                    // Envia atualização de vidas para todos
                    broadcastVidas(wss);

                    // Se vida zerou, pode fazer algo especial (respawn ou remover)
                    if (vidas[jogadorId] <= 0) {
                        console.log(`💀 Jogador ${jogadorId} morreu!`);
                        // Aqui você pode resetar a posição ou reiniciar vida
                        vidas[jogadorId] = 3;
                    }

                    break; // só um tiro acerta por update
                }
            }
        }
    }, 1000 / 60);
}

// Envia estado de vidas a todos os clientes
function broadcastVidas(wss) {
    const data = JSON.stringify({ type: 'vidas', vidas });
    wss.clients.forEach(client => {
        if (client.readyState === 1) client.send(data);
    });
}
